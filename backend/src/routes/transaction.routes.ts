import { Router } from "express";
import { transactionController } from "../controllers/transaction.controller.js";
import { authorize, requireAuth } from "../middleware/auth.middleware.js";
import { db } from "../db/index.js";
import rateLimit from "express-rate-limit";

const router = Router();

/**
 * Limit checkout attempts to prevent spam/abuse
 */
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 per 15 min
  message: { success: false, message: "Terlalu banyak permintaan checkout. Coba lagi dalam 15 menit." }
});

/**
 * POST /api/checkout
 * Public checkout flow
 */
router.post("/api/checkout", checkoutLimiter, transactionController.checkout);

/**
 * POST /api/callback/midtrans
 * Verified Webhook
 */
router.post("/api/callback/midtrans", transactionController.midtransCallback);

/**
 * GET /api/transaction/:invoice
 * Public receipt fetch
 */
router.get("/api/transaction/:invoice", transactionController.getTransaction);

/**
 * GET /api/user/orders
 * Customer order history
 */
router.get("/api/user/orders", requireAuth, transactionController.getUserOrders);

/**
 * POST /api/admin/transaction/:id/retry
 * Retries failed orders via Apigames specifically
 */
router.post("/api/admin/transaction/:id/retry", authorize("create_transaction"), transactionController.retryOrder);

/**
 * GET /api/admin/transactions
 * Fetch all transactions (Admin view)
 */
router.get("/api/admin/transactions", authorize("view_all_transactions"), async (_req, res, next) => {
  try {
    const allTrx = await db.query.transactions.findMany({
      orderBy: (trx, { desc }) => [desc(trx.createdAt)],
      limit: 100,
    });
    
    // Mapped for admin panel
    res.json(allTrx.map(trx => ({
      ...trx,
      amount: parseFloat(trx.amount),
      hargaModal: parseFloat(trx.hargaModal),
      hargaJual: parseFloat(trx.hargaJual),
    })));
  } catch (error) {
    next(error);
  }
});

export default router;
