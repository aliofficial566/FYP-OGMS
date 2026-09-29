const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// Admin Middleware check
const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};

/**
 * @route   GET /api/orders/my-orders
 * @desc    Get logged in user's orders
 * @access  Private (User)
 */
router.get('/my-orders', authMiddleware, orderController.getMyOrders);
router.post('/', authMiddleware, orderController.createOrder);
router.put('/:id/cancel', authMiddleware, orderController.cancelOrder);

/**
 * @route   GET /api/orders
 * @desc    Get all orders
 * @access  Private (Admin Only)
 */
router.get('/', authMiddleware, adminMiddleware, orderController.getAllOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order details (with items)
 * @access  Private (Admin or Owner)
 */
router.get('/:id', authMiddleware, orderController.getOrderDetails);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private (Admin Only)
 */
router.put('/:id/status', authMiddleware, adminMiddleware, orderController.updateOrderStatus);

module.exports = router;
