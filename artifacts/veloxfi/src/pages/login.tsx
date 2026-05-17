import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { getPendingReferral, clearPendingReferral } from "@/lib/referral";

export default function Login() {
  const { login, register } = useAuth();
  const [, nav] = useLocation();
  const [mode, setMode] = useState<"register" | "login">("login");
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState("");
  const [checked, setChecked] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // If someone arrived via /r/<code> or ?ref=<code>, pre-fill the field and
  // open the Register tab.
  useEffect(() => {
    const pending = getPendingReferral();
    if (pending) {
      setReferral(pending);
      setMode("register");
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await login(username, password);
    setLoading(false);
    if (res.ok) nav("/mine");
    else setErr(res.error ?? "Invalid username or password.");
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!checked) { setErr("You must confirm you're 18+ to continue."); return; }
    if (username.length < 3) { setErr("Username must be at least 3 characters."); return; }
    if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setLoading(true);
    const res = await register(username, email, password, referral.trim() || undefined);
    setLoading(false);
    if (res.ok) {
      clearPendingReferral();
      setSuccess(true);
    } else {
      setErr(res.error ?? "Registration failed.");
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.05fr", minHeight: "100vh" }} className="login-grid">

      {/* ── LEFT: visual ── */}
      <div style={{ background: "var(--ink)", color: "var(--paper)", padding: 48, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />

        <div className="row" style={{ position: "relative", zIndex: 2, gap: 12 }}>
          <div style={{ width: 44, height: 44, background: "var(--paper)", borderRadius: 10, overflow: "hidden", border: "2px solid rgba(255,255,255,0.2)" }}>
            <img src="/mascot.jpg" alt="Velox" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div className="display" style={{ fontSize: 22 }}>VELOXFI</div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 2 }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--cyan)", letterSpacing: 2 }}>// AGENT INTAKE PROTOCOL</div>
          <h2 className="display" style={{ fontSize: 56, lineHeight: 0.95, margin: "16px 0 18px" }}>
            Pick your fur.<br />
            Join the pack.
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", maxWidth: 440, lineHeight: 1.5 }}>
            Free <b style={{ color: "var(--cyan)" }}>4-hour mining sessions</b>. Convert WOLF to <b style={{ color: "var(--magenta)" }}>$BATTLE</b> on Solana at a fixed 5,000:1 rate. No presale, no team allocation, no gimmicks.
          </p>

          <div style={{ marginTop: 36, maxWidth: 380 }}>
            <div className="mascot-frame" style={{ aspectRatio: "4/3" }}>
              <img src="/mascot.jpg" alt="Wolf" />
              <div className="gloss" />
              <div style={{ position: "absolute", bottom: 10, left: 10, right: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div className="mono" style={{ fontSize: 10, color: "var(--cyan)" }}>
                  <div>NAME / AGENT_07</div>
                  <div style={{ opacity: 0.7 }}>BREED / CYBER_WOLF</div>
                </div>
                <div style={{ background: "var(--magenta)", border: "2px solid var(--ink)", borderRadius: 8, padding: "4px 8px" }}>
                  <span className="display" style={{ fontSize: 14, color: "white" }}>+12 perks</span>
                </div>
              </div>
            </div>
          </div>

          <div className="row" style={{ marginTop: 24, gap: 8, flexWrap: "wrap" }}>
            {["🔒 No wallet needed", "⚡ 1-click claim", "⛏ 4-hour sessions", "🐺 Free mining"].map((t) => (
              <span key={t} className="pill" style={{ background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.3)", color: "white" }}>{t}</span>
            ))}
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 2, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
          By joining you agree to the <Link href="/terms" style={{ color: "rgba(255,255,255,0.7)" }}>Howl rules & terms</Link>.
        </div>
      </div>

      {/* ── RIGHT: form ── */}
      <div style={{ background: "var(--cream)", padding: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 480 }}>

          {success ? (
            // Welcome screen
            <div style={{ textAlign: "center" }}>
              <div style={{ position: "relative", display: "inline-block", marginTop: 10 }}>
                <div style={{ position: "absolute", inset: -22, borderRadius: "50%", border: "2px dashed var(--ink)", animation: "spin-slow 20s linear infinite" }} />
                <div style={{ width: 128, height: 128, borderRadius: 36, overflow: "hidden", border: "3px solid var(--ink)", boxShadow: "4px 4px 0 0 var(--ink)", background: "linear-gradient(140deg,#1a1d3a,#2b1a4d)" }}>
                  <img src="/mascot.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }} />
                </div>
              </div>
              <h2 className="display" style={{ fontSize: 42, marginTop: 22, lineHeight: 1 }}>
                Welcome, <span style={{ color: "var(--magenta)" }}>{username}</span>.
              </h2>
              <p style={{ fontSize: 14, color: "var(--mute)", marginTop: 8 }}>
                Your rig is ready. Start your first 4-hour mining session whenever you want.
              </p>
              <div className="card cyan" style={{ marginTop: 22, textAlign: "left", padding: 16 }}>
                <div className="mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>👛 About your Solana wallet</div>
                <div style={{ fontSize: 13, lineHeight: 1.55 }}>
                  You don't need a wallet to mine. Whenever you want to convert WOLF to $BATTLE, you'll add your Solana wallet address on the Wallet page — that's where your $BATTLE will be sent.
                </div>
              </div>
              <Link href="/mine" className="btn lg primary" style={{ marginTop: 22, width: "100%", justifyContent: "center" }}>
                Enter mining hub →
              </Link>
            </div>
          ) : (
            <>
              {/* Mode tabs */}
              <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
                <div className="tabs">
                  <div className={`tab${mode === "register" ? " active" : ""}`} onClick={() => { setMode("register"); setErr(""); }}>Register</div>
                  <div className={`tab${mode === "login" ? " active" : ""}`} onClick={() => { setMode("login"); setErr(""); }}>Sign in</div>
                </div>
                <Link href="/" className="btn sm ghost">✕ Close</Link>
              </div>

              <h2 className="display" style={{ fontSize: 36, lineHeight: 1, margin: 0 }}>
                {mode === "register" ? "Howl your way in" : "Welcome back, wolf"}
              </h2>
              <p style={{ fontSize: 14, color: "var(--mute)", marginTop: 8 }}>
                {mode === "register"
                  ? "Free account. Email + password — no wallet needed to start mining."
                  : "Sign in with the username and password you registered with."}
              </p>

              {mode === "login" ? (
                <form onSubmit={handleLogin} style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Username</label>
                    <input className="input" placeholder="moonwolf42" value={username} onChange={(e) => setUsername(e.target.value)} style={{ marginTop: 6 }} required autoFocus />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Password</label>
                    <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ marginTop: 6 }} required />
                  </div>
                  {err && <div style={{ color: "var(--tomato)", fontSize: 13, fontWeight: 600 }}>{err}</div>}
                  <button className="btn lg magenta" type="submit" disabled={loading}>
                    {loading ? "Signing in…" : "Enter the den →"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Callsign (username)</label>
                    <input className="input" placeholder="moonwolf42" value={username} onChange={(e) => setUsername(e.target.value)} style={{ marginTop: 6 }} required autoFocus />
                    <div style={{ fontSize: 11, color: "var(--mute)", marginTop: 4 }}>3–16 chars. Visible on the leaderboard.</div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Email</label>
                    <input className="input" type="email" placeholder="wolf@howl.io" value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginTop: 6 }} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Password</label>
                    <input className="input" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} style={{ marginTop: 6 }} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Referral code (optional)</label>
                    <input className="input mono" placeholder="ALPHAWOLF" value={referral} onChange={(e) => setReferral(e.target.value)} style={{ marginTop: 6 }} />
                  </div>

                  <label className="row" style={{ gap: 10, cursor: "pointer", alignItems: "flex-start", marginTop: 2 }}>
                    <div onClick={() => setChecked(!checked)} style={{ width: 20, height: 20, border: "2.5px solid var(--ink)", borderRadius: 6, background: checked ? "var(--lime)" : "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2, flexShrink: 0, cursor: "pointer" }}>
                      {checked && <span style={{ fontSize: 12 }}>✓</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink)" }}>I'm 18+ and I accept that meme coins are not a financial product.</div>
                  </label>

                  {err && <div style={{ color: "var(--tomato)", fontSize: 13, fontWeight: 600 }}>{err}</div>}

                  <button className="btn lg magenta" type="submit" disabled={loading}>
                    {loading ? "Generating your wolf…" : "Generate my wolf →"}
                  </button>

                  <div className="mono" style={{ fontSize: 11, color: "var(--mute)", textAlign: "center", marginTop: 4 }}>
                    No wallet connection needed. You add your Solana wallet later, only when you want to convert WOLF to $BATTLE.
                  </div>
                </form>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
