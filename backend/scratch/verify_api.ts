import { apigameService } from "../src/services/apigame.service.js";
import { env } from "../src/config/env.js";

async function verifyApi() {
  console.log("🔍 Checking Apigame Balance...");
  try {
    const data = await apigameService.getBalance();
    console.log("📦 Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Request Failed:", err);
  }
}

verifyApi();
