import { useState } from "react";
import { useLocation } from "wouter";
import MemeShell from "@/components/MemeShell";
import { useAuth } from "@/context/AuthContext";

const GAME_ICONS: Record<string, string> = {
  snake: "🐍",
  tetris: "🟦",
  runner: "🐺",
  rocket: "🚀",
};

const STREAK_REWARDS = [50, 75, 100, 150, 200, 300, 500];

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
  const [tab, setTab] = useState<"overview" | "history" | "mining">("overview");

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

  function saveWallet() {
    setWallet(walletInput.trim());
    setWalletSaved(true);
    setTimeout(() => setWalletSaved(false), 2000);
  }

  const gameHistory = user.gameHistory || [];
  const totalGames = gameHistory.length;
  const totalGameWolf = user.totalGameWolf || gameHistory.reduce((s, g) => s + g.wolf, 0);
  const totalMined = user.totalMined || 0;
  const totalConversions = user.conversions.length;
  const streak = user.dailyStreak || 0;
  const nextStreakReward = STREAK_REWARDS[Math.min(streak, STREAK_REWARDS.length - 1)];
  const totalEarned = user.wolf + (user.conversions.reduce((s, c) => s + c.wolf, 0));

  const tabStyle = (active: boolean, color: string) => ({
    background: active ? color : "#fff",
    border: `2px solid ${active ? "#1a1a1a" : "#ddd"}`,
    borderRadius: 10,
    padding: "8px 20px",
    fontFamily: "Bungee,sans-serif",
    fontSize: 13,
    cursor: "pointer",
    boxShadow: active ? "2px 2px 0 #1a1a1a" : "none",
    color: "#1a1a1a",
    transform: active ? "translate(-1px,-1px)" : "none",
  });

  return (
    <MemeShell testId="page-profile">
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Header */}
        <div style={{ background: "#1a1a1a", border: "2.5px solid #1a1a1a", borderRadius: 24, padding: "28px 28px", boxShadow: "6px 6px 0 #FFD93D", marginBottom: 24 }}>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="WOLF Balance" value={user.wolf.toLocaleString()} sub="In-game tokens" color="#6BCB77" />
          <StatCard label="$BATTLE" value={user.battle.toFixed(4)} sub="Real Solana token" color="#4CC9F0" />
          <StatCard label="Total Earned" value={totalEarned.toLocaleString()} sub="WOLF all-time" color="#FFD93D" />
          <StatCard label="Conversions" value={totalConversions} sub="WOLF → $BATTLE" color="#A29BFE" />
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

        {/* Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          <button onClick={() => setTab("overview")} style={tabStyle(tab === "overview", "#4CC9F0")}>Overview</button>
          <button onClick={() => setTab("history")} style={tabStyle(tab === "history", "#6BCB77")}>Game History</button>
          <button onClick={() => setTab("mining")} style={tabStyle(tab === "mining", "#FFD93D")}>Mining & Convert</button>
        </div>

        {/* Tab: Overview */}
        {tab === "overview" && (
          <div className="flex flex-col gap-4">
            {/* Stats grid */}
            <div style={{ background: "#fff", border: "2.5px solid #1a1a1a", borderRadius: 20, padding: "20px 24px", boxShadow: "5px 5px 0 #1a1a1a" }}>
              <h3 style={{ fontFamily: "Bungee,sans-serif", fontSize: 16, color: "#1a1a1a", marginBottom: 16 }}>📊 STATS OVERVIEW</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Games Played", value: totalGames, icon: "🎮" },
                  { label: "WOLF from Games", value: totalGameWolf.toLocaleString(), icon: "🏆" },
                  { label: "WOLF from Mining", value: totalMined.toLocaleString(), icon: "⛏️" },
                  { label: "Daily Streak", value: `${streak} days`, icon: "🔥" },
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{ background: "#FFFBF0", border: "1.5px solid #e5e5e5", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 24 }}>{icon}</span>
                    <div>
                      <p style={{ fontFamily: "Fredoka,sans-serif", fontWeight: 700, fontSize: 11, color: "#888", margin: 0 }}>{label}</p>
                      <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 18, color: "#1a1a1a", margin: 0 }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ background: "#fff", border: "2.5px solid #1a1a1a", borderRadius: 20, padding: "20px 24px", boxShadow: "5px 5px 0 #1a1a1a" }}>
              <h3 style={{ fontFamily: "Bungee,sans-serif", fontSize: 16, color: "#1a1a1a", marginBottom: 16 }}>⚡ QUICK ACTIONS</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => nav("/mine")} style={{ background: "#6BCB77", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "16px", fontFamily: "Bungee,sans-serif", fontSize: 14, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a1a", color: "#1a1a1a" }}>⛏️ MINE WOLF</button>
                <button onClick={() => nav("/games")} style={{ background: "#4CC9F0", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "16px", fontFamily: "Bungee,sans-serif", fontSize: 14, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a1a", color: "#1a1a1a" }}>🎮 PLAY GAMES</button>
                <button onClick={() => nav("/convert")} style={{ background: "#FF9F43", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "16px", fontFamily: "Bungee,sans-serif", fontSize: 14, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a1a", color: "#1a1a1a" }}>🔄 CONVERT WOLF</button>
                <button onClick={() => nav("/leaderboard")} style={{ background: "#A29BFE", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "16px", fontFamily: "Bungee,sans-serif", fontSize: 14, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a1a", color: "#1a1a1a" }}>🏆 LEADERBOARD</button>
              </div>
            </div>

            {/* Wallet */}
            <div style={{ background: "#fff", border: "2.5px solid #1a1a1a", borderRadius: 20, padding: "20px 24px", boxShadow: "5px 5px 0 #1a1a1a" }}>
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
              {user.wallet && (
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
                  { label: "Email", value: user.email },
                  { label: "Member since", value: "2026" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#FFFBF0", borderRadius: 10, border: "1.5px solid #e5e5e5" }}>
                    <span style={{ fontFamily: "Fredoka,sans-serif", fontWeight: 700, fontSize: 13, color: "#888" }}>{label}</span>
                    <span style={{ fontFamily: "Fredoka,sans-serif", fontWeight: 700, fontSize: 13, color: "#1a1a1a" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Game History */}
        {tab === "history" && (
          <div style={{ background: "#fff", border: "2.5px solid #1a1a1a", borderRadius: 20, padding: "24px", boxShadow: "5px 5px 0 #1a1a1a" }}>
            <h3 style={{ fontFamily: "Bungee,sans-serif", fontSize: 16, color: "#1a1a1a", marginBottom: 16 }}>🎮 GAME HISTORY</h3>
            {gameHistory.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>🎮</div>
                <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 18, color: "#1a1a1a", marginBottom: 8 }}>NO GAMES YET</p>
                <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 14, color: "#666", marginBottom: 20 }}>Play games to start earning WOLF tokens!</p>
                <button onClick={() => nav("/games")} style={{ background: "#4CC9F0", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "12px 28px", fontFamily: "Bungee,sans-serif", fontSize: 14, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a1a", color: "#1a1a1a" }}>PLAY NOW 🎮</button>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 100px 140px", gap: 8, padding: "8px 14px", background: "#1a1a1a", borderRadius: "10px 10px 0 0", marginBottom: 0 }}>
                  {["#", "GAME", "WOLF", "DATE"].map(h => (
                    <span key={h} style={{ fontFamily: "Bungee,sans-serif", fontSize: 11, color: "#FFD93D" }}>{h}</span>
                  ))}
                </div>
                <div style={{ border: "2px solid #1a1a1a", borderTop: "none", borderRadius: "0 0 14px 14px", overflow: "hidden" }}>
                  {gameHistory.slice(0, 20).map((g, i) => (
                    <div key={g.id} style={{ display: "grid", gridTemplateColumns: "40px 1fr 100px 140px", gap: 8, padding: "12px 14px", background: i % 2 === 0 ? "#fff" : "#FFFBF0", borderTop: i > 0 ? "1px solid #eee" : "none", alignItems: "center" }}>
                      <span style={{ fontFamily: "Fredoka,sans-serif", fontWeight: 700, fontSize: 13, color: "#aaa" }}>#{i + 1}</span>
                      <span style={{ fontFamily: "Fredoka,sans-serif", fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>
                        {GAME_ICONS[g.game] || "🎮"} {g.game.charAt(0).toUpperCase() + g.game.slice(1)}
                      </span>
                      <span style={{ fontFamily: "Bungee,sans-serif", fontSize: 14, color: "#6BCB77" }}>+{g.wolf}</span>
                      <span style={{ fontFamily: "Fredoka,sans-serif", fontSize: 12, color: "#888" }}>{new Date(g.date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 12, color: "#aaa", textAlign: "center", marginTop: 12 }}>
                  Showing {Math.min(gameHistory.length, 20)} of {gameHistory.length} sessions
                </p>
              </>
            )}
          </div>
        )}

        {/* Tab: Mining & Convert */}
        {tab === "mining" && (
          <div className="flex flex-col gap-4">
            <div style={{ background: "#fff", border: "2.5px solid #1a1a1a", borderRadius: 20, padding: "20px 24px", boxShadow: "5px 5px 0 #6BCB77" }}>
              <h3 style={{ fontFamily: "Bungee,sans-serif", fontSize: 16, color: "#1a1a1a", marginBottom: 16 }}>⛏️ MINING STATS</h3>
              <div className="grid grid-cols-2 gap-4">
                <div style={{ background: "#6BCB77" + "22", border: "2px solid #6BCB77", borderRadius: 14, padding: "16px", textAlign: "center" }}>
                  <p style={{ fontFamily: "Fredoka,sans-serif", fontWeight: 700, fontSize: 11, color: "#555", margin: "0 0 4px" }}>TOTAL MINED</p>
                  <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 28, color: "#1a1a1a", margin: 0 }}>{totalMined.toLocaleString()}</p>
                  <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 11, color: "#888", margin: 0 }}>WOLF</p>
                </div>
                <div style={{ background: "#4CC9F0" + "22", border: "2px solid #4CC9F0", borderRadius: 14, padding: "16px", textAlign: "center" }}>
                  <p style={{ fontFamily: "Fredoka,sans-serif", fontWeight: 700, fontSize: 11, color: "#555", margin: "0 0 4px" }}>FROM GAMES</p>
                  <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 28, color: "#1a1a1a", margin: 0 }}>{totalGameWolf.toLocaleString()}</p>
                  <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 11, color: "#888", margin: 0 }}>WOLF</p>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => nav("/mine")} style={{ flex: 1, background: "#6BCB77", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "14px", fontFamily: "Bungee,sans-serif", fontSize: 14, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a1a", color: "#1a1a1a" }}>⛏️ GO TO MINING</button>
              </div>
            </div>

            {/* Conversion history */}
            <div style={{ background: "#fff", border: "2.5px solid #1a1a1a", borderRadius: 20, padding: "20px 24px", boxShadow: "5px 5px 0 #A29BFE" }}>
              <h3 style={{ fontFamily: "Bungee,sans-serif", fontSize: 16, color: "#1a1a1a", marginBottom: 16 }}>🔄 CONVERSION HISTORY</h3>
              {user.conversions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "28px 0" }}>
                  <div style={{ fontSize: 48, marginBottom: 10 }}>🔄</div>
                  <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 14, color: "#666", marginBottom: 16 }}>No conversions yet. You can convert any amount of WOLF to $BATTLE!</p>
                  <button onClick={() => nav("/convert")} style={{ background: "#A29BFE", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "12px 28px", fontFamily: "Bungee,sans-serif", fontSize: 14, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a1a", color: "#1a1a1a" }}>CONVERT NOW</button>
                </div>
              ) : (
                <>
                  {user.conversions.map(c => (
                    <div key={c.id} style={{ background: "#FFFBF0", border: "1.5px solid #e5e5e5", borderRadius: 12, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                      <div>
                        <p style={{ fontFamily: "Fredoka,sans-serif", fontWeight: 700, fontSize: 14, color: "#1a1a1a", margin: 0 }}>{c.wolf.toLocaleString()} WOLF → {Number(c.battle).toFixed(4)} $BATTLE</p>
                        <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 12, color: "#888", margin: "2px 0 0" }}>{new Date(c.date).toLocaleDateString()}</p>
                      </div>
                      <span style={{ background: c.status === "pending" ? "#FFD93D" : "#6BCB77", border: "1.5px solid #1a1a1a", borderRadius: 8, padding: "4px 12px", fontFamily: "Fredoka,sans-serif", fontWeight: 700, fontSize: 12, color: "#1a1a1a" }}>
                        {c.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </MemeShell>
  );
}
