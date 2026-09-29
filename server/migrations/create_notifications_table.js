const db = require('../config/db');

async function run() {
    try {
        await db.promise().execute("CREATE TABLE IF NOT EXISTS notifications (notification_id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, title VARCHAR(255), message TEXT, type VARCHAR(50), is_read TINYINT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
        console.log("Table 'notifications' created successfully.");
    } catch (e) {
        console.error("Error creating table:", e.message);
    } finally {
        process.exit();
    }
}
run();
