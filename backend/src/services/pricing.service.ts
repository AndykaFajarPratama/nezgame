/**
 * Pricing logic Service
 * Responsible for dynamic auto-pricing and fee deduction
 */
export class PricingService {
  /**
   * Determine payment gateway fee based on method.
   * Rates based on standard Midtrans fees.
   */
  getFee(paymentMethod: string): number {
    const method = paymentMethod.toLowerCase();
    if (method === "qris") return 0.007; // 0.7%
    if (method === "gopay") return 0.02; // 2.0%
    return 0.03;                         // Default 3.0% (VA, Credit Card etc approx)
  }

  /**
   * Determine base profit margin depending on base cost.
   * - < 10.000: 12%
   * - 10.000 - 50.000: 10%
   * - > 50.000: 8%
   */
  getProfitMargin(hargaModal: number): number {
    if (hargaModal < 10000) return 0.12;
    if (hargaModal <= 50000) return 0.10;
    return 0.08;
  }

  /**
   * Calculate final sell price ensuring the precise profit margin AFTER
   * the payment gateway fee is deducted.
   */
  calculateHargaJual(hargaModal: number, paymentMethod: string = "default"): number {
    const profit = this.getProfitMargin(hargaModal);
    const fee = this.getFee(paymentMethod);
    
    // Formula to guarantee clean profit margin after percentage cut
    const hargaJual = hargaModal / (1 - (profit + fee));
    
    // Round UP to the nearest integer for clean numbers
    return Math.ceil(hargaJual);
  }

  /**
   * Bulk format products for API response (Client Side Safe).
   * Strips strictly confidential hargaModal details.
   */
  formatProductsForClient(productsRaw: any[], defaultPaymentMethod: string = "default") {
    return productsRaw.map(prod => {
      // Parse modal safely
      const hargaModal = parseFloat(prod.priceModal || prod.hargaModal || "0");
      const hargaJual = this.calculateHargaJual(hargaModal, defaultPaymentMethod);
      
      return {
        id: prod.id,
        sku_code: prod.skuCode || prod.sku_code,
        name: prod.name,
        price_sell: hargaJual, // Client gets exactly this
        status: prod.status,
        needs_zone_id: prod.needsZoneId || prod.needs_zone_id,
        category: prod.category || undefined
      };
    });
  }
}

// Singleton instance
export const pricingService = new PricingService();
