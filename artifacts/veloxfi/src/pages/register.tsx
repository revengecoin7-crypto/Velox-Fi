import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const [, nav] = useLocation();
  const [field, setField] = useState({ username: "", email: "", pass: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (field.pass.length < 6) { setErr("Password must be at least 6 characters"); return; }
    setLoading(true);
    const result = await register(field.username, field.email, field.pass);
    setLoading(false);
    if (result.ok) nav("/mine");
    else setErr(result.error || "Registration failed");
  }

  const inp = (placeholder: string, type: string, key: keyof typeof field, auto: string) => (
    <input
      type={type}
      value={field[key]}
      onChange={e => setField(f => ({ ...f, [key]: e.target.value }))}
      required
      autoComplete={auto}
      placeholder={placeholder}
      style={{ width: "100%", border: "2.5px solid #1a1a1a", borderRadius: 12, padding: "13px 16px", fontFamily: "Fredoka,sans-serif", fontSize: 15, outline: "none", boxSizing: "border-box", marginBottom: 14 }}
    />
  );

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
          <h1 className="font-bungee text-2xl mb-1" style={{ color: "#1a1a1a" }}>ENTER THE ARENA</h1>
          <p className="font-fredoka text-base mb-6" style={{ color: "#666" }}>Free to play. No wallet needed. Start earning today!</p>

          <form onSubmit={handleSubmit}>
            <label className="font-fredoka font-semibold text-sm block mb-1">Username</label>
            {inp("Choose a username", "text", "username", "username")}

            <label className="font-fredoka font-semibold text-sm block mb-1">Email</label>
            {inp("Your email address", "email", "email", "email")}

            <label className="font-fredoka font-semibold text-sm block mb-1">Password</label>
            {inp("Create a password (min 6 chars)", "password", "pass", "new-password")}

            {err && (
              <div style={{ background: "#fee2e2", border: "2px solid #FF6B6B", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
                <p className="font-fredoka text-sm" style={{ color: "#991b1b" }}>⚠️ {err}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", background: loading ? "#ccc" : "#6BCB77", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "16px", fontFamily: "Bungee,sans-serif", fontSize: 17, cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "4px 4px 0 #1a1a1a", marginTop: 4 }}
            >
              {loading ? "CREATING ACCOUNT..." : "🚀 CREATE ACCOUNT"}
            </button>
          </form>

          <div style={{ borderTop: "2px solid #eee", marginTop: 24, paddingTop: 20, textAlign: "center" }}>
            <p className="font-fredoka text-sm" style={{ color: "#666" }}>
              Already have an account?{" "}
              <button onClick={() => nav("/login")} style={{ background: "none", border: "none", cursor: "pointer", color: "#FFD93D", fontFamily: "Fredoka,sans-serif", fontWeight: 700, fontSize: "inherit", textDecoration: "underline" }}>
                Login →
              </button>
            </p>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="font-fredoka text-xs" style={{ color: "#aaa" }}>
            100% FREE · NO WALLET NEEDED · Start with 100 WOLF bonus 🎁
          </p>
        </div>
      </div>
    </div>
  );
}
