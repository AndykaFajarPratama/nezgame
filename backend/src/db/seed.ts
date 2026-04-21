import { db } from "./index.js";
import { categories, products, roles, permissions, role_permissions } from "./schema.js";
import { eq } from "drizzle-orm";

interface GameSeed {
  name: string;
  slug: string;
  needsZone: boolean;
  imageUrl?: string;
  products: { sku: string; name: string; price: number }[];
}

const games: GameSeed[] = [
  {
    name: "Mobile Legends",
    slug: "mobile-legends",
    needsZone: true,
    products: [
      { sku: "MLBB_86", name: "86 Diamonds", price: 19500 },
      { sku: "MLBB_172", name: "172 Diamonds", price: 38000 },
      { sku: "MLBB_257", name: "257 Diamonds", price: 57000 },
      { sku: "MLBB_344", name: "344 Diamonds", price: 76000 },
      { sku: "MLBB_514", name: "514 Diamonds", price: 113000 },
      { sku: "MLBB_706", name: "706 Diamonds", price: 153000 },
    ],
  },
  {
    name: "Free Fire",
    slug: "free-fire",
    needsZone: false,
    products: [
      { sku: "FF_70", name: "70 Diamonds", price: 9300 },
      { sku: "FF_140", name: "140 Diamonds", price: 18500 },
      { sku: "FF_355", name: "355 Diamonds", price: 46000 },
      { sku: "FF_720", name: "720 Diamonds", price: 93000 },
      { sku: "FF_1450", name: "1450 Diamonds", price: 183000 },
    ],
  },
  {
    name: "PUBG Mobile",
    slug: "pubg-mobile",
    needsZone: false,
    products: [
      { sku: "PUBG_60", name: "60 UC", price: 14000 },
      { sku: "PUBG_325", name: "325 UC", price: 68000 },
      { sku: "PUBG_660", name: "660 UC", price: 133000 },
      { sku: "PUBG_1800", name: "1800 UC", price: 348000 },
    ],
  },
];

async function seed() {
  console.log("🌱 Seeding database...");

  // 1. Seed Roles
  console.log("  📦 Seeding roles...");
  const roleNames = ["owner", "admin", "customer"];
  const roleMap: Record<string, number> = {};

  for (const name of roleNames) {
    const existing = await db.query.roles.findFirst({ where: eq(roles.name, name) });
    if (existing) {
      roleMap[name] = existing.id;
    } else {
      const [inserted] = await db.insert(roles).values({ name }).returning();
      roleMap[name] = inserted.id;
    }
  }

  // 2. Seed Permissions
  console.log("  🔐 Seeding permissions...");
  const permissionNames = ["view_products", "create_transaction", "update_pricing", "view_all_transactions"];
  const permMap: Record<string, number> = {};

  for (const name of permissionNames) {
    const existing = await db.query.permissions.findFirst({ where: eq(permissions.name, name) });
    if (existing) {
      permMap[name] = existing.id;
    } else {
      const [inserted] = await db.insert(permissions).values({ name }).returning();
      permMap[name] = inserted.id;
    }
  }

  // 3. Map Role Permissions
  console.log("  🔗 Mapping role permissions...");
  const mapping = [
    { role: "customer", perms: ["view_products", "create_transaction"] },
    { role: "admin", perms: ["view_products", "create_transaction", "update_pricing", "view_all_transactions"] },
    { role: "owner", perms: ["view_products", "create_transaction", "update_pricing", "view_all_transactions"] },
  ];

  for (const map of mapping) {
    const roleId = roleMap[map.role];
    for (const pName of map.perms) {
      const permId = permMap[pName];
      // Check if mapping exists
      const existing = await db.select().from(role_permissions).where(
        and(eq(role_permissions.roleId, roleId), eq(role_permissions.permissionId, permId))
      );
      if (existing.length === 0) {
        await db.insert(role_permissions).values({ roleId, permissionId: permId });
      }
    }
  }

  // 4. Seed Categories & Products
  console.log("  🎮 Seeding categories & products...");
  for (const game of games) {
    let cat = await db.query.categories.findFirst({ where: eq(categories.slug, game.slug) });
    if (!cat) {
      const [inserted] = await db.insert(categories).values({
        name: game.name,
        slug: game.slug,
        imageUrl: game.imageUrl || null,
      }).returning();
      cat = inserted;
    }

    for (const prod of game.products) {
      const existing = await db.query.products.findFirst({ where: eq(products.skuCode, prod.sku) });
      if (!existing) {
        await db.insert(products).values({
          categoryId: cat.id,
          skuCode: prod.sku,
          name: prod.name,
          priceModal: prod.price.toString(),
          status: "active",
          needsZoneId: game.needsZone,
        });
      }
    }
  }

  console.log("\n🎉 Database seeded successfully!");
  process.exit(0);
}

// Helper for 'and' since it's used in mapping loop
import { and } from "drizzle-orm";

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

