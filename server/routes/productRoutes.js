const express = require('express');
const router = express.Router();
const { addProduct, getProducts, getProductById, updateProduct, deleteProduct } = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};

// GET products (Public or Admin view)
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin only routes
router.post('/', authMiddleware, adminMiddleware, upload.array('images', 5), addProduct);
router.put('/:id', authMiddleware, adminMiddleware, upload.array('images', 5), updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;
