import { db } from "../src/db/index.js";
import { categories } from "../src/db/schema.js";
import { eq } from "drizzle-orm";

const mappings = [
  { id: 1, name: "Mobile Legends", img: "/logos/mlbb.png" },
  { id: 2, name: "Free Fire", img: "/logos/ff.png" },
  { id: 3, name: "PUBG Mobile", img: "/logos/pm.png" },
  { id: 4, name: "Genshin Impact", img: "/logos/gi.png" },
  { id: 5, name: "Valorant", img: "/logos/va.png" },
  { id: 7, name: "Honkai Star Rail", img: "/logos/hr.png" },
  { id: 9, name: "Roblox", img: "/logos/ro.png" },
];

async function updateLogos() {
  console.log("🚀 Updating game logos in database...");
  
  for (const item of mappings) {
    console.log(`Updating ${item.name} -> ${item.img}`);
    await db.update(categories)
      .set({ imageUrl: item.img })
      .where(eq(categories.id, item.id));
  }
  
  console.log("✅ Done.");
}

updateLogos().catch(console.error);
