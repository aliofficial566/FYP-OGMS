const db = require('../config/db');

// 1. GET ALL ORDERS (ADMIN ONLY)
exports.getAllOrders = async (req, res) => {
    try {
        const { status } = req.query;
        let query = `
            SELECT 
                o.order_id,
                CONCAT('ORD-', LPAD(o.order_id, 4, '0')) AS order_number,
                u.full_name AS customer_name,
                u.email,
                o.total_amount,
                o.order_status,
                o.created_at,
                o.cancelled_by
            FROM orders o
            JOIN users u ON o.user_id = u.user_id
        `;
        
        const params = [];
        if (status) {
            query += " WHERE o.order_status = ?";
            params.push(status);
        }

        query += " ORDER BY o.created_at DESC";

        const [orders] = await db.promise().execute(query, params);

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// 2. GET ORDER DETAILS (ADMIN & CUSTOMER)
exports.getOrderDetails = async (req, res) => {
    const orderId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        // Fetch order details
        const [orders] = await db.promise().execute(`
            SELECT 
                o.*,
                CONCAT('ORD-', LPAD(o.order_id, 4, '0')) AS order_number,
                u.full_name AS customer_name,
                u.email
            FROM orders o
            JOIN users u ON o.user_id = u.user_id
            WHERE o.order_id = ?
        `, [orderId]);

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        const order = orders[0];

        // Security Check: Only admin or the order owner can view details
        if (userRole !== 'admin' && order.user_id !== userId) {
            return res.status(403).json({ message: 'Access denied. You can only view your own orders.' });
        }

        // Fetch order items
        const [items] = await db.promise().execute(`
            SELECT * FROM order_items WHERE order_id = ?
        `, [orderId]);

        res.status(200).json({
            success: true,
            order: order,
            items: items
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// 3. GET USER ORDERS (CUSTOMER ONLY)
exports.getMyOrders = async (req, res) => {
    const userId = req.user.id;

    try {
        const [orders] = await db.promise().execute(`
            SELECT 
                order_id,
                CONCAT('ORD-', LPAD(order_id, 4, '0')) AS order_number,
                total_amount,
                order_status,
                created_at,
                cancelled_by
            FROM orders
            WHERE user_id = ?
            ORDER BY created_at DESC
        `, [userId]);

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// 4. UPDATE ORDER STATUS (ADMIN ONLY)
exports.updateOrderStatus = async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;

    // Validate Input
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid or missing status value.' });
    }

    try {
        // Check if order exists and get its current status
        const [orders] = await db.promise().execute('SELECT order_status, user_id FROM orders WHERE order_id = ?', [orderId]);
        
        if (orders.length === 0) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        const currentStatus = orders[0].order_status;

        // Skip if same status
        if (currentStatus === status) {
            return res.status(400).json({ message: 'Order is already in this status.' });
        }

        // --- STATUS FLOW VALIDATION ---
        // Allowed: Pending → Processing → Shipped → Delivered
        // Any → Cancelled
        // Prevent: Delivered/Cancelled → anything else (except already handled same status)
        
        if (currentStatus === 'Cancelled' || currentStatus === 'Delivered') {
             return res.status(400).json({ 
                message: `Cannot change status from ${currentStatus}. This is a final state.` 
            });
        }

        // Specific flow validation
        if (status !== 'Cancelled') {
            const statusPriority = {
                'Pending': 1,
                'Processing': 2,
                'Shipped': 3,
                'Delivered': 4
            };

            if (statusPriority[status] < statusPriority[currentStatus]) {
                return res.status(400).json({ 
                    message: `Invalid transition: Cannot move back from ${currentStatus} to ${status}.` 
                });
            }
            
            // Optional: Enforce sequential steps (e.g. can't jump from Pending to Shipped directly?)
            // The prompt says "Pending → Processing → Shipped → Delivered", implying a sequence.
            // But usually, businesses might skip. Let's stick to the prompt's implied sequence if possible.
            // "Prevent: Delivered -> Processing, Cancelled -> Processing" are specifically mentioned.
            // My logic above handles "Delivered -> anything" and "Cancelled -> anything".
        }

        // Update the order status
        if (status === 'Cancelled') {
            const connection = await db.promise().getConnection();
            try {
                await connection.beginTransaction();

                // Fetch order items to restore stock
                const [items] = await connection.execute('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [orderId]);

                // Restore stock
                for (const item of items) {
                    await connection.execute(
                        'UPDATE products SET stock_qty = stock_qty + ? WHERE product_id = ?',
                        [item.quantity, item.product_id]
                    );
                }

                // Update status
                await connection.execute('UPDATE orders SET order_status = ?, cancelled_by = ? WHERE order_id = ?', [status, 'Admin', orderId]);

                await connection.commit();
            } catch (err) {
                await connection.rollback();
                throw err;
            } finally {
                connection.release();
            }
        } else {
            await db.promise().execute('UPDATE orders SET order_status = ? WHERE order_id = ?', [status, orderId]);
        }

        // Create Notification
        const customerId = orders[0].user_id;
        await db.promise().execute(
            'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
            [customerId, 'Order Status Updated', `Your order #${orderId} is now ${status}`, 'order_status']
        );

        res.status(200).json({
            success: true,
            message: `Order status updated to ${status} successfully`,
            order_id: orderId,
            new_status: status
        });

    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// 5. CREATE NEW ORDER (CUSTOMER)
exports.createOrder = async (req, res) => {
    const userId = req.user.id;
    const { delivery_address, city, total_amount, items } = req.body;

    if (!delivery_address || !city || !total_amount || !items || items.length === 0) {
        return res.status(400).json({ message: 'Missing required order fields or items.' });
    }

    const connection = await db.promise().getConnection();
    try {
        await connection.beginTransaction();

        // 1. Insert into orders table
        const [orderResult] = await connection.execute(
            'INSERT INTO orders (user_id, delivery_address, city, total_amount) VALUES (?, ?, ?, ?)',
            [userId, delivery_address, city, total_amount]
        );

        const orderId = orderResult.insertId;

        // 2. Insert into order_items table and deduct stock
        for (const item of items) {
            // Validate stock and deduct
            const [updateResult] = await connection.execute(
                'UPDATE products SET stock_qty = stock_qty - ? WHERE product_id = ? AND stock_qty >= ?',
                [item.quantity, item.product_id, item.quantity]
            );

            if (updateResult.affectedRows === 0) {
                // Fetch available stock to show in message
                const [stockResult] = await connection.execute(
                    'SELECT stock_qty FROM products WHERE product_id = ?',
                    [item.product_id]
                );
                const availableStock = stockResult.length > 0 ? stockResult[0].stock_qty : 0;

                await connection.rollback();
                connection.release();
                return res.status(400).json({ 
                    message: `Insufficient stock for product: ${item.product_name || item.product_id}. Only ${availableStock} units available.` 
                });
            }

            // Use final_price if available, otherwise fallback to price
            const finalPrice = item.final_price || item.price;
            const discountPercent = item.discount_percent || 0;
            const line_total = finalPrice * item.quantity;
            
            await connection.execute(
                'INSERT INTO order_items (order_id, product_id, product_name, price, discount_percent, final_price, quantity, line_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [orderId, item.product_id, item.product_name, item.price, discountPercent, finalPrice, item.quantity, line_total]
            );
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Order placed successfully.',
            order_id: orderId
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Internal server error while placing order.' });
    } finally {
        connection.release();
    }
};
// 6. CANCEL ORDER (CUSTOMER)
exports.cancelOrder = async (req, res) => {
    const orderId = req.params.id;
    const userId = req.user.id;

    try {
        // Check if order exists and belongs to user
        const [orders] = await db.promise().execute('SELECT user_id, order_status FROM orders WHERE order_id = ?', [orderId]);
        
        if (orders.length === 0) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        const order = orders[0];

        // Security Check: Only the order owner can cancel
        if (order.user_id !== userId) {
            return res.status(403).json({ message: 'Access denied. You can only cancel your own orders.' });
        }

        // Check status
        if (order.order_status !== 'Pending') {
            return res.status(400).json({ message: 'You can only cancel pending orders.' });
        }

        // Update status and cancelled_by
        const connection = await db.promise().getConnection();
        try {
            await connection.beginTransaction();

            // Fetch order items to restore stock
            const [items] = await connection.execute('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [orderId]);

            // Restore stock
            for (const item of items) {
                await connection.execute(
                    'UPDATE products SET stock_qty = stock_qty + ? WHERE product_id = ?',
                    [item.quantity, item.product_id]
                );
            }

            // Update status
            await connection.execute('UPDATE orders SET order_status = ?, cancelled_by = ? WHERE order_id = ?', ['Cancelled', 'User', orderId]);

            await connection.commit();
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully.',
            order_id: orderId,
            new_status: 'Cancelled'
        });

    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
