const db = require('../config/db');

// 1. GET SALES SUMMARY
exports.getSalesSummary = async (req, res) => {
    try {
        console.log('Fetching sales summary...');
        const [results] = await db.promise().query(`
            SELECT 
                (SELECT COUNT(*) FROM orders WHERE order_status != 'Cancelled') AS total_orders,
                (SELECT SUM(total_amount) FROM orders WHERE order_status != 'Cancelled') AS total_revenue,
                (SELECT SUM(quantity) FROM order_items oi JOIN orders o ON oi.order_id = o.order_id WHERE o.order_status != 'Cancelled') AS total_items_sold
        `);

        const data = results[0];
        console.log('Sales summary data:', data);
        res.status(200).json({
            total_orders: data.total_orders || 0,
            total_revenue: data.total_revenue || 0,
            total_items_sold: data.total_items_sold || 0
        });
    } catch (error) {
        console.error('Error fetching sales summary:', error);
        res.status(500).json({ message: 'Internal server error while fetching sales summary.' });
    }
};

// 1b. GET DASHBOARD SUMMARY (Consolidated)
exports.getDashboardSummary = async (req, res) => {
    try {
        const [stats] = await db.promise().execute(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE is_active = 1) AS total_users,
                (SELECT COUNT(*) FROM products WHERE is_active = 1) AS total_products,
                (SELECT COUNT(*) FROM orders WHERE order_status != 'Cancelled') AS total_orders,
                (SELECT SUM(total_amount) FROM orders WHERE order_status != 'Cancelled') AS total_revenue,
                (SELECT COUNT(*) FROM orders WHERE order_status = 'Pending') AS pending_orders
        `);

        // Get inventory distribution
        const [inventory] = await db.promise().execute(`
            SELECT 
                COUNT(CASE WHEN stock_qty <= 0 THEN 1 END) as out_of_stock,
                COUNT(CASE WHEN stock_qty > 0 AND stock_qty < 10 THEN 1 END) as low_stock,
                COUNT(CASE WHEN stock_qty >= 10 THEN 1 END) as in_stock,
                COUNT(*) as total_count
            FROM products
            WHERE is_active = 1
        `);

        res.status(200).json({
            stats: stats[0],
            inventory: inventory[0]
        });
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// 2. GET SALES TREND (For Charts)
exports.getSalesTrend = async (req, res) => {
    try {
        const { range, start_date, end_date } = req.query;
        let dateFormat = '%Y-%m-%d';
        let limitQuery = '';

        if (range === 'custom' && start_date && end_date) {
            limitQuery = `AND DATE(o.created_at) BETWEEN ${db.escape(start_date)} AND ${db.escape(end_date)}`;
        } else if (range === '7days') {
            limitQuery = 'AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
        } else if (range === '30days') {
            limitQuery = 'AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
        } else if (range === 'month') {
            limitQuery = 'AND MONTH(o.created_at) = MONTH(CURDATE()) AND YEAR(o.created_at) = YEAR(CURDATE())';
        } else if (range === 'year') {
            dateFormat = '%Y-%m';
            limitQuery = 'AND YEAR(o.created_at) = YEAR(CURDATE())';
        }

        const query = `
            SELECT 
                DATE_FORMAT(o.created_at, ?) AS date,
                SUM(o.total_amount) AS total_revenue,
                COUNT(o.order_id) AS total_orders,
                SUM(item_counts.daily_items) AS total_items_sold
            FROM orders o
            LEFT JOIN (
                SELECT order_id, SUM(quantity) as daily_items 
                FROM order_items 
                GROUP BY order_id
            ) item_counts ON o.order_id = item_counts.order_id
            WHERE o.order_status != 'Cancelled' ${limitQuery}
            GROUP BY date
            ORDER BY date ASC
        `;

        const [results] = await db.promise().query(query, [dateFormat]);
        res.status(200).json(results);
    } catch (error) {
        console.error('Sales Trend Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 3. GET ORDER STATUS COUNT
exports.getOrderStatusData = async (req, res) => {
    try {
        const [results] = await db.promise().execute(`
            SELECT order_status, COUNT(*) AS count
            FROM orders
            GROUP BY order_status
        `);

        // Format to key-value pairs for easy frontend consumption
        const statusCounts = {
            Pending: 0,
            Processing: 0,
            Shipped: 0,
            Delivered: 0,
            Cancelled: 0
        };

        results.forEach(row => {
            if (statusCounts.hasOwnProperty(row.order_status)) {
                statusCounts[row.order_status] = row.count;
            }
        });

        res.status(200).json(statusCounts);
    } catch (error) {
        console.error('Error fetching order status data:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// 4. GET LOW STOCK PRODUCTS
exports.getLowStockProducts = async (req, res) => {
    try {
        const [results] = await db.promise().execute(`
            SELECT product_id, name, stock_qty
            FROM products
            WHERE stock_qty < 10 AND is_active = 1
            ORDER BY stock_qty ASC
        `);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching low stock products:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// 5. GET TOP SELLING PRODUCTS
exports.getTopProducts = async (req, res) => {
    try {
        const [results] = await db.promise().query(`
            SELECT 
                product_name,
                SUM(quantity) AS total_sold
            FROM order_items
            GROUP BY product_id, product_name
            ORDER BY total_sold DESC
            LIMIT 5
        `);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching top products:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// 6. GET CATEGORY PERFORMANCE
exports.getCategoryPerformance = async (req, res) => {
    try {
        const [results] = await db.promise().query(`
            SELECT 
                c.name AS category_name,
                SUM(oi.line_total) AS total_sales
            FROM order_items oi
            JOIN products p ON oi.product_id = p.product_id
            JOIN categories c ON p.category_id = c.category_id
            GROUP BY c.category_id, c.name
        `);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching category performance:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
