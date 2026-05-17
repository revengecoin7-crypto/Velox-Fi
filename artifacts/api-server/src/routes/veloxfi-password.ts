import { Router } from "express";
import { db } from "@workspace/db";
import { veloxfiUsers } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { Resend } from "resend";

const router = Router();
const resend = new Resend(process.env.RESEND_API_KEY);
// Falls back to Resend's public test sender until veloxfi.io is verified
// in the Resend dashboard. Set RESEND_FROM=noreply@veloxfi.io in Railway
// env after DNS verification to switch over.
const FROM     = process.env.RESEND_FROM ?? "onboarding@resend.dev";
const BASE_URL = process.env.SITE_URL    ?? "https://veloxfi.io";

router.post("/veloxfi/forgot-password", async (req: any, res: any) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
      res.status(400).json({ error: "Enter a valid email address." });
      return;
    }

    const [user] = await db
      .select({ username: veloxfiUsers.username, email: veloxfiUsers.email })
      .from(veloxfiUsers)
      .where(eq(veloxfiUsers.email, email.trim().toLowerCase()))
      .limit(1);

    if (user) {
      const token  = randomUUID();
      const expiry = new Date(Date.now() + 60 * 60 * 1000);

      await db
        .update(veloxfiUsers)
        .set({ resetToken: token, resetTokenExpiry: expiry })
        .where(eq(veloxfiUsers.username, user.username));

      const resetLink = `${BASE_URL}/?reset=${token}`;

      await resend.emails.send({
        from:    FROM,
        to:      [user.email],
        subject: "🔐 Reset your VeloxFi password",
        html: `
          <div style="font-family:sans-serif;background:#05080f;color:#e2e8f0;padding:40px;max-width:520px;margin:0 auto;border-radius:16px;border:1px solid #1e293b">
            <div style="font-family:monospace;font-size:22px;font-weight:900;background:linear-gradient(135deg,#3b82f6,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:3px;margin-bottom:8px">VELOXFI</div>
            <h2 style="color:#e2e8f0;margin:0 0 20px;font-size:18px">Reset your password</h2>
            <p style="color:#94a3b8;line-height:1.6">Hi <strong style="color:#e2e8f0">${user.username}</strong>,</p>
            <p style="color:#94a3b8;line-height:1.6">We received a request to reset your VeloxFi password. Click the button below to set a new one. This link expires in <strong style="color:#e2e8f0">1 hour</strong>.</p>
            <div style="text-align:center;margin:32px 0">
              <a href="${resetLink}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;text-decoration:none;border-radius:10px;font-family:monospace;font-size:13px;font-weight:700;letter-spacing:1px">RESET PASSWORD →</a>
            </div>
            <p style="color:#475569;font-size:12px;line-height:1.6">If you didn't request this, you can safely ignore this email. Your password will not be changed.</p>
            <p style="color:#475569;font-size:12px">Or copy this link: <span style="color:#3b82f6">${resetLink}</span></p>
          </div>
        `,
      });
    }

    res.json({ ok: true });
  } catch (e) {
    console.error("forgot-password error:", e);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

router.post("/veloxfi/reset-password", async (req: any, res: any) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({ error: "Missing required fields." });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters." });
      return;
    }

    const [user] = await db
      .select()
      .from(veloxfiUsers)
      .where(eq(veloxfiUsers.resetToken, token))
      .limit(1);

    if (!user || !user.resetTokenExpiry) {
      res.status(400).json({ error: "This reset link has expired, please request a new one." });
      return;
    }

    if (new Date() > new Date(user.resetTokenExpiry)) {
      await db
        .update(veloxfiUsers)
        .set({ resetToken: null, resetTokenExpiry: null })
        .where(eq(veloxfiUsers.username, user.username));
      res.status(400).json({ error: "This reset link has expired, please request a new one." });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const sessionToken = randomUUID();

    await db
      .update(veloxfiUsers)
      .set({ passwordHash, resetToken: null, resetTokenExpiry: null, sessionToken })
      .where(eq(veloxfiUsers.username, user.username));

    res.json({ username: user.username, tokens: user.tokens, email: user.email, token: sessionToken });
  } catch (e) {
    console.error("reset-password error:", e);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

export default router;
