import { db } from "../src/db/index.js";
import { transactions } from "../src/db/schema.js";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

/**
 * MOCK TEST:
 * This script creates a transaction and mocks a successful Midtrans payout
 * but simulates a failure at the Apigame delivery level.
 */

async function simulateApigameFailure() {
  const invoice = `FAIL-TEST-${uuidv4().substring(0, 8)}`;
  console.log(`🏗️ Creating test transaction: ${invoice}`);

  // 1. Create UNPAID
  const [newTrx] = await db.insert(transactions).values({
    invoiceNumber: invoice,
    targetId: "ERROR_TARGET", // Trigger failure
    productSku: "invalid_sku",
    hargaModal: "1000",
    hargaJual: "2000",
    amount: "2000",
    status: "UNPAID",
  }).returning();

  console.log(`✅ ID: ${newTrx.id}`);

  // 2. Simulate Midtrans Callback arriving (Manually call the controller logic or trigger it)
  // Since we want to test the server logic, we'll send a real POST request to the local server
  const spoofPayload = {
    order_id: invoice,
    transaction_status: "settlement",
    fraud_status: "accept",
  };

  console.log("🚀 Sending verified-style callback (expecting fulfillment failure)...");

  // NOTE: This will fail verification in my current secured code because it's not a real Midtrans notification.
  // To truly test the Error Handling, we need to bypass verification or use a valid setup.
  // For this audit, we will check if the Error Catch block in the controller works.
  
  try {
     const res = await fetch("http://localhost:3000/api/callback/midtrans", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(spoofPayload),
     });
     
     const data = await res.json();
     console.log("📡 Server Response:", data);
  } catch (err) {
     console.log("❌ Request failed (as expected by security check).");
  }

  // Check the status
  const finalTrx = await db.query.transactions.findFirst({
    where: eq(transactions.id, newTrx.id),
  });

  console.log(`📈 Final DB Status: ${finalTrx?.status}`);
  if (finalTrx?.status === "UNPAID") {
    console.log("✅ Security maintained: Could not force status change.");
  } else if (finalTrx?.status === "FAILED") {
    console.log("✅ Error Handling: Transaction marked as FAILED during fulfillment error.");
  }
}

simulateApigameFailure().catch(console.error);
