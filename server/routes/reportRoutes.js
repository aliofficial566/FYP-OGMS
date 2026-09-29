const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};

// All report routes are strictly Admin-only
router.get('/dashboard-summary', authMiddleware, adminMiddleware, reportController.getDashboardSummary);
router.get('/sales-summary', authMiddleware, adminMiddleware, reportController.getSalesSummary);
router.get('/sales-trend', authMiddleware, adminMiddleware, reportController.getSalesTrend);
router.get('/order-status', authMiddleware, adminMiddleware, reportController.getOrderStatusData);
router.get('/low-stock', authMiddleware, adminMiddleware, reportController.getLowStockProducts);
router.get('/top-products', authMiddleware, adminMiddleware, reportController.getTopProducts);
router.get('/category-performance', authMiddleware, adminMiddleware, reportController.getCategoryPerformance);

module.exports = router;
