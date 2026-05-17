import type { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { veloxfiAuditLog, veloxfiUsers } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

function clientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  if (Array.isArray(forwarded) && forwarded.length > 0) return String(forwarded[0]).split(",")[0].trim();
  return req.ip ?? "unknown";
}

/**
 * Records sensitive API calls (auth, mining, conversion, daily, pet, admin).
 * Writes happen on response 'finish' so the actual status code is captured.
 * Failures are swallowed so logging can never break the request itself.
 */
export function auditLog(req: Request, res: Response, next: NextFunction) {
  const started = Date.now();

  res.on("finish", () => {
    void (async () => {
      try {
        // Resolve username from the Bearer session token (without throwing
        // if not authenticated — many endpoints are anonymous).
        let username: string | null = null;
        const auth = req.headers.authorization;
        if (auth?.startsWith("Bearer ")) {
          const token = auth.slice(7);
          const [u] = await db.select({ username: veloxfiUsers.username })
            .from(veloxfiUsers).where(eq(veloxfiUsers.sessionToken, token));
          username = u?.username ?? null;
        }

        // Truncate request body to keep log rows lean. Strip obvious secrets.
        let body: string | null = null;
        if (req.body && Object.keys(req.body).length > 0) {
          const safe = { ...req.body };
          if (safe.password)      safe.password      = "***";
          if (safe.passwordHash)  safe.passwordHash  = "***";
          if (safe.sessionToken)  safe.sessionToken  = "***";
          body = JSON.stringify(safe).slice(0, 2000);
        }

        const ua = String(req.headers["user-agent"] ?? "").slice(0, 200);

        await db.insert(veloxfiAuditLog).values({
          username,
          ip:        clientIp(req).slice(0, 64),
          method:    req.method,
          path:      req.originalUrl.split("?")[0].slice(0, 200),
          status:    res.statusCode,
          body,
          userAgent: ua,
        });
      } catch {
        // Audit logging must never break the API. Swallow.
      } finally {
        void started; // keep reference to silence unused-var lints
      }
    })();
  });

  next();
}
