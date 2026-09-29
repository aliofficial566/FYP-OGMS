const express = require('express');
const router = express.Router();
const { addCatalogue, getCatalogues, getCatalogueById, updateCatalogue, deleteCatalogue } = require('../controllers/catalogueController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};

// GET catalogues (Public or Admin view)
router.get('/', getCatalogues);
router.get('/:id', getCatalogueById);

// Admin only routes
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), addCatalogue);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), updateCatalogue);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCatalogue);

module.exports = router;
