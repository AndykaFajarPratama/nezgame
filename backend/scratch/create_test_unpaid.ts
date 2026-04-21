import { db } from "../src/db/index.js";
import { transactions } from "../src/db/schema.js";
import { v4 as uuidv4 } from "uuid";

async function createUnpaid() {
  const invoice = `TEST-UNPAID-${uuidv4().substring(0, 8)}`;
  console.log(`🏗️ Creating test unpaid transaction: ${invoice}`);
  
  await db.insert(transactions).values({
    invoiceNumber: invoice,
    targetId: "12345678",
    productSku: "ml-diamonds-86", // MLBB 86 Diamonds
    hargaModal: "18500",
    hargaJual: "21500",
    amount: "21500",
    status: "UNPAID",
  });
  
  console.log("✅ Created.");
}

createUnpaid().catch(console.error);
