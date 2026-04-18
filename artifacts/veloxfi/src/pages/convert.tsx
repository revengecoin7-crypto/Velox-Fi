import { useState } from "react";
import { useLocation } from "wouter";
import MemeShell from "@/components/MemeShell";
import { useAuth } from "@/context/AuthContext";

export default function Convert() {
  const { user, requestConversion, setWallet } = useAuth();
  const [, nav] = useLocation();
  const [wolfAmount, setWolfAmount] = useState("");
  const [walletInput, setWalletInput] = useState(user?.wallet || "");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  if (!user) {
    return (
      <MemeShell testId="page-convert">
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div style={{ fontSize: 80 }}>🔄</div>
          <h1 className="font-bungee text-3xl mt-4 mb-3">CONVERT WOLF</h1>
          <p className="font-fredoka text-lg mb-6" style={{ color: "#555" }}>Login to convert your WOLF to $BATTLE tokens.</p>
          <div className="flex gap-4 flex-wrap justify-center">
            <button onClick={() => nav("/login")} style={{ background: "#FFD93D", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "14px 36px", fontFamily: "Bungee,sans-serif", fontSize: 16, cursor: "pointer", boxShadow: "4px 4px 0 #1a1a1a" }}>LOGIN</button>
            <button onClick={() => nav("/register")} style={{ background: "#6BCB77", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "14px 36px", fontFamily: "Bungee,sans-serif", fontSize: 16, cursor: "pointer", boxShadow: "4px 4px 0 #1a1a1a" }}>REGISTER</button>
          </div>
        </div>
      </MemeShell>
    );
  }

  const wolf = parseInt(wolfAmount) || 0;
  const battleOut = wolf >= 5000 ? Math.floor(wolf / 5000) : 0;

  async function handleConvert() {
    if (!walletInput.trim()) { setStatus("error"); setMsg("Enter your Solana wallet address first."); return; }
    setWallet(walletInput.trim());
    const result = await requestConversion(wolf);
    if (result?.ok) { setStatus("success"); setMsg(`Conversion requested! You'll receive ${battleOut} $BATTLE within 24 hours.`); setWolfAmount(""); }
    else { setStatus("error"); setMsg(result?.error || "Something went wrong."); }
  }

  return (
    <MemeShell testId="page-convert">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="font-bungee text-4xl mb-2">🔄 CONVERT</h1>
          <p className="font-fredoka text-lg" style={{ color: "#555" }}>Exchange your WOLF tokens for $BATTLE</p>
        </div>

        {/* Rate card */}
        <div style={{ background: "#FFD93D", border: "2.5px solid #1a1a1a", borderRadius: 20, padding: "20px 28px", boxShadow: "5px 5px 0 #1a1a1a", marginBottom: 24, textAlign: "center" }}>
          <p className="font-bungee text-2xl">5,000 WOLF = 1 $BATTLE</p>
          <p className="font-fredoka text-sm mt-1" style={{ color: "#555" }}>Fixed rate · Processing within 24 hours weekdays</p>
        </div>

        {/* Balance */}
        <div style={{ background: "#fff", border: "2.5px solid #1a1a1a", borderRadius: 16, padding: "16px 24px", boxShadow: "3px 3px 0 #1a1a1a", marginBottom: 24 }}>
          <p className="font-fredoka text-sm font-semibold" style={{ color: "#888" }}>AVAILABLE BALANCE</p>
          <p className="font-bungee text-3xl" style={{ color: "#1a1a1a" }}>{user.wolf.toLocaleString()} WOLF</p>
        </div>

        {/* Conversion form */}
        <div style={{ background: "#fff", border: "2.5px solid #1a1a1a", borderRadius: 20, padding: 28, boxShadow: "5px 5px 0 #1a1a1a", marginBottom: 24 }}>
          <h2 className="font-bungee text-xl mb-4">CONVERSION REQUEST</h2>

          <label className="font-fredoka font-semibold text-sm block mb-1" style={{ color: "#1a1a1a" }}>WOLF Amount</label>
          <div className="flex gap-2 mb-4">
            <input
              type="number"
              value={wolfAmount}
              onChange={e => setWolfAmount(e.target.value)}
              min={0}
              max={user.wolf}
              placeholder="Enter amount (min 5,000)"
              style={{ flex: 1, border: "2.5px solid #1a1a1a", borderRadius: 12, padding: "12px 16px", fontFamily: "Fredoka,sans-serif", fontSize: 16, outline: "none" }}
            />
            <button
              onClick={() => setWolfAmount(String(Math.floor(user.wolf / 5000) * 5000))}
              style={{ background: "#A29BFE", border: "2.5px solid #1a1a1a", borderRadius: 12, padding: "0 16px", fontFamily: "Fredoka,sans-serif", fontWeight: 700, cursor: "pointer", boxShadow: "2px 2px 0 #1a1a1a", fontSize: 14 }}
            >MAX</button>
          </div>

          <div style={{ background: "#FFFBF0", border: "2px solid #1a1a1a", borderRadius: 12, padding: "14px 18px", marginBottom: 20, textAlign: "center" }}>
            <p className="font-fredoka text-sm" style={{ color: "#888" }}>You will receive</p>
            <p className="font-bungee text-3xl" style={{ color: battleOut > 0 ? "#6BCB77" : "#ccc" }}>{battleOut} $BATTLE</p>
            {wolf > 0 && wolf < 5000 && <p className="font-fredoka text-sm" style={{ color: "#FF6B6B" }}>Minimum 5,000 WOLF required</p>}
          </div>

          <label className="font-fredoka font-semibold text-sm block mb-1" style={{ color: "#1a1a1a" }}>Solana Wallet Address</label>
          <input
            type="text"
            value={walletInput}
            onChange={e => setWalletInput(e.target.value)}
            placeholder="Your Solana wallet address"
            style={{ width: "100%", border: "2.5px solid #1a1a1a", borderRadius: 12, padding: "12px 16px", fontFamily: "Fredoka,sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 20 }}
          />

          {status !== "idle" && (
            <div style={{ background: status === "success" ? "#d1fae5" : "#fee2e2", border: `2px solid ${status === "success" ? "#6BCB77" : "#FF6B6B"}`, borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
              <p className="font-fredoka text-sm" style={{ color: status === "success" ? "#065f46" : "#991b1b" }}>{msg}</p>
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={battleOut === 0}
            style={{ width: "100%", background: battleOut > 0 ? "#6BCB77" : "#ccc", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "16px", fontFamily: "Bungee,sans-serif", fontSize: 16, cursor: battleOut > 0 ? "pointer" : "not-allowed", boxShadow: battleOut > 0 ? "4px 4px 0 #1a1a1a" : "none" }}
          >
            CONVERT {wolf > 0 ? `${wolf.toLocaleString()} WOLF → ${battleOut} $BATTLE` : ""}
          </button>
        </div>

        {/* History */}
        {user.conversions.length > 0 && (
          <div style={{ background: "#fff", border: "2.5px solid #1a1a1a", borderRadius: 20, padding: 24, boxShadow: "5px 5px 0 #1a1a1a" }}>
            <h3 className="font-bungee text-lg mb-4">CONVERSION HISTORY</h3>
            <div className="flex flex-col gap-3">
              {user.conversions.map(c => (
                <div key={c.id} style={{ background: "#FFFBF0", border: "2px solid #1a1a1a", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <p className="font-fredoka font-bold text-sm">{c.wolf.toLocaleString()} WOLF → {c.battle} $BATTLE</p>
                    <p className="font-fredoka text-xs" style={{ color: "#888" }}>{new Date(c.date).toLocaleDateString()}</p>
                  </div>
                  <span style={{ background: c.status === "pending" ? "#FFD93D" : "#6BCB77", border: "2px solid #1a1a1a", borderRadius: 8, padding: "4px 12px", fontFamily: "Fredoka,sans-serif", fontWeight: 700, fontSize: 12 }}>
                    {c.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="font-fredoka text-xs text-center mt-6" style={{ color: "#aaa" }}>
          $BATTLE tokens are claimable via Solana wallet. Processing: 24 hrs weekdays, Monday for weekend requests.
        </p>
      </div>
    </MemeShell>
  );
}
