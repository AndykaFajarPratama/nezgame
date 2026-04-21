import { Router } from "express";
import { db } from "../db/index.js";
import { site_settings } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

/**
 * GET all site settings
 */
router.get("/api/settings", async (req, res) => {
  try {
    const settings = await db.select().from(site_settings);
    // Convert array to object for easier use
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
    
    return res.json(settingsMap);
  } catch (error) {
    console.error("Fetch Settings Error:", error);
    return res.status(500).json({ error: "Gagal mengambil pengaturan." });
  }
});

/**
 * POST update/create a setting
 */
router.post("/api/settings", async (req, res) => {
  const { key, value } = req.body;

  if (!key) {
    return res.status(400).json({ error: "Key wajib diisi." });
  }

  try {
    // Check if exists
    const existing = await db.select().from(site_settings).where(eq(site_settings.key, key)).limit(1);

    if (existing.length > 0) {
      await db.update(site_settings)
        .set({ value, updatedAt: new Date() })
        .where(eq(site_settings.key, key));
    } else {
      await db.insert(site_settings).values({ key, value });
    }

    return res.json({ success: true, message: `Pengaturan ${key} berhasil diperbarui.` });
  } catch (error) {
    console.error("Update Setting Error:", error);
    return res.status(500).json({ error: "Gagal memperbarui pengaturan." });
  }
});

export default router;
