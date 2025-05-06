const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Get all items in cart
router.get('/', (req, res) => {
  const query = `
    SELECT cart_items.id, products.id as product_id, products.title, products.price, cart_items.quantity
    FROM cart_items
    JOIN products ON cart_items.product_id = products.id
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: "Failed to fetch cart items" });
    }
    res.json(rows);
  });
});

// Add item to cart
router.post('/', (req, res) => {
  const { product_id, quantity } = req.body;
  const query = `
    INSERT INTO cart_items (product_id, quantity) VALUES (?, ?)
  `;
  db.run(query, [product_id, quantity], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: "Failed to add item to cart" });
    }
    res.status(201).json({ id: this.lastID });
  });
});

// Update quantity
router.put('/:id', (req, res) => {
  const { quantity } = req.body;
  const { id } = req.params;
  const query = `
    UPDATE cart_items SET quantity = ? WHERE id = ?
  `;
  db.run(query, [quantity, id], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: "Failed to update cart item" });
    }
    res.json({ message: "Cart updated" });
  });
});

// Delete cart item
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM cart_items WHERE id = ?`;
  db.run(query, [id], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: "Failed to delete cart item" });
    }
    res.json({ message: "Item removed from cart" });
  });
});

// Checkout and process purchase
router.post('/checkout', (req, res) => {
  const cartQuery = `
    SELECT cart_items.product_id, cart_items.quantity, products.price
    FROM cart_items
    JOIN products ON cart_items.product_id = products.id
  `;

  db.all(cartQuery, [], (err, cartItems) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: "Failed to retrieve cart for checkout" });
    }

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const now = new Date().toISOString();
    const purchaseInsert = db.prepare(`
      INSERT INTO purchases (date, product_id, quantity, total_price) VALUES (?, ?, ?, ?)
    `);

    const updateProduct = db.prepare(`
      UPDATE products SET quantity = quantity - ? WHERE id = ? AND quantity >= ?
    `);

    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      for (const item of cartItems) {
        const total = item.price * item.quantity;

        updateProduct.run([item.quantity, item.product_id, item.quantity], function (err) {
          if (err) {
            console.error("Product update error:", err.message);
          }
        });

        purchaseInsert.run([now, item.product_id, item.quantity, total], function (err) {
          if (err) {
            console.error("Purchase insert error:", err.message);
          }
        });
      }

      db.run("DELETE FROM cart_items", [], (err) => {
        if (err) {
          console.error("Failed to clear cart:", err.message);
        }
      });

      db.run("COMMIT", (err) => {
        if (err) {
          console.error("Commit failed:", err.message);
          return res.status(500).json({ error: "Checkout failed" });
        }
        res.json({ message: "Checkout successful!" });
      });
    });
  });
});

module.exports = router;
