# 📦 StockWise — Offline Inventory Management System MVP

A complete, offline-capable inventory management system for small businesses.

## 🚀 Quick Start (No Installation)

1. Download `frontend/index.html`
2. Open it in Chrome / Firefox
3. Login: `admin` / `admin123`
4. ✅ Works completely offline!

## 🖥️ Full Stack Setup

```bash
cd backend
npm install
npm start
# Open: http://localhost:3001
```

## ✨ Features

- 📦 Product management (add, edit, delete)
- 🧾 Sales recording + receipts
- 🛒 Purchase / restock tracking
- ⚠️ Low stock alerts
- 📈 Reports + CSV export
- 💾 Backup & restore (JSON)
- 🔐 Admin login
- 📴 Works 100% offline

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Storage (offline) | IndexedDB (browser) |
| Backend (optional) | Node.js + Express |
| Database (backend) | SQLite (better-sqlite3) |

## 📁 Structure

```
stockwise-inventory/
├── frontend/index.html     ← Standalone offline app
├── backend/server.js       ← REST API server
├── backend/package.json    ← Dependencies
└── MANUAL.md               ← Full documentation
```

## 📘 Documentation

See [MANUAL.md](MANUAL.md) for full installation guide, API docs, and usage instructions.

## 🔐 Default Credentials

- Username: `admin`
- Password: `admin123`
