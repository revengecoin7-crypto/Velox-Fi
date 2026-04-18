import { useState } from "react";
import { useLocation } from "wouter";
import MemeShell from "@/components/MemeShell";
import { useAuth } from "@/context/AuthContext";

export default function Profile() {
  const { user, logout, setWallet } = useAuth();
  const [, nav] = useLocation();
  const [walletInput, setWalletInput] = useState(user?.wallet || "");
  const [walletSaved, setWalletSaved] = useState(false);

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

  function handleLogout() {
    logout();
    nav("/");
  }

  const card = (children: React.ReactNode, style?: React.CSSProperties) => (
    <div style={{ background: "#fff", border: "2.5px solid #1a1a1a", borderRadius: 20, padding: 24, boxShadow: "5px 5px 0 #1a1a1a", ...style }}>
      {children}
    </div>
  );

  return (
    <MemeShell testId="page-profile">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-bungee text-4xl">👤 PROFILE</h1>
            <p className="font-fredoka text-base" style={{ color: "#666" }}>Welcome back, <strong>{user.username}</strong>!</p>
          </div>
          <button
            onClick={handleLogout}
            style={{ background: "#FF6B6B", border: "2.5px solid #1a1a1a", borderRadius: 12, padding: "10px 24px", fontFamily: "Bungee,sans-serif", fontSize: 13, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a1a" }}
          >LOGOUT</button>
        </div>

        {/* Balance summary */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          {card(
            <>
              <p className="font-fredoka text-xs font-semibold uppercase mb-1" style={{ color: "#888" }}>WOLF Balance</p>
              <p className="font-bungee text-3xl" style={{ color: "#6BCB77" }}>{user.wolf.toLocaleString()}</p>
              <p className="font-fredoka text-sm mt-1" style={{ color: "#aaa" }}>In-game tokens</p>
            </>
          )}
          {card(
            <>
              <p className="font-fredoka text-xs font-semibold uppercase mb-1" style={{ color: "#888" }}>$BATTLE Pending</p>
              <p className="font-bungee text-3xl" style={{ color: "#4CC9F0" }}>{user.battle.toFixed(2)}</p>
              <p className="font-fredoka text-sm mt-1" style={{ color: "#aaa" }}>Real token</p>
            </>
          )}
        </div>

        {/* Account info */}
        {card(
          <>
            <h3 className="font-bungee text-lg mb-4">ACCOUNT INFO</h3>
            <div className="flex flex-col gap-3">
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#FFFBF0", borderRadius: 10, border: "1.5px solid #e5e5e5" }}>
                <span className="font-fredoka text-sm font-semibold" style={{ color: "#888" }}>Username</span>
                <span className="font-fredoka text-sm font-bold">{user.username}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#FFFBF0", borderRadius: 10, border: "1.5px solid #e5e5e5" }}>
                <span className="font-fredoka text-sm font-semibold" style={{ color: "#888" }}>Email</span>
                <span className="font-fredoka text-sm font-bold">{user.email}</span>
              </div>
            </div>
          </>,
          { marginBottom: 20 }
        )}

        {/* Wallet */}
        {card(
          <>
            <h3 className="font-bungee text-lg mb-2">SOLANA WALLET</h3>
            <p className="font-fredoka text-sm mb-4" style={{ color: "#666" }}>Required to claim $BATTLE tokens. You can play and earn without a wallet.</p>
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
                style={{ background: walletSaved ? "#6BCB77" : "#FFD93D", border: "2.5px solid #1a1a1a", borderRadius: 12, padding: "0 20px", fontFamily: "Bungee,sans-serif", fontSize: 13, cursor: "pointer", boxShadow: "2px 2px 0 #1a1a1a", whiteSpace: "nowrap" }}
              >{walletSaved ? "SAVED ✓" : "SAVE"}</button>
            </div>
          </>,
          { marginBottom: 20 }
        )}

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
          <button onClick={() => nav("/mine")} style={{ background: "#6BCB77", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "16px", fontFamily: "Bungee,sans-serif", fontSize: 14, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a1a" }}>⛏️ MINE WOLF</button>
          <button onClick={() => nav("/games")} style={{ background: "#4CC9F0", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "16px", fontFamily: "Bungee,sans-serif", fontSize: 14, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a1a" }}>🎮 PLAY GAMES</button>
          <button onClick={() => nav("/convert")} style={{ background: "#FF9F43", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "16px", fontFamily: "Bungee,sans-serif", fontSize: 14, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a1a" }}>🔄 CONVERT WOLF</button>
          <button onClick={() => nav("/leaderboard")} style={{ background: "#A29BFE", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "16px", fontFamily: "Bungee,sans-serif", fontSize: 14, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a1a" }}>🏆 LEADERBOARD</button>
        </div>

        {/* Conversion history */}
        {user.conversions.length > 0 && card(
          <>
            <h3 className="font-bungee text-lg mb-4">CONVERSION HISTORY</h3>
            <div className="flex flex-col gap-3">
              {user.conversions.slice(0, 5).map(c => (
                <div key={c.id} style={{ background: "#FFFBF0", border: "1.5px solid #e5e5e5", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <p className="font-fredoka font-bold text-sm">{c.wolf.toLocaleString()} WOLF → {c.battle} $BATTLE</p>
                    <p className="font-fredoka text-xs" style={{ color: "#888" }}>{new Date(c.date).toLocaleDateString()}</p>
                  </div>
                  <span style={{ background: "#FFD93D", border: "1.5px solid #1a1a1a", borderRadius: 8, padding: "4px 10px", fontFamily: "Fredoka,sans-serif", fontWeight: 700, fontSize: 11 }}>
                    {c.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </MemeShell>
  );
}
