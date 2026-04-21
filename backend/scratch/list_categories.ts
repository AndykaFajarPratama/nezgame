import { db } from "../src/db/index.js";
import { categories } from "../src/db/schema.js";

async function getCategories() {
  const allCats = await db.select().from(categories);
  console.log(JSON.stringify(allCats, null, 2));
}

getCategories().catch(console.error);
