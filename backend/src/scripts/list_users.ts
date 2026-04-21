import { db } from "../db/index.js";
import { users, roles } from "../db/schema.js";
import { eq } from "drizzle-orm";

async function list() {
  const allUsers = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    roleId: users.roleId,
  }).from(users);

  console.log("Current Users in DB:");
  console.table(allUsers);
  process.exit(0);
}

list().catch(console.error);
