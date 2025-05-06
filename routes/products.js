const express = require('express');
const router = express.Router();
const db = require('../db/db'); 

// GET /api/products - All products, optional category or search
router.get('/', (req, res) => {
  const { category, search } = req.query;
  let sql = 'SELECT * FROM products';
  let params = [];

  if (category) {
    sql += ' WHERE category = ?';
    params.push(category);
  } else if (search) {
    sql += ' WHERE title LIKE ?';
    params.push(`%${search}%`);
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET /api/products/:id - Single product details
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json(row);
  });
});

module.exports = router;
