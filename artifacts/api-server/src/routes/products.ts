import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, reviewsTable, orderItemsTable } from "@workspace/db";
import { eq, ilike, or, sql } from "drizzle-orm";
import {
  ListProductsQueryParams,
  CreateProductBody,
  GetProductParams,
  UpdateProductParams,
  UpdateProductBody,
  DeleteProductParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/products", async (req, res) => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { category, search } = parsed.data;

  let query = db.select().from(productsTable).$dynamic();

  if (category && search) {
    query = query.where(
      sql`${productsTable.category} ilike ${`%${category}%`} AND (${productsTable.name} ilike ${`%${search}%`} OR ${productsTable.description} ilike ${`%${search}%`})`
    );
  } else if (category) {
    query = query.where(ilike(productsTable.category, `%${category}%`));
  } else if (search) {
    query = query.where(
      or(
        ilike(productsTable.name, `%${search}%`),
        ilike(productsTable.description, `%${search}%`)
      )
    );
  }

  const products = await query;

  const enriched = await Promise.all(
    products.map(async (p) => {
      const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.productId, p.id));
      const avgRating = reviews.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const soldItems = await db
        .select({ qty: sql<number>`SUM(${orderItemsTable.quantity})` })
        .from(orderItemsTable)
        .where(eq(orderItemsTable.productId, p.id));

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        price: parseFloat(p.price),
        category: p.category,
        imageUrl: p.imageUrl,
        stock: p.stock,
        featured: p.featured,
        averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        reviewCount: reviews.length,
        soldLastMonth: Number(soldItems[0]?.qty ?? 0),
        createdAt: p.createdAt.toISOString(),
      };
    })
  );

  res.json(enriched);
});

router.post("/products", async (req, res) => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, description, price, category, imageUrl, stock, featured } = parsed.data;
  const [product] = await db.insert(productsTable).values({
    name,
    description,
    price: String(price),
    category,
    imageUrl,
    stock: stock ?? 0,
    featured: featured ?? false,
  }).returning();

  res.status(201).json({
    ...product,
    price: parseFloat(product.price),
    averageRating: null,
    reviewCount: 0,
    soldLastMonth: 0,
    createdAt: product.createdAt.toISOString(),
  });
});

router.get("/products/:id", async (req, res) => {
  const parsed = GetProductParams.safeParse({ id: parseInt(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, parsed.data.id));
  if (!product) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.productId, product.id));
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;

  const soldItems = await db
    .select({ qty: sql<number>`COALESCE(SUM(${orderItemsTable.quantity}), 0)` })
    .from(orderItemsTable)
    .where(eq(orderItemsTable.productId, product.id));

  res.json({
    id: product.id,
    name: product.name,
    description: product.description,
    price: parseFloat(product.price),
    category: product.category,
    imageUrl: product.imageUrl,
    stock: product.stock,
    featured: product.featured,
    averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
    reviewCount: reviews.length,
    soldLastMonth: Number(soldItems[0]?.qty ?? 0),
    createdAt: product.createdAt.toISOString(),
  });
});

router.patch("/products/:id", async (req, res) => {
  const paramParsed = UpdateProductParams.safeParse({ id: parseInt(req.params.id) });
  if (!paramParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = UpdateProductBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  const data = bodyParsed.data;
  if (data.name !== undefined) updates.name = data.name;
  if (data.description !== undefined) updates.description = data.description;
  if (data.price !== undefined) updates.price = String(data.price);
  if (data.category !== undefined) updates.category = data.category;
  if (data.imageUrl !== undefined) updates.imageUrl = data.imageUrl;
  if (data.stock !== undefined) updates.stock = data.stock;
  if (data.featured !== undefined) updates.featured = data.featured;

  const [product] = await db.update(productsTable).set(updates).where(eq(productsTable.id, paramParsed.data.id)).returning();
  if (!product) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.productId, product.id));
  const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;
  const soldItems = await db.select({ qty: sql<number>`COALESCE(SUM(${orderItemsTable.quantity}), 0)` }).from(orderItemsTable).where(eq(orderItemsTable.productId, product.id));

  res.json({
    ...product,
    price: parseFloat(product.price),
    averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
    reviewCount: reviews.length,
    soldLastMonth: Number(soldItems[0]?.qty ?? 0),
    createdAt: product.createdAt.toISOString(),
  });
});

router.delete("/products/:id", async (req, res) => {
  const parsed = DeleteProductParams.safeParse({ id: parseInt(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(productsTable).where(eq(productsTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
