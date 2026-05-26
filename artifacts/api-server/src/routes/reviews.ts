import { Router } from "express";
import { db } from "@workspace/db";
import { reviewsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ListProductReviewsParams, CreateProductReviewParams, CreateProductReviewBody } from "@workspace/api-zod";

const router = Router();

router.get("/products/:id/reviews", async (req, res) => {
  const parsed = ListProductReviewsParams.safeParse({ id: parseInt(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.productId, parsed.data.id));
  res.json(reviews.map(r => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  })));
});

router.post("/products/:id/reviews", async (req, res) => {
  const paramParsed = CreateProductReviewParams.safeParse({ id: parseInt(req.params.id) });
  if (!paramParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = CreateProductReviewBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }

  const [review] = await db.insert(reviewsTable).values({
    productId: paramParsed.data.id,
    reviewerName: bodyParsed.data.reviewerName,
    rating: bodyParsed.data.rating,
    comment: bodyParsed.data.comment,
  }).returning();

  res.status(201).json({
    ...review,
    createdAt: review.createdAt.toISOString(),
  });
});

export default router;
