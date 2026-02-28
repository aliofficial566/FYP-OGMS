const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register User
exports.registerUser = async (req, res) => {
    const {
        name,
        cnic,
        email,
        password,
        phone_number,
        address,
        town,
        region,
        postcode,
        country,
        role // optional, defaults to 'user'
    } = req.body;

    // Validation: Check if all fields are provided
    if (!name || !cnic || !email || !password || !phone_number || !address || !town || !region || !postcode || !country) {
        return res.status(400).json({ message: 'All fields are required. Please fill in every detail.' });
    }

    try {
        // Check if user exists
        const [rows] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const query = `
            INSERT INTO users 
            (name, cnic, email, password, phone_number, address, town, region, postcode, country, role) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            name,
            cnic,
            email,
            hashedPassword,
            phone_number || null,
            address || null,
            town || null,
            region || null,
            postcode || null,
            country || null,
            role || 'user'
        ];

        await db.promise().execute(query, values);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    try {
        // Check user
        const [rows] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = rows[0];

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                cnic: user.cnic,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
