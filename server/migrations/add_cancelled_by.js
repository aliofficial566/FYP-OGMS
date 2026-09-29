const db = require('../config/db');

async function run() {
    try {
        await db.promise().execute("ALTER TABLE orders ADD COLUMN cancelled_by VARCHAR(50) DEFAULT NULL");
        console.log("Column 'cancelled_by' added successfully.");
    } catch (e) {
        console.error("Error or column already exists:", e.message);
    } finally {
        process.exit();
    }
}
run();
