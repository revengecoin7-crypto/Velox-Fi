import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Sender + base URL come from env so we can swap to a verified domain
// without touching code. Falls back to Resend's public test sender so
// emails still work in dev / before veloxfi.io is verified.
const FROM     = process.env.RESEND_FROM ?? "onboarding@resend.dev";
const BASE_URL = process.env.SITE_URL    ?? "https://veloxfi.io";

// ── Shared shell ───────────────────────────────────────────────────────────
function shell(title: string, body: string): string {
  return `
    <div style="font-family:sans-serif;background:#FFFBF0;color:#0B0B1A;padding:32px;max-width:520px;margin:0 auto;border-radius:16px;border:2.5px solid #0B0B1A">
      <div style="font-family:'Bagel Fat One',sans-serif;font-size:26px;color:#FF2BD6;letter-spacing:1px;margin-bottom:8px">VELOXFI</div>
      <h2 style="margin:0 0 16px;font-size:20px;color:#0B0B1A">${title}</h2>
      ${body}
      <p style="color:#666;font-size:12px;line-height:1.6;margin-top:24px;border-top:1px solid #ddd;padding-top:12px">
        You're getting this because you signed up at <a href="${BASE_URL}" style="color:#FF2BD6;text-decoration:none">veloxfi.io</a>.
      </p>
    </div>
  `;
}

function ctaButton(label: string, href: string): string {
  return `
    <div style="text-align:center;margin:24px 0">
      <a href="${href}" style="display:inline-block;padding:14px 32px;background:#FF2BD6;color:#fff;text-decoration:none;border-radius:10px;font-weight:700;letter-spacing:1px;border:2.5px solid #0B0B1A;box-shadow:3px 3px 0 #0B0B1A">${label}</a>
    </div>
  `;
}

async function safeSend(opts: { to: string; subject: string; html: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`[mailer] RESEND_API_KEY not set — skipping email to ${opts.to}`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, ...opts });
  } catch (e) {
    console.error(`[mailer] failed sending '${opts.subject}' to ${opts.to}:`, e);
  }
}

// ── 1. Email verification ──────────────────────────────────────────────────
export async function sendVerificationEmail(to: string, username: string, verifyToken: string) {
  const link = `${BASE_URL}/?verify=${verifyToken}`;
  await safeSend({
    to,
    subject: "🐺 Verify your VeloxFi email",
    html: shell("Welcome to the pack",
      `<p style="line-height:1.6">Hi <b>${username}</b>, click below to verify your email. You'll need a verified email before converting WOLF to $BATTLE.</p>
       ${ctaButton("VERIFY EMAIL →", link)}
       <p style="color:#666;font-size:12px">Or copy this link: <span style="color:#FF2BD6;word-break:break-all">${link}</span></p>`),
  });
}

// ── 2. Password reset ──────────────────────────────────────────────────────
export async function sendPasswordResetEmail(to: string, username: string, resetToken: string) {
  const link = `${BASE_URL}/?reset=${resetToken}`;
  await safeSend({
    to,
    subject: "🔐 Reset your VeloxFi password",
    html: shell("Reset your password",
      `<p style="line-height:1.6">Hi <b>${username}</b>, we received a request to reset your password. This link expires in <b>1 hour</b>.</p>
       ${ctaButton("RESET PASSWORD →", link)}
       <p style="color:#666;font-size:12px;line-height:1.6">If you didn't request this, you can safely ignore this email.</p>`),
  });
}

// ── 3. Mining session complete ─────────────────────────────────────────────
export async function sendMiningCompleteEmail(to: string, username: string) {
  const link = `${BASE_URL}/mine`;
  await safeSend({
    to,
    subject: "⛏ Your mining session is ready to claim",
    html: shell("Your rig finished mining",
      `<p style="line-height:1.6">Hey <b>${username}</b>, your 4-hour mining session is done.</p>
       <p style="line-height:1.6">There are <b style="color:#FF2BD6">240 WOLF</b> waiting for you (plus your tier and pet bonus). Start your next session right after claiming.</p>
       ${ctaButton("CLAIM NOW →", link)}`),
  });
}

// ── 4. Streak milestone reached ────────────────────────────────────────────
export async function sendMilestoneEmail(to: string, username: string, day: number, reward: number) {
  const link = `${BASE_URL}/daily`;
  await safeSend({
    to,
    subject: `🔥 Day ${day} streak — ${reward} WOLF unlocked`,
    html: shell(`Day ${day} streak hit`,
      `<p style="line-height:1.6">Nice work <b>${username}</b>. You hit a <b>${day}-day streak</b>.</p>
       <p style="line-height:1.6">Your <b style="color:#FF2BD6">${reward.toLocaleString()} WOLF</b> milestone reward is ready in the Daily Den.</p>
       ${ctaButton("OPEN DAILY DEN →", link)}`),
  });
}

// ── 5. Conversion paid by admin ────────────────────────────────────────────
export async function sendConversionPaidEmail(to: string, username: string, amount: number, walletAddress: string) {
  const link = `https://pump.fun/coin/HAytudteqxtE4yFUF9Y8SN7LJz7VeCSERKVdwggDpump`;
  const short = walletAddress.length > 10 ? `${walletAddress.slice(0, 4)}…${walletAddress.slice(-4)}` : walletAddress;
  await safeSend({
    to,
    subject: `💱 ${amount} $BATTLE sent to your wallet`,
    html: shell("Your $BATTLE is on its way",
      `<p style="line-height:1.6">Hi <b>${username}</b>, your conversion was just processed.</p>
       <p style="line-height:1.6"><b style="color:#FF2BD6">${amount.toLocaleString()} $BATTLE</b> has been sent to your Solana wallet <span style="font-family:monospace">${short}</span> from the capped buyback pool.</p>
       <p style="line-height:1.6">Check your wallet — the tokens should appear within a few minutes.</p>
       ${ctaButton("VIEW $BATTLE ON PUMP.FUN →", link)}`),
  });
}

// ── 6. Pet level-up ────────────────────────────────────────────────────────
export async function sendPetLevelUpEmail(to: string, username: string, petName: string, newStageName: string, newStageIcon: string, newBonusPct: number) {
  const link = `${BASE_URL}/pet`;
  await safeSend({
    to,
    subject: `${newStageIcon} ${petName} evolved to ${newStageName}`,
    html: shell(`${petName} just grew up`,
      `<p style="line-height:1.6">Hey <b>${username}</b>, your wolf hit a new stage.</p>
       <p style="line-height:1.6">${petName} is now a <b style="color:#FF2BD6">${newStageIcon} ${newStageName}</b> — that's <b>+${newBonusPct}% mining bonus</b> applied to every claim from now on.</p>
       ${ctaButton("SEE YOUR WOLF →", link)}`),
  });
}
