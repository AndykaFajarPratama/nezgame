# 🎮 NezGame - Platform Top Up Game #1 Indonesia

Platform top up game otomatis dengan harga terjangkau, proses instan, dan keamanan terjamin.

## 📁 Struktur Project

```
web/
├── index.html          # 🎨 FRONTEND - Halaman utama
├── index.css           # 🎨 FRONTEND - Stylesheet
├── app.js              # 🎨 FRONTEND - JavaScript logic
├── favicon.svg         # 🎨 FRONTEND - Favicon
├── manifest.json       # 🎨 FRONTEND - PWA manifest
├── nez_mascot_*.png    # 🎨 FRONTEND - Gambar mascot
│
├── main.py             # ⚙️ BACKEND - FastAPI server
├── models.py           # ⚙️ BACKEND - Database models
├── database.py         # ⚙️ BACKEND - Database config
├── api_services.py     # ⚙️ BACKEND - Apigame & Midtrans
├── seed_db.py          # ⚙️ BACKEND - Database seeder
│
├── .env                # 🔒 Config (JANGAN di-commit!)
├── .env.example        # 📝 Template config
├── requirements.txt    # 📦 Python dependencies
├── Procfile            # 🚀 Process file (Render)
├── render.yaml         # 🚀 Render deployment config
├── robots.txt          # 🔍 SEO
├── sitemap.xml         # 🔍 SEO
└── .gitignore          # Git ignore rules
```

## 🚀 Cara Menjalankan (Local)

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env dengan API keys kamu
```

### 3. Seed Database (Opsional)
```bash
python seed_db.py
```

### 4. Jalankan Server
```bash
uvicorn main:app --reload --port 8000
```

Buka `http://localhost:8000` di browser.

## 🌐 Deploy ke Render (GRATIS)

### Langkah-langkah:
1. Push project ke GitHub
2. Buka [render.com](https://render.com) dan sign up
3. Klik **New → Web Service**
4. Connect repository GitHub
5. Render akan otomatis detect `render.yaml`
6. Tambahkan Environment Variables di dashboard Render:
   - `APP_ENV` = `production`
   - `MIDTRANS_SERVER_KEY` = key kamu
   - `MIDTRANS_CLIENT_KEY` = key kamu
   - `APIGAME_MERCHANT_ID` = id kamu
   - `APIGAME_SECRET_KEY` = key kamu
7. Deploy! 🎉

Domain gratis: `https://nezgame.onrender.com`

## ⚠️ Catatan Production

- Ganti Midtrans Sandbox keys ke Production keys
- Update `MIDTRANS_IS_PRODUCTION=True` di `.env`
- Update script Midtrans di `index.html` dari `sandbox` ke `production`:
  ```html
  <!-- Sandbox -->
  <script src="https://app.sandbox.midtrans.com/snap/snap.js" ...>
  <!-- Production -->
  <script src="https://app.midtrans.com/snap/snap.js" ...>
  ```
- Set `APP_ENV=production` untuk security headers & CORS

## 📡 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/` | Halaman utama |
| GET | `/api/health` | Health check |
| GET | `/api/categories` | Daftar game |
| GET | `/api/products/{slug}` | Produk per game |
| POST | `/api/checkout` | Buat transaksi |
| GET | `/api/transaction/{inv}` | Cek transaksi |
| POST | `/api/callback/midtrans` | Midtrans webhook |
| POST | `/api/admin/sync` | Sync produk Apigame |

## 💬 Customer Service

WhatsApp: [08223456889](https://wa.me/628223456889)
