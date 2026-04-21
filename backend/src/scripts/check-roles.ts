import { db } from "../db/index.js";
import { roles } from "../db/schema.js";

async function check() {
  const allRoles = await db.select().from(roles);
  console.log(JSON.stringify(allRoles, null, 2));
  process.exit(0);
}

check();
