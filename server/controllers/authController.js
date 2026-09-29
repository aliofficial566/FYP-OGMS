const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Temporary/Mock Email Transporter (Use real credentials in production)
const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
        user: "ethereal_user", // Replace with real credentials
        pass: "ethereal_pass",
    },
});

// Helper function to find user in either table
const findUserByEmail = async (email) => {
    // Check admins table first
    const [adminRows] = await db.promise().query('SELECT * FROM admins WHERE email = ?', [email]);
    if (adminRows.length > 0) return { ...adminRows[0], table: 'admins' };

    // Check users table
    const [userRows] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (userRows.length > 0) return { ...userRows[0], table: 'users' };

    return null;
};

// Register User (Always as normal user per workflow requirements)
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
        country
    } = req.body;

    // Validation
    if (!name || !cnic || !email || !password || !phone_number || !address || !town || !region || !postcode || !country) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Check if exists in EITHER table
        const existing = await findUserByEmail(email);
        if (existing) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert into users table mapping frontend fields to DB schema
        const fullAddress = `${address}, ${region}, ${postcode}, ${country}`;
        const query = `
            INSERT INTO users 
            (full_name, email, password_hash, phone, address, city) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const values = [name, email, hashedPassword, phone_number, fullAddress, town];
        await db.promise().execute(query, values);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Login User (Checks both tables)
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash || user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Map correct id and role based on table
        const id = user.admin_id || user.user_id || user.id;
        const role = user.table === 'admins' ? 'admin' : (user.role || 'user');
        const name = user.full_name || user.name || 'User';

        const token = jwt.sign(
            { id, role, table: user.table },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id,
                name,
                email: user.email,
                profile_image: user.profile_image,
                address: user.table === 'users' ? user.address : undefined,
                phone: user.table === 'users' ? user.phone : undefined,
                role
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Forgot Password - Step 1: Request OTP
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await findUserByEmail(email);
        if (!user) return res.status(404).json({ message: 'Email not found' });

        const otp = '6219';
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry for static OTP

        // Make sure admins table has these columns or we only reset user passwords
        await db.promise().query(`UPDATE ${user.table} SET reset_token = ?, reset_expires = ? WHERE email = ?`, [otp, expiry, email]);

        console.log(`OTP for ${email}: ${otp}`);
        res.json({ message: 'OTP sent to your email.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Verify OTP - Step 2
exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await findUserByEmail(email);
        if (!user || user.reset_token !== otp) return res.status(400).json({ message: 'Invalid OTP' });

        if (new Date() > new Date(user.reset_expires)) return res.status(400).json({ message: 'OTP expired' });

        res.json({ message: 'OTP verified' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Reset Password - Step 3
exports.resetPassword = async (req, res) => {
    const { email, otp, password } = req.body;
    try {
        const user = await findUserByEmail(email);
        if (!user || user.reset_token !== otp) return res.status(400).json({ message: 'Invalid request' });

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.promise().query(`UPDATE ${user.table} SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE email = ?`, [hashedPassword, email]);

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
