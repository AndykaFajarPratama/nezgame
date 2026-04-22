import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { transactions, products, categories } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { midtransService } from "../services/midtrans.service.js";
import { apigameService } from "../services/apigame.service.js";
import { getSession } from "../middleware/auth.middleware.js";
import { pricingService } from "../services/pricing.service.js";
import { z } from "zod";

const checkoutSchema = z.object({
  sku_code: z.string().min(1, "SKU Code required"),
  target_id: z.string().min(1, "Target ID required"),
  zone_id: z.string().nullable().optional(),
  payment_method: z.string().optional(),
  customer_name: z.string().optional(),
  customer_email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  customer_phone: z.string().optional(),
});

interface CheckoutBody {
  sku_code: string;
  target_id: string;
  zone_id?: string | null;
  payment_method?: string; // used to calculate fee
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
}

export class TransactionController {
  
  /**
   * Create checkout transaction
   * Guest friendly (user_id is nullable)
   */
  async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = checkoutSchema.safeParse(req.body);
      
      if (!validated.success) {
        const errorMsg = validated.error.issues[0].message;
        res.status(400).json({ success: false, error: errorMsg, message: errorMsg });
        return;
      }

      const { sku_code, target_id, zone_id, payment_method = "default" } = validated.data;

      // Fetch base product (holds harga_modal)
      const product = await db.query.products.findFirst({
        where: eq(products.skuCode, sku_code),
      });

      if (!product) {
        res.status(404).json({ success: false, error: "Product not found.", message: "Product not found." });
        return;
      }

      const hargaModal = parseFloat(product.priceModal);
      const hargaJual = pricingService.calculateHargaJual(hargaModal, payment_method);
      const hargaJualStr = hargaJual.toString();

      // Midtrans minimum amount check (Rp 100)
      if (hargaJual < 100) {
        const msg = `Harga terlalu kecil untuk diproses (Rp ${hargaJual}). Minimum Rp 100.`;
        res.status(400).json({ success: false, error: msg, message: msg });
        return;
      }

      // Check session
      let userId: string | null = null;
      try {
        const session = await getSession(req);
        if (session) userId = session.user.id;
      } catch {
        // Guest checkout
      }

      const invoice = `INV-${uuidv4().replace(/-/g, "").substring(0, 8).toUpperCase()}`;

      // 1. Create Transaction record
      let newTrx;
      try {
        const [inserted] = await db
          .insert(transactions)
          .values({
            invoiceNumber: invoice,
            userId,
            targetId: target_id,
            zoneId: zone_id || null,
            productSku: sku_code,
            hargaModal: product.priceModal,
            hargaJual: hargaJualStr,
            amount: hargaJualStr,
            paymentMethod: "Midtrans",
            paymentMethodDetail: payment_method,
            customerEmail: validated.data.customer_email || null,
            customerPhone: validated.data.customer_phone || null,
            status: "UNPAID",
          })
          .returning();
        newTrx = inserted;
      } catch (dbError: any) {
        console.error(`❌ DB insert error for ${invoice}:`, dbError.message);
        res.status(500).json({ success: false, error: "Gagal menyimpan transaksi.", message: "Gagal menyimpan transaksi." });
        return;
      }

      // 2. Request Midtrans Snap Token
      try {
        const payment = await midtransService.createTransaction(
          invoice,
          hargaJual,
          product.name,
          validated.data.customer_name || "Customer",
          validated.data.customer_email || "customer@example.com",
          payment_method
        );

        await db
          .update(transactions)
          .set({ snapToken: payment.token })
          .where(eq(transactions.id, newTrx.id));

        res.json({
          success: true,
          invoice,
          snapToken: payment.token,
        });
      } catch (paymentError: any) {
        await db
          .update(transactions)
          .set({ status: "FAILED" })
          .where(eq(transactions.id, newTrx.id));

        const errMsg = paymentError?.message || paymentError?.ApiResponse?.status_message || "Unknown payment error";
        console.error(`❌ Midtrans error for ${invoice}:`, errMsg);
        res.status(502).json({ 
          success: false, 
          error: `Payment gateway error: ${errMsg}`, 
          message: `Gagal menghubungi payment gateway.` 
        });
      }
    } catch (error: any) {
      console.error(`❌ Checkout error:`, error.message);
      next(error);
    }
  }

  /**
   * Accurate Midtrans Webhook Handler
   */
  async midtransCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body;
      
      // 1. Verify notification authenticity with Midtrans
      const verification = await midtransService.verifyNotification(payload);
      
      const orderId = verification.order_id;
      const transactionStatus = verification.transaction_status;
      const fraudStatus = verification.fraud_status;

      console.log(`🔔 Midtrans verified callback: ${orderId} | status=${transactionStatus}`);

      const trx = await db.query.transactions.findFirst({
        where: eq(transactions.invoiceNumber, orderId),
      });

      if (!trx) {
        res.json({ success: false, message: "Transaction not found" });
        return;
      }

      const isPaid =
        (transactionStatus === "capture" || transactionStatus === "settlement") &&
        (fraudStatus === "accept" || !fraudStatus);

      if (isPaid && trx.status === "UNPAID") {
        // 2. Update status to PAID immediately before calling external API
        await db
          .update(transactions)
          .set({ status: "PAID", updatedAt: new Date() })
          .where(eq(transactions.id, trx.id));

        // 2. Dispatch to Apigames
        try {
          const apiResp = await apigameService.placeOrder(
            trx.productSku,
            trx.targetId,
            trx.zoneId || null,
            trx.invoiceNumber
          );

          const finalStatus = String(apiResp?.status) === "1" ? "SUCCESS" : "FAILED";

          // 3. Update with final Apigames result
          await db
            .update(transactions)
            .set({
              status: finalStatus,
              apigameRefId: apiResp?.ref_id || null,
              updatedAt: new Date(),
            })
            .where(eq(transactions.id, trx.id));

        } catch (fulfillError: any) {
          await db
            .update(transactions)
            .set({ status: "FAILED", updatedAt: new Date() }) // Fail safe for Retry
            .where(eq(transactions.id, trx.id));
          console.error(`❌ Fulfillment error for ${orderId}:`, fulfillError.message);
        }
      }

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resend Order (Admin Retry System)
   * Recover failed apigames fulfillments.
   */
  async retryOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const trx = await db.query.transactions.findFirst({
        where: eq(transactions.invoiceNumber, id as string), // Support ID or Invoice
      });

      if (!trx) {
         res.status(404).json({ success: false, message: "Transaction not found" });
         return;
      }

      if (trx.status !== 'FAILED') {
        res.status(400).json({ success: false, message: "Can only retry FAILED orders." });
        return;
      }

      const apiResp = await apigameService.placeOrder(
        trx.productSku,
        trx.targetId,
        trx.zoneId || null,
        `RE-${trx.invoiceNumber}-${Date.now().toString().slice(-4)}` // Unique attempt ref
      );

      const finalStatus = String(apiResp?.status) === "1" ? "SUCCESS" : "FAILED_RETRY";

      await db
        .update(transactions)
        .set({
          status: finalStatus === "FAILED_RETRY" ? "FAILED" : finalStatus,
          apigameRefId: apiResp?.ref_id || trx.apigameRefId,
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, trx.id));

      res.json({
        success: finalStatus === "SUCCESS",
        message: finalStatus === "SUCCESS" ? "Order successfully fulfilled!" : "Retry failed.",
        raw: apiResp
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List single transaction (receipt check)
   */
  async getTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const { invoice } = req.params;
      const trx = await db.query.transactions.findFirst({
        where: eq(transactions.invoiceNumber, invoice as string),
      });

      if (!trx) {
        res.status(404).json({ success: false, message: "Transaction not found" });
        return;
      }

      res.json({
        invoice_number: trx.invoiceNumber,
        target_id: trx.targetId,
        zone_id: trx.zoneId,
        product_sku: trx.productSku,
        amount: parseFloat(trx.amount),
        status: trx.status,
        created_at: trx.createdAt?.toISOString() || null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch all transactions for the logged-in user
   */
  async getUserOrders(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const userOrders = await db
        .select({
          id: transactions.id,
          invoiceNumber: transactions.invoiceNumber,
          targetId: transactions.targetId,
          zoneId: transactions.zoneId,
          productSku: transactions.productSku,
          amount: transactions.amount,
          status: transactions.status,
          createdAt: transactions.createdAt,
          productName: products.name,
          categoryName: categories.name,
          categorySlug: categories.slug,
          categoryImage: categories.imageUrl,
        })
        .from(transactions)
        .leftJoin(products, eq(transactions.productSku, products.skuCode))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(transactions.userId, userId as string))
        .orderBy(desc(transactions.createdAt));

      res.json(userOrders.map(trx => ({
        ...trx,
        amount: parseFloat(trx.amount as string),
      })));
    } catch (error) {
      console.error("Error fetching user orders:", error);
      next(error);
    }
  }
}

export const transactionController = new TransactionController();
