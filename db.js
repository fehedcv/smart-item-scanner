const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./inventory.db');
require('dotenv').config();

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT UNIQUE,
    count INTEGER
  )`);

  // Insert default stock items if not exist
  const items = ['water_bottle', 'coffee_cup', 'notebook', 'phone_charger'];
  items.forEach(item => {
    db.run(`INSERT OR IGNORE INTO inventory (item_name, count) VALUES (?, ?)`, [item, 0]);
  });
});

module.exports = db;
