import { createHash } from "crypto";
import "dotenv/config";

const merchantId = process.env.APIGAME_MERCHANT_ID;
const secretKey = process.env.APIGAME_SECRET_KEY;

function generateSign(refId?: string): string {
  const raw = refId
    ? `${merchantId}${secretKey}${refId}`
    : `${merchantId}${secretKey}`;
  return createHash("md5").update(raw).digest("hex");
}

async function probe() {
  const sign = generateSign();
  const baseUrls = [
    "https://apigames.id",
    "https://v1.apigames.id",
    "https://v2.apigames.id",
  ];
  const paths = [
    "/v2/pricelist",
    "/v2/produk",
    "/v2/profile",
    "/merchant/pricelist",
  ];

  console.log(`🔍 Probing Apigame Endpoints...`);
  console.log(`Merchant ID: ${merchantId}`);

  for (const baseUrl of baseUrls) {
    for (const path of paths) {
      const url = `${baseUrl}${path}?merchant_id=${merchantId}&signature=${sign}`;
      console.log(`\n🔗 Testing: ${url}`);
      try {
        const res = await fetch(url);
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Content-Type: ${res.headers.get("content-type")}`);
        if (text.startsWith("{")) {
            const data = JSON.parse(text);
            console.log(`✅ JSON Response:`, JSON.stringify(data).substring(0, 200));
            if (data.status === 1 || data.data) {
                console.log(`🌟 SUCCESSFUL ENDPOINT!`);
            }
        } else {
            console.log(`📄 Raw text (start):`, text.substring(0, 200).replace(/\n/g, " "));
        }
      } catch (e: any) {
        console.log(`❌ Error: ${e.message}`);
      }
    }
  }
}

probe();
