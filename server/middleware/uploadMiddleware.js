const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = 'media';
        if (req.baseUrl.includes('categories')) folder = 'categories';
        if (req.baseUrl.includes('products')) folder = 'products';
        if (req.baseUrl.includes('catalogues')) folder = 'catalogues';

        const uploadDir = path.join(__dirname, `../uploads/${folder}`);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        let prefix = 'file';
        if (req.baseUrl.includes('categories')) prefix = 'category';
        if (req.baseUrl.includes('products')) prefix = 'product';
        if (req.baseUrl.includes('catalogues')) prefix = 'catalogue';
        
        // Generates safe, unique filenames
        cb(null, prefix + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Only accept typical image formats
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;
