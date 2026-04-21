import { createHash } from "crypto";
import { env } from "../config/env.js";

/**
 * Apigame API integration service.
 * Handles product listing and game top-up fulfillment.
 * API docs: https://apigames.id
 */
export class ApigameService {
  private merchantId: string;
  private secretKey: string;
  private baseUrl = "https://apigames.id";

  constructor() {
    this.merchantId = env.APIGAME_MERCHANT_ID;
    this.secretKey = env.APIGAME_SECRET_KEY;
  }

  /**
   * Generate MD5 signature for Apigame API requests.
   */
  private generateSign(refId?: string): string {
    const raw = refId
      ? `${this.merchantId}${this.secretKey}${refId}`
      : `${this.merchantId}${this.secretKey}`;
    return createHash("md5").update(raw).digest("hex");
  }

  /**
   * Check merchant balance on Apigame.
   */
  async getBalance(): Promise<any> {
    const sign = this.generateSign();
    const url = `${this.baseUrl}/v2/profile?merchant_id=${this.merchantId}&signature=${sign}`;
    const res = await fetch(url);
    return res.json();
  }

  /**
   * Fetch product/price list from Apigame.
   */
  async getProducts(): Promise<any> {
    const sign = this.generateSign();
    let url = `${this.baseUrl}/v2/pricelist?merchant_id=${this.merchantId}&signature=${sign}`;
    let res = await fetch(url);

    // Fallback to alternate endpoint
    if (res.status === 404) {
      url = `${this.baseUrl}/v2/produk?merchant_id=${this.merchantId}&signature=${sign}`;
      res = await fetch(url);
    }

    return res.json();
  }

  /**
   * Place a top-up order through Apigame.
   */
  async placeOrder(
    sku: string,
    target: string,
    zoneId: string | null,
    refId: string
  ): Promise<any> {
    const sign = this.generateSign(refId);
    const params = new URLSearchParams({
      ref_id: refId,
      merchant_id: this.merchantId,
      produk: sku,
      tujuan: target,
      signature: sign,
    });

    if (zoneId) {
      params.set("server_id", zoneId);
    }

    const url = `${this.baseUrl}/v2/transaksi?${params.toString()}`;
    const res = await fetch(url);
    return res.json();
  }

  /**
   * Validate game account username using Apigames v1 checker.
   */
  async checkUsername(
    gameCode: string,
    target: string,
    zoneId: string | null
  ): Promise<any> {
    const raw = `${this.merchantId}${this.secretKey}`;
    const sign = createHash("md5").update(raw).digest("hex");
    
    const params = new URLSearchParams({
      user_id: target,
      signature: sign,
    });
    
    // Apigames v1 checker logic for Zone ID:
    // Some games (like Mobile Legends) require ID & Zone ID to be concatenated.
    if (zoneId) {
      if (gameCode === "mobilelegend" || gameCode === "mobilelegends") {
        params.set("user_id", target + zoneId);
      } else {
        params.set("server_id", zoneId);
      }
    }
    
    const url = `https://v1.apigames.id/merchant/${this.merchantId}/cek-username/${gameCode}?${params.toString()}`;
    
    try {
      const res = await fetch(url);
      return res.json();
    } catch (e) {
      console.error("Apigames validation error:", e);
      return { status: 0, message: "Validasi gagal" };
    }
  }
}

// Singleton instance
export const apigameService = new ApigameService();
