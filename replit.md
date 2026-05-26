# TriggeryOmi Drones and Parts

A full-featured drone e-commerce storefront with admin panel, product reviews, fake checkout, and sales analytics.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/triggeryomi run dev` — run the storefront (port 19320)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + Wouter (routing)
- API: Express 5 + Zod validation
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — Drizzle DB schema (products, reviews, orders, order-items)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/triggeryomi/src/pages/` — React pages
- `artifacts/triggeryomi/src/hooks/use-cart.tsx` — cart state (localStorage)

## Architecture decisions

- Checkout is a simulation — payment form looks real but calls `POST /api/orders` which records the order in the DB without any payment processing.
- Admin panel at `/admin` — no auth, just navigate to it. Sub-routes: `/admin/products`, `/admin/orders`.
- Cart state is managed in React context backed by localStorage (no server-side cart).
- `soldLastMonth` on products is computed at query time by summing `order_items.quantity`.
- Numeric fields (price, totalAmount) are stored as `numeric` in Postgres and parsed to `float` in API responses.

## Product

- **Storefront** (`/`) — Hero, feature grid, featured products
- **Catalog** (`/products`) — Full product grid with search + category filter
- **Product Detail** (`/products/:id`) — Images, specs, reviews, add-to-cart, sold-last-month badge
- **Cart** (`/cart`) — Item list, quantity controls, order summary
- **Checkout** (`/checkout`) — Simulated payment form with card fields; on submit creates a real order record
- **Admin Dashboard** (`/admin`) — Revenue/orders stats + monthly sales bar chart
- **Admin Products** (`/admin/products`) — Add, edit, delete products with a form dialog
- **Admin Orders** (`/admin/orders`) — Table of all orders with line items

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After adding new routes to `artifacts/api-server/src/routes/`, you must restart the API Server workflow so it rebuilds the esbuild bundle.
- Re-run codegen (`pnpm --filter @workspace/api-spec run codegen`) after any OpenAPI spec change before touching the frontend.
- `soldLastMonth` field currently counts ALL-TIME sold quantity (not just the current month). If scoping to last 30 days is needed, add a date filter in `products.ts` route.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
