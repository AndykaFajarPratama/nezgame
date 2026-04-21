import { db } from "../src/db/index.js";
import { categories } from "../src/db/schema.js";
import { eq } from "drizzle-orm";

const restorations = [
  { id: 1, name: "Mobile Legends", img: "https://upload.wikimedia.org/wikipedia/en/thumb/0/07/MLBB_Logo.png/640px-MLBB_Logo.png" },
  { id: 2, name: "Free Fire", img: "https://logos-download.com/wp-content/uploads/2021/01/Free_Fire_Logo.png" },
  { id: 3, name: "PUBG Mobile", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/PUBG_Mobile_logo.png/640px-PUBG_Mobile_logo.png" },
  { id: 4, name: "Genshin Impact", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Genshin_Impact_logo.svg/1024px-Genshin_Impact_logo.svg.png" },
  { id: 5, name: "Valorant", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Valorant_logo_-_pink_color_version.svg/640px-Valorant_logo_-_pink_color_version.svg.png" },
  { id: 7, name: "Honkai Star Rail", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Honkai_Star_Rail_Logo.svg/640px-Honkai_Star_Rail_Logo.svg.png" },
];

async function restoreLogos() {
  console.log("🛠️ Restoring official brand logos via CDN...");
  
  for (const item of restorations) {
    console.log(`Updating ${item.name} to Official URL...`);
    await db.update(categories)
      .set({ imageUrl: item.img })
      .where(eq(categories.id, item.id));
  }
  
  console.log("✅ Database restoration complete.");
}

restoreLogos().catch(console.error);
