import { apigameService } from "../src/services/apigame.service.js";
import { env } from "../src/config/env.js";

async function checkLowDiamonds() {
  console.log("🔍 Fetching products from Apigame...");
  try {
    const sign = (apigameService as any).generateSign();
    const endpoints = [
      `https://apigames.id/v2/pricelist?merchant_id=${env.APIGAME_MERCHANT_ID}&signature=${sign}`,
      `https://v1.apigames.id/v2/pricelist?merchant_id=${env.APIGAME_MERCHANT_ID}&signature=${sign}`,
      `https://v1.apigames.id/v2/produk?merchant_id=${env.APIGAME_MERCHANT_ID}&signature=${sign}`,
      `https://v2.apigames.id/v2/pricelist?merchant_id=${env.APIGAME_MERCHANT_ID}&signature=${sign}`,
    ];
    
    let text = "";
    let data;

    for (const url of endpoints) {
      console.log(`🔗 Trying Endpoint: ${url}`);
      const res = await fetch(url);
      text = await res.text();
      try {
        data = JSON.parse(text);
        if (data.status === 1 || data.data) {
          console.log("✅ Success!");
          break;
        }
      } catch (e) {
        // Continue to next endpoint
      }
    }

    if (!data) {
      console.error("❌ All endpoints failed. Last raw response:", text.substring(0, 500));
      return;
    }

    console.log("📦 Data Structure Keys:", Object.keys(data));
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

      // Extract number of diamonds (e.g. "5 Diamonds", "10 DM", "3 Diamonds (2+1)")
      const match = nameLower.match(/(\d+)\s*(diamond|dm)/);
      if (match) {
        const qty = parseInt(match[1]);
        return qty <= 10;
      }
      
      return false;
    });

    console.log(`\n💎 Mobile Legends Items (<= 10 Diamonds):`);
    if (lowDiamonds.length === 0) {
      console.log("No items found.");
    } else {
      lowDiamonds.forEach(p => {
        console.log(`- ${p.product_name} (${p.code}) | Price: Rp ${p.price}`);
      });
    }

  } catch (err) {
    console.error("❌ Request Failed:", err);
  }
}

checkLowDiamonds();
