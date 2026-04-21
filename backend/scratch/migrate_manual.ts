import 'dotenv/config';
import postgres from 'postgres';

async function migrateManually() {
  const sql = postgres(process.env.DATABASE_URL!);
  try {
    console.log('Running manual migrations map...');
    
    // 1. Create RBAC tables
    await sql`
      CREATE TABLE IF NOT EXISTS "roles" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(50) NOT NULL UNIQUE,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS "permissions" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(100) NOT NULL UNIQUE,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS "role_permissions" (
        "role_id" integer NOT NULL REFERENCES "roles"("id") ON DELETE cascade,
        "permission_id" integer NOT NULL REFERENCES "permissions"("id") ON DELETE cascade
      );
    `;

    // 2. Modify users
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role_id" integer REFERENCES "roles"("id");`;
    await sql`ALTER TABLE "users" DROP COLUMN IF EXISTS "role";`;

    // 3. Modify transactions
    await sql`ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "customer_email" text;`;
    await sql`ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "customer_phone" text;`;
    await sql`ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "harga_modal" numeric(12, 2) NOT NULL DEFAULT 0;`;
    await sql`ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "harga_jual" numeric(12, 2) NOT NULL DEFAULT 0;`;
    await sql`ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "payment_method_detail" varchar(50);`;

    // 4. Modify products
    await sql`ALTER TABLE "products" DROP COLUMN IF EXISTS "price_sell";`;

    console.log('Manual migrations done!');
  } catch (err) {
    console.error('Error migrating manually:', err);
  } finally {
    await sql.end();
  }
}

migrateManually();
