import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";

const WALLETS = [
  { id: "phantom", name: "Phantom", sub: "Connect Solana wallet", color: "#AB9FF2", mark: "P" },
  { id: "solflare", name: "Solflare", sub: "Connect Solana wallet", color: "#FC822B", mark: "S" },
  { id: "backpack", name: "Backpack", sub: "Connect Solana wallet", color: "#E33E3F", mark: "B" },
];

export default function Login() {
  const { login } = useAuth();
  const [, nav] = useLocation();
  const [mode, setMode] = useState<"register" | "login">("login");
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState("ALPHAWOLF");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await login(username, password);
    setLoading(false);
    if (res.ok) nav("/mine");
    else setErr("Invalid username or password.");
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.05fr", minHeight: "100vh" }}>

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
            Every wolf starts at <b style={{ color: "var(--cyan)" }}>LVL 1</b> with a free mining rig. Hit daily streaks and climb to <b style={{ color: "var(--magenta)" }}>LVL 50 ALPHA</b> for max hash rate.
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
            {["🔒 Non-custodial", "⚡ 1-click claim", "⛏ 4-hour sessions", "🐺 Free mining"].map((t) => (
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

          {/* Mode tabs */}
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
            <div className="tabs">
              <div className={`tab${mode === "register" ? " active" : ""}`} onClick={() => { setMode("register"); setStep(1); setErr(""); }}>Register</div>
              <div className={`tab${mode === "login" ? " active" : ""}`} onClick={() => { setMode("login"); setStep(1); setErr(""); }}>Sign in</div>
            </div>
            <Link href="/" className="btn sm ghost">✕ Close</Link>
          </div>

          {/* ── STEP 1: method select ── */}
          {step === 1 && (
            <>
              <h2 className="display" style={{ fontSize: 36, lineHeight: 1, margin: 0 }}>
                {mode === "register" ? "Howl your way in" : "Welcome back, wolf"}
              </h2>
              <p style={{ fontSize: 14, color: "var(--mute)", marginTop: 8 }}>
                {mode === "register"
                  ? "Choose how you want to enter the den. Wallet is recommended — your BATTLE goes straight there."
                  : "Reconnect your wallet or use the e-mail you registered with."}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 22 }}>
                {WALLETS.map((w) => (
                  <div key={w.id} className="card flat" style={{ padding: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 14, border: "2.5px solid var(--ink)" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: w.color, border: "2.5px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "Bagel Fat One", fontSize: 22 }}>{w.mark}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{w.name}</div>
                      <div style={{ fontSize: 12, color: "var(--mute)" }}>{w.sub}</div>
                    </div>
                    <span>→</span>
                  </div>
                ))}

                <div className="row" style={{ gap: 10, margin: "8px 0" }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(11,11,26,0.12)" }} />
                  <div style={{ fontSize: 11, color: "var(--mute)", letterSpacing: 1 }}>OR</div>
                  <div style={{ flex: 1, height: 1, background: "rgba(11,11,26,0.12)" }} />
                </div>

                {mode === "register" ? (
                  <div className="card flat" style={{ padding: 14, border: "2.5px solid var(--ink)" }}>
                    <div style={{ fontSize: 12, color: "var(--mute)", textTransform: "uppercase", letterSpacing: 1 }}>Email — we generate a wallet for you</div>
                    <div className="row" style={{ marginTop: 8, gap: 8 }}>
                      <input className="input" placeholder="wolf@howl.io" value={email} onChange={(e) => setEmail(e.target.value)} />
                      <button className="btn primary" onClick={() => setStep(2)}>Continue</button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Username</label>
                      <input className="input" placeholder="moonwolf42" value={username} onChange={(e) => setUsername(e.target.value)} style={{ marginTop: 6 }} required />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Password</label>
                      <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ marginTop: 6 }} required />
                    </div>
                    {err && <div style={{ color: "var(--tomato)", fontSize: 13, fontWeight: 600 }}>{err}</div>}
                    <button className="btn lg magenta" type="submit" disabled={loading} style={{ marginTop: 4 }}>
                      {loading ? "Signing in..." : "Enter the den →"}
                    </button>
                  </form>
                )}

                {mode === "register" && (
                  <button className="btn ghost" style={{ marginTop: 4 }}>👁 Try as guest (no rewards saved)</button>
                )}
              </div>

              {mode === "register" && (
                <div className="card cyan" style={{ marginTop: 18, padding: 14 }}>
                  <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Referral bonus</div>
                      <div className="display" style={{ fontSize: 18, marginTop: 2 }}>+250 BATTLE welcome boost</div>
                    </div>
                    <input className="input mono" style={{ maxWidth: 130, fontSize: 12 }} value={referral} onChange={(e) => setReferral(e.target.value)} />
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── STEP 2: details (register) ── */}
          {step === 2 && mode === "register" && (
            <RegisterStep2
              email={email} setEmail={setEmail}
              username={username} setUsername={setUsername}
              password={password} setPassword={setPassword}
              referral={referral}
              onBack={() => setStep(1)}
              onSuccess={() => setStep(3)}
            />
          )}

          {/* ── STEP 3: success ── */}
          {step === 3 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ position: "relative", display: "inline-block", marginTop: 10 }}>
                <div style={{ position: "absolute", inset: -22, borderRadius: "50%", border: "2px dashed var(--ink)", animation: "spin-slow 20s linear infinite" }} />
                <div style={{ width: 128, height: 128, borderRadius: 36, overflow: "hidden", border: "3px solid var(--ink)", boxShadow: "4px 4px 0 0 var(--ink)", background: "linear-gradient(140deg,#1a1d3a,#2b1a4d)" }}>
                  <img src="/mascot.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }} />
                </div>
              </div>
              <h2 className="display" style={{ fontSize: 42, marginTop: 22, lineHeight: 1 }}>
                Welcome, <span style={{ color: "var(--magenta)" }}>{username || "AGENT_07"}</span>.
              </h2>
              <p style={{ fontSize: 14, color: "var(--mute)", marginTop: 8 }}>
                Your rig is heating up. You start with <b className="display" style={{ fontSize: 16 }}>+250 BATTLE</b> welcome bonus.
              </p>
              <div className="card cream" style={{ marginTop: 22, textAlign: "left" }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>WALLET ADDRESS</div>
                  <span>📋</span>
                </div>
                <div className="mono" style={{ fontSize: 12, marginTop: 4 }}>7VLxw9zKbXcM3qPj4yR8…E8dZ9KuvLNS</div>
              </div>
              <Link href="/mine" className="btn lg primary" style={{ marginTop: 22, width: "100%", justifyContent: "center" }}>
                Enter mining hub →
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function RegisterStep2({ email, setEmail, username, setUsername, password, setPassword, referral, onBack, onSuccess }: {
  email: string; setEmail: (v: string) => void;
  username: string; setUsername: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  referral: string;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const { register } = useAuth();
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!checked) { setErr("You must confirm you're 18+."); return; }
    if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setLoading(true);
    const res = await register(username, email, password, referral !== "ALPHAWOLF" ? referral : undefined);
    setLoading(false);
    if (res.ok) onSuccess();
    else setErr(res.error ?? "Registration failed.");
  }

  return (
    <>
      <button className="btn sm ghost" style={{ marginBottom: 16 }} onClick={onBack}>← back</button>
      <h2 className="display" style={{ fontSize: 36, lineHeight: 1 }}>One more thing.</h2>
      <p style={{ fontSize: 14, color: "var(--mute)", marginTop: 8 }}>Pick a callsign your pack will know you by.</p>

      <form onSubmit={handleSubmit} style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Callsign</label>
          <input className="input" placeholder="moonwolf42" value={username} onChange={(e) => setUsername(e.target.value)} style={{ marginTop: 6 }} required />
          <div style={{ fontSize: 11, color: "var(--mute)", marginTop: 4 }}>3–16 chars. Visible on the leaderboard.</div>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Email</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginTop: 6 }} required />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Password</label>
          <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ marginTop: 6 }} required />
        </div>
        <label className="row" style={{ gap: 10, cursor: "pointer", alignItems: "flex-start" }}>
          <div onClick={() => setChecked(!checked)} style={{ width: 20, height: 20, border: "2.5px solid var(--ink)", borderRadius: 6, background: checked ? "var(--lime)" : "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2, flexShrink: 0, cursor: "pointer" }}>
            {checked && <span style={{ fontSize: 12 }}>✓</span>}
          </div>
          <div style={{ fontSize: 12, color: "var(--ink)" }}>I'm 18+ and I accept that meme coins are not a financial product.</div>
        </label>
        {err && <div style={{ color: "var(--tomato)", fontSize: 13, fontWeight: 600 }}>{err}</div>}
        <button className="btn lg magenta" type="submit" disabled={loading}>
          {loading ? "Generating your wolf..." : "Generate my wolf →"}
        </button>
      </form>
    </>
  );
}
