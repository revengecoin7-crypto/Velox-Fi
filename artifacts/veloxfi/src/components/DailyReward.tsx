import { useState, useEffect } from "react";
import { useAuth, getDailyRewardForStreak } from "@/context/AuthContext";
import TokenFly from "./TokenFly";

const STREAK_DAYS = [
  { day: 1, wolf: 50,  emoji: "🐺" },
  { day: 2, wolf: 75,  emoji: "⭐" },
  { day: 3, wolf: 100, emoji: "💎" },
  { day: 4, wolf: 150, emoji: "🔥" },
  { day: 5, wolf: 200, emoji: "⚡" },
  { day: 6, wolf: 300, emoji: "🏆" },
  { day: 7, wolf: 500, emoji: "👑" },
];

export default function DailyReward() {
  const { user, canClaimDaily, claimDailyReward } = useAuth();
  const [visible, setVisible] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claimResult, setClaimResult] = useState<{ wolf: number; streak: number } | null>(null);
  const [flyShow, setFlyShow] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (canClaimDaily()) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, [user?.id]);

  if (!visible || !user) return null;

  function handleClaim() {
    const result = claimDailyReward();
    if (result.ok && result.wolf && result.streak) {
      setClaimResult({ wolf: result.wolf, streak: result.streak });
      setClaimed(true);
      setFlyShow(true);
    }
  }

  function handleClose() {
    setVisible(false);
    setClaimed(false);
    setClaimResult(null);
    setFlyShow(false);
  }

  const nextStreak = (user.dailyStreak || 0) + 1;
  const reward = getDailyRewardForStreak(nextStreak);
  const currentDay = Math.min(nextStreak, 7);

  return (
    <>
      <TokenFly
        count={claimResult?.wolf ? Math.min(Math.ceil(claimResult.wolf / 20), 10) : 0}
        show={flyShow}
        fromX={window.innerWidth / 2}
        fromY={window.innerHeight / 2}
        onComplete={() => setFlyShow(false)}
      />

      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
          zIndex: 1000, backdropFilter: "blur(4px)",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1001,
        background: "#FFFBF0",
        border: "3px solid #1a1a1a",
        borderRadius: 24,
        padding: "32px 28px",
        boxShadow: "8px 8px 0 #1a1a1a",
        maxWidth: 420,
        width: "calc(100vw - 32px)",
        textAlign: "center",
      }}>

        {!claimed ? (
          <>
            <div style={{ fontSize: 56, marginBottom: 8 }}>🎁</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFD93D", border: "2px solid #1a1a1a", borderRadius: 30, padding: "4px 16px", marginBottom: 12 }}>
              <span style={{ fontFamily: "Bungee,sans-serif", fontSize: 11, color: "#1a1a1a" }}>DAY {currentDay} STREAK</span>
            </div>
            <h2 style={{ fontFamily: "Bungee,sans-serif", fontSize: 26, color: "#1a1a1a", margin: "0 0 4px" }}>
              DAILY REWARD!
            </h2>
            <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 15, color: "#666", marginBottom: 20 }}>
              You're on a {user.dailyStreak || 0}-day streak! Keep it going!
            </p>

            {/* Streak bar */}
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
              {STREAK_DAYS.map(d => {
                const isDone = d.day < currentDay;
                const isCurrent = d.day === currentDay;
                return (
                  <div key={d.day} style={{
                    width: 42, borderRadius: 10, padding: "6px 4px",
                    background: isDone ? "#6BCB77" : isCurrent ? "#FFD93D" : "#f0f0f0",
                    border: `2px solid ${isDone ? "#4a9e5a" : isCurrent ? "#1a1a1a" : "#ddd"}`,
                    boxShadow: isCurrent ? "2px 2px 0 #1a1a1a" : "none",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 14 }}>{d.emoji}</div>
                    <div style={{ fontFamily: "Bungee,sans-serif", fontSize: 9, color: isDone ? "#fff" : isCurrent ? "#1a1a1a" : "#aaa" }}>
                      {d.wolf}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reward amount */}
            <div style={{ background: "#6BCB77", border: "2.5px solid #1a1a1a", borderRadius: 16, padding: "16px 24px", marginBottom: 20, boxShadow: "3px 3px 0 #1a1a1a" }}>
              <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#1a1a1a", margin: "0 0 4px" }}>TODAY'S REWARD</p>
              <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 32, color: "#fff", margin: 0 }}>+{reward} WOLF</p>
            </div>

            <button
              onClick={handleClaim}
              style={{
                width: "100%", background: "#FFD93D", border: "2.5px solid #1a1a1a",
                borderRadius: 14, padding: "14px", fontFamily: "Bungee,sans-serif",
                fontSize: 16, cursor: "pointer", boxShadow: "4px 4px 0 #1a1a1a",
                color: "#1a1a1a",
              }}
            >
              CLAIM REWARD 🎁
            </button>
            <button onClick={handleClose} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#aaa", marginTop: 12 }}>
              Remind me later
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 72, marginBottom: 12 }}>🎉</div>
            <h2 style={{ fontFamily: "Bungee,sans-serif", fontSize: 28, color: "#1a1a1a", margin: "0 0 8px" }}>
              CLAIMED!
            </h2>
            <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 36, color: "#6BCB77", margin: "0 0 8px" }}>
              +{claimResult?.wolf} WOLF
            </p>
            <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 15, color: "#666", marginBottom: 24 }}>
              Day {claimResult?.streak} streak! Come back tomorrow for more! 🔥
            </p>
            <button
              onClick={handleClose}
              style={{
                background: "#6BCB77", border: "2.5px solid #1a1a1a",
                borderRadius: 14, padding: "12px 36px", fontFamily: "Bungee,sans-serif",
                fontSize: 15, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a1a", color: "#1a1a1a",
              }}
            >
              AWESOME! ✓
            </button>
          </>
        )}
      </div>
    </>
  );
}
