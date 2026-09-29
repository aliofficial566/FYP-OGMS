const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.getAllUsers = async (req, res) => {
    try {
        console.log('Admin requesting users list...');
        const [rows] = await db.promise().query(`
            SELECT user_id as id, full_name, email, phone, city, address, created_at, profile_image
            FROM users 
            ORDER BY created_at DESC
        `);

        console.log(`Successfully fetched ${rows.length} users from DB.`);
        res.status(200).json(rows);
    } catch (error) {
        console.error('CRITICAL: Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error while fetching users.' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { full_name, password, address, phone } = req.body;
        const { id, table, role } = req.user; // From authMiddleware

        let updateFields = [];
        let params = [];

        if (full_name) {
            updateFields.push('full_name = ?');
            params.push(full_name);
        }

        if (address && role !== 'admin') {
            updateFields.push('address = ?');
            params.push(address);
        }

        if (phone) {
            updateFields.push('phone = ?');
            params.push(phone);
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);
            updateFields.push('password_hash = ?');
            params.push(password_hash);
        }

        if (req.file) {
            const profile_image = `/uploads/profiles/${req.file.filename}`;
            updateFields.push('profile_image = ?');
            params.push(profile_image);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields provided for update.' });
        }

        const idField = role === 'admin' ? 'admin_id' : 'user_id';
        params.push(id);

        const sql = `UPDATE ${table} SET ${updateFields.join(', ')} WHERE ${idField} = ?`;
        
        await db.promise().execute(sql, params);

        // Fetch updated user to return
        const selectFields = role === 'admin' 
            ? 'full_name as name, email, profile_image' 
            : 'full_name as name, email, profile_image, address, phone';
            
        const [rows] = await db.promise().execute(
            `SELECT ${selectFields} FROM ${table} WHERE ${idField} = ?`,
            [id]
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: rows[0]
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Internal server error while updating profile.' });
    }
};
