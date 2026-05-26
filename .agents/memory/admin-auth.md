---
name: Admin Auth
description: How admin authentication works in this project
---

# Admin Auth

Cookie-based authentication for the admin panel.

## How it works
- Password hash stored in `settings` table (key: `admin_password`) using bcryptjs
- On first boot if no hash exists, seeds with hash of `"admin"` (default credentials: admin/admin)
- Login: `POST /api/admin/login` → sets signed `HttpOnly` cookie `admin_session=authenticated`
- Cookie signed with `SESSION_SECRET` env var via `cookieParser(process.env.SESSION_SECRET)` in `app.ts`
- Auth check: `req.signedCookies["admin_session"] === "authenticated"` in `requireAdminAuth` middleware
- Frontend: `AdminAuthProvider` wraps entire app, calls `/api/admin/me` on mount to check status
- Protected routes: `ProtectedAdminRoute` wrapper in `App.tsx` redirects to `/admin/login` if not authenticated
- Admin panel Settings page (`/admin/settings`) allows changing password

**Why:** Chose signed cookies (not JWT/localStorage) because browser sends them automatically — existing React Query hooks for admin stats/orders/products work without modification.

**How to apply:** Any new admin-only API route should use `requireAdminAuth` middleware from `artifacts/api-server/src/middleware/admin-auth.ts`. New admin UI pages need `ProtectedAdminRoute` wrapper in `App.tsx`.
