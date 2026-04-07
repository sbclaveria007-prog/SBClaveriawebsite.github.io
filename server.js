// ============================================================
// StockWise Inventory System - Backend Server
// Node.js + Express + SQLite
// ============================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── Database Setup ───────────────────────────────────────
const db = new Database(path.join(__dirname, 'stockwise.db'));

// Enable WAL for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Schema ───────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    sku         TEXT    NOT NULL UNIQUE,
    category    TEXT,
    quantity    INTEGER NOT NULL DEFAULT 0,
    threshold   INTEGER NOT NULL DEFAULT 5,
    cost_price  REAL    DEFAULT 0,
    sell_price  REAL    DEFAULT 0,
    created_at  TEXT    DEFAULT (datetime('now')),
    updated_at  TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sales (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    receipt_no  TEXT    NOT NULL UNIQUE,
    total       REAL    NOT NULL DEFAULT 0,
    item_count  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sale_items (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id      INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id   INTEGER NOT NULL REFERENCES products(id),
    product_name TEXT    NOT NULL,
    qty          INTEGER NOT NULL,
    unit_price   REAL    NOT NULL,
    subtotal     REAL    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS purchases (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    po_no        TEXT    NOT NULL UNIQUE,
    product_id   INTEGER NOT NULL REFERENCES products(id),
    product_name TEXT    NOT NULL,
    supplier     TEXT,
    qty          INTEGER NOT NULL,
    unit_cost    REAL    DEFAULT 0,
    total        REAL    DEFAULT 0,
    created_at   TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS activity (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    text       TEXT    NOT NULL,
    color      TEXT    DEFAULT '#00e5a0',
    created_at TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    username   TEXT    NOT NULL UNIQUE,
    password   TEXT    NOT NULL,
    role       TEXT    DEFAULT 'admin'
  );

  INSERT OR IGNORE INTO users (username, password) VALUES ('admin', 'admin123');
`);

// ─── Helper ───────────────────────────────────────────────
const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const err = (res, msg, status = 400) => res.status(status).json({ success: false, error: msg });

const logActivity = (text, color = '#00e5a0') => {
  db.prepare('INSERT INTO activity (text, color) VALUES (?, ?)').run(text, color);
};

// ============================================================
// AUTH
// ============================================================
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return err(res, 'Username and password required');
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
  if (!user) return err(res, 'Invalid credentials', 401);
  ok(res, { id: user.id, username: user.username, role: user.role });
});

// ============================================================
// PRODUCTS  /api/products
// ============================================================
app.get('/api/products', (req, res) => {
  const { search, category, stock } = req.query;
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (name LIKE ? OR sku LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (stock === 'out') { sql += ' AND quantity = 0'; }
  else if (stock === 'low') { sql += ' AND quantity > 0 AND quantity <= threshold'; }
  else if (stock === 'ok') { sql += ' AND quantity > threshold'; }

  sql += ' ORDER BY name ASC';
  ok(res, db.prepare(sql).all(...params));
});

app.get('/api/products/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!p) return err(res, 'Product not found', 404);
  ok(res, p);
});

app.post('/api/products', (req, res) => {
  const { name, sku, category, quantity, threshold, cost_price, sell_price } = req.body;
  if (!name || !sku) return err(res, 'Name and SKU are required');
  if (quantity < 0) return err(res, 'Quantity cannot be negative');

  try {
    const result = db.prepare(`
      INSERT INTO products (name, sku, category, quantity, threshold, cost_price, sell_price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, sku, category || null, quantity || 0, threshold || 5, cost_price || 0, sell_price || 0);

    logActivity(`Added product: <strong>${name}</strong>`, '#00e5a0');
    ok(res, db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid), 201);
  } catch (e) {
    if (e.message.includes('UNIQUE')) return err(res, 'SKU already exists');
    err(res, e.message);
  }
});

app.put('/api/products/:id', (req, res) => {
  const { name, sku, category, quantity, threshold, cost_price, sell_price } = req.body;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return err(res, 'Product not found', 404);

  try {
    db.prepare(`
      UPDATE products SET name=?, sku=?, category=?, quantity=?, threshold=?,
        cost_price=?, sell_price=?, updated_at=datetime('now')
      WHERE id=?
    `).run(
      name || existing.name, sku || existing.sku, category ?? existing.category,
      quantity ?? existing.quantity, threshold ?? existing.threshold,
      cost_price ?? existing.cost_price, sell_price ?? existing.sell_price,
      req.params.id
    );
    logActivity(`Updated product: <strong>${name || existing.name}</strong>`, '#7c6fff');
    ok(res, db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id));
  } catch (e) {
    if (e.message.includes('UNIQUE')) return err(res, 'SKU already exists');
    err(res, e.message);
  }
});

app.delete('/api/products/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!p) return err(res, 'Product not found', 404);
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  logActivity(`Deleted product: <strong>${p.name}</strong>`, '#ff4757');
  ok(res, { deleted: true });
});

app.get('/api/products/categories/list', (req, res) => {
  const rows = db.prepare('SELECT DISTINCT category FROM products WHERE category IS NOT NULL').all();
  ok(res, rows.map(r => r.category));
});

// ============================================================
// SALES  /api/sales
// ============================================================
app.get('/api/sales', (req, res) => {
  const sales = db.prepare('SELECT * FROM sales ORDER BY created_at DESC').all();
  ok(res, sales);
});

app.get('/api/sales/:id', (req, res) => {
  const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(req.params.id);
  if (!sale) return err(res, 'Sale not found', 404);
  sale.items = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(sale.id);
  ok(res, sale);
});

app.post('/api/sales', (req, res) => {
  const { items } = req.body;
  if (!items || !items.length) return err(res, 'Items are required');

  // Validate all items first
  for (const item of items) {
    if (!item.product_id || !item.qty || item.qty <= 0) return err(res, 'Invalid item data');
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id);
    if (!product) return err(res, `Product ${item.product_id} not found`, 404);
    if (product.quantity < item.qty) return err(res, `Insufficient stock for "${product.name}"`);
  }

  const sale = db.transaction(() => {
    const receiptNo = 'REC-' + Date.now();
    let total = 0;
    const saleItems = [];

    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id);
      const price = item.unit_price || product.sell_price;
      const subtotal = price * item.qty;
      total += subtotal;
      saleItems.push({ ...item, product_name: product.name, unit_price: price, subtotal });
      db.prepare('UPDATE products SET quantity = quantity - ?, updated_at = datetime("now") WHERE id = ?')
        .run(item.qty, item.product_id);
    }

    const result = db.prepare(`INSERT INTO sales (receipt_no, total, item_count) VALUES (?, ?, ?)`)
      .run(receiptNo, total, saleItems.length);

    for (const si of saleItems) {
      db.prepare(`INSERT INTO sale_items (sale_id, product_id, product_name, qty, unit_price, subtotal) VALUES (?,?,?,?,?,?)`)
        .run(result.lastInsertRowid, si.product_id, si.product_name, si.qty, si.unit_price, si.subtotal);
    }

    logActivity(`Sale recorded: <strong>${receiptNo}</strong> — ₱${total.toFixed(2)}`, '#ff6b35');
    return { id: result.lastInsertRowid, receiptNo, total, itemCount: saleItems.length };
  })();

  ok(res, sale, 201);
});

// ============================================================
// PURCHASES  /api/purchases
// ============================================================
app.get('/api/purchases', (req, res) => {
  ok(res, db.prepare('SELECT * FROM purchases ORDER BY created_at DESC').all());
});

app.post('/api/purchases', (req, res) => {
  const { product_id, qty, unit_cost, supplier } = req.body;
  if (!product_id || !qty || qty <= 0) return err(res, 'Product and valid quantity required');

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
  if (!product) return err(res, 'Product not found', 404);

  const poNo = 'PO-' + Date.now();
  const total = (unit_cost || 0) * qty;

  db.prepare(`INSERT INTO purchases (po_no, product_id, product_name, supplier, qty, unit_cost, total) VALUES (?,?,?,?,?,?,?)`)
    .run(poNo, product_id, product.name, supplier || null, qty, unit_cost || 0, total);

  db.prepare('UPDATE products SET quantity = quantity + ?, updated_at = datetime("now") WHERE id = ?')
    .run(qty, product_id);

  logActivity(`Restocked: <strong>${product.name}</strong> +${qty} units`, '#7c6fff');
  ok(res, { poNo, product: product.name, qty, total }, 201);
});

// ============================================================
// REPORTS  /api/reports
// ============================================================
app.get('/api/reports/summary', (req, res) => {
  const totalRevenue = db.prepare('SELECT COALESCE(SUM(total),0) as v FROM sales').get().v;
  const totalCost = db.prepare('SELECT COALESCE(SUM(total),0) as v FROM purchases').get().v;
  const totalProducts = db.prepare('SELECT COUNT(*) as v FROM products').get().v;
  const totalSales = db.prepare('SELECT COUNT(*) as v FROM sales').get().v;
  const lowStock = db.prepare('SELECT COUNT(*) as v FROM products WHERE quantity <= threshold').get().v;

  ok(res, { totalRevenue, totalCost, grossProfit: totalRevenue - totalCost, totalProducts, totalSales, lowStock });
});

app.get('/api/reports/sales-by-product', (req, res) => {
  const rows = db.prepare(`
    SELECT product_name, SUM(qty) as units_sold, SUM(subtotal) as revenue
    FROM sale_items GROUP BY product_name ORDER BY revenue DESC
  `).all();
  ok(res, rows);
});

app.get('/api/reports/daily-sales', (req, res) => {
  const rows = db.prepare(`
    SELECT date(created_at) as day, SUM(total) as total, COUNT(*) as count
    FROM sales GROUP BY date(created_at) ORDER BY day DESC LIMIT 30
  `).all();
  ok(res, rows);
});

// ============================================================
// ACTIVITY  /api/activity
// ============================================================
app.get('/api/activity', (req, res) => {
  ok(res, db.prepare('SELECT * FROM activity ORDER BY created_at DESC LIMIT 50').all());
});

// ============================================================
// ALERTS  /api/alerts
// ============================================================
app.get('/api/alerts', (req, res) => {
  ok(res, db.prepare('SELECT * FROM products WHERE quantity <= threshold ORDER BY quantity ASC').all());
});

// ============================================================
// SERVE FRONTEND
// ============================================================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─── Start ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ StockWise Server running at http://localhost:${PORT}`);
  console.log(`📦 Database: ${path.join(__dirname, 'stockwise.db')}`);
  console.log(`🔐 Default login: admin / admin123\n`);
});

module.exports = app;
