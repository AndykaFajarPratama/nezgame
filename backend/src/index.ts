import express from "express";
import cors from "cors";
import { env, validateEnv } from "./config/env.js";
import { securityHeaders, errorHandler } from "./middleware/error.middleware.js";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

// Routes
import authRoutes from "./routes/auth.routes.js";
import customAuthRoutes from "./routes/auth.custom.routes.js";
import catalogRoutes from "./routes/catalog.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import ownerRoutes from "./routes/owner.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import adminStatsRoutes from "./routes/admin.stats.js";

// Validate environment
validateEnv();

const app = express();
app.set("trust proxy", 1); // Wajib agar secure cookie (SameSite=None) berfungsi di balik load balancer (Railway/Render)

// ─── Middleware ────────────────────────────────────────────────
app.use(
  cors({
    origin: env.isProduction
      ? [env.FRONTEND_URL] // ✅ DIUBAH: dari APP_DOMAIN ke FRONTEND_URL
      : ["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(securityHeaders);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Logging & Rate Limiting ──────────────────────────────────
app.use(morgan(env.isProduction ? "combined" : "dev"));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
  skip: (req) => !req.path.startsWith("/api/"),
});
app.use(apiLimiter);

// ─── Health & IP Check ─────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV
  });
});

app.get("/api/ip", async (_req, res) => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    res.json({
      success: true,
      server_ip: data.ip,
      message: "Daftarkan IP ini ke dashboard Apigames Anda."
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal mendapatkan IP server" });
  }
});

// ─── API Routes ───────────────────────────────────────────────
app.use(customAuthRoutes);
app.use(authRoutes);
app.use(catalogRoutes);
app.use(settingsRoutes);
app.use(adminStatsRoutes);
app.use(transactionRoutes);
app.use(ownerRoutes);

// ✅ DIHAPUS: Static files & SPA fallback karena frontend sudah di Vercel

// ─── Error Handler (must be last) ────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────
app.listen(env.PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║       🎮 NezGame API Server v2.0        ║
╠══════════════════════════════════════════╣
║  Port:     ${String(env.PORT).padEnd(29)}║
║  Env:      ${env.NODE_ENV.padEnd(29)}║
║  Frontend: ${env.FRONTEND_URL.substring(0, 29).padEnd(29)}║
╚══════════════════════════════════════════╝
  `);
});

export default app;