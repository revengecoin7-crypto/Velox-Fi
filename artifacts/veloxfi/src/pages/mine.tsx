import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import MemeShell from "@/components/MemeShell";
import { useAuth } from "@/context/AuthContext";

export default function Mine() {
  const { user, startMiningSession, claimMiningReward, getMiningProgress } = useAuth();
  const [, nav] = useLocation();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  const progress = getMiningProgress();
  const fmt = (m: number) => `${Math.floor(m / 60)}h ${m % 60}m`;

  if (!user) {
    return (
      <MemeShell testId="page-mine">
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div style={{ fontSize: 80 }}>⛏️</div>
          <h1 className="font-bungee text-3xl mt-4 mb-3" style={{ color: "#1a1a1a" }}>WOLF MINING</h1>
          <p className="font-fredoka text-lg mb-6" style={{ color: "#555" }}>Login to start mining WOLF tokens for free!</p>
          <div className="flex gap-4 flex-wrap justify-center">
            <button onClick={() => nav("/login")} style={{ background: "#FFD93D", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "14px 36px", fontFamily: "Bungee,sans-serif", fontSize: 16, cursor: "pointer", boxShadow: "4px 4px 0 #1a1a1a" }}>LOGIN</button>
            <button onClick={() => nav("/register")} style={{ background: "#6BCB77", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "14px 36px", fontFamily: "Bungee,sans-serif", fontSize: 16, cursor: "pointer", boxShadow: "4px 4px 0 #1a1a1a" }}>CREATE ACCOUNT</button>
          </div>
        </div>
      </MemeShell>
    );
  }

  const canClaim = !progress.active && user.lastMineSession !== null && progress.wolfEarned > 0;

  return (
    <MemeShell testId="page-mine">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="font-bungee text-4xl mb-2" style={{ color: "#1a1a1a" }}>⛏️ WOLF MINING</h1>
          <p className="font-fredoka text-lg" style={{ color: "#555" }}>Mine 1 WOLF per minute · Max 240 WOLF per 4-hour session</p>
        </div>

        {/* Balance card */}
        <div style={{ background: "#FFD93D", border: "2.5px solid #1a1a1a", borderRadius: 20, padding: "24px 28px", boxShadow: "5px 5px 0 #1a1a1a", marginBottom: 24 }}>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <p className="font-fredoka text-sm font-semibold" style={{ color: "#555" }}>YOUR BALANCE</p>
              <p className="font-bungee text-4xl" style={{ color: "#1a1a1a" }}>{user.wolf.toLocaleString()} WOLF</p>
            </div>
            <div className="text-right">
              <p className="font-fredoka text-sm" style={{ color: "#666" }}>= {(user.wolf / 5000).toFixed(4)} $BATTLE</p>
              <p className="font-fredoka text-sm" style={{ color: "#666" }}>5,000 WOLF = 1 $BATTLE</p>
            </div>
          </div>
        </div>

        {/* Mining card */}
        <div style={{ background: "#fff", border: "2.5px solid #1a1a1a", borderRadius: 20, padding: "28px", boxShadow: "5px 5px 0 #1a1a1a", marginBottom: 24 }}>
          {!progress.active && user.lastMineSession === null && (
            <div className="text-center">
              <div style={{ fontSize: 80, marginBottom: 16 }}>⛏️</div>
              <h2 className="font-bungee text-2xl mb-3">START MINING</h2>
              <p className="font-fredoka text-base mb-6" style={{ color: "#555" }}>
                Start a 4-hour mining session and earn up to 240 WOLF.<br />
                No wallet needed — just click and earn!
              </p>
              <button
                onClick={() => startMiningSession()}
                style={{ background: "#6BCB77", border: "2.5px solid #1a1a1a", borderRadius: 16, padding: "16px 48px", fontFamily: "Bungee,sans-serif", fontSize: 18, cursor: "pointer", boxShadow: "4px 4px 0 #1a1a1a" }}
              >
                START MINING
              </button>
            </div>
          )}

          {progress.active && (
            <div className="text-center">
              <div style={{ fontSize: 60, marginBottom: 8 }}>⚙️</div>
              <h2 className="font-bungee text-xl mb-1">MINING IN PROGRESS</h2>
              <p className="font-fredoka text-4xl font-bold mt-2 mb-1" style={{ color: "#6BCB77" }}>
                +{progress.wolfEarned} WOLF
              </p>
              <p className="font-fredoka text-base mb-4" style={{ color: "#777" }}>
                {fmt(progress.minutesLeft)} remaining in this session
              </p>
              <div style={{ background: "#FFFBF0", border: "2px solid #1a1a1a", borderRadius: 12, height: 24, overflow: "hidden", position: "relative", marginBottom: 20 }}>
                <div style={{ background: "linear-gradient(90deg, #6BCB77, #FFD93D)", height: "100%", width: `${progress.percentDone}%`, borderRadius: 10, transition: "width 0.5s ease" }} />
                <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontFamily: "Fredoka,sans-serif", fontWeight: 700, fontSize: 12, color: "#1a1a1a" }}>
                  {progress.percentDone.toFixed(1)}%
                </span>
              </div>
              <p className="font-fredoka text-sm" style={{ color: "#888" }}>Auto-refreshes every 5 seconds · Session started successfully</p>
            </div>
          )}

          {canClaim && (
            <div className="text-center">
              <div style={{ fontSize: 80, marginBottom: 8 }}>🎉</div>
              <h2 className="font-bungee text-2xl mb-2">SESSION COMPLETE!</h2>
              <p className="font-fredoka text-4xl font-bold mb-2" style={{ color: "#6BCB77" }}>
                +{progress.wolfEarned} WOLF
              </p>
              <p className="font-fredoka text-base mb-6" style={{ color: "#555" }}>Ready to claim. Start another session after claiming!</p>
              <button
                onClick={() => claimMiningReward()}
                style={{ background: "#FFD93D", border: "2.5px solid #1a1a1a", borderRadius: 16, padding: "16px 48px", fontFamily: "Bungee,sans-serif", fontSize: 18, cursor: "pointer", boxShadow: "4px 4px 0 #1a1a1a" }}
              >
                CLAIM {progress.wolfEarned} WOLF
              </button>
            </div>
          )}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Per Minute", value: "1 WOLF" },
            { label: "Session Max", value: "240 WOLF" },
            { label: "Session Length", value: "4 Hours" },
            { label: "Convert Rate", value: "5K = 1 $BATTLE" },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "#fff", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "16px", boxShadow: "3px 3px 0 #1a1a1a", textAlign: "center" }}>
              <p className="font-fredoka text-xs font-semibold mb-1" style={{ color: "#888", textTransform: "uppercase" }}>{label}</p>
              <p className="font-bungee text-lg" style={{ color: "#1a1a1a" }}>{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="font-fredoka text-sm" style={{ color: "#888" }}>
            Also earn WOLF by playing games! 🎮{" "}
            <button onClick={() => nav("/games")} style={{ background: "none", border: "none", cursor: "pointer", color: "#4CC9F0", fontFamily: "Fredoka,sans-serif", fontWeight: 700, fontSize: "inherit", textDecoration: "underline" }}>
              Browse arcade games →
            </button>
          </p>
        </div>
      </div>
    </MemeShell>
  );
}
