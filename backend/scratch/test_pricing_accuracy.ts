import { pricingService } from "../src/services/pricing.service.js";

function testPricing() {
  const testCases = [
    { name: "Sangat Kecil (<10k)", modal: 5000, method: "qris" },
    { name: "Kecil (<10k)", modal: 9900, method: "default" },
    { name: "Sedang (10k-50k)", modal: 25000, method: "gopay" },
    { name: "Besar (>50k)", modal: 100000, method: "qris" },
    { name: "Sangat Besar (>50k)", modal: 500000, method: "default" }
  ];

  console.log("📊 PRICING VALIDATION TABLE");
  console.log("=".repeat(80));
  console.log(
    "Kategori".padEnd(20) + 
    "Modal".padEnd(10) + 
    "Method".padEnd(10) + 
    "Profit %".padEnd(10) + 
    "Fee %".padEnd(10) + 
    "Harga Jual"
  );
  console.log("-".repeat(80));

  testCases.forEach(tc => {
    const margin = pricingService.getProfitMargin(tc.modal);
    const fee = pricingService.getFee(tc.method);
    const jual = pricingService.calculateHargaJual(tc.modal, tc.method);

    console.log(
      tc.name.padEnd(20) + 
      tc.modal.toString().padEnd(10) + 
      tc.method.padEnd(10) + 
      (margin * 100 + "%").padEnd(10) + 
      (fee * 100 + "%").padEnd(10) + 
      "Rp " + jual.toLocaleString("id-ID")
    );
  });
}

testPricing();
