import { apigameService } from "../src/services/apigame.service.js";

async function checkLowDiamonds() {
  console.log("🔍 Fetching products from Apigame using Service...");
  try {
    const data = await apigameService.getProducts();
    
    if (!data || (data.status !== 1 && !data.data)) {
        console.error("❌ API returned error or no data:", data);
        return;
    }

    const products = data.data || data; // Handle cases where data is top level or in .data
    
    if (!Array.isArray(products)) {
        console.error("❌ Products is not an array:", products);
        return;
    }
    
    console.log(`✅ Total products found: ${products.length}`);

    // Keywords for Mobile Legends
    const mlKeywords = ["Mobile Legends", "MLBB"];
    
    const lowDiamonds = products.filter(p => {
      const nameLower = p.product_name.toLowerCase();
      const isML = mlKeywords.some(k => nameLower.includes(k.toLowerCase()));
      
      if (!isML) return false;

      // Extract number of diamonds
      // Matches things like "3 Diamonds", "12 DM", "10 Diamonds (9+1)"
      const match = nameLower.match(/(\d+)\s*(diamond|dm)/i);
      if (match) {
        const qty = parseInt(match[1]);
        return qty < 15;
      }
      
      return false;
    });

    console.log(`\n💎 Mobile Legends Items (< 15 Diamonds):`);
    if (lowDiamonds.length === 0) {
      console.log("No items found.");
      
      console.log("\nSample MLBB products for debugging:");
      products.filter(p => mlKeywords.some(k => p.product_name.toLowerCase().includes(k.toLowerCase())))
              .slice(0, 10)
              .forEach(p => console.log(`- ${p.product_name} (${p.code}) | Price: Rp ${p.price}`));
              
    } else {
      lowDiamonds.forEach(p => {
        console.log(`- ${p.product_name} (${p.code}) | Price: ${p.price}`);
      });
    }

  } catch (err) {
    console.error("❌ Request Failed:", err);
  }
}

checkLowDiamonds();
