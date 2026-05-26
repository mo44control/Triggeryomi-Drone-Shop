import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, productsTable } from "@workspace/db";
import { sql, eq, gte } from "drizzle-orm";

const router = Router();

router.get("/admin/stats", async (req, res) => {
  const [totals] = await db
    .select({
      totalRevenue: sql<number>`COALESCE(SUM(${ordersTable.totalAmount}), 0)`,
      totalOrders: sql<number>`COUNT(*)`,
    })
    .from(ordersTable);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [monthly] = await db
    .select({
      ordersThisMonth: sql<number>`COUNT(*)`,
      revenueThisMonth: sql<number>`COALESCE(SUM(${ordersTable.totalAmount}), 0)`,
    })
    .from(ordersTable)
    .where(gte(ordersTable.createdAt, startOfMonth));

  const [productCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(productsTable);

  const topProductResult = await db
    .select({
      name: productsTable.name,
      total: sql<number>`SUM(${orderItemsTable.quantity})`,
    })
    .from(orderItemsTable)
    .innerJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
    .groupBy(productsTable.name)
    .orderBy(sql`SUM(${orderItemsTable.quantity}) DESC`)
    .limit(1);

  res.json({
    totalRevenue: Number(totals.totalRevenue),
    totalOrders: Number(totals.totalOrders),
    totalProducts: Number(productCount.count),
    ordersThisMonth: Number(monthly.ordersThisMonth),
    revenueThisMonth: Number(monthly.revenueThisMonth),
    topProduct: topProductResult[0]?.name ?? null,
  });
});

router.get("/admin/orders", async (req, res) => {
  const orders = await db.select().from(ordersTable).orderBy(sql`${ordersTable.createdAt} DESC`);

  const result = await Promise.all(
    orders.map(async (order) => {
      const items = await db
        .select()
        .from(orderItemsTable)
        .where(eq(orderItemsTable.orderId, order.id));

      return {
        id: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        shippingAddress: order.shippingAddress,
        totalAmount: parseFloat(order.totalAmount),
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          priceAtPurchase: parseFloat(i.priceAtPurchase),
          productName: i.productName,
        })),
      };
    })
  );

  res.json(result);
});

router.get("/admin/monthly-sales", async (req, res) => {
  const rows = await db
    .select({
      month: sql<string>`TO_CHAR(${ordersTable.createdAt}, 'YYYY-MM')`,
      orders: sql<number>`COUNT(*)`,
      revenue: sql<number>`SUM(${ordersTable.totalAmount})`,
    })
    .from(ordersTable)
    .groupBy(sql`TO_CHAR(${ordersTable.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`TO_CHAR(${ordersTable.createdAt}, 'YYYY-MM') ASC`)
    .limit(12);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  res.json(
    rows.map(r => ({
      month: (() => {
        const [year, mon] = r.month.split("-");
        return `${months[parseInt(mon) - 1]} ${year}`;
      })(),
      orders: Number(r.orders),
      revenue: Number(r.revenue),
    }))
  );
});

export default router;
