import { useState } from "react";
import { useLocation } from "wouter";
import MemeShell from "@/components/MemeShell";
import { useAuth } from "@/context/AuthContext";

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div style={{ background: "#fff", border: "2.5px solid #1a1a1a", borderRadius: 18, padding: "18px 20px", boxShadow: `4px 4px 0 ${color}` }}>
      <p style={{ fontFamily: "Fredoka,sans-serif", fontWeight: 700, fontSize: 11, color: "#888", textTransform: "uppercase", marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 28, color: "#1a1a1a", margin: 0 }}>{value}</p>
      {sub && <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 12, color: "#aaa", marginTop: 2 }}>{sub}</p>}
    </div>
  );
}

export default function Profile() {
  const { user, logout, setWallet } = useAuth();
  const [, nav] = useLocation();
  const [walletInput, setWalletInput] = useState(user?.wallet || "");
  const [walletSaved, setWalletSaved] = useState(false);
  const [walletError, setWalletError] = useState("");

  if (!user) {
    return (
      <MemeShell testId="page-profile">
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div style={{ fontSize: 80 }}>👤</div>
          <h1 className="font-bungee text-3xl mt-4 mb-3">PROFILE</h1>
          <p className="font-fredoka text-lg mb-6" style={{ color: "#555" }}>Login to view your profile and earnings.</p>
          <div className="flex gap-4 flex-wrap justify-center">
            <button onClick={() => nav("/login")} style={{ background: "#FFD93D", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "14px 36px", fontFamily: "Bungee,sans-serif", fontSize: 16, cursor: "pointer", boxShadow: "4px 4px 0 #1a1a1a" }}>LOGIN</button>
            <button onClick={() => nav("/register")} style={{ background: "#6BCB77", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "14px 36px", fontFamily: "Bungee,sans-serif", fontSize: 16, cursor: "pointer", boxShadow: "4px 4px 0 #1a1a1a" }}>REGISTER</button>
          </div>
        </div>
      </MemeShell>
    );
  }

  async function saveWallet() {
    setWalletError("");
    await setWallet(walletInput.trim());
    if (walletInput.trim().length < 32) {
      setWalletError("Invalid Solana address (must be 32–44 characters).");
      return;
    }
    setWalletSaved(true);
    setTimeout(() => setWalletSaved(false), 2000);
  }

  const streak = user.dailyStreak || 0;
  const STREAK_REWARDS = [50, 75, 100, 150, 200, 300, 500];
  const nextStreakReward = STREAK_REWARDS[Math.min(streak, STREAK_REWARDS.length - 1)];

  return (
    <MemeShell testId="page-profile">
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Header */}
        <div style={{ background: "#1a1a1a", border: "2.5px solid #1a1a1a", borderRadius: 24, padding: "28px", boxShadow: "6px 6px 0 #FFD93D", marginBottom: 24 }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div style={{ width: 64, height: 64, background: "#FFD93D", borderRadius: 20, border: "3px solid #FFD93D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                🐺
              </div>
              <div>
                <h1 style={{ fontFamily: "Bungee,sans-serif", fontSize: 26, color: "#FFD93D", margin: 0 }}>{user.username}</h1>
                <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#888", margin: "2px 0 0" }}>{user.email}</p>
                {streak > 0 && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#FF9F43", borderRadius: 20, padding: "2px 10px", marginTop: 4 }}>
                    <span style={{ fontSize: 12 }}>🔥</span>
                    <span style={{ fontFamily: "Bungee,sans-serif", fontSize: 10, color: "#1a1a1a" }}>{streak}-DAY STREAK</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => { logout(); nav("/"); }}
              style={{ background: "#FF6B6B", border: "2.5px solid #FF6B6B", borderRadius: 12, padding: "10px 20px", fontFamily: "Bungee,sans-serif", fontSize: 13, cursor: "pointer", boxShadow: "2px 2px 0 #cc3333", color: "#fff" }}
            >LOGOUT</button>
          </div>
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <StatCard label="WOLF Balance"  value={user.wolf.toLocaleString()} sub="In-game tokens"  color="#6BCB77" />
          <StatCard label="$BATTLE"       value={user.battle.toFixed(4)}    sub="Real Solana token" color="#4CC9F0" />
          <StatCard label="Daily Streak"  value={`${streak} days`}           sub="Come back daily!"  color="#FFD93D" />
        </div>

        {/* Streak / daily reward card */}
        <div style={{ background: streak > 0 ? "#FF9F43" : "#f0f0f0", border: "2.5px solid #1a1a1a", borderRadius: 20, padding: "18px 24px", boxShadow: "4px 4px 0 #1a1a1a", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 13, color: "#1a1a1a", margin: 0 }}>🔥 DAILY STREAK</p>
            <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 28, color: "#1a1a1a", margin: "2px 0 0" }}>{streak} DAYS</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#1a1a1a", margin: 0 }}>Next reward: <strong>+{nextStreakReward} WOLF</strong></p>
            <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 12, color: "#333", margin: "2px 0 0" }}>Come back daily to grow your streak!</p>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ background: "#fff", border: "2.5px solid #1a1a1a", borderRadius: 20, padding: "20px 24px", boxShadow: "5px 5px 0 #1a1a1a", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "Bungee,sans-serif", fontSize: 16, color: "#1a1a1a", marginBottom: 16 }}>⚡ QUICK ACTIONS</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => nav("/mine")}        style={{ background: "#6BCB77", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "16px", fontFamily: "Bungee,sans-serif", fontSize: 14, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a1a", color: "#1a1a1a" }}>⛏️ MINE WOLF</button>
            <button onClick={() => nav("/games")}       style={{ background: "#4CC9F0", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "16px", fontFamily: "Bungee,sans-serif", fontSize: 14, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a1a", color: "#1a1a1a" }}>🎮 PLAY GAMES</button>
            <button onClick={() => nav("/convert")}     style={{ background: "#FF9F43", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "16px", fontFamily: "Bungee,sans-serif", fontSize: 14, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a1a", color: "#1a1a1a" }}>🔄 CONVERT WOLF</button>
            <button onClick={() => nav("/leaderboard")} style={{ background: "#A29BFE", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "16px", fontFamily: "Bungee,sans-serif", fontSize: 14, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a1a", color: "#1a1a1a" }}>🏆 LEADERBOARD</button>
          </div>
        </div>

        {/* Wallet */}
        <div style={{ background: "#fff", border: "2.5px solid #1a1a1a", borderRadius: 20, padding: "20px 24px", boxShadow: "5px 5px 0 #1a1a1a", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "Bungee,sans-serif", fontSize: 16, color: "#1a1a1a", marginBottom: 8 }}>👛 SOLANA WALLET</h3>
          <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#666", marginBottom: 14 }}>Required to receive $BATTLE tokens. You can play and earn without a wallet.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={walletInput}
              onChange={e => setWalletInput(e.target.value)}
              placeholder="Your Solana wallet address"
              style={{ flex: 1, border: "2.5px solid #1a1a1a", borderRadius: 12, padding: "12px 16px", fontFamily: "Fredoka,sans-serif", fontSize: 13, outline: "none" }}
            />
            <button
              onClick={saveWallet}
              style={{ background: walletSaved ? "#6BCB77" : "#FFD93D", border: "2.5px solid #1a1a1a", borderRadius: 12, padding: "0 20px", fontFamily: "Bungee,sans-serif", fontSize: 13, cursor: "pointer", boxShadow: "2px 2px 0 #1a1a1a", whiteSpace: "nowrap", color: "#1a1a1a" }}
            >{walletSaved ? "SAVED ✓" : "SAVE"}</button>
          </div>
          {walletError && <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 12, color: "#FF6B6B", marginTop: 8 }}>{walletError}</p>}
          {user.wallet && !walletError && (
            <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 12, color: "#6BCB77", marginTop: 8 }}>
              ✓ Wallet connected: {user.wallet.slice(0, 8)}...{user.wallet.slice(-6)}
            </p>
          )}
        </div>

        {/* Account info */}
        <div style={{ background: "#fff", border: "2.5px solid #1a1a1a", borderRadius: 20, padding: "20px 24px", boxShadow: "5px 5px 0 #1a1a1a" }}>
          <h3 style={{ fontFamily: "Bungee,sans-serif", fontSize: 16, color: "#1a1a1a", marginBottom: 14 }}>👤 ACCOUNT INFO</h3>
          <div className="flex flex-col gap-2">
            {[
              { label: "Username", value: user.username },
              { label: "Email",    value: user.email },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#FFFBF0", borderRadius: 10, border: "1.5px solid #e5e5e5" }}>
                <span style={{ fontFamily: "Fredoka,sans-serif", fontWeight: 700, fontSize: 13, color: "#888" }}>{label}</span>
                <span style={{ fontFamily: "Fredoka,sans-serif", fontWeight: 700, fontSize: 13, color: "#1a1a1a" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </MemeShell>
  );
}
