import { Router } from "express";
import { db } from "../db/index.js";
import { transactions, users } from "../db/schema.js";
import { eq, sql, count, sum } from "drizzle-orm";

const router = Router();

/**
 * GET admin dashboard stats
 */
router.get("/api/admin/stats", async (req, res) => {
  try {
    // 1. Total Revenue (Success/Paid transactions)
    const resultRevenue = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(eq(transactions.status, "SUCCESS"));
    
    // 2. Active Users (Total user count)
    const resultUsers = await db
      .select({ total: count(users.id) })
      .from(users);

    // 3. Total Orders (All transactions)
    const resultOrders = await db
      .select({ total: count(transactions.id) })
      .from(transactions);

    return res.json({
      revenue: parseFloat(resultRevenue[0]?.total || "0"),
      users: resultUsers[0]?.total || 0,
      orders: resultOrders[0]?.total || 0,
      uptime: "99.9%" // Static for now as placeholder for "Sys Uptime"
    });
  } catch (error) {
    console.error("Fetch Stats Error:", error);
    return res.status(500).json({ error: "Gagal memuat statistik." });
  }
});

/**
 * GET transaction chart data (Simplified)
 */
router.get("/api/admin/chart", async (req, res) => {
    try {
        // Simple grouped count by hour for today
        const result = await db.execute(sql`
            SELECT 
                EXTRACT(HOUR FROM created_at) as hour, 
                COUNT(*) as count 
            FROM transactions 
            WHERE created_at > CURRENT_DATE
            GROUP BY hour 
            ORDER BY hour ASC
        `);
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ error: "Gagal memuat grafik." });
    }
});

export default router;
