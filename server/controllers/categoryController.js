const db = require('../config/db');

// @route   POST /api/categories
// @desc    Add a new category
const addCategory = async (req, res) => {
    try {
        const { name, description, catalogue_id } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });

        const [existing] = await db.promise().query('SELECT * FROM categories WHERE name = ?', [name]);
        if (existing.length > 0) return res.status(400).json({ message: 'Category already exists' });

        let image_url = req.file ? `/uploads/categories/${req.file.filename}` : null;
        const is_active = req.body.is_active !== undefined ? 
            (['true', '1', 1, true].includes(req.body.is_active) ? 1 : 0) : 1;

        const [result] = await db.promise().query(
            'INSERT INTO categories (name, description, image_url, catalogue_id, is_active) VALUES (?, ?, ?, ?, ?)',
            [name, description || null, image_url, catalogue_id || null, is_active]
        );
        res.status(201).json({ message: 'Category added successfully', category_id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

// @route   GET /api/categories
// @desc    Get all categories (Admin view shows all, Public shows active)
const getCategories = async (req, res) => {
    try {
        const { view } = req.query;
        const query = `
            SELECT * FROM categories 
            ${view === 'admin' ? '' : 'WHERE is_active = 1'} 
            ORDER BY created_at DESC
        `;
        const [categories] = await db.promise().query(query);
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

// @route   PUT /api/categories/:id
// @desc    Update a category
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const [current] = await db.promise().query('SELECT * FROM categories WHERE category_id = ?', [id]);
        if (current.length === 0) return res.status(404).json({ message: 'Category not found' });

        const name = req.body.name || current[0].name;
        const description = req.body.description !== undefined ? req.body.description : current[0].description;
        const catalogue_id = req.body.catalogue_id !== undefined ? req.body.catalogue_id : current[0].catalogue_id;
        
        let image_url = req.file ? `/uploads/categories/${req.file.filename}` : req.body.image_url || current[0].image_url;
        
        const is_active = req.body.is_active !== undefined ? 
            (['true', '1', 1, true].includes(req.body.is_active) ? 1 : 0) : 
            current[0].is_active;

        await db.promise().query(
            'UPDATE categories SET name = ?, description = ?, image_url = ?, catalogue_id = ?, is_active = ? WHERE category_id = ?',
            [name, description, image_url, catalogue_id, is_active, id]
        );
        res.status(200).json({ message: 'Category updated successfully' });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

// @route   DELETE /api/categories/:id
// @desc    Hard delete a category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if there are any products associated with this category
        const [products] = await db.promise().query('SELECT * FROM products WHERE category_id = ?', [id]);
        if (products.length > 0) {
            return res.status(400).json({ message: 'Cannot delete category because it contains products. Please delete or move the products first.' });
        }

        await db.promise().query('DELETE FROM categories WHERE category_id = ?', [id]);
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

module.exports = {
    addCategory,
    getCategories,
    updateCategory,
    deleteCategory
};
