import { db } from "../src/db/index.js";
import { roles } from "../src/db/schema.js";

async function checkRoles() {
  const allRoles = await db.select().from(roles);
  console.log("Current Roles in Database:");
  console.table(allRoles);
}

checkRoles().catch(console.error);
