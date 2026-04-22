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

/**
 * Games that support Apigames v1 cek-username API.
 * Only Mobile Legends, Free Fire, and Higgs Domino are confirmed supported.
 */
const apigameValidatedGames: Record<string, string> = {
  "mobile-legends": "mobilelegend",
  "free-fire": "freefire",
};

/**
 * Games where Apigames does NOT support username checking.
 * For these, we do basic UID format validation and let users proceed.
 */
const uidFormatRules: Record<string, { minLen: number; maxLen: number; pattern: RegExp; label: string }> = {
  "genshin-impact":      { minLen: 9, maxLen: 10, pattern: /^\d{9,10}$/, label: "UID Genshin (9-10 digit angka)" },
  "honkai-star-rail":    { minLen: 9, maxLen: 10, pattern: /^\d{9,10}$/, label: "UID HSR (9-10 digit angka)" },
  "valorant":            { minLen: 3, maxLen: 50, pattern: /^.{3,}$/, label: "Riot ID (contoh: Name#TAG)" },
  "pubg-mobile":         { minLen: 6, maxLen: 12, pattern: /^\d{6,12}$/, label: "ID PUBG (6-12 digit angka)" },
  "call-of-duty-mobile": { minLen: 6, maxLen: 20, pattern: /^\d{6,20}$/, label: "ID CODM (6-20 digit angka)" },
  "arena-of-valor":      { minLen: 6, maxLen: 15, pattern: /^\d{6,15}$/, label: "ID AOV (6-15 digit angka)" },
};

/**
 * POST /api/validate/:slug
 * Checks account validity via Apigames v1 for supported games,
 * or performs basic UID format validation for unsupported games.
 */
router.post("/api/validate/:slug", validateLimiter, async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { target_id, zone_id } = req.body;
    
    if (!target_id) {
      res.status(400).json({ success: false, message: "Target ID required" });
      return;
    }

    // ── 1. Try Apigames v1 cek-username for supported games ──
    const gameCode = apigameValidatedGames[slug as string];
    if (gameCode) {
      console.log(`[Validate] Using Apigames v1 for ${slug} (code: ${gameCode}), target: ${target_id}, zone: ${zone_id}`);
      const check = await apigameService.checkUsername(gameCode, target_id, zone_id || null);
      console.log(`[Validate] Apigames response:`, JSON.stringify(check));

      if (check.status === 1 && check.data?.is_valid !== false) {
        res.json({
          success: true,
          nickname: check.data?.username || "Akun Ditemukan",
          raw: check.data
        });
      } else {
        res.json({
          success: false,
          message: "Akun tidak ditemukan atau ID salah."
        });
      }
      return;
    }

    // ── 2. Basic UID format validation for unsupported games ──
    const formatRule = uidFormatRules[slug as string];
    if (formatRule) {
      console.log(`[Validate] Using format validation for ${slug}, target: ${target_id}, zone: ${zone_id}`);
      if (formatRule.pattern.test(target_id)) {
        res.json({
          success: true,
          nickname: `UID ${target_id} (Format Valid ✓)`,
        });
      } else {
        res.json({
          success: false,
          message: `Format ID salah. Pastikan sesuai: ${formatRule.label}`,
        });
      }
      return;
    }

    // ── 3. Unknown game – accept any non-empty ID ──
    console.log(`[Validate] No validation rule for slug: ${slug}, accepting target: ${target_id}`);
    res.json({
      success: true,
      nickname: `ID ${target_id} (Diterima)`,
    });

  } catch (error) {
    next(error);
  }
});

export default router;
