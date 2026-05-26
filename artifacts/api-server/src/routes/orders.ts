import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateOrderBody } from "@workspace/api-zod";

const router = Router();

router.post("/orders", async (req, res) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { customerName, customerEmail, shippingAddress, items } = parsed.data;

  let totalAmount = 0;
  const itemDetails: { productId: number; quantity: number; priceAtPurchase: number; productName: string }[] = [];

  for (const item of items) {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    if (!product) {
      res.status(400).json({ error: `Product ${item.productId} not found` });
      return;
    }
    const price = parseFloat(product.price);
    totalAmount += price * item.quantity;
    itemDetails.push({
      productId: item.productId,
      quantity: item.quantity,
      priceAtPurchase: price,
      productName: product.name,
    });
  }

  const [order] = await db.insert(ordersTable).values({
    customerName,
    customerEmail,
    shippingAddress,
    totalAmount: String(totalAmount.toFixed(2)),
    status: "confirmed",
  }).returning();

  const insertedItems = await Promise.all(
    itemDetails.map(item =>
      db.insert(orderItemsTable).values({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: String(item.priceAtPurchase.toFixed(2)),
        productName: item.productName,
      }).returning()
    )
  );

  res.status(201).json({
    id: order.id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    shippingAddress: order.shippingAddress,
    totalAmount: parseFloat(order.totalAmount),
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    items: insertedItems.flat().map(i => ({
      productId: i.productId,
      quantity: i.quantity,
      priceAtPurchase: parseFloat(i.priceAtPurchase),
      productName: i.productName,
    })),
  });
});

export default router;
