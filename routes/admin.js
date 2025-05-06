const express = require('express');
const router = express.Router();
const db = require('../db/db');

// GET /api/admin/products - fetch all products
router.get('/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /api/admin/products - add a new product
router.post('/products', (req, res) => {
  const { title, description, price, category, image, quantity } = req.body;

  const sql = `
    INSERT INTO products (title, description, price, category, image, quantity)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [title, description, price, category, image, quantity || 0];

  db.run(sql, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Product added', id: this.lastID });
  });
});

// PUT /api/admin/products/:id - update a product
router.put('/products/:id', (req, res) => {
  const { title, description, price, category, image, quantity } = req.body;
  const { id } = req.params;

  const sql = `
    UPDATE products 
    SET title = ?, description = ?, price = ?, category = ?, image = ?, quantity = ?
    WHERE id = ?
  `;
  const params = [title, description, price, category, image, quantity || 0, id];

  db.run(sql, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Product updated', changes: this.changes });
  });
});

// POST /api/admin/bulk - bulk insert products
router.post('/bulk', (req, res) => {
  const products = req.body;

  const sql = `
    INSERT INTO products (title, description, price, category, image, quantity)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const stmt = db.prepare(sql);

  try {
    db.serialize(() => {
      for (const p of products) {
        stmt.run([
          p.title,
          p.description,
          p.price,
          p.category,
          p.image,
          p.quantity || 0
        ]);
      }
    });
    stmt.finalize();
    res.status(201).json({ message: 'Bulk insert successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
