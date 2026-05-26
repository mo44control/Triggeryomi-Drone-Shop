import { Request, Response, NextFunction } from "express";

export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const cookies = (req as any).signedCookies;
  if (!cookies || cookies["admin_session"] !== "authenticated") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
