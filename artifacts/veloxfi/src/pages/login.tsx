import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [, nav] = useLocation();
  const [field, setField] = useState({ user: "", pass: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const result = await login(field.user, field.pass);
    setLoading(false);
    if (result.ok) nav("/mine");
    else setErr(result.error || "Login failed");
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#FFFBF0", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div className="text-center mb-8">
          <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <img src="/favicon.jpg" alt="VeloxFi" style={{ width: 48, height: 48, borderRadius: 14, border: "2.5px solid #1a1a1a", boxShadow: "3px 3px 0 #1a1a1a" }} />
            <span style={{ fontFamily: "Bungee,sans-serif", fontSize: 26, color: "#1a1a1a", letterSpacing: 1 }}>VELOXFI</span>
          </a>
        </div>

        <div style={{ background: "#fff", border: "2.5px solid #1a1a1a", borderRadius: 24, padding: "36px 32px", boxShadow: "6px 6px 0 #1a1a1a" }}>
          <h1 className="font-bungee text-2xl mb-2" style={{ color: "#1a1a1a" }}>ENTER THE ARENA</h1>
          <p className="font-fredoka text-base mb-6" style={{ color: "#666" }}>Free to play. No wallet needed.</p>

          <form onSubmit={handleSubmit}>
            <label className="font-fredoka font-semibold text-sm block mb-1">Username or Email</label>
            <input
              type="text"
              value={field.user}
              onChange={e => setField(f => ({ ...f, user: e.target.value }))}
              required
              autoComplete="username"
              placeholder="Enter your username or email"
              style={{ width: "100%", border: "2.5px solid #1a1a1a", borderRadius: 12, padding: "13px 16px", fontFamily: "Fredoka,sans-serif", fontSize: 15, outline: "none", boxSizing: "border-box", marginBottom: 14 }}
            />

            <label className="font-fredoka font-semibold text-sm block mb-1">Password</label>
            <input
              type="password"
              value={field.pass}
              onChange={e => setField(f => ({ ...f, pass: e.target.value }))}
              required
              autoComplete="current-password"
              placeholder="Your password"
              style={{ width: "100%", border: "2.5px solid #1a1a1a", borderRadius: 12, padding: "13px 16px", fontFamily: "Fredoka,sans-serif", fontSize: 15, outline: "none", boxSizing: "border-box", marginBottom: 6 }}
            />

            {err && (
              <div style={{ background: "#fee2e2", border: "2px solid #FF6B6B", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
                <p className="font-fredoka text-sm" style={{ color: "#991b1b" }}>⚠️ {err}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", background: loading ? "#ccc" : "#FFD93D", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "16px", fontFamily: "Bungee,sans-serif", fontSize: 17, cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "4px 4px 0 #1a1a1a", marginTop: 8 }}
            >
              {loading ? "LOGGING IN..." : "⚡ LOGIN"}
            </button>
          </form>

          <div style={{ borderTop: "2px solid #eee", marginTop: 24, paddingTop: 20, textAlign: "center" }}>
            <p className="font-fredoka text-sm" style={{ color: "#666" }}>
              No account?{" "}
              <button onClick={() => nav("/register")} style={{ background: "none", border: "none", cursor: "pointer", color: "#6BCB77", fontFamily: "Fredoka,sans-serif", fontWeight: 700, fontSize: "inherit", textDecoration: "underline" }}>
                Create one free →
              </button>
            </p>
          </div>
        </div>

        <p className="font-fredoka text-xs text-center mt-4" style={{ color: "#aaa" }}>
          100% FREE · NO WALLET NEEDED · Built on Solana
        </p>
      </div>
    </div>
  );
}
