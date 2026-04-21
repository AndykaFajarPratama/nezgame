import { auth } from "../auth/index.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

async function createInitialUsers() {
  console.log("🚀 Creating initial Owner and Admin accounts...");

  const initialUsers = [
    {
      name: "Super Owner",
      email: "owner@nezgame.com",
      password: "NezOwner123!",
      roleId: 1, // owner
    },
    {
      name: "System Admin",
      email: "admin@nezgame.com",
      password: "NezAdmin123!",
      roleId: 2, // admin
    },
  ];

  for (const userData of initialUsers) {
    try {
      console.log(`\nProcessing ${userData.email}...`);
      
      // 1. Check if exists
      const existing = await db.query.users.findFirst({
        where: eq(users.email, userData.email),
      });

      if (existing) {
        console.log(`  ⚠ User ${userData.email} already exists. Updating role...`);
        await db.update(users).set({ roleId: userData.roleId }).where(eq(users.id, existing.id));
        console.log(`  ✅ Role updated to ID ${userData.roleId}`);
        continue;
      }

      // 2. SignUp using Better Auth API
      const response = await auth.api.signUpEmail({
        body: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
        },
      });

      if (response && response.user) {
        console.log(`  ✅ User created successfully: ${response.user.id}`);
        
        // 3. Update the roleId because Better Auth doesn't let us set it directly in signUp
        await db.update(users)
          .set({ roleId: userData.roleId })
          .where(eq(users.id, response.user.id));
        
        console.log(`  ✅ Role assigned: ID ${userData.roleId}`);
      }
    } catch (err: any) {
      console.error(`  ❌ Failed to create ${userData.email}:`, err.message);
    }
  }

  process.exit(0);
}

createInitialUsers();
