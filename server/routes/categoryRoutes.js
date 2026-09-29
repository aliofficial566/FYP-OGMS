const express = require('express');
const router = express.Router();
const { addCategory, getCategories, updateCategory, deleteCategory } = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};

// Public or Admin (GET)
router.get('/', getCategories);

// Admin only routes
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), addCategory);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), updateCategory);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCategory);

module.exports = router;
