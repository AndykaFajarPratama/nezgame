import midtransClient from "midtrans-client";
import { env } from "../config/env.js";

/**
 * Midtrans payment gateway service.
 * Handles Snap transaction creation and webhook verification.
 */
export class MidtransService {
  private snap: InstanceType<typeof midtransClient.Snap>;

  constructor() {
    // Validate keys exist
    if (!env.MIDTRANS_SERVER_KEY || !env.MIDTRANS_CLIENT_KEY) {
      console.error("❌ CRITICAL: Midtrans keys are missing! Check environment variables.");
    }

    // Detect key type vs isProduction mismatch
    const serverKey = env.MIDTRANS_SERVER_KEY;
    const isProduction = env.MIDTRANS_IS_PRODUCTION;

    if (isProduction && serverKey.startsWith("SB-")) {
      console.error("⚠️ WARNING: MIDTRANS_IS_PRODUCTION=true but using SANDBOX key! Switching to sandbox mode.");
    }
    if (!isProduction && !serverKey.startsWith("SB-")) {
      console.error("⚠️ WARNING: MIDTRANS_IS_PRODUCTION=false but using PRODUCTION key! Switching to production mode.");
    }

    // Auto-detect mode from server key prefix to prevent 401 errors
    const autoDetectProduction = !serverKey.startsWith("SB-");

    this.snap = new midtransClient.Snap({
      isProduction: autoDetectProduction,
      serverKey: env.MIDTRANS_SERVER_KEY,
      clientKey: env.MIDTRANS_CLIENT_KEY,
    });
  }

  /**
   * Create a Midtrans Snap transaction.
   * Returns { token, redirect_url }.
   */
  async createTransaction(
    orderId: string,
    amount: number,
    productName: string,
    customerName: string = "Customer",
    customerEmail: string = "customer@example.com",
    paymentMethod: string = "default"
  ): Promise<{ token: string; redirect_url: string }> {
    
    // Determine explicitly enabled payment methods based on user selection
    let enabledPayments: string[] | undefined = undefined;
    
    if (paymentMethod === "qris") {
      enabledPayments = ["qris", "gopay"]; // QRIS usually encompasses GoPay too
    } else if (paymentMethod === "va") {
      enabledPayments = ["bni_va", "bca_va", "mandiri_va", "permata_va", "bri_va", "cimb_va"]; 
    }

    const param: any = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(amount),
      },
      item_details: [
        {
          id: orderId,
          price: Math.round(amount),
          quantity: 1,
          name: productName.substring(0, 50), // Midtrans name max 50 chars
        },
      ],
      customer_details: {
        first_name: customerName,
        email: customerEmail,
      },
      enabled_payments: enabledPayments
    };

    const transaction = await this.snap.createTransaction(param);
    return transaction;
  }

  /**
   * Verify a Midtrans notification/webhook payload.
   */
  async verifyNotification(payload: any): Promise<any> {
    const statusResponse = await this.snap.transaction.notification(payload);
    return statusResponse;
  }
}

// Singleton instance
export const midtransService = new MidtransService();
