import { db } from "../src/db/index.js";
import { transactions } from "../src/db/schema.js";
import { eq } from "drizzle-orm";

async function simulate() {
  console.log("🔍 Looking for an UNPAID transaction...");
  const trx = await db.query.transactions.findFirst({
    where: eq(transactions.status, "UNPAID"),
  });

  if (!trx) {
    console.log("❌ No UNPAID transactions found to test spoofing.");
    return;
  }

  console.log(`✅ Found: ${trx.invoiceNumber} (ID: ${trx.id})`);

  // Spoofing attempt
  const payload = {
    order_id: trx.invoiceNumber,
    transaction_status: "settlement",
    fraud_status: "accept",
  };

  console.log("🚀 Attempting to spoof Midtrans callback...");
  const res = await fetch("http://localhost:3000/api/callback/midtrans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  console.log("📡 Server Response:", data);

  // Check if status updated
  const updatedTrx = await db.query.transactions.findFirst({
    where: eq(transactions.id, trx.id),
  });

  console.log(`📈 New Status: ${updatedTrx?.status}`);
  if (updatedTrx?.status === "PAID" || updatedTrx?.status === "SUCCESS") {
    console.log("🚨 VULNERABILITY CONFIRMED: Webhook spoofing successful without signature verification!");
  } else {
    console.log("🛡️ Webhook seems protected (or something went wrong).");
  }
}

simulate().catch(console.error);
