# 📘 StockWise Inventory System — Manual of Operations
**Version:** MVP 1.0  
**Last Updated:** 2026  
**License:** Open-Source (MIT)

---

## TABLE OF CONTENTS

1. [System Overview](#1-system-overview)
2. [Installation Guide](#2-installation-guide)
3. [System Usage Guide](#3-system-usage-guide)
4. [Database Schema](#4-database-schema)
5. [API Documentation](#5-api-documentation)
6. [Backup & Restore](#6-backup--restore)
7. [Troubleshooting](#7-troubleshooting)
8. [Optional Features](#8-optional-features)

---

## 1. SYSTEM OVERVIEW

StockWise is a lightweight, offline-capable inventory management system designed for small businesses. It allows you to:

- Track products and stock levels
- Record sales transactions and generate receipts
- Record purchases and restock inventory
- View low-stock alerts
- Export reports and backup data

### Architecture

```
┌─────────────────────────────────────────────┐
│              FRONTEND (Browser)              │
│         HTML + CSS + JavaScript              │
│    Data stored in: IndexedDB (offline)       │
└──────────────────┬──────────────────────────┘
                   │ REST API (optional)
┌──────────────────▼──────────────────────────┐
│              BACKEND (Node.js)               │
│           Express.js REST API                │
│         SQLite database on disk              │
└─────────────────────────────────────────────┘
```

### Offline-First Design

The frontend uses **IndexedDB** (browser storage) so it works completely without the backend. The backend (Node.js + SQLite) is optional and is used when you need:
- Multi-device access
- Server-side data persistence
- REST API integration

---

## 2. INSTALLATION GUIDE

### Option A: Frontend Only (No Installation Required)

1. Download `frontend/index.html`
2. Open it in any modern web browser (Chrome, Firefox, Edge, Safari)
3. The system runs entirely in the browser using IndexedDB
4. ✅ No internet connection needed after the first load (fonts load from Google)

**To make it work 100% offline:** Open the file once online (fonts cache automatically), then it works offline indefinitely.

---

### Option B: Full Stack (Frontend + Backend)

#### Prerequisites

| Software | Version | Download |
|----------|---------|----------|
| Node.js  | ≥ 16.0  | https://nodejs.org |
| npm      | ≥ 8.0   | Comes with Node.js |

#### Step 1 — Download the project

```bash
# Option 1: Clone from GitHub (if hosted)
git clone https://github.com/yourname/stockwise-inventory.git
cd stockwise-inventory

# Option 2: Download ZIP, extract, then:
cd stockwise-inventory
```

#### Step 2 — Install backend dependencies

```bash
cd backend
npm install
```

This installs:
- `express` — HTTP server framework
- `better-sqlite3` — Fast SQLite database
- `cors` — Cross-origin resource sharing

#### Step 3 — Start the server

```bash
# Normal start
npm start

# Development mode (auto-restart on changes)
npm run dev
```

**Expected output:**
```
✅ StockWise Server running at http://localhost:3001
📦 Database: /path/to/stockwise.db
🔐 Default login: admin / admin123
```

#### Step 4 — Open the app

Open your browser and go to:
```
http://localhost:3001
```

The database file `stockwise.db` is created automatically on first run.

---

### Project File Structure

```
stockwise-inventory/
├── frontend/
│   └── index.html          ← Complete offline frontend app
├── backend/
│   ├── server.js           ← Express API server
│   ├── package.json        ← Node.js dependencies
│   └── stockwise.db        ← SQLite database (auto-created)
└── MANUAL.md               ← This document
```

---

## 3. SYSTEM USAGE GUIDE

### 3.1 Logging In

1. Open the app in your browser
2. Enter credentials:
   - **Username:** `admin`
   - **Password:** `admin123`
3. Click **Sign In**

> **Note:** To change the password, edit the `CREDS` object in `index.html` (frontend) or update the `users` table in the database (backend).

---

### 3.2 Dashboard

The dashboard shows:
- **Total Products** — Count of all products
- **Total Sales** — Number of transactions recorded
- **Total Revenue** — Sum of all sales
- **Low Stock Items** — Products at or below threshold
- **Sales Chart** — Bar chart of last 7 days
- **Top Products** — By stock value
- **Activity Feed** — Recent system actions

---

### 3.3 Adding a Product

1. Navigate to **Products** in the sidebar
2. Click **+ Add Product** (top right)
3. Fill in the form:

| Field | Required | Description |
|-------|----------|-------------|
| Product Name | ✅ | Full product name |
| SKU | ✅ | Unique stock-keeping unit code (e.g., WM-001) |
| Category | No | Group (e.g., Electronics, Accessories) |
| Quantity | ✅ | Current stock count |
| Low Stock Alert | No | Quantity threshold for alerts (default: 5) |
| Cost Price | No | What you paid per unit |
| Selling Price | No | What you sell it for |

4. Click **Save Product**

---

### 3.4 Editing a Product

1. Find the product in the **Products** table
2. Click the ✏️ (edit) button
3. Update the fields
4. Click **Save Product**

> **Note:** Editing quantity directly here is for corrections. Use **Purchases** for normal restocking.

---

### 3.5 Deleting a Product

1. Find the product in the **Products** table
2. Click the 🗑 (delete) button
3. Confirm the deletion

> ⚠️ **Warning:** Deleting a product does NOT delete associated sales history.

---

### 3.6 Recording a Sale

1. Navigate to **Sales** in the sidebar
2. Click **+ New Sale**
3. In the modal:
   - Select a product from the dropdown
   - Set the quantity
   - The price auto-fills from the product's selling price
   - Click **+ Add Item** to add more products to the same sale
4. Review the **Total** at the bottom
5. Click **Complete Sale**

A receipt is automatically generated. You can print it using the **🖨 Print** button.

> **Stock is automatically deducted** when a sale is recorded.

---

### 3.7 Viewing Receipts

1. Navigate to **Sales**
2. Find the transaction in the table
3. Click **🧾 View** to see the receipt
4. Click **🖨 Print** to print it

---

### 3.8 Recording a Purchase (Restock)

1. Navigate to **Purchases** in the sidebar
2. Click **+ Add Purchase**
3. Fill in the form:

| Field | Required | Description |
|-------|----------|-------------|
| Product | ✅ | Select the product to restock |
| Quantity | ✅ | Number of units received |
| Unit Cost | No | Price paid per unit |
| Supplier | No | Supplier or vendor name |

4. Click **Save Purchase**

> **Stock is automatically increased** when a purchase is recorded.

---

### 3.9 Low Stock Alerts

1. Navigate to **Low Stock** (⚠️) in the sidebar
2. View all products at or below their threshold
3. Click **Restock** next to any product to quickly open the purchase form

The badge number on the sidebar shows how many products need attention.

---

### 3.10 Searching Products

Use the **search bar** at the top of the screen to search by:
- Product name
- SKU code

You can also filter by **Category** and **Stock Status** on the Products page.

---

### 3.11 Reports

1. Navigate to **Reports** in the sidebar
2. View summary stats: Revenue, Cost, Gross Profit
3. See sales breakdown by product
4. Export data using the buttons:
   - **⬇ Export Products CSV** — Full product catalog
   - **⬇ Export Sales CSV** — All transactions
   - **⬇ Export Purchases CSV** — All purchase history

---

## 4. DATABASE SCHEMA

### products

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment ID |
| name | TEXT | Product name |
| sku | TEXT UNIQUE | Stock keeping unit |
| category | TEXT | Optional category |
| quantity | INTEGER | Current stock |
| threshold | INTEGER | Low-stock alert level |
| cost_price | REAL | Purchase cost per unit |
| sell_price | REAL | Selling price per unit |
| created_at | TEXT | ISO timestamp |
| updated_at | TEXT | ISO timestamp |

### sales

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment ID |
| receipt_no | TEXT UNIQUE | Receipt number (REC-timestamp) |
| total | REAL | Total sale amount |
| item_count | INTEGER | Number of line items |
| created_at | TEXT | ISO timestamp |

### sale_items

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment ID |
| sale_id | INTEGER FK | References sales.id |
| product_id | INTEGER FK | References products.id |
| product_name | TEXT | Snapshot of product name |
| qty | INTEGER | Units sold |
| unit_price | REAL | Price at time of sale |
| subtotal | REAL | qty × unit_price |

### purchases

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment ID |
| po_no | TEXT UNIQUE | PO number (PO-timestamp) |
| product_id | INTEGER FK | References products.id |
| product_name | TEXT | Snapshot of product name |
| supplier | TEXT | Optional supplier name |
| qty | INTEGER | Units received |
| unit_cost | REAL | Cost per unit |
| total | REAL | qty × unit_cost |
| created_at | TEXT | ISO timestamp |

### Entity Relationship Diagram

```
products ──────┬────────── sale_items ─── sales
               │              (many)      (one)
               │
               └────────── purchases
                              (many)
```

---

## 5. API DOCUMENTATION

Base URL: `http://localhost:3001/api`

### Authentication

**POST /api/auth/login**
```json
Request:  { "username": "admin", "password": "admin123" }
Response: { "success": true, "data": { "id": 1, "username": "admin", "role": "admin" } }
```

---

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | List all products |
| GET | /api/products/:id | Get single product |
| POST | /api/products | Create product |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |
| GET | /api/products/categories/list | List all categories |

**Query parameters for GET /api/products:**
- `?search=keyword` — Search name or SKU
- `?category=Electronics` — Filter by category
- `?stock=low` — Filter: `ok`, `low`, `out`

**POST /api/products body:**
```json
{
  "name": "Wireless Mouse",
  "sku": "WM-001",
  "category": "Electronics",
  "quantity": 50,
  "threshold": 10,
  "cost_price": 350.00,
  "sell_price": 599.00
}
```

---

### Sales

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/sales | List all sales |
| GET | /api/sales/:id | Get sale with items |
| POST | /api/sales | Create sale (deducts stock) |

**POST /api/sales body:**
```json
{
  "items": [
    { "product_id": 1, "qty": 2, "unit_price": 599.00 },
    { "product_id": 3, "qty": 1, "unit_price": 150.00 }
  ]
}
```

---

### Purchases

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/purchases | List all purchases |
| POST | /api/purchases | Record purchase (adds stock) |

**POST /api/purchases body:**
```json
{
  "product_id": 1,
  "qty": 100,
  "unit_cost": 350.00,
  "supplier": "TechSupply Co."
}
```

---

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/reports/summary | Revenue, cost, profit |
| GET | /api/reports/sales-by-product | Sales grouped by product |
| GET | /api/reports/daily-sales | Daily totals (last 30 days) |

---

### Alerts & Activity

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/alerts | Products at/below threshold |
| GET | /api/activity | Last 50 activity log entries |

---

## 6. BACKUP & RESTORE

### Frontend (Browser / IndexedDB)

**To Export:**
1. Go to **Backup** in the sidebar
2. Click **⬇ Download Backup JSON**
3. A `.json` file is saved to your Downloads folder

**To Restore:**
1. Go to **Backup** in the sidebar
2. Click **📂 Choose Backup File**
3. Select your `.json` backup file
4. Confirm the restore

> ⚠️ Restoring overwrites all current data.

---

### Backend (SQLite)

**Manual backup:**
```bash
# Copy the database file
cp backend/stockwise.db backup/stockwise-$(date +%Y%m%d).db
```

**Restore from backup:**
```bash
# Stop the server first, then replace the database
cp backup/stockwise-20260101.db backend/stockwise.db
# Restart the server
```

**Export to JSON via API:**
```bash
# Use curl or a browser to call the API
curl http://localhost:3001/api/products > products-backup.json
curl http://localhost:3001/api/sales > sales-backup.json
```

---

## 7. TROUBLESHOOTING

### Problem: App doesn't open / white screen
**Solution:**
- Make sure you're opening `index.html` in a modern browser
- Try Chrome or Firefox (not Internet Explorer)
- Check the browser console for errors (F12 → Console)

---

### Problem: "Cannot find module" when starting server
**Solution:**
```bash
cd backend
npm install   # Re-install dependencies
```

---

### Problem: Port 3001 already in use
**Solution:**
```bash
# Change port in server.js, line: const PORT = 3002;
# Or kill the process using the port:
# Windows:
netstat -ano | findstr :3001
taskkill /PID [PID_NUMBER] /F

# Mac/Linux:
lsof -ti:3001 | xargs kill
```

---

### Problem: SKU already exists error
**Solution:** Each product must have a unique SKU. Check the Products list and choose a different SKU code.

---

### Problem: Data disappears after closing browser
**Cause:** Browser private/incognito mode deletes IndexedDB on close.
**Solution:** Use regular (non-private) browser mode.

---

### Problem: Can't delete a product
**Cause:** A product may have associated sale history.
**Solution:** In the backend, deletion is blocked if related records exist. Export data first, or clear references manually in the database.

---

### Problem: Low stock alert not showing
**Solution:** 
- Check that the product's **Threshold** value is set correctly
- If threshold is 0, no alert will trigger
- The badge updates when you navigate to any page

---

### Problem: Receipt won't print
**Solution:**
- Make sure pop-ups are allowed for the page
- Try a different browser
- Alternatively, copy the receipt text and paste into a document

---

## 8. OPTIONAL FEATURES

These features can be added to extend the MVP:

### Multi-User Support
- Add a `users` table with roles (admin, staff, viewer)
- Use JWT tokens for session management
- Install: `npm install jsonwebtoken bcryptjs`

### Barcode Scanner Support
```html
<!-- Add to index.html: -->
<script src="https://cdn.jsdelivr.net/npm/quagga@0.12.1/dist/quagga.min.js"></script>
```

### Email Notifications (Low Stock)
```bash
npm install nodemailer
# Configure SMTP in server.js to send alerts
```

### PWA (Install as App)
Add a `manifest.json` and `service-worker.js` to make the app installable on mobile/desktop.

### Cloud Sync
Use a free tier of:
- **Supabase** (PostgreSQL + REST API)
- **Firebase Firestore** (NoSQL)
- **PocketBase** (self-hosted)

---

## QUICK REFERENCE CARD

| Action | Where | How |
|--------|-------|-----|
| Add product | Products | + Add Product button |
| Edit product | Products | ✏️ button in row |
| Delete product | Products | 🗑 button in row |
| Record sale | Sales | + New Sale button |
| View receipt | Sales | 🧾 View button |
| Restock | Purchases | + Add Purchase button |
| Low stock alerts | ⚠️ Sidebar | Low Stock page |
| Export CSV | Reports | ⬇ Export buttons |
| Backup data | Backup | ⬇ Download Backup |
| Restore data | Backup | 📂 Choose Backup File |
| Search products | Top bar | Search field |

---

*StockWise MVP — Built with HTML, CSS, JavaScript, Node.js, and SQLite*  
*All components are free and open-source.*
