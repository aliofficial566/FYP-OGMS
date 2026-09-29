const db = require('../config/db');
const { generateSlug } = require('../helpers');
const fs = require('fs');
const path = require('path');

// @desc    Add a new product
// @route   POST /api/products
const addProduct = async (req, res) => {
    try {
        const { category_id, name, description, brand, price, stock_qty, unit, discount_percent } = req.body;
        if (!name || !price || !category_id) {
            return res.status(400).json({ message: 'Name, price, and category are required' });
        }

        let image_url = null;
        if (req.files && req.files.length > 0) {
            const urls = req.files.map(file => `/uploads/products/${file.filename}`);
            image_url = JSON.stringify(urls);
        } else if (req.body.image_url) {
            image_url = req.body.image_url;
        }

        const is_active = req.body.is_active !== undefined ? 
            (['true', '1', 1, true].includes(req.body.is_active) ? 1 : 0) : 1;

        const [result] = await db.promise().query(
            'INSERT INTO products (category_id, name, description, brand, price, stock_qty, unit, image_url, discount_percent, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [category_id, name, description || null, brand || null, price, stock_qty || 0, unit || null, image_url, discount_percent || 0, is_active]
        );
        res.status(201).json({ message: 'Product added successfully', product_id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

// @desc    Get all products with pagination and filtering
// @route   GET /api/products
const getProducts = async (req, res) => {
    try {
        const { view } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const offset = (page - 1) * limit;
        const category = req.query.category;
        const brand = req.query.brand;
        const search = req.query.search;
        const minPrice = req.query.minPrice;
        const maxPrice = req.query.maxPrice;
        const inStock = req.query.inStock === 'true';
        const sort = req.query.sort;

        // Base where clause depends on view
        let baseWhere = view === 'admin' ? '1=1' : 'p.is_active = 1';

        let query = `
            SELECT p.*, c.name AS category_name,
            cat.discount_percent AS catalogue_discount,
            CASE 
                WHEN p.discount_percent > 0 THEN p.discount_percent
                WHEN cat.discount_percent > 0 THEN cat.discount_percent
                ELSE 0
            END AS applied_discount,
            CASE 
                WHEN p.discount_percent > 0 THEN ROUND(p.price - (p.price * p.discount_percent / 100), 2)
                WHEN cat.discount_percent > 0 THEN ROUND(p.price - (p.price * cat.discount_percent / 100), 2)
                ELSE p.price
            END AS final_price
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN catalogues cat ON c.catalogue_id = cat.catalogue_id AND cat.is_active = 1
            WHERE ${baseWhere}
        `;
        
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.category_id 
            WHERE ${baseWhere}
        `;

        const params = [];
        const countParams = [];

        if (category && category !== 'All') {
            query += ` AND c.name = ?`;
            countQuery += ` AND c.name = ?`;
            params.push(category);
            countParams.push(category);
        }

        if (brand) {
            query += ` AND p.brand LIKE ?`;
            countQuery += ` AND p.brand LIKE ?`;
            params.push(`%${brand}%`);
            countParams.push(`%${brand}%`);
        }

        if (search) {
            query += ` AND p.name LIKE ?`;
            countQuery += ` AND p.name LIKE ?`;
            params.push(`%${search}%`);
            countParams.push(`%${search}%`);
        }

        if (minPrice) {
            query += ` AND p.price >= ?`;
            countQuery += ` AND p.price >= ?`;
            params.push(parseFloat(minPrice));
            countParams.push(parseFloat(minPrice));
        }

        if (maxPrice) {
            query += ` AND p.price <= ?`;
            countQuery += ` AND p.price <= ?`;
            params.push(parseFloat(maxPrice));
            countParams.push(parseFloat(maxPrice));
        }

        if (inStock) {
            query += ` AND p.stock_qty > 0`;
            countQuery += ` AND p.stock_qty > 0`;
        }

        if (sort === 'price_asc') {
            query += ` ORDER BY p.price ASC`;
        } else if (sort === 'price_desc') {
            query += ` ORDER BY p.price DESC`;
        } else if (sort === 'newest') {
            query += ` ORDER BY p.created_at DESC`;
        } else if (sort === 'name_asc') {
            query += ` ORDER BY p.name ASC`;
        } else {
            query += ` ORDER BY p.created_at DESC`;
        }

        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [products] = await db.promise().query(query, params);
        const [totalCount] = await db.promise().query(countQuery, countParams);

        res.status(200).json({
            products,
            total: totalCount[0].total,
            page,
            totalPages: Math.ceil(totalCount[0].total / limit)
        });
    } catch (error) {
        console.error('Error in getProducts:', error);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT p.*, c.name AS category_name,
            cat.discount_percent AS catalogue_discount,
            CASE 
                WHEN p.discount_percent > 0 THEN p.discount_percent
                WHEN cat.discount_percent > 0 THEN cat.discount_percent
                ELSE 0
            END AS applied_discount,
            CASE 
                WHEN p.discount_percent > 0 THEN ROUND(p.price - (p.price * p.discount_percent / 100), 2)
                WHEN cat.discount_percent > 0 THEN ROUND(p.price - (p.price * cat.discount_percent / 100), 2)
                ELSE p.price
            END AS final_price
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN catalogues cat ON c.catalogue_id = cat.catalogue_id AND cat.is_active = 1
            ${!isNaN(id) ? 'WHERE p.product_id = ?' : ''}
        `;
        let product = [];
        if (!isNaN(id)) {
            const [rows] = await db.promise().query(query, [id]);
            product = rows;
        } else {
            const [rows] = await db.promise().query(query);
            product = rows.filter(p => generateSlug(p.name) === id);
        }
        
        if (product.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(product[0]);
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_id, name, description, brand, price, stock_qty, unit, discount_percent, remaining_images } = req.body;
        
        if (!name || !price || !category_id) {
            return res.status(400).json({ message: 'Name, price, and category are required' });
        }

        const [current] = await db.promise().query('SELECT * FROM products WHERE product_id = ?', [id]);
        if (current.length === 0) return res.status(404).json({ message: 'Product not found' });

        let images = [];
        const currentImageUrl = current[0].image_url;
        
        // Parse current images
        try {
            if (currentImageUrl) {
                images = JSON.parse(currentImageUrl);
                if (!Array.isArray(images)) images = [currentImageUrl];
            }
        } catch (e) {
            images = [currentImageUrl];
        }

        // If client sends remaining images (after deleting some)
        if (remaining_images) {
            try {
                images = JSON.parse(remaining_images);
            } catch (e) {
                console.error('Error parsing remaining_images', e);
            }
        }

        // Add new uploaded images
        if (req.files && req.files.length > 0) {
            const newUrls = req.files.map(file => `/uploads/products/${file.filename}`);
            images = [...images, ...newUrls];
        }

        let image_url = images.length > 0 ? JSON.stringify(images) : null;

        const is_active = req.body.is_active !== undefined ? 
            (['true', '1', 1, true].includes(req.body.is_active) ? 1 : 0) : 
            current[0].is_active;

        await db.promise().query(
            'UPDATE products SET category_id = ?, name = ?, description = ?, brand = ?, price = ?, stock_qty = ?, unit = ?, image_url = ?, discount_percent = ?, is_active = ? WHERE product_id = ?',
            [category_id, name, description || null, brand || null, price, stock_qty || 0, unit || null, image_url, discount_percent || 0, is_active, id]
        );
        res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

// @desc    Hard delete a product
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Get product images to delete files
        const [product] = await db.promise().query('SELECT image_url FROM products WHERE product_id = ?', [id]);
        
        if (product.length > 0 && product[0].image_url) {
            let images = [];
            try {
                images = JSON.parse(product[0].image_url);
                if (!Array.isArray(images)) images = [product[0].image_url];
            } catch (e) {
                images = [product[0].image_url];
            }
            
            // Delete files from disk
            images.forEach(img => {
                const filePath = path.join(__dirname, '..', img);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }

        // Delete from order_items first to avoid foreign key constraint error
        await db.promise().query('DELETE FROM order_items WHERE product_id = ?', [id]);
        
        // Then delete the product
        await db.promise().query('DELETE FROM products WHERE product_id = ?', [id]);
        
        res.status(200).json({ message: 'Product and associated files deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

module.exports = {
    addProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
