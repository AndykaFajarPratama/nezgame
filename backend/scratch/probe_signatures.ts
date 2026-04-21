import { createHash } from "crypto";
import "dotenv/config";

const merchantId = process.env.APIGAME_MERCHANT_ID!;
const secretKey = process.env.APIGAME_SECRET_KEY!;

function signMD5(str: string): string {
  return createHash("md5").update(str).digest("hex");
}

async function probe() {
  const configs = [
    { name: "Direct concat", sign: signMD5(merchantId + secretKey) },
    { name: "Colon separator", sign: signMD5(merchantId + ":" + secretKey) },
    { name: "Plus separator", sign: signMD5(merchantId + "+" + secretKey) },
  ];

  const endpoints = [
    "https://v2.apigames.id/merchant/pricelist",
    "https://v1.apigames.id/merchant/pricelist",
    "https://v2.apigames.id/v2/pricelist",
  ];

  console.log(`🔍 Probing Apigame Signatures...`);

  for (const endpoint of endpoints) {
    console.log(`\n🌐 Endpoint: ${endpoint}`);
    for (const config of configs) {
      const url = `${endpoint}?merchant_id=${merchantId}&signature=${config.sign}`;
      try {
        const res = await fetch(url);
        const text = await res.text();
        if (text.includes('"status":1') || (text.includes('"data"') && !text.includes('"rc":401'))) {
          console.log(`✅ [${config.name}] SUCCESS!`);
          console.log(`Response snippet: ${text.substring(0, 200)}`);
          return; // Stop if we find a working one
        } else {
          console.log(`❌ [${config.name}] Failed (Status: ${res.status}): ${text.substring(0, 100)}`);
        }
      } catch (e: any) {
        console.log(`❗ [${config.name}] Error: ${e.message}`);
      }
    }
  }
}

probe();
