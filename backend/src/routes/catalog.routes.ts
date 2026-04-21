import { Router } from "express";
import { catalogController } from "../controllers/catalog.controller.js";
import { apigameService } from "../services/apigame.service.js";
import { authorize } from "../middleware/auth.middleware.js";
import rateLimit from "express-rate-limit";

const router = Router();

/**
 * Limit account validation specifically (prevents scraping)
 */
const validateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 per 15 min
  message: { success: false, message: "Terlalu banyak permintaan validasi. Coba lagi dalam 15 menit." }
});

/**
 * GET /api/categories
 * List all game categories
 */
router.get("/api/categories", catalogController.getCategories);

/**
 * GET /api/products/:slug
 * Get dynamically priced products by category
 */
router.get("/api/products/:slug", catalogController.getProducts);

/**
 * POST /api/admin/sync
 * Sync products via Apigame (Admin/Pricing Role only)
 */
router.post("/api/admin/sync", authorize("update_pricing"), catalogController.syncProducts);

// ─── Utility (Validation) ──────────────────────────────────────────

const apigameCodes: Record<string, string> = {
  "mobile-legends": "mobilelegend",
  "free-fire": "freefire",
  "pubg-mobile": "pubgm",
  "genshin-impact": "genshin",
  "valorant": "valorant",
  "call-of-duty-mobile": "codm",
  "honkai-star-rail": "hongkaistarrail",
  "arena-of-valor": "aov"
};

/**
 * POST /api/validate/:slug
 * Checks account validity via Apigames v1.
 */
router.post("/api/validate/:slug", validateLimiter, async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { target_id, zone_id } = req.body;
    
    if (!target_id) {
      res.status(400).json({ success: false, message: "Target ID required" });
      return;
    }

    const gameCode = apigameCodes[slug as string];
    if (!gameCode) {
      res.json({ success: false, message: "Validasi tidak didukung untuk game ini" });
      return;
    }

    const check = await apigameService.checkUsername(gameCode, target_id, zone_id || null);
    
    if (check.status === 1 && check.data?.is_valid !== false) {
      res.json({
        success: true,
        nickname: check.data.username || "Akun Ditemukan",
        raw: check.data
      });
    } else {
      res.json({
        success: false,
        message: "Akun tidak ditemukan atau ID salah."
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
