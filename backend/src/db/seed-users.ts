import { auth } from "../auth/index.js";
import { db } from "./index.js";
import { users, accounts, sessions } from "./schema.js";
import { eq } from "drizzle-orm";

async function populateUsers() {
  console.log("Seeding and resetting admin and owner accounts...");
  
  const accountsToSeed = [
    { email: "owner@nezgame.com", password: "nezgame123", name: "Owner NezGame", roleId: 1 },
    { email: "admin@nezgame.com", password: "admin123", name: "Admin System", roleId: 2 }
  ];

  for (const account of accountsToSeed) {
    try {
      // Find the user first
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, account.email)
      });

      // Completely delete user to ensure fresh credentials
      if (existingUser) {
         console.log(`Deleting existing records for: ${account.email}`);
         await db.delete(sessions).where(eq(sessions.userId, existingUser.id));
         await db.delete(accounts).where(eq(accounts.userId, existingUser.id));
         await db.delete(users).where(eq(users.id, existingUser.id));
      }

      console.log(`Creating fresh account for: ${account.email}`);
      const headers = new Headers();
      await auth.api.signUpEmail({
        body: {
          email: account.email,
          password: account.password,
          name: account.name
        },
        headers
      });

      // Update the roleId because by default it sets it to 3 (Customer) due to db hooks
      await db.update(users)
        .set({ roleId: account.roleId, emailVerified: true })
        .where(eq(users.email, account.email));
        
      console.log(`Successfully verified and set role for: ${account.email}`);

    } catch (err: any) {
      console.error(`Error processing ${account.email}:`, err?.message || err);
    }
  }

  console.log("Users reset and seeding done.");
  process.exit(0);
}

populateUsers();
