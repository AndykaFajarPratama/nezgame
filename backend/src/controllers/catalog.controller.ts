import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { categories, products } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { pricingService } from "../services/pricing.service.js";
import { apigameService } from "../services/apigame.service.js";

/**
 * Controller for public catalog actions and admin sync
 */
export class CatalogController {
  
  /**
   * List all categories
   */
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const allCategories = await db.query.categories.findMany({
        orderBy: (cat, { asc }) => [asc(cat.name)],
        with: {
          products: {
            where: (p, { eq }) => eq(p.status, "active"),
          },
        },
      });

      const results = allCategories.map((cat: any) => {
        const { products, ...rest } = cat;
        return {
          ...rest,
          activeProductCount: products.length,
        };
      });

      res.json(results);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get products by category slug (dynamically priced)
   */
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const paymentMethod = (req.query.method as string) || "default";

      // Find category
      const category = await db.query.categories.findFirst({
        where: eq(categories.slug, slug as string),
      });

      if (!category) {
        res.status(404).json({ success: false, message: "Category not found" });
        return;
      }

      // Get active products
      const categoryProducts = await db.query.products.findMany({
        where: (prod, { and }) =>
          and(
            eq(prod.categoryId, category.id),
            eq(prod.status, "active")
          )
      });

      // Format safely using the dynamic pricing engine
      const mapped = pricingService.formatProductsForClient(categoryProducts, paymentMethod);
      
      // Sort by price sell
      mapped.sort((a, b) => a.price_sell - b.price_sell);

      res.json(mapped);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Sync products from Apigames.
   * Optimized to avoid N+1 query problem.
   */
  async syncProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const resp = await apigameService.getProducts();

      if (!resp?.data) {
        res.json({ success: false, message: "Failed to fetch from Apigame", raw: resp });
        return;
      }

      // 1. Fetch all existing categories and products to avoid N+1
      const existingCategories = await db.query.categories.findMany();
      const existingProducts = await db.query.products.findMany();

      const categoryMap = new Map(existingCategories.map((c) => [c.slug, c]));
      const productMap = new Map(existingProducts.map((p) => [p.skuCode, p]));

      let created = 0;
      let updated = 0;

      for (const item of resp.data) {
        const catName = item.brand || "Other";
        const catSlug = catName.toLowerCase().replace(/\s+/g, "-");

        let cat = categoryMap.get(catSlug);

        // Create category if not exists
        if (!cat) {
          const [inserted] = await db
            .insert(categories)
            .values({ name: catName, slug: catSlug })
            .returning();
          cat = inserted;
          categoryMap.set(catSlug, cat);
        }

        const sku = item.code;
        const priceModal = parseFloat(item.price || "0").toString();
        const needsZone = Boolean(item.server_id);
        const status = item.status === "available" ? "active" : "inactive";

        const existingProd = productMap.get(sku);

        if (existingProd) {
          // Update if modal price or status changed
          if (existingProd.priceModal !== priceModal || existingProd.status !== status) {
            await db
              .update(products)
              .set({
                priceModal,
                status,
                needsZoneId: needsZone,
                updatedAt: new Date(),
              })
              .where(eq(products.skuCode, sku));
            updated++;
          }
        } else {
          // Insert new product
          await db.insert(products).values({
            categoryId: cat.id,
            skuCode: sku,
            name: item.name || sku,
            priceModal,
            status,
            needsZoneId: needsZone,
          });
          created++;
        }
      }

      console.log(`🔄 Product sync completed: ${created} created, ${updated} updated`);
      res.json({ success: true, message: "Synced products", created, updated });
    } catch (error) {
      next(error);
    }
  }
}

export const catalogController = new CatalogController();
