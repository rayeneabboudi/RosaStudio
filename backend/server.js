// backend/server.js
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to SQLite DB
// ✅ Use the correct filename: 'product' (as seen in your screenshots)
const dbPath = path.join(__dirname, 'product'); // ← no .db extension
const db = new Database(dbPath);

// Optional: Log connection
console.log(`✅ Connected to SQLite database at ${dbPath}`);

// Ensure table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    image TEXT,
    description TEXT
  )
`);

// === API ROUTES (backend only) ===

// GET all products
app.get('/api/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products').all();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST new product
app.post('/api/products', (req, res) => {
  const { name, price, image, description } = req.body;
  try {
    const stmt = db.prepare(
      'INSERT INTO products (name, price, image, description) VALUES (?, ?, ?, ?)'
    );
    const info = stmt.run(name, price, image, description);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT update product
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, image, description } = req.body;
  try {
    const stmt = db.prepare(
      'UPDATE products SET name = ?, price = ?, image = ?, description = ? WHERE id = ?'
    );
    const info = stmt.run(name, price, image, description, id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    const info = stmt.run(id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Rosa Studio Backend API is running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});