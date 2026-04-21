import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { transactions, users, roles, sessions } from "../db/schema.js";
import { eq, desc, and, or, gte, lte, sql, count, sum, avg } from "drizzle-orm";
import { getSession } from "../middleware/auth.middleware.js";
import { auth } from "../auth/index.js";

const router = Router();

// ═══════════════════════════════════════════════════════════════
//  OWNER-ONLY MIDDLEWARE (roleId === 1)
// ═══════════════════════════════════════════════════════════════

async function requireOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = await getSession(req);
    if (!session) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    const roleId = (session.user as any).roleId;
    if (roleId !== 1) {
      res.status(403).json({ success: false, message: "Owner access required." });
      return;
    }

    (req as any).user = session.user;
    (req as any).session = session.session;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Auth error." });
  }
}

// ═══════════════════════════════════════════════════════════════
//  GET /api/owner/analytics
//  Revenue, profit, and transaction analytics (SQL Optimized)
// ═══════════════════════════════════════════════════════════════

router.get("/api/owner/analytics", requireOwner, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const range = (req.query.range as string) || "30d";
    
    let daysBack = 30;
    if (range === "7d") daysBack = 7;
    else if (range === "90d") daysBack = 90;
    else if (range === "365d") daysBack = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    // Move to start of day for cleaner queries
    startDate.setHours(0, 0, 0, 0);

    // 1. Overall Summary (Calculated in DB)
    const [summary] = await db
      .select({
        totalRevenue: sql<string>`COALESCE(SUM(${transactions.hargaJual}), '0')`,
        totalCost: sql<string>`COALESCE(SUM(${transactions.hargaModal}), '0')`,
        totalTransactions: count(),
        avgOrderValue: avg(transactions.hargaJual),
      })
      .from(transactions)
      .where(
        and(
          gte(transactions.createdAt, startDate),
          eq(transactions.status, "SUCCESS")
        )
      );

    const totalRevenue = parseFloat(summary?.totalRevenue || "0");
    const totalCost = parseFloat(summary?.totalCost || "0");
    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // 2. Daily Data for Charts (Group by Day in DB)
    const dailyResults = await db
      .select({
        date: sql<string>`TO_CHAR(${transactions.createdAt}, 'YYYY-MM-DD')`,
        revenue: sql<string>`SUM(${transactions.hargaJual})`,
        cost: sql<string>`SUM(${transactions.hargaModal})`,
        count: count(),
      })
      .from(transactions)
      .where(
        and(
          gte(transactions.createdAt, startDate),
          eq(transactions.status, "SUCCESS")
        )
      )
      .groupBy(sql`TO_CHAR(${transactions.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${transactions.createdAt}, 'YYYY-MM-DD')`);

    // Fill missing days
    const dailyData: any[] = [];
    const dateMap = new Map(dailyResults.map(r => [r.date, r]));
    const cursor = new Date(startDate);
    const today = new Date();
    while (cursor <= today) {
      const key = cursor.toISOString().split("T")[0];
      const data = dateMap.get(key);
      const rev = parseFloat(data?.revenue || "0");
      const cst = parseFloat(data?.cost || "0");
      dailyData.push({
        date: key,
        revenue: Math.round(rev),
        cost: Math.round(cst),
        profit: Math.round(rev - cst),
        count: Number(data?.count || 0),
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    // 3. Monthly Aggregation (Group by Month in DB)
    const monthlyData = await db
      .select({
        month: sql<string>`TO_CHAR(${transactions.createdAt}, 'YYYY-MM')`,
        revenue: sql<number>`CAST(SUM(${transactions.hargaJual}) AS DOUBLE PRECISION)`,
        cost: sql<number>`CAST(SUM(${transactions.hargaModal}) AS DOUBLE PRECISION)`,
        count: count(),
      })
      .from(transactions)
      .where(eq(transactions.status, "SUCCESS"))
      .groupBy(sql`TO_CHAR(${transactions.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${transactions.createdAt}, 'YYYY-MM')`);

    // 4. Top Products (Group by SKU in DB)
    const topProductsRaw = await db
      .select({
        sku: transactions.productSku,
        revenue: sql<number>`CAST(SUM(${transactions.hargaJual}) AS DOUBLE PRECISION)`,
        profit: sql<number>`CAST(SUM(${transactions.hargaJual} - ${transactions.hargaModal}) AS DOUBLE PRECISION)`,
        count: count(),
      })
      .from(transactions)
      .where(
        and(
          gte(transactions.createdAt, startDate),
          eq(transactions.status, "SUCCESS")
        )
      )
      .groupBy(transactions.productSku)
      .orderBy(sql`profit DESC`)
      .limit(10);

    // 5. Payment Breakdown
    const paymentBreakdown = await db
      .select({
        method: sql<string>`COALESCE(${transactions.paymentMethodDetail}, ${transactions.paymentMethod})`,
        revenue: sql<number>`CAST(SUM(${transactions.hargaJual}) AS DOUBLE PRECISION)`,
        count: count(),
      })
      .from(transactions)
      .where(
        and(
          gte(transactions.createdAt, startDate),
          eq(transactions.status, "SUCCESS")
        )
      )
      .groupBy(sql`COALESCE(${transactions.paymentMethodDetail}, ${transactions.paymentMethod})`)
      .orderBy(sql`revenue DESC`);

    // 6. Status Breakdown (All Time)
    const statusCountsRaw = await db
      .select({
        status: transactions.status,
        count: count(),
      })
      .from(transactions)
      .groupBy(transactions.status);

    const statusCounts: Record<string, number> = {};
    statusCountsRaw.forEach(r => statusCounts[r.status] = Number(r.count));

    res.json({
      summary: {
        totalRevenue: Math.round(totalRevenue),
        totalCost: Math.round(totalCost),
        totalProfit: Math.round(totalProfit),
        totalTransactions: Number(summary?.totalTransactions || 0),
        avgOrderValue: Math.round(Number(summary?.avgOrderValue || 0)),
        profitMargin: Math.round(profitMargin * 100) / 100,
      },
      dailyData,
      monthlyData,
      topProducts: topProductsRaw,
      paymentBreakdown,
      statusCounts,
    });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════
//  GET /api/owner/admins
//  List all admin/owner users (SQL Optimized)
// ═══════════════════════════════════════════════════════════════

router.get("/api/owner/admins", requireOwner, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const adminUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        roleId: users.roleId,
        createdAt: users.createdAt,
        roleName: roles.name,
        sessionCount: sql<number>`CAST(COUNT(${sessions.id}) AS INTEGER)`,
      })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .leftJoin(sessions, eq(users.id, sessions.userId))
      .groupBy(
        users.id,
        users.name,
        users.email,
        users.image,
        users.roleId,
        users.createdAt,
        roles.name
      )
      .orderBy(users.createdAt);

    res.json(adminUsers);
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════
//  POST /api/owner/admins
//  Create a new admin user via Better Auth
// ═══════════════════════════════════════════════════════════════

router.post("/api/owner/admins", requireOwner, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: "name, email, password required." });
      return;
    }

    // Get admin role id
    const adminRole = await db.query.roles.findFirst({
      where: eq(roles.name, "admin"),
    });

    if (!adminRole) {
      res.status(500).json({ success: false, message: "Admin role not found in database." });
      return;
    }

    // Create user via Better Auth
    const newUser = await auth.api.signUpEmail({
      body: { name, email, password },
    });

    if (!newUser) {
      res.status(400).json({ success: false, message: "Failed to create user." });
      return;
    }

    // Assign admin role
    await db
      .update(users)
      .set({ roleId: adminRole.id })
      .where(eq(users.email, email));

    res.json({ success: true, message: `Admin '${name}' created successfully.` });
  } catch (error: any) {
    if (error.message?.includes("unique") || error.message?.includes("duplicate")) {
      res.status(409).json({ success: false, message: "Email already exists." });
      return;
    }
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════
//  DELETE /api/owner/admins/:id
//  Remove an admin (cannot delete owner)
// ═══════════════════════════════════════════════════════════════

router.delete("/api/owner/admins/:id", requireOwner, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const target = await db.query.users.findFirst({
      where: eq(users.id, id as string),
    });

    if (!target) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    // Prevent deleting owner
    if (target.roleId === 1) {
      res.status(403).json({ success: false, message: "Cannot delete owner account." });
      return;
    }

    // Delete sessions first, then accounts, then user
    await db.delete(sessions).where(eq(sessions.userId, id as string));
    // User deletion via cascade
    await db.delete(users).where(eq(users.id, id as string));

    res.json({ success: true, message: "Admin removed." });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════
//  GET /api/owner/transactions-report
//  Enhanced transaction data with filtering & pagination (SQL Optimized)
// ═══════════════════════════════════════════════════════════════

router.get("/api/owner/transactions-report", requireOwner, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 25, 100);
    const status = req.query.status as string;
    const from = req.query.from as string;
    const to = req.query.to as string;
    const search = req.query.search as string;

    // Build conditions
    const conditions = [];
    if (status && status !== "ALL") {
      conditions.push(eq(transactions.status, status));
    }
    if (from) {
      conditions.push(gte(transactions.createdAt, new Date(from)));
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      conditions.push(lte(transactions.createdAt, toDate));
    }
    if (search) {
      const s = `%${search}%`;
      conditions.push(
        or(
          sql`${transactions.invoiceNumber} ILIKE ${s}`,
          sql`${transactions.targetId} ILIKE ${s}`,
          sql`${transactions.productSku} ILIKE ${s}`
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // 1. Get total count and overall summary for filtered range in SQL
    const [summaryData] = await db
      .select({
        totalCount: count(),
        successRevenue: sql<string>`SUM(CASE WHEN ${transactions.status} = 'SUCCESS' THEN ${transactions.hargaJual} ELSE 0 END)`,
        successCost: sql<string>`SUM(CASE WHEN ${transactions.status} = 'SUCCESS' THEN ${transactions.hargaModal} ELSE 0 END)`,
        successCount: sql<number>`CAST(COUNT(*) FILTER (WHERE ${transactions.status} = 'SUCCESS') AS INTEGER)`,
      })
      .from(transactions)
      .where(whereClause);

    const total = Number(summaryData?.totalCount || 0);
    const summaryRevenue = parseFloat(summaryData?.successRevenue || "0");
    const summaryCost = parseFloat(summaryData?.successCost || "0");
    const successCount = Number(summaryData?.successCount || 0);

    // 2. Get paginated data
    const allTrx = await db.query.transactions.findMany({
      where: whereClause,
      orderBy: [desc(transactions.createdAt)],
      limit,
      offset: (page - 1) * limit,
    });

    res.json({
      transactions: allTrx.map((t) => ({
        id: t.id,
        invoice_number: t.invoiceNumber,
        target_id: t.targetId,
        zone_id: t.zoneId,
        product_sku: t.productSku,
        hargaModal: parseFloat(t.hargaModal),
        hargaJual: parseFloat(t.hargaJual),
        amount: parseFloat(t.amount),
        payment_method: t.paymentMethodDetail || t.paymentMethod,
        status: t.status,
        created_at: t.createdAt?.toISOString() || null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalRevenue: Math.round(summaryRevenue),
        totalCost: Math.round(summaryCost),
        totalProfit: Math.round(summaryRevenue - summaryCost),
        avgOrderValue: successCount > 0 ? Math.round(summaryRevenue / successCount) : 0,
        totalFiltered: total,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
