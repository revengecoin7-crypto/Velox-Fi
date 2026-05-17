import { Router } from "express";
import { db } from "@workspace/db";
import { veloxfiUsers } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { sendPasswordResetEmail } from "../lib/mailer";

const router = Router();

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

      await sendPasswordResetEmail(user.email, user.username, token);
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
