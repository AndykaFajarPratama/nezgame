import { db } from "./index.js";
import { sql } from "drizzle-orm";

async function run() {
  console.log("⏳ Creating site_settings table manually...");
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "site_settings" (
        "key" varchar(255) PRIMARY KEY NOT NULL,
        "value" text NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log("✅ Table site_settings created or already exists.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create table:", error);
    process.exit(1);
  }
}

run();
