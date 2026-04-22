# 📘 NezGame API Documentation

**Base URL:** `https://nezgame-production-c-[hash].up.railway.app`  
**Version:** 2.0  
**Last Updated:** 2026-04-22

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Health Check](#health-check)
4. [Auth - Better Auth](#auth---better-auth)
5. [Auth - Custom Registration](#auth---custom-registration)
6. [Catalog](#catalog)
7. [Transactions](#transactions)
8. [Settings](#settings)
9. [Admin](#admin)
10. [Owner Dashboard](#owner-dashboard)
11. [Error Handling](#error-handling)
12. [Rate Limiting](#rate-limiting)
13. [Environment Variables](#environment-variables)
14. [Database Schema](#database-schema)
15. [External Services](#external-services)

---

## Overview

NezGame API adalah backend untuk platform top-up game otomatis. Dibangun dengan:

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL + Drizzle ORM
- **Authentication:** Better Auth (session-based)
- **Payment:** Midtrans Snap
- **Game Fulfillment:** Apigames.id API
- **Email:** EmailJS REST API
- **Hosting:** Railway

### Architecture

```
Frontend (Vercel) ──→ Backend API (Railway) ──→ PostgreSQL (Railway DB)
                                            ──→ Midtrans (Payment)
                                            ──→ Apigames (Fulfillment)
                                            ──→ EmailJS (Email OTP)
```

---

## Authentication

NezGame menggunakan **session-based authentication** via Better Auth. Session dikirim sebagai cookie.

### Roles & Permissions (RBAC)

| Role | ID | Permissions |
|------|----|-------------|
| **Owner** | 1 | Full access (all permissions + owner dashboard) |
| **Admin** | 2 | `view_products`, `create_transaction`, `update_pricing`, `view_all_transactions` |
| **Customer** | 3 | Checkout (guest OK), view own orders |

### Auth Headers

Session cookie dikirim otomatis oleh browser. Untuk API client:
```
Cookie: better-auth.session_token=<session_token>
```

---

## Health Check

### `GET /api/health`

Cek status server.

**Auth:** None

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-04-22T07:00:00.000Z",
  "env": "production"
}
```

---

## Auth - Better Auth

Better Auth menangani semua endpoint di bawah `/api/auth/*` secara otomatis.

### `POST /api/auth/sign-up/email`

Registrasi user baru (digunakan internal, user biasa gunakan custom registration).

**Body:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "securepassword"
}
```

---

### `POST /api/auth/sign-in/email`

Login user.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": "abc123",
    "name": "User Name",
    "email": "user@example.com",
    "emailVerified": true,
    "roleId": 3
  },
  "session": {
    "id": "session-id",
    "token": "session-token",
    "expiresAt": "2026-04-23T07:00:00.000Z"
  }
}
```

---

### `POST /api/auth/sign-out`

Logout user (invalidate session).

**Auth:** Required (session cookie)

---

### `GET /api/auth/get-session`

Get current session info.

**Auth:** Required (session cookie)

**Response:**
```json
{
  "user": {
    "id": "abc123",
    "name": "User Name",
    "email": "user@example.com",
    "roleId": 3
  },
  "session": { ... }
}
```

---

### `POST /api/auth/forget-password`

Request password reset link.

**Body:**
```json
{
  "email": "user@example.com",
  "redirectTo": "https://nezgame.vercel.app/reset-password"
}
```

---

### `POST /api/auth/reset-password`

Reset password using token.

**Body:**
```json
{
  "token": "reset-token",
  "newPassword": "newsecurepassword"
}
```

---

## Auth - Custom Registration

Alur registrasi 2 langkah dengan OTP email verification.

### `POST /api/auth/custom/register-request`

**Step 1:** Kirim OTP ke email user.

**Auth:** None

**Body:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Kode verifikasi telah dikirim ke email Anda.",
  "email": "user@example.com"
}
```

**Response (Error - Email exists):**
```json
{
  "error": "Email sudah terdaftar."
}
```

---

### `POST /api/auth/custom/register-verify`

**Step 2:** Verifikasi OTP dan buat akun.

**Auth:** None

**Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Pendaftaran berhasil! Silakan masuk.",
  "data": { ... }
}
```

**Response (Error):**
```json
{
  "error": "Kode OTP salah."
}
```

---

## Catalog

### `GET /api/categories`

Daftar semua kategori game.

**Auth:** None

**Response:**
```json
[
  {
    "id": 1,
    "name": "Mobile Legends",
    "slug": "mobile-legends",
    "imageUrl": "https://example.com/ml.png",
    "createdAt": "2026-04-01T00:00:00.000Z",
    "activeProductCount": 15
  },
  {
    "id": 2,
    "name": "Genshin Impact",
    "slug": "genshin-impact",
    "imageUrl": "https://example.com/gi.png",
    "createdAt": "2026-04-01T00:00:00.000Z",
    "activeProductCount": 6
  }
]
```

---

### `GET /api/products/:slug`

Daftar produk berdasarkan kategori slug. Harga dihitung secara dinamis.

**Auth:** None

**Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `slug` | path | Slug kategori (contoh: `genshin-impact`) |
| `method` | query (optional) | Payment method: `qris`, `va`, `default` |

**Response:**
```json
[
  {
    "id": 1,
    "sku_code": "GI60GC",
    "name": "60 Genesis Crystals",
    "price_sell": 16667,
    "status": "active",
    "needs_zone_id": true
  },
  {
    "id": 2,
    "sku_code": "GI330GC",
    "name": "330 Genesis Crystals",
    "price_sell": 83334,
    "status": "active",
    "needs_zone_id": true
  }
]
```

> **Note:** `price_sell` sudah termasuk markup profit + gateway fee. `harga_modal` TIDAK dikirim ke client.

---

### `POST /api/validate/:slug`

Validasi akun game sebelum checkout.

**Auth:** None  
**Rate Limit:** 30 request per 15 menit

**Body:**
```json
{
  "target_id": "808629310",
  "zone_id": "asia"
}
```

**Games yang didukung Apigames v1 cek-username:**
| Slug | Game Code | Validasi |
|------|-----------|----------|
| `mobile-legends` | `mobilelegend` | ✅ API Apigames (nickname real) |
| `free-fire` | `freefire` | ✅ API Apigames (nickname real) |

**Games dengan validasi format UID:**
| Slug | Format | Validasi |
|------|--------|----------|
| `genshin-impact` | 9-10 digit angka | ✅ Format check |
| `honkai-star-rail` | 9-10 digit angka | ✅ Format check |
| `valorant` | Min 3 karakter | ✅ Format check |
| `pubg-mobile` | 6-12 digit angka | ✅ Format check |
| `call-of-duty-mobile` | 6-20 digit angka | ✅ Format check |
| `arena-of-valor` | 6-15 digit angka | ✅ Format check |

**Response (Valid - API):**
```json
{
  "success": true,
  "nickname": "PlayerName123",
  "raw": { "is_valid": true, "username": "PlayerName123" }
}
```

**Response (Valid - Format):**
```json
{
  "success": true,
  "nickname": "UID 808629310 (Format Valid ✓)"
}
```

**Response (Invalid):**
```json
{
  "success": false,
  "message": "Akun tidak ditemukan atau ID salah."
}
```

---

### `POST /api/admin/sync`

Sync produk dari Apigames ke database.

**Auth:** Required (permission: `update_pricing`)

**Response:**
```json
{
  "success": true,
  "message": "Synced products",
  "created": 5,
  "updated": 12
}
```

---

## Transactions

### `POST /api/checkout`

Buat transaksi dan dapatkan Midtrans Snap token.

**Auth:** Optional (guest checkout OK)  
**Rate Limit:** 10 request per 15 menit

**Body:**
```json
{
  "sku_code": "GI60GC",
  "target_id": "808629310",
  "zone_id": "asia",
  "payment_method": "qris",
  "customer_name": "John",
  "customer_email": "john@example.com",
  "customer_phone": "081234567890"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sku_code` | string | ✅ | SKU produk |
| `target_id` | string | ✅ | ID akun game |
| `zone_id` | string | ❌ | Zone/Server ID (jika diperlukan) |
| `payment_method` | string | ❌ | `qris`, `va`, `default` |
| `customer_name` | string | ❌ | Nama customer |
| `customer_email` | string | ❌ | Email untuk receipt |
| `customer_phone` | string | ❌ | Phone customer |

**Response (Success):**
```json
{
  "success": true,
  "invoice": "INV-A1B2C3D4",
  "snapToken": "tok_abc123..."
}
```

**Response (Error - Validation):**
```json
{
  "success": false,
  "error": "SKU Code required",
  "message": "SKU Code required"
}
```

**Response (Error - Payment Gateway):**
```json
{
  "success": false,
  "error": "Payment gateway error: ...",
  "message": "Gagal menghubungi payment gateway. ..."
}
```

### Flow Checkout:
```
1. POST /api/checkout → snapToken
2. Frontend: window.snap.pay(snapToken)
3. User bayar via Midtrans popup
4. Midtrans → POST /api/callback/midtrans (webhook)
5. Backend: Update status → Dispatch ke Apigames → Update final status
```

---

### `POST /api/callback/midtrans`

Webhook dari Midtrans setelah pembayaran.

**Auth:** None (verified via Midtrans SDK)

**Body:** Midtrans notification payload (otomatis dari Midtrans)

**Flow Internal:**
1. Verify notification via `midtransService.verifyNotification()`
2. Jika `settlement/capture` + `fraud_status: accept` → status = `PAID`
3. Dispatch order ke Apigames API
4. Jika Apigames sukses → status = `SUCCESS`
5. Jika Apigames gagal → status = `FAILED` (bisa retry via admin)

**Response:**
```json
{ "success": true }
```

---

### `GET /api/transaction/:invoice`

Cek status transaksi (public receipt).

**Auth:** None

**Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `invoice` | path | Invoice number (contoh: `INV-A1B2C3D4`) |

**Response:**
```json
{
  "invoice_number": "INV-A1B2C3D4",
  "target_id": "808629310",
  "zone_id": "asia",
  "product_sku": "GI60GC",
  "amount": 16667,
  "status": "SUCCESS",
  "created_at": "2026-04-22T07:00:00.000Z"
}
```

**Status Values:**
| Status | Description |
|--------|-------------|
| `UNPAID` | Menunggu pembayaran |
| `PAID` | Pembayaran diterima, menunggu fulfillment |
| `SUCCESS` | Top-up berhasil dikirim |
| `FAILED` | Gagal (bisa di-retry admin) |

---

### `GET /api/user/orders`

Riwayat order user yang login.

**Auth:** Required (session cookie)

**Response:**
```json
[
  {
    "id": 1,
    "invoiceNumber": "INV-A1B2C3D4",
    "targetId": "808629310",
    "zoneId": "asia",
    "productSku": "GI60GC",
    "amount": 16667,
    "status": "SUCCESS",
    "createdAt": "2026-04-22T07:00:00.000Z",
    "productName": "60 Genesis Crystals",
    "categoryName": "Genshin Impact",
    "categorySlug": "genshin-impact",
    "categoryImage": "https://..."
  }
]
```

---

### `POST /api/admin/transaction/:id/retry`

Retry order yang gagal di Apigames.

**Auth:** Required (permission: `create_transaction`)

**Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `id` | path | Invoice number |

**Response:**
```json
{
  "success": true,
  "message": "Order successfully fulfilled!",
  "raw": { "status": 1, "ref_id": "..." }
}
```

---

### `GET /api/admin/transactions`

Daftar semua transaksi (admin view).

**Auth:** Required (permission: `view_all_transactions`)

**Response:**
```json
[
  {
    "id": 1,
    "invoiceNumber": "INV-A1B2C3D4",
    "targetId": "808629310",
    "zoneId": "asia",
    "productSku": "GI60GC",
    "amount": 16667,
    "hargaModal": 14000,
    "hargaJual": 16667,
    "status": "SUCCESS",
    "createdAt": "2026-04-22T07:00:00.000Z"
  }
]
```

---

## Settings

### `GET /api/settings`

Ambil semua site settings.

**Auth:** None

**Response:**
```json
{
  "site_name": "NezGame",
  "whatsapp_number": "6281234567890",
  "maintenance_mode": "false"
}
```

---

### `POST /api/settings`

Update atau buat setting baru.

**Auth:** None (⚠️ sebaiknya ditambahkan auth)

**Body:**
```json
{
  "key": "whatsapp_number",
  "value": "6281234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pengaturan whatsapp_number berhasil diperbarui."
}
```

---

## Admin

### `GET /api/admin/stats`

Dashboard statistics.

**Auth:** None (⚠️ sebaiknya ditambahkan auth)

**Response:**
```json
{
  "revenue": 5000000,
  "users": 150,
  "orders": 320,
  "uptime": "99.9%"
}
```

---

### `GET /api/admin/chart`

Data grafik transaksi hari ini (per jam).

**Auth:** None (⚠️ sebaiknya ditambahkan auth)

**Response:**
```json
[
  { "hour": 8, "count": 5 },
  { "hour": 9, "count": 12 },
  { "hour": 10, "count": 8 }
]
```

---

## Owner Dashboard

Semua endpoint owner memerlukan `roleId === 1`.

### `GET /api/owner/analytics`

Analytics lengkap: revenue, profit, chart data.

**Auth:** Required (Owner only)

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `range` | string | `30d` | Period: `7d`, `30d`, `90d`, `365d` |

**Response:**
```json
{
  "summary": {
    "totalRevenue": 10000000,
    "totalCost": 8500000,
    "totalProfit": 1500000,
    "totalTransactions": 200,
    "avgOrderValue": 50000,
    "profitMargin": 15.0
  },
  "dailyData": [
    {
      "date": "2026-04-01",
      "revenue": 500000,
      "cost": 425000,
      "profit": 75000,
      "count": 10
    }
  ],
  "monthlyData": [
    {
      "month": "2026-04",
      "revenue": 10000000,
      "cost": 8500000,
      "count": 200
    }
  ],
  "topProducts": [
    {
      "sku": "ML86DM",
      "revenue": 2000000,
      "profit": 300000,
      "count": 50
    }
  ],
  "paymentBreakdown": [
    { "method": "qris", "revenue": 6000000, "count": 120 },
    { "method": "va", "revenue": 4000000, "count": 80 }
  ],
  "statusCounts": {
    "SUCCESS": 180,
    "FAILED": 10,
    "UNPAID": 10
  }
}
```

---

### `GET /api/owner/admins`

List semua admin/owner users.

**Auth:** Required (Owner only)

**Response:**
```json
[
  {
    "id": "user-id-1",
    "name": "Owner",
    "email": "owner@nezgame.com",
    "image": null,
    "roleId": 1,
    "createdAt": "2026-04-01T00:00:00.000Z",
    "roleName": "owner",
    "sessionCount": 2
  }
]
```

---

### `POST /api/owner/admins`

Buat admin baru.

**Auth:** Required (Owner only)

**Body:**
```json
{
  "name": "New Admin",
  "email": "admin@nezgame.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin 'New Admin' created successfully."
}
```

---

### `DELETE /api/owner/admins/:id`

Hapus admin (tidak bisa hapus owner).

**Auth:** Required (Owner only)

**Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `id` | path | User ID |

**Response:**
```json
{
  "success": true,
  "message": "Admin removed."
}
```

---

### `GET /api/owner/transactions-report`

Report transaksi lengkap dengan filter & pagination.

**Auth:** Required (Owner only)

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Halaman |
| `limit` | number | 25 | Jumlah per halaman (max 100) |
| `status` | string | ALL | Filter: `SUCCESS`, `FAILED`, `UNPAID`, `PAID`, `ALL` |
| `from` | string | - | Tanggal mulai (YYYY-MM-DD) |
| `to` | string | - | Tanggal akhir (YYYY-MM-DD) |
| `search` | string | - | Cari invoice, target ID, atau SKU |

**Response:**
```json
{
  "transactions": [
    {
      "id": 1,
      "invoice_number": "INV-A1B2C3D4",
      "target_id": "808629310",
      "zone_id": "asia",
      "product_sku": "GI60GC",
      "hargaModal": 14000,
      "hargaJual": 16667,
      "amount": 16667,
      "payment_method": "qris",
      "status": "SUCCESS",
      "created_at": "2026-04-22T07:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 200,
    "totalPages": 8
  },
  "summary": {
    "totalRevenue": 10000000,
    "totalCost": 8500000,
    "totalProfit": 1500000,
    "avgOrderValue": 50000,
    "totalFiltered": 200
  }
}
```

---

## Error Handling

Semua error mengikuti format:

```json
{
  "success": false,
  "error": "Human readable error message",
  "message": "Indonesian error message"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `400` | Bad Request (validasi gagal) |
| `401` | Unauthorized (belum login) |
| `403` | Forbidden (role tidak cukup) |
| `404` | Not Found |
| `429` | Rate Limited |
| `500` | Internal Server Error |
| `502` | Bad Gateway (payment/external API error) |

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Global `/api/*` | 100 requests | 15 menit |
| `POST /api/validate/:slug` | 30 requests | 15 menit |
| `POST /api/checkout` | 10 requests | 15 menit |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | ✅ | Secret key for Better Auth sessions |
| `BETTER_AUTH_URL` | ❌ | Backend URL (default: http://localhost:3000) |
| `APP_DOMAIN` | ❌ | Production domain |
| `FRONTEND_URL` | ❌ | Frontend URL for CORS |
| `APIGAME_MERCHANT_ID` | ✅ | Apigames merchant ID |
| `APIGAME_SECRET_KEY` | ✅ | Apigames secret key |
| `MIDTRANS_CLIENT_KEY` | ✅ | Midtrans client key |
| `MIDTRANS_SERVER_KEY` | ✅ | Midtrans server key |
| `MIDTRANS_IS_PRODUCTION` | ❌ | `true` for production mode |
| `EMAILJS_SERVICE_ID` | ✅ | EmailJS service ID |
| `EMAILJS_PUBLIC_KEY` | ✅ | EmailJS public key |
| `EMAILJS_PRIVATE_KEY` | ✅ | EmailJS private/access key |
| `EMAILJS_VERIFY_TEMPLATE_ID` | ❌ | Template for OTP verification |
| `EMAILJS_RESET_TEMPLATE_ID` | ❌ | Template for password reset |
| `PRODUCT_MARKUP_FLAT` | ❌ | Flat markup (default: 2000) |

---

## Database Schema

### Tables

```
users              - Better Auth users (+ roleId field)
sessions           - Better Auth sessions
accounts           - Better Auth OAuth accounts
verifications      - OTP verification tokens

roles              - owner, admin, customer
permissions        - RBAC permissions
role_permissions   - Many-to-many role↔permission

categories         - Game categories (ML, Genshin, FF, etc.)
products           - SKU products with harga_modal
transactions       - All checkout transactions
site_settings      - Key-value site configuration
```

### Pricing Model

```
harga_modal (cost)  → from Apigames API
profit_margin       → 8-12% based on price tier
gateway_fee         → 0.7% (QRIS), 2% (GoPay), 3% (VA)
harga_jual (sell)   → harga_modal / (1 - (profit + fee))
```

| Price Tier | Profit Margin |
|------------|---------------|
| < Rp 10.000 | 12% |
| Rp 10.000 - 50.000 | 10% |
| > Rp 50.000 | 8% |

---

## External Services

### Apigames API

- **Base URL:** `https://apigames.id` (v2) / `https://v1.apigames.id` (v1 checker)
- **Auth:** Merchant ID + MD5 signature
- **Endpoints used:**
  - `GET /v2/profile` - Check merchant balance
  - `GET /v2/pricelist` - Get product/price list
  - `GET /v2/transaksi` - Place top-up order
  - `GET /v1/merchant/:id/cek-username/:game` - Validate game account

### Midtrans

- **Mode:** Sandbox (testing) / Production
- **Integration:** Snap popup
- **Webhook:** `POST /api/callback/midtrans`
- **Supported payments:**
  - QRIS + GoPay
  - Virtual Account (BNI, BCA, Mandiri, Permata, BRI, CIMB)

### EmailJS

- **API:** REST API (server-side)
- **Templates:**
  - `template_verification` - OTP signup verification
  - `template_reset` - Password reset link
