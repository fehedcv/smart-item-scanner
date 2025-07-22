const express = require('express');
const multer = require('multer');
const db = require('../db');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(req.file.path));

    const response = await axios.post('http://localhost:8000/detect', formData, {
      headers: formData.getHeaders(),
    });

    const result = response.data.result;

    // Update DB with detected counts
    Object.entries(result).forEach(([item, count]) => {
      db.run(`UPDATE inventory SET count = count + ? WHERE item_name = ?`, [count, item]);
    });
    fs.unlinkSync(filePath);
    res.json({ message: 'Detection complete', result });

  } catch (error) {
    console.error('ML Service error:', error);
    
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: 'ML Service failed' });

  }
}); 

/* Dummy ML integration (simulate image processing result)
function mockDetectionResult() {
  return {
    water_bottle: Math.floor(Math.random() * 3),
    coffee_cup: Math.floor(Math.random() * 2),
    notebook: Math.floor(Math.random() * 1),
    phone_charger: Math.floor(Math.random() * 2),
  };
}

// POST /upload-image
router.post('/upload-image', upload.single('image'), (req, res) => {
  const result = mockDetectionResult();
  // Update DB with detected counts
  Object.entries(result).forEach(([item, count]) => {
    db.run(`UPDATE inventory SET count = count + ? WHERE item_name = ?`, [count, item]);
  });

  res.json({ message: 'Detection complete', result });
});*/

// GET /get-inventory
router.get('/get-inventory', (req, res) => {
  db.all(`SELECT * FROM inventory`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const lowStock = rows.filter(row => row.count < 2);
    res.json({ inventory: rows, lowStock });
  });
});

// PUT /update-stock
router.put('/update-stock', (req, res) => {
  const { item_name, new_count } = req.body;
  db.run(`UPDATE inventory SET count = ? WHERE item_name = ?`, [new_count, item_name], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Stock updated successfully' });
  });
});

module.exports = router;
