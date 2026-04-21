import { useEffect, useState } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import MemeShell from "@/components/MemeShell";
import { useAuth } from "@/context/AuthContext";

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

interface LBEntry {
  rank:     number;
  username: string;
  wolf:     number;
  tokens:   number;
  isMe:     boolean;
}

const PRIZES = [
  { rank: 1, emoji: "👑", label: "CHAMPION",  color: "#FFD93D", wolf: 5000 },
  { rank: 2, emoji: "🥈", label: "RUNNER UP", color: "#C0C0C0", wolf: 3000 },
  { rank: 3, emoji: "🥉", label: "3RD PLACE", color: "#CD7F32", wolf: 1000 },
];

function rankColor(rank: number) {
  if (rank === 1) return "#FFD93D";
  if (rank === 2) return "#b0b0b0";
  if (rank === 3) return "#CD7F32";
  return "#1a1a1a";
}
function rankBg(rank: number) {
  if (rank === 1) return "#FFFBF0";
  if (rank === 2) return "#f8f8f8";
  if (rank === 3) return "#fdf6ee";
  return "#fff";
}

function WeekCountdown() {
  const now = new Date();
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + (8 - now.getDay()) % 7 || 7);
  nextMonday.setHours(0, 0, 0, 0);
  const msLeft = nextMonday.getTime() - now.getTime();
  const d = Math.floor(msLeft / 86400000);
  const h = Math.floor((msLeft % 86400000) / 3600000);
  const m = Math.floor((msLeft % 3600000) / 60000);
  return <span>{d}d {h}h {m}m</span>;
}

export default function Leaderboard() {
  usePageMeta({
    title: "Leaderboard — Top WOLF Earners | VeloxFi Game Arena",
    description: "See the top WOLF token earners on VeloxFi. Weekly prizes: #1 gets 5000 WOLF, #2 gets 3000 WOLF, #3 gets 1000 WOLF. Play games and mine to climb the rankings.",
    canonical: "https://veloxfi.io/leaderboard",
  });

  const { user } = useAuth();
  const [entries, setEntries] = useState<LBEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/veloxfi/leaderboard`)
      .then(r => r.json())
      .then((data: { username: string; tokens: number; wolf?: number }[]) => {
        const sorted = [...data].sort((a, b) => (b.wolf ?? 0) - (a.wolf ?? 0));
        setEntries(sorted.map((u, i) => ({
          rank:     i + 1,
          username: u.username,
          wolf:     u.wolf ?? 0,
          tokens:   u.tokens ?? 0,
          isMe:     u.username === user?.username,
        })));
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [user?.username]);

  const top3   = entries.slice(0, 3);
  const rest   = entries.slice(3, 10);
  const myEntry = entries.find(e => e.isMe);

  return (
    <MemeShell>
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-5 font-bungee text-xs text-[#1a1a1a]"
            style={{ background: "#FFD93D", border: "2.5px solid #1a1a1a", boxShadow: "3px 3px 0 #1a1a1a" }}>
            🏆 SEASON 1 RANKINGS
          </div>
          <h1 className="font-bungee text-4xl md:text-5xl text-[#1a1a1a] mb-4">
            TOP <span style={{ color: "#FFD93D" }}>WOLVES</span>
          </h1>
          <p className="font-fredoka text-lg text-gray-600">Weekly prizes for the biggest WOLF earners 🐺</p>
        </div>

        {/* Weekly prize info */}
        <div style={{ background: "#fff", border: "2.5px solid #1a1a1a", borderRadius: 20, padding: "20px 24px", boxShadow: "5px 5px 0 #1a1a1a", marginBottom: 28 }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-bungee text-base text-[#1a1a1a] mb-1">🗓️ WEEKLY RESET</p>
              <p className="font-fredoka text-sm" style={{ color: "#666" }}>Rankings reset every Monday at 00:00 UTC</p>
            </div>
            <div style={{ background: "#FF9F43", border: "2px solid #1a1a1a", borderRadius: 12, padding: "10px 20px", boxShadow: "2px 2px 0 #1a1a1a", textAlign: "center" }}>
              <p className="font-fredoka text-xs font-bold mb-0.5" style={{ color: "#1a1a1a" }}>RESETS IN</p>
              <p className="font-bungee text-lg" style={{ color: "#1a1a1a" }}><WeekCountdown /></p>
            </div>
          </div>
        </div>

        {/* Prize cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {PRIZES.map(p => (
            <div key={p.rank} style={{ background: "#fff", border: "2.5px solid #1a1a1a", borderRadius: 20, padding: "20px 16px", boxShadow: `5px 5px 0 ${p.color}`, textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 6 }}>{p.emoji}</div>
              <p className="font-bungee text-sm" style={{ color: p.rank === 1 ? "#FFD93D" : p.rank === 2 ? "#888" : "#CD7F32" }}>{p.label}</p>
              <p className="font-bungee text-3xl mt-1" style={{ color: "#1a1a1a" }}>+{p.wolf.toLocaleString()}</p>
              <p className="font-fredoka text-sm" style={{ color: "#666" }}>WOLF reward</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <p className="font-bungee text-xl text-[#1a1a1a]">LOADING...</p>
          </div>
        ) : entries.length === 0 ? (
          <div style={{ background: "#fff", border: "2.5px solid #1a1a1a", borderRadius: 20, padding: "48px 24px", boxShadow: "5px 5px 0 #1a1a1a", textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>🏆</div>
            <h2 className="font-bungee text-2xl mb-3">NO PLAYERS YET</h2>
            <p className="font-fredoka text-base mb-6" style={{ color: "#666" }}>Be the first wolf on the leaderboard! Start playing games or mining to earn WOLF.</p>
            <a href="/games" style={{ background: "#FFD93D", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "14px 36px", fontFamily: "Bungee,sans-serif", fontSize: 15, cursor: "pointer", boxShadow: "4px 4px 0 #1a1a1a", textDecoration: "none", color: "#1a1a1a" }}>
              🎮 PLAY NOW
            </a>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {top3.length > 0 && (
              <div className="flex gap-4 mb-6 items-end">
                {[top3[1] ?? null, top3[0] ?? null, top3[2] ?? null].map((entry, idx) => {
                  if (!entry) return <div key={idx} className="flex-1" />;
                  const prize = PRIZES.find(p => p.rank === entry.rank);
                  const isFirst = entry.rank === 1;
                  return (
                    <div key={entry.rank} className="flex-1"
                      style={{
                        background: entry.isMe ? "#d1fae5" : rankBg(entry.rank),
                        border: `2.5px solid ${isFirst ? "#FFD93D" : "#1a1a1a"}`,
                        borderRadius: 20,
                        padding: isFirst ? "24px 16px" : "18px 14px",
                        boxShadow: `${isFirst ? "6px 6px" : "4px 4px"} 0 ${rankColor(entry.rank)}`,
                        textAlign: "center",
                        order: idx,
                      }}>
                      <div style={{ fontSize: isFirst ? 40 : 30, marginBottom: 4 }}>{prize?.emoji ?? "🎯"}</div>
                      <div className="font-bungee text-sm" style={{ color: rankColor(entry.rank) }}>{prize?.label}</div>
                      <div className="font-bungee text-lg mt-1 truncate" style={{ color: "#1a1a1a" }}>{entry.username}</div>
                      <div className="font-fredoka font-bold mt-1" style={{ color: "#6BCB77", fontSize: isFirst ? 22 : 16 }}>{entry.wolf.toLocaleString()} WOLF</div>
                      {prize && <div className="font-bungee text-xs mt-2 px-2 py-1 rounded-lg" style={{ background: prize.color, color: "#1a1a1a", border: "1.5px solid #1a1a1a" }}>+{prize.wolf} prize</div>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Table for ranks 4-10 */}
            {rest.length > 0 && (
              <div style={{ background: "#fff", border: "2.5px solid #1a1a1a", borderRadius: 20, overflow: "hidden", boxShadow: "5px 5px 0 #1a1a1a", marginBottom: 24 }}>
                <div style={{ background: "#1a1a1a", padding: "12px 20px", display: "grid", gridTemplateColumns: "50px 1fr 140px 100px", gap: 8 }}>
                  {["RANK", "PLAYER", "WOLF BALANCE", "$BATTLE"].map(h => (
                    <span key={h} className="font-bungee text-xs" style={{ color: "#FFD93D" }}>{h}</span>
                  ))}
                </div>
                {rest.map((entry, i) => (
                  <div key={entry.rank}
                    style={{
                      padding: "14px 20px",
                      display: "grid",
                      gridTemplateColumns: "50px 1fr 140px 100px",
                      gap: 8,
                      background: entry.isMe ? "#d1fae5" : i % 2 === 0 ? "#fff" : "#FFFBF0",
                      borderTop: "1.5px solid #eee",
                      alignItems: "center",
                    }}>
                    <span className="font-bungee text-sm" style={{ color: rankColor(entry.rank) }}>#{entry.rank}</span>
                    <span className="font-fredoka font-bold text-sm truncate" style={{ color: entry.isMe ? "#065f46" : "#1a1a1a" }}>
                      {entry.isMe ? "⭐ " : ""}{entry.username}
                    </span>
                    <span className="font-bungee text-sm" style={{ color: "#6BCB77" }}>{entry.wolf.toLocaleString()}</span>
                    <span className="font-fredoka text-sm" style={{ color: "#4CC9F0" }}>{entry.tokens.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* My rank */}
        {user && myEntry && (
          <div style={{ background: myEntry.rank <= 3 ? "#d1fae5" : "#fff", border: "2.5px solid #1a1a1a", borderRadius: 20, padding: "20px 24px", boxShadow: "5px 5px 0 #6BCB77", marginBottom: 24 }}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-bungee text-sm mb-1" style={{ color: "#888" }}>YOUR RANK</p>
                <div className="flex items-center gap-3">
                  <span className="font-bungee text-4xl" style={{ color: rankColor(myEntry.rank) }}>#{myEntry.rank}</span>
                  <div>
                    <p className="font-bungee text-lg text-[#1a1a1a]">{user.username}</p>
                    <p className="font-fredoka text-sm" style={{ color: "#6BCB77" }}>{myEntry.wolf.toLocaleString()} WOLF</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <a href="/games" style={{ background: "#4CC9F0", border: "2.5px solid #1a1a1a", borderRadius: 12, padding: "10px 20px", fontFamily: "Bungee,sans-serif", fontSize: 13, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a1a", textDecoration: "none", color: "#1a1a1a" }}>🎮 PLAY</a>
                <a href="/mine"  style={{ background: "#FFD93D", border: "2.5px solid #1a1a1a", borderRadius: 12, padding: "10px 20px", fontFamily: "Bungee,sans-serif", fontSize: 13, cursor: "pointer", boxShadow: "3px 3px 0 #1a1a1a", textDecoration: "none", color: "#1a1a1a" }}>⛏️ MINE</a>
              </div>
            </div>
          </div>
        )}

        {!user && (
          <div style={{ background: "#FFD93D", border: "2.5px solid #1a1a1a", borderRadius: 20, padding: "40px 24px", boxShadow: "6px 6px 0 #1a1a1a", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🐺</div>
            <h2 className="font-bungee text-2xl text-[#1a1a1a] mb-3">JOIN THE COMPETITION</h2>
            <p className="font-fredoka text-gray-700 text-base mb-6">Create an account, play games, mine WOLF, and compete for the weekly prize pool!</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/register" style={{ background: "#1a1a1a", border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "14px 36px", fontFamily: "Bungee,sans-serif", fontSize: 14, textDecoration: "none", color: "#fff", boxShadow: "4px 4px 0 #333" }}>CREATE ACCOUNT 🚀</a>
              <a href="/games"    style={{ background: "#fff",    border: "2.5px solid #1a1a1a", borderRadius: 14, padding: "14px 36px", fontFamily: "Bungee,sans-serif", fontSize: 14, textDecoration: "none", color: "#1a1a1a", boxShadow: "4px 4px 0 #333" }}>PLAY GAMES 🎮</a>
            </div>
          </div>
        )}

      </div>
    </MemeShell>
  );
}
