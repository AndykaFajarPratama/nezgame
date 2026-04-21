import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
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
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Middleware ────────────────────────────────────────────────
app.use(
  cors({
    origin: env.isProduction 
      ? [env.APP_DOMAIN] 
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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
  skip: (req) => !req.path.startsWith("/api/"),
});
app.use(apiLimiter);

// ─── Health Check ─────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV 
  });
});

// ─── API Routes ───────────────────────────────────────────────
// Auth (Custom routes first, then Better Auth fallback)
app.use(customAuthRoutes);
app.use(authRoutes);

// Catalog (public)
app.use(catalogRoutes);

// Transactions (mixed auth)
// Admin/Settings
app.use(settingsRoutes);
app.use(adminStatsRoutes);
app.use(transactionRoutes);

// Owner Dashboard (owner-only)
app.use(ownerRoutes);

// ─── Static Files (frontend) ─────────────────────────────────
// Serve the frontend from the frontend/dist directory
const frontendPath = path.resolve(__dirname, "../../frontend/dist");

app.use(express.static(frontendPath));

// SPA fallback: serve index.html for non-API routes
app.get(/.*/, (req, res, next) => {
  // Don't catch API routes or auth routes
  if (req.path.startsWith("/api/")) {
    next();
    return;
  }
  
  // Check if file exists, if not serve index.html (SPA routing)
  res.sendFile(path.join(frontendPath, "index.html"), (err) => {
    if (err) {
      res.status(404).json({ success: false, message: "Page not found" });
    }
  });
});

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
║  Frontend: ${frontendPath.substring(0, 29).padEnd(29)}║
╚══════════════════════════════════════════╝
  `);
});

export default app;
