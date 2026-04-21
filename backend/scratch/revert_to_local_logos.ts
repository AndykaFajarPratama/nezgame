import { db } from "../src/db/index.js";
import { categories } from "../src/db/schema.js";
import { eq, inArray } from "drizzle-orm";

const mapping = {
  "Mobile Legends": "/logos/mlbb.png",
  "Free Fire": "/logos/ff.png",
  "PUBG Mobile": "/logos/pm.png",
  "Genshin Impact": "/logos/gi.png",
  "Valorant": "/logos/va.png",
  "Honkai Star Rail": "/logos/hr.png",
  "Roblox": "/logos/ro.png"
};

async function revertToLocal() {
  console.log("🛠️ Reverting category images to local paths...");
  
  for (const [name, path] of Object.entries(mapping)) {
    console.log(`Updating ${name} -> ${path}`);
    await db.update(categories)
      .set({ imageUrl: path })
      .where(eq(categories.name, name));
  }
  
  console.log("✅ Database reverted to local assets.");
}

revertToLocal().catch(console.error);
