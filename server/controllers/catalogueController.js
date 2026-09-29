const db = require('../config/db');
const { generateSlug } = require('../helpers');

// @route   POST /api/catalogues
// @desc    Add a new catalogue
const addCatalogue = async (req, res) => {
    try {
        const { name, description, discount_percent } = req.body;
        // Handle category_ids which could be sent as JSON string or array
        let category_ids = [];
        if (req.body.category_ids) {
            try {
                category_ids = typeof req.body.category_ids === 'string' ? JSON.parse(req.body.category_ids) : req.body.category_ids;
            } catch (e) {
                category_ids = [];
            }
        }

        if (!name) return res.status(400).json({ message: 'Name is required' });

        const [existing] = await db.promise().query('SELECT * FROM catalogues WHERE name = ?', [name]);
        if (existing.length > 0) return res.status(400).json({ message: 'Catalogue already exists' });

        let image_url = req.file ? `/uploads/catalogues/${req.file.filename}` : req.body.image_url || null;

        const is_active = req.body.is_active !== undefined ? 
            (['true', '1', 1, true].includes(req.body.is_active) ? 1 : 0) : 1;

        const [result] = await db.promise().query(
            'INSERT INTO catalogues (name, description, image_url, discount_percent, is_active) VALUES (?, ?, ?, ?, ?)',
            [name, description || null, image_url, discount_percent || 0, is_active]
        );
        const newCatalogueId = result.insertId;

        // Assign categories if any
        if (category_ids && category_ids.length > 0) {
            const placeholders = category_ids.map(() => '?').join(',');
            await db.promise().query(
                `UPDATE categories SET catalogue_id = ? WHERE category_id IN (${placeholders})`,
                [newCatalogueId, ...category_ids]
            );
        }

        res.status(201).json({ message: 'Catalogue created successfully', catalogue_id: newCatalogueId });
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

// @route   GET /api/catalogues
// @desc    Get all active catalogues with product count
const getCatalogues = async (req, res) => {
    try {
        const { view } = req.query;
        const query = `
            SELECT c.*, 
            (SELECT COUNT(p.product_id) 
             FROM products p 
             JOIN categories cat ON p.category_id = cat.category_id 
             WHERE cat.catalogue_id = c.catalogue_id AND p.is_active = 1) as product_count
            FROM catalogues c 
            ${view === 'admin' ? '' : 'WHERE c.is_active = 1'}
            ORDER BY c.created_at DESC
        `;
        const [catalogues] = await db.promise().query(query);
        
        // Fetch categories for each catalogue to send back for editing
        for (let cat of catalogues) {
            const [categories] = await db.promise().query('SELECT category_id, name FROM categories WHERE catalogue_id = ?', [cat.catalogue_id]);
            cat.categories = categories;
        }

        res.status(200).json(catalogues);
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

// @route   GET /api/catalogues/:id
// @desc    Get single catalogue with products
const getCatalogueById = async (req, res) => {
    try {
        const { id } = req.params;
        let catalogue = [];
        if (!isNaN(id)) {
            const [rows] = await db.promise().query('SELECT * FROM catalogues WHERE catalogue_id = ? AND is_active = 1', [id]);
            catalogue = rows;
        } else {
            const [rows] = await db.promise().query('SELECT * FROM catalogues WHERE is_active = 1');
            catalogue = rows.filter(c => generateSlug(c.name) === id);
        }
        
        if (catalogue.length === 0) {
            return res.status(404).json({ message: 'Catalogue not found' });
        }

        // Get categories for this catalogue
        const catalogueId = catalogue[0].catalogue_id;
        const [categories] = await db.promise().query('SELECT * FROM categories WHERE catalogue_id = ? AND is_active = 1', [catalogueId]);
        const categoryIds = categories.map(c => c.category_id);

        let products = [];
        if (categoryIds.length > 0) {
            const placeholders = categoryIds.map(() => '?').join(',');
            const query = `
                SELECT p.*,
                CASE 
                    WHEN p.discount_percent > 0 THEN p.discount_percent
                    WHEN ? > 0 THEN ?
                    ELSE 0
                END AS applied_discount,
                CASE 
                    WHEN p.discount_percent > 0 THEN ROUND(p.price - (p.price * p.discount_percent / 100), 2)
                    WHEN ? > 0 THEN ROUND(p.price - (p.price * ? / 100), 2)
                    ELSE p.price
                END AS final_price
                FROM products p 
                WHERE p.category_id IN (${placeholders}) AND p.is_active = 1
            `;
            const catalogue_discount = catalogue[0].discount_percent;
            const [fetchedProducts] = await db.promise().query(query, [catalogue_discount, catalogue_discount, catalogue_discount, catalogue_discount, ...categoryIds]);
            products = fetchedProducts;
        }

        res.status(200).json({
            ...catalogue[0],
            categories,
            products
        });
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

// @route   PUT /api/catalogues/:id
// @desc    Update a catalogue
const updateCatalogue = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, discount_percent } = req.body;
        
        let category_ids = [];
        if (req.body.category_ids) {
            try {
                category_ids = typeof req.body.category_ids === 'string' ? JSON.parse(req.body.category_ids) : req.body.category_ids;
            } catch (e) {
                category_ids = [];
            }
        }

        if (!name) return res.status(400).json({ message: 'Name is required' });

        const [existing] = await db.promise().query('SELECT * FROM catalogues WHERE name = ? AND catalogue_id != ?', [name, id]);
        if (existing.length > 0) return res.status(400).json({ message: 'Catalogue name already in use' });

        const [current] = await db.promise().query('SELECT * FROM catalogues WHERE catalogue_id = ?', [id]);
        if (current.length === 0) return res.status(404).json({ message: 'Catalogue not found' });

        let image_url = req.file ? `/uploads/catalogues/${req.file.filename}` : req.body.image_url || current[0].image_url;

        const is_active = req.body.is_active !== undefined ? 
            (['true', '1', 1, true].includes(req.body.is_active) ? 1 : 0) : 
            current[0].is_active;

        await db.promise().query(
            'UPDATE catalogues SET name = ?, description = ?, image_url = ?, discount_percent = ?, is_active = ? WHERE catalogue_id = ?',
            [name, description || null, image_url, discount_percent || 0, is_active, id]
        );

        // Reassign categories
        // First, clear existing assignments
        await db.promise().query('UPDATE categories SET catalogue_id = NULL WHERE catalogue_id = ?', [id]);
        
        // Then set new assignments
        if (category_ids && category_ids.length > 0) {
            const placeholders = category_ids.map(() => '?').join(',');
            await db.promise().query(
                `UPDATE categories SET catalogue_id = ? WHERE category_id IN (${placeholders})`,
                [id, ...category_ids]
            );
        }

        res.status(200).json({ message: 'Catalogue updated successfully' });
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

// @route   DELETE /api/catalogues/:id
// @desc    Soft delete a catalogue
const deleteCatalogue = async (req, res) => {
    try {
        const { id } = req.params;
        // First clear assignments in categories
        await db.promise().query('UPDATE categories SET catalogue_id = NULL WHERE catalogue_id = ?', [id]);
        // Then perform hard delete
        await db.promise().query('DELETE FROM catalogues WHERE catalogue_id = ?', [id]);

        res.status(200).json({ message: 'Catalogue deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

module.exports = {
    addCatalogue,
    getCatalogues,
    getCatalogueById,
    updateCatalogue,
    deleteCatalogue
};
