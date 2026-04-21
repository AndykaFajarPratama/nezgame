import { auth } from "../src/auth/index.js";
import { db } from "../src/db/index.js";
import { users } from "../src/db/schema.js";
import { eq } from "drizzle-orm";

async function verifyRegistration() {
  const testEmail = `testuser_${Date.now()}@example.com`;
  console.log(`🧪 Testing registration for: ${testEmail}`);
  
  // 1. Create a user via the auth API (this triggers the hooks)
  const newUser = await auth.api.signUpEmail({
    body: {
      email: testEmail,
      password: "password123",
      name: "Test Customer",
    }
  });

  if (!newUser) {
    console.error("❌ Failed to create user via auth API.");
    return;
  }

  // 2. Fetch the user from the database to check roleId
  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, testEmail),
  });

  console.log("👤 User in DB:", dbUser);

  if (dbUser?.roleId === 3) {
    console.log("✅ SUCCESS: roleId correctly assigned to 3 (Customer) via hooks.");
  } else {
    console.log(`❌ FAILURE: roleId is ${dbUser?.roleId}, expected 3.`);
  }

  // Cleanup
  await db.delete(users).where(eq(users.id, dbUser!.id));
}

verifyRegistration().catch(console.error);
