import { Router } from "express";
import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { requireAdminAuth } from "../middleware/admin-auth";

const router = Router();

const ADMIN_PASSWORD_KEY = "admin_password";
const ADMIN_USERNAME = "admin";

async function getAdminPasswordHash(): Promise<string> {
  const [row] = await db
    .select()
    .from(settingsTable)
    .where(eq(settingsTable.key, ADMIN_PASSWORD_KEY));

  if (!row) {
    const hash = await bcrypt.hash("admin", 10);
    await db.insert(settingsTable).values({ key: ADMIN_PASSWORD_KEY, value: hash });
    return hash;
  }
  return row.value;
}

router.post("/admin/login", async (req, res) => {
  const { username, password } = req.body ?? {};

  if (typeof username !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  if (username !== ADMIN_USERNAME) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const hash = await getAdminPasswordHash();
  const valid = await bcrypt.compare(password, hash);

  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  res.cookie("admin_session", "authenticated", {
    signed: true,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "lax",
  });

  res.json({ authenticated: true, username: ADMIN_USERNAME });
});

router.post("/admin/logout", (req, res) => {
  res.clearCookie("admin_session");
  res.json({ ok: true });
});

router.get("/admin/me", (req, res) => {
  const cookies = (req as any).signedCookies;
  if (!cookies || cookies["admin_session"] !== "authenticated") {
    res.status(401).json({ authenticated: false });
    return;
  }
  res.json({ authenticated: true, username: ADMIN_USERNAME });
});

router.post("/admin/change-password", requireAdminAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};

  if (
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string" ||
    newPassword.length < 1
  ) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const hash = await getAdminPasswordHash();
  const valid = await bcrypt.compare(currentPassword, hash);

  if (!valid) {
    res.status(401).json({ error: "Current password is incorrect" });
    return;
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await db
    .insert(settingsTable)
    .values({ key: ADMIN_PASSWORD_KEY, value: newHash, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: settingsTable.key,
      set: { value: newHash, updatedAt: new Date() },
    });

  res.json({ ok: true });
});

export default router;
