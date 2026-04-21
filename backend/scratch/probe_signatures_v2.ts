import { createHash } from "crypto";
import "dotenv/config";

const merchantId = process.env.APIGAME_MERCHANT_ID!;
const secretKey = process.env.APIGAME_SECRET_KEY!;

function signMD5(str: string): string {
  return createHash("md5").update(str).digest("hex");
}

async function probe() {
  const configs = [
    { name: "Secret only", sign: signMD5(secretKey) },
    { name: "Merchant only", sign: signMD5(merchantId) },
    { name: "Key then ID", sign: signMD5(secretKey + merchantId) },
  ];

  const endpoints = [
    "https://v2.apigames.id/merchant/pricelist",
  ];

  console.log(`🔍 Probing More Apigame Signatures...`);

  for (const endpoint of endpoints) {
    for (const config of configs) {
      const url = `${endpoint}?merchant_id=${merchantId}&signature=${config.sign}`;
      try {
        const res = await fetch(url);
        const text = await res.text();
        if (text.includes('"status":1') || (text.includes('"data"') && !text.includes('"rc":401'))) {
          console.log(`✅ [${config.name}] SUCCESS!`);
          console.log(`Response snippet: ${text.substring(0, 500)}`);
          return;
        } else {
          console.log(`❌ [${config.name}] Failed: ${text.substring(0, 100)}`);
        }
      } catch (e: any) {}
    }
  }
}

probe();
