import { db } from "../src/db/index.js";
import { products } from "../src/db/schema.js";
import { eq, or, lt, and, ne } from "drizzle-orm";

async function updateCatalogStatus() {
  console.log("🔄 Updating catalog product statuses...");
  
  try {
    // 1. Set products to 'active' if:
    //    - Price < 15,000
    //    - OR Category is Mobile Legends (id: 1)
    const activeCount = await db
      .update(products)
      .set({ status: 'active' })
      .where(
        or(
          lt(products.priceModal, "15000"),
          eq(products.categoryId, 1)
        )
      );
    
    console.log(`✅ Activated products that meet criteria.`);

    // 2. Set products to 'inactive' if they DON'T meet the criteria
    //    Basically: Price >= 15,000 AND NOT Mobile Legends
    const inactiveCount = await db
      .update(products)
      .set({ status: 'inactive' })
      .where(
        and(
          gte(products.priceModal, "15000"),
          ne(products.categoryId, 1)
        )
      );

    console.log(`✅ Deactivated other products.`);
    
    console.log("\n✨ Catalog update complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Update failed:", err);
    process.exit(1);
  }
}

// Need to import gte
import { gte } from "drizzle-orm";

updateCatalogStatus();
