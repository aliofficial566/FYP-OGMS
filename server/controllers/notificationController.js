const db = require('../config/db');

// 1. GET USER NOTIFICATIONS
exports.getNotifications = async (req, res) => {
    const userId = req.user.id;

    try {
        const [notifications] = await db.promise().execute(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// 2. MARK AS READ
exports.markAsRead = async (req, res) => {
    const notificationId = req.params.id;

    try {
        await db.promise().execute(
            'UPDATE notifications SET is_read = 1 WHERE notification_id = ?',
            [notificationId]
        );

        res.status(200).json({
            success: true,
            message: 'Notification marked as read.'
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
