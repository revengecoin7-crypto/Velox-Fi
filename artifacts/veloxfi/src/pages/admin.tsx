import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Shield, Eye, EyeOff, RefreshCw, LogOut, Download, Check, Users, Gamepad2, Pickaxe, ArrowRightLeft, TrendingUp, Clock, Activity } from "lucide-react";
import { getEvents, getLiveSessions, type PageEvent } from "@/lib/analytics";

// ── constants ──────────────────────────────────────────────
const ADMIN_PW  = "veloxfi2025";
const AUTH_KEY  = "vfx_admin_auth";
const USERS_KEY = "vfx_users_v2";

// ── types ──────────────────────────────────────────────────
interface StoredUser {
  id: string;
  username: string;
  email: string;
  wolf: number;
  battle: number;
  lastMineSession: number | null;
  conversions: Conversion[];
  wallet: string | null;
  gameHistory?: GameSession[];
  lastDailyReward?: string | null;
  dailyStreak?: number;
  totalMined?: number;
  totalGameWolf?: number;
  password: string;
}
interface Conversion {
  id: string; wolf: number; battle: number; date: string; status: string;
  username?: string; email?: string; wallet?: string; userId?: string;
}
interface GameSession { id: string; game: string; wolf: number; date: string; }

// ── helpers ────────────────────────────────────────────────
function loadUsers(): StoredUser[] {
  try { return Object.values(JSON.parse(localStorage.getItem(USERS_KEY) || "{}")); }
  catch { return []; }
}

function saveUser(u: StoredUser) {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
    users[u.id] = u;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch { /* ignore */ }
}

function fmt(n: number) { return n.toLocaleString(); }
function dateStr(iso: string) { return new Date(iso).toLocaleString("nl-NL"); }
function shortWallet(w: string | null) {
  if (!w) return "—";
  return w.length > 12 ? `${w.slice(0, 6)}…${w.slice(-4)}` : w;
}
function todayStr() { return new Date().toISOString().slice(0, 10); }

const PAGE_LABELS: Record<string, string> = {
  "/": "Home", "/games": "Games", "/games/snake": "Snake",
  "/games/tetris": "Tetris", "/games/runner": "Wolf Run",
  "/games/rocket": "Rocket", "/mine": "Mine", "/convert": "Convert",
  "/leaderboard": "Leaderboard", "/profile": "Profile",
  "/login": "Login", "/register": "Register",
  "/presale": "Buy $BATTLE", "/blog": "Blog", "/faq": "FAQ",
  "/whitepaper": "Whitepaper", "/roadmap": "Roadmap",
};

// ── sub-components ─────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#fff", border: "2.5px solid #1a1a1a", borderRadius: 18, padding: "18px 20px", boxShadow: "4px 4px 0 #1a1a1a", ...style }}>
      {children}
    </div>
  );
}

function StatTile({ label, value, sub, color, icon }: { label: string; value: string | number; sub?: string; color: string; icon: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "2.5px solid #1a1a1a", borderRadius: 18, padding: "18px 20px", boxShadow: `5px 5px 0 ${color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontFamily: "Fredoka,sans-serif", fontWeight: 700, fontSize: 11, color: "#888", margin: "0 0 4px", textTransform: "uppercase" }}>{label}</p>
          <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 28, color: "#1a1a1a", margin: 0 }}>{value}</p>
          {sub && <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 12, color: "#aaa", margin: "2px 0 0" }}>{sub}</p>}
        </div>
        <div style={{ background: color + "22", border: `2px solid ${color}`, borderRadius: 10, padding: "8px", color }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ── login screen ───────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [, nav] = useLocation();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (pw === ADMIN_PW) { sessionStorage.setItem(AUTH_KEY, "1"); onLogin(); }
      else { setErr("Incorrect password"); }
      setLoading(false);
    }, 500);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FFFBF0", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", border: "2.5px solid #1a1a1a", borderRadius: 24, padding: "36px 32px", boxShadow: "8px 8px 0 #1a1a1a", maxWidth: 380, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🔐</div>
        <h1 style={{ fontFamily: "Bungee,sans-serif", fontSize: 24, color: "#1a1a1a", marginBottom: 4 }}>ADMIN LOGIN</h1>
        <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#888", marginBottom: 24 }}>VeloxFi Dashboard</p>
        <form onSubmit={submit}>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <input
              type={show ? "text" : "password"}
              value={pw}
              onChange={e => { setPw(e.target.value); setErr(""); }}
              placeholder="Admin password"
              style={{ width: "100%", border: `2.5px solid ${err ? "#FF6B6B" : "#1a1a1a"}`, borderRadius: 12, padding: "13px 44px 13px 16px", fontFamily: "Fredoka,sans-serif", fontSize: 15, outline: "none", boxSizing: "border-box" }}
            />
            <button type="button" onClick={() => setShow(v => !v)}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888" }}>
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {err && <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#FF6B6B", marginBottom: 12 }}>{err}</p>}
          <button type="submit" disabled={!pw || loading}
            style={{ width: "100%", background: pw && !loading ? "#FFD93D" : "#f0f0f0", border: "2.5px solid #1a1a1a", borderRadius: 13, padding: "14px", fontFamily: "Bungee,sans-serif", fontSize: 16, cursor: pw && !loading ? "pointer" : "not-allowed", boxShadow: pw && !loading ? "4px 4px 0 #1a1a1a" : "none", color: "#1a1a1a" }}>
            {loading ? "CHECKING…" : "LOGIN"}
          </button>
        </form>
        <button onClick={() => nav("/")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#aaa", marginTop: 16 }}>← Back to VeloxFi</button>
      </div>
    </div>
  );
}

// ── main dashboard ─────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === "1");
  const [, nav] = useLocation();

  // ── stats state ──
  const [tick, setTick] = useState(0);
  const [tab, setTab] = useState<"overview" | "conversions" | "users" | "traffic" | "activity">("overview");

  useEffect(() => {
    if (!authed) return;
    const id = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(id);
  }, [authed]);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  // ── computed data ──
  const users    = loadUsers();
  const events   = getEvents();
  const liveSess = getLiveSessions();
  const liveCount = Object.keys(liveSess).length;

  const now = Date.now();
  const msDay  = 86400000;
  const msWeek = 7 * msDay;

  const eventsToday  = events.filter(e => now - e.ts < msDay);
  const eventsWeek   = events.filter(e => now - e.ts < msWeek);
  const uniqueSids   = new Set(events.map(e => e.sid)).size;
  const uniqueToday  = new Set(eventsToday.map(e => e.sid)).size;

  // users
  const usersToday = users.filter(u => {
    const conv = u.conversions?.[0];
    return conv ? false : true; // rough: no good join date stored, use first-seen from events
  });
  const totalWolf   = users.reduce((s, u) => s + (u.wolf || 0), 0);
  const totalGames  = users.reduce((s, u) => s + (u.gameHistory?.length || 0), 0);
  const totalMined  = users.reduce((s, u) => s + (u.totalMined || 0), 0);

  // conversions (all, across all users, enriched with user info)
  const allConversions: Conversion[] = [];
  for (const u of users) {
    for (const c of u.conversions || []) {
      allConversions.push({ ...c, username: u.username, email: u.email, wallet: u.wallet || undefined, userId: u.id });
    }
  }
  allConversions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const pendingConv = allConversions.filter(c => c.status === "pending");
  const totalBattleReq = allConversions.reduce((s, c) => s + c.battle, 0);

  // page view breakdown
  const pageBreakdown: Record<string, number> = {};
  for (const e of events) {
    pageBreakdown[e.page] = (pageBreakdown[e.page] || 0) + 1;
  }
  const topPages = Object.entries(pageBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 12);

  // recent events (last 30)
  const recentEvents = [...events].reverse().slice(0, 30);

  // users new today (based on events with uid)
  const newUserIdsToday = new Set(eventsToday.filter(e => e.uid).map(e => e.uid));

  // mark conversion completed
  function markDone(userId: string, convId: string) {
    const raw = JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
    const u: StoredUser = raw[userId];
    if (!u) return;
    u.conversions = u.conversions.map(c => c.id === convId ? { ...c, status: "completed" } : c);
    raw[userId] = u;
    localStorage.setItem(USERS_KEY, JSON.stringify(raw));
    refresh();
  }

  // csv export conversions
  function exportConvCsv() {
    const header = ["Date", "Username", "Email", "Wallet", "WOLF", "$BATTLE", "Status"];
    const rows = allConversions.map(c => [
      dateStr(c.date), c.username, c.email, c.wallet || "", c.wolf, c.battle.toFixed(4), c.status
    ]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `veloxfi-conversions-${todayStr()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  function exportUsersCsv() {
    const header = ["Username", "Email", "WOLF", "$BATTLE Req", "Games", "Mined", "Streak", "Wallet"];
    const rows = users.map(u => [
      u.username, u.email, u.wolf, allConversions.filter(c => c.userId === u.id).reduce((s,c)=>s+c.battle,0).toFixed(4),
      u.gameHistory?.length || 0, u.totalMined || 0, u.dailyStreak || 0, u.wallet || ""
    ]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `veloxfi-users-${todayStr()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const tabStyle = (active: boolean, color: string) => ({
    background: active ? color : "#fff",
    border: `2px solid ${active ? "#1a1a1a" : "#ddd"}`,
    borderRadius: 10, padding: "8px 18px",
    fontFamily: "Bungee,sans-serif", fontSize: 12,
    cursor: "pointer", boxShadow: active ? "2px 2px 0 #1a1a1a" : "none",
    color: "#1a1a1a", transform: active ? "translate(-1px,-1px)" : "none",
    whiteSpace: "nowrap" as const,
  });

  return (
    <div style={{ minHeight: "100vh", background: "#FFFBF0", color: "#1a1a1a" }}>

      {/* ── HEADER ── */}
      <div style={{ background: "#1a1a1a", borderBottom: "2.5px solid #1a1a1a", padding: "0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>🛡️</span>
            <div>
              <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 18, color: "#FFD93D", margin: 0 }}>VELOXFI ADMIN</p>
              <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 12, color: "#666", margin: 0 }}>Dashboard · Auto-refresh 5s</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Live indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#6BCB77", border: "2px solid #6BCB77", borderRadius: 20, padding: "5px 14px" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontFamily: "Bungee,sans-serif", fontSize: 12, color: "#fff" }}>{liveCount} LIVE</span>
            </div>
            <button onClick={refresh} style={{ background: "#FFD93D", border: "2px solid #FFD93D", borderRadius: 10, padding: "6px 14px", fontFamily: "Bungee,sans-serif", fontSize: 12, cursor: "pointer", color: "#1a1a1a", display: "flex", alignItems: "center", gap: 6 }}>
              <RefreshCw size={14} /> REFRESH
            </button>
            <button onClick={() => { sessionStorage.removeItem(AUTH_KEY); setAuthed(false); }} style={{ background: "#FF6B6B", border: "2px solid #FF6B6B", borderRadius: 10, padding: "6px 14px", fontFamily: "Bungee,sans-serif", fontSize: 12, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
              <LogOut size={14} /> LOGOUT
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>

        {/* ── TOP STATS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
          <StatTile label="Live Visitors" value={liveCount} sub="Right now on site" color="#6BCB77" icon={<Activity size={20} />} />
          <StatTile label="Visitors Today" value={uniqueToday} sub="Unique sessions" color="#4CC9F0" icon={<Eye size={20} />} />
          <StatTile label="Total Visitors" value={fmt(uniqueSids)} sub="All-time unique sessions" color="#A29BFE" icon={<Users size={20} />} />
          <StatTile label="Page Views" value={fmt(events.length)} sub={`Today: ${fmt(eventsToday.length)}`} color="#FF9F43" icon={<TrendingUp size={20} />} />
          <StatTile label="Registered Users" value={users.length} sub={`~${newUserIdsToday.size} active today`} color="#FFD93D" icon={<Users size={20} />} />
          <StatTile label="Total WOLF" value={fmt(totalWolf)} sub="Across all wallets" color="#6BCB77" icon={<Pickaxe size={20} />} />
          <StatTile label="Pending Conv." value={pendingConv.length} sub="Awaiting $BATTLE send" color="#FF6B6B" icon={<ArrowRightLeft size={20} />} />
          <StatTile label="$BATTLE Req." value={totalBattleReq.toFixed(2)} sub="Total requested" color="#A29BFE" icon={<ArrowRightLeft size={20} />} />
        </div>

        {/* ── PENDING CONVERSIONS ALERT ── */}
        {pendingConv.length > 0 && (
          <div style={{ background: "#FF6B6B", border: "2.5px solid #1a1a1a", borderRadius: 16, padding: "14px 20px", marginBottom: 20, boxShadow: "4px 4px 0 #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>⚠️</span>
              <div>
                <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 15, color: "#fff", margin: 0 }}>{pendingConv.length} CONVERSION{pendingConv.length !== 1 ? "S" : ""} NEED ATTENTION</p>
                <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "rgba(255,255,255,0.8)", margin: 0 }}>Send $BATTLE tokens and mark as completed</p>
              </div>
            </div>
            <button onClick={() => setTab("conversions")} style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 10, padding: "8px 18px", fontFamily: "Bungee,sans-serif", fontSize: 13, cursor: "pointer", color: "#FF6B6B" }}>
              VIEW NOW →
            </button>
          </div>
        )}

        {/* ── LIVE SESSIONS ── */}
        {liveCount > 0 && (
          <div style={{ background: "#fff", border: "2.5px solid #6BCB77", borderRadius: 18, padding: "16px 20px", marginBottom: 20, boxShadow: "4px 4px 0 #6BCB77" }}>
            <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 14, color: "#1a1a1a", marginBottom: 10 }}>🟢 LIVE SESSIONS ({liveCount})</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Object.entries(liveSess).map(([sid, s]) => (
                <div key={sid} style={{ background: "#FFFBF0", border: "1.5px solid #6BCB77", borderRadius: 8, padding: "5px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#6BCB77" }} />
                  <span style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#1a1a1a" }}>
                    {PAGE_LABELS[s.page] || s.page}
                  </span>
                  <span style={{ fontFamily: "Fredoka,sans-serif", fontSize: 11, color: "#aaa" }}>
                    {Math.round((Date.now() - s.ts) / 1000)}s ago
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TABS ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
          <button onClick={() => setTab("overview")}    style={tabStyle(tab === "overview",    "#FFD93D")}>📊 Overview</button>
          <button onClick={() => setTab("conversions")} style={tabStyle(tab === "conversions", "#FF6B6B")}>🔄 Conversions {pendingConv.length > 0 && `(${pendingConv.length})`}</button>
          <button onClick={() => setTab("users")}       style={tabStyle(tab === "users",       "#6BCB77")}>👥 Users</button>
          <button onClick={() => setTab("traffic")}     style={tabStyle(tab === "traffic",     "#4CC9F0")}>📈 Traffic</button>
          <button onClick={() => setTab("activity")}    style={tabStyle(tab === "activity",    "#A29BFE")}>⏱️ Activity</button>
        </div>

        {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>

            {/* Game stats */}
            <Card>
              <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 14, marginBottom: 14 }}>🎮 GAME STATS</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Total game sessions", value: fmt(totalGames) },
                  { label: "Total WOLF from games", value: fmt(users.reduce((s,u) => s+(u.totalGameWolf||0),0)) },
                  { label: "Total WOLF mined", value: fmt(totalMined) },
                  { label: "Avg WOLF per user", value: users.length > 0 ? Math.round(totalWolf / users.length) : 0 },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#FFFBF0", borderRadius: 8, border: "1.5px solid #eee" }}>
                    <span style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#666" }}>{label}</span>
                    <span style={{ fontFamily: "Bungee,sans-serif", fontSize: 14, color: "#1a1a1a" }}>{value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Most popular games */}
            <Card>
              <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 14, marginBottom: 14 }}>🏆 POPULAR GAMES</p>
              {(() => {
                const gameCounts: Record<string, number> = {};
                for (const u of users) for (const g of u.gameHistory || []) gameCounts[g.game] = (gameCounts[g.game]||0)+1;
                const sorted = Object.entries(gameCounts).sort((a,b) => b[1]-a[1]);
                const icons: Record<string, string> = { snake:"🐍", tetris:"🧱", runner:"🐺", rocket:"🚀" };
                if (sorted.length === 0) return <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#aaa" }}>No games played yet</p>;
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {sorted.map(([game, count]) => (
                      <div key={game}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13 }}>{icons[game]||"🎮"} {game.charAt(0).toUpperCase()+game.slice(1)}</span>
                          <span style={{ fontFamily: "Bungee,sans-serif", fontSize: 13, color: "#6BCB77" }}>{count}</span>
                        </div>
                        <div style={{ background: "#f0f0f0", borderRadius: 6, height: 8, overflow: "hidden" }}>
                          <div style={{ width: `${(count / (sorted[0][1]||1)) * 100}%`, background: "#6BCB77", height: "100%", borderRadius: 6, transition: "width 0.5s" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </Card>

            {/* Conversion summary */}
            <Card>
              <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 14, marginBottom: 14 }}>💱 CONVERSION SUMMARY</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Total conversions", value: allConversions.length },
                  { label: "Pending", value: pendingConv.length, color: "#FF6B6B" },
                  { label: "Completed", value: allConversions.filter(c=>c.status==="completed").length, color: "#6BCB77" },
                  { label: "Total WOLF converted", value: fmt(allConversions.reduce((s,c)=>s+c.wolf,0)) },
                  { label: "Total $BATTLE requested", value: totalBattleReq.toFixed(4) },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#FFFBF0", borderRadius: 8, border: "1.5px solid #eee" }}>
                    <span style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#666" }}>{label}</span>
                    <span style={{ fontFamily: "Bungee,sans-serif", fontSize: 14, color: color || "#1a1a1a" }}>{value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top earners */}
            <Card>
              <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 14, marginBottom: 14 }}>🥇 TOP WOLF EARNERS</p>
              {users.length === 0
                ? <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#aaa" }}>No users yet</p>
                : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[...users].sort((a,b) => b.wolf-a.wolf).slice(0,5).map((u, i) => (
                      <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: i===0 ? "#FFFBF0" : "transparent", borderRadius: 8, border: i===0 ? "1.5px solid #FFD93D" : "none" }}>
                        <span style={{ fontFamily: "Bungee,sans-serif", fontSize: 14, color: ["#FFD93D","#888","#CD7F32"][i]||"#aaa", minWidth: 20 }}>#{i+1}</span>
                        <span style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, flex: 1, fontWeight: 700 }}>{u.username}</span>
                        <span style={{ fontFamily: "Bungee,sans-serif", fontSize: 13, color: "#6BCB77" }}>{fmt(u.wolf)}</span>
                      </div>
                    ))}
                  </div>
                )
              }
            </Card>
          </div>
        )}

        {/* ═══════════════ CONVERSIONS TAB ═══════════════ */}
        {tab === "conversions" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 16, margin: 0 }}>
                🔄 ALL CONVERSIONS ({allConversions.length})
                {pendingConv.length > 0 && <span style={{ marginLeft: 10, color: "#FF6B6B" }}>· {pendingConv.length} PENDING</span>}
              </p>
              {allConversions.length > 0 && (
                <button onClick={exportConvCsv} style={{ background: "#4CC9F0", border: "2px solid #1a1a1a", borderRadius: 10, padding: "7px 16px", fontFamily: "Bungee,sans-serif", fontSize: 12, cursor: "pointer", boxShadow: "2px 2px 0 #1a1a1a", color: "#1a1a1a", display: "flex", alignItems: "center", gap: 6 }}>
                  <Download size={14} /> EXPORT CSV
                </button>
              )}
            </div>

            {allConversions.length === 0 ? (
              <Card>
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: 56, marginBottom: 12 }}>🔄</div>
                  <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 18, color: "#1a1a1a" }}>NO CONVERSIONS YET</p>
                  <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 14, color: "#888" }}>Conversion requests will appear here when users convert WOLF to $BATTLE.</p>
                </div>
              </Card>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {allConversions.map(c => (
                  <div key={c.id} style={{ background: "#fff", border: `2.5px solid ${c.status === "pending" ? "#FF6B6B" : "#6BCB77"}`, borderRadius: 16, padding: "16px 20px", boxShadow: `4px 4px 0 ${c.status === "pending" ? "#FF6B6B" : "#6BCB77"}`, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                    {/* Status badge */}
                    <div style={{ minWidth: 90, textAlign: "center", background: c.status === "pending" ? "#FF6B6B" : "#6BCB77", border: "2px solid #1a1a1a", borderRadius: 8, padding: "4px 10px" }}>
                      <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 11, color: "#fff", margin: 0 }}>{c.status.toUpperCase()}</p>
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 15, margin: "0 0 2px" }}>
                        {c.wolf.toLocaleString()} WOLF → {Number(c.battle).toFixed(4)} $BATTLE
                      </p>
                      <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#666", margin: 0 }}>
                        👤 {c.username} · 📧 {c.email}
                      </p>
                      <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 12, color: "#888", margin: "2px 0 0" }}>
                        🕐 {dateStr(c.date)}
                      </p>
                    </div>
                    {/* Wallet */}
                    <div style={{ minWidth: 160 }}>
                      <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 11, color: "#888", margin: "0 0 2px" }}>SEND TO WALLET:</p>
                      <p style={{ fontFamily: "monospace", fontSize: 13, color: c.wallet ? "#1a1a1a" : "#FF6B6B", margin: 0, wordBreak: "break-all" }}>
                        {c.wallet || "⚠️ NO WALLET SET"}
                      </p>
                    </div>
                    {/* Action */}
                    {c.status === "pending" && c.userId && (
                      <button onClick={() => markDone(c.userId!, c.id)}
                        style={{ background: "#6BCB77", border: "2.5px solid #1a1a1a", borderRadius: 10, padding: "8px 16px", fontFamily: "Bungee,sans-serif", fontSize: 12, cursor: "pointer", boxShadow: "2px 2px 0 #1a1a1a", color: "#1a1a1a", display: "flex", alignItems: "center", gap: 6 }}>
                        <Check size={14} /> MARK DONE
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ USERS TAB ═══════════════ */}
        {tab === "users" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 16, margin: 0 }}>👥 ALL USERS ({users.length})</p>
              {users.length > 0 && (
                <button onClick={exportUsersCsv} style={{ background: "#6BCB77", border: "2px solid #1a1a1a", borderRadius: 10, padding: "7px 16px", fontFamily: "Bungee,sans-serif", fontSize: 12, cursor: "pointer", boxShadow: "2px 2px 0 #1a1a1a", color: "#1a1a1a", display: "flex", alignItems: "center", gap: 6 }}>
                  <Download size={14} /> EXPORT CSV
                </button>
              )}
            </div>

            {users.length === 0 ? (
              <Card><div style={{ textAlign: "center", padding: "40px 0" }}><div style={{ fontSize: 56 }}>👥</div><p style={{ fontFamily: "Bungee,sans-serif", fontSize: 18 }}>NO USERS YET</p></div></Card>
            ) : (
              <Card style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#1a1a1a" }}>
                        {["USERNAME","EMAIL","WOLF","$BATTLE REQ","GAMES","MINED","STREAK","WALLET"].map(h => (
                          <th key={h} style={{ padding: "12px 14px", fontFamily: "Bungee,sans-serif", fontSize: 11, color: "#FFD93D", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...users].sort((a,b) => b.wolf-a.wolf).map((u, i) => {
                        const userBattle = allConversions.filter(c => c.userId === u.id).reduce((s,c)=>s+c.battle,0);
                        return (
                          <tr key={u.id} style={{ borderBottom: "1.5px solid #eee", background: i%2===0?"#fff":"#FFFBF0" }}>
                            <td style={{ padding: "10px 14px", fontFamily: "Bungee,sans-serif", fontSize: 13 }}>{u.username}</td>
                            <td style={{ padding: "10px 14px", fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#666" }}>{u.email}</td>
                            <td style={{ padding: "10px 14px", fontFamily: "Bungee,sans-serif", fontSize: 13, color: "#6BCB77" }}>{fmt(u.wolf)}</td>
                            <td style={{ padding: "10px 14px", fontFamily: "Bungee,sans-serif", fontSize: 13, color: "#A29BFE" }}>{userBattle.toFixed(4)}</td>
                            <td style={{ padding: "10px 14px", fontFamily: "Fredoka,sans-serif", fontSize: 13 }}>{u.gameHistory?.length||0}</td>
                            <td style={{ padding: "10px 14px", fontFamily: "Fredoka,sans-serif", fontSize: 13 }}>{u.totalMined||0}</td>
                            <td style={{ padding: "10px 14px", fontFamily: "Fredoka,sans-serif", fontSize: 13 }}>
                              {u.dailyStreak ? `🔥 ${u.dailyStreak}d` : "—"}
                            </td>
                            <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: 12, color: u.wallet ? "#1a1a1a" : "#ccc" }}>{shortWallet(u.wallet)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ═══════════════ TRAFFIC TAB ═══════════════ */}
        {tab === "traffic" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>

            {/* Period stats */}
            <Card>
              <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 14, marginBottom: 14 }}>📅 PERIOD STATS</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Page views today",      value: fmt(eventsToday.length) },
                  { label: "Unique visitors today",  value: fmt(uniqueToday) },
                  { label: "Page views this week",   value: fmt(eventsWeek.length) },
                  { label: "Unique visitors week",   value: fmt(new Set(eventsWeek.map(e=>e.sid)).size) },
                  { label: "All-time page views",    value: fmt(events.length) },
                  { label: "All-time unique visitors",value: fmt(uniqueSids) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#FFFBF0", borderRadius: 8, border: "1.5px solid #eee" }}>
                    <span style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#666" }}>{label}</span>
                    <span style={{ fontFamily: "Bungee,sans-serif", fontSize: 14, color: "#4CC9F0" }}>{value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top pages */}
            <Card>
              <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 14, marginBottom: 14 }}>🗂️ TOP PAGES (all time)</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {topPages.map(([page, count]) => (
                  <div key={page}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#1a1a1a" }}>{PAGE_LABELS[page] || page}</span>
                      <span style={{ fontFamily: "Bungee,sans-serif", fontSize: 12, color: "#4CC9F0" }}>{fmt(count)}</span>
                    </div>
                    <div style={{ background: "#f0f0f0", borderRadius: 6, height: 7, overflow: "hidden" }}>
                      <div style={{ width: `${(count / (topPages[0]?.[1] || 1)) * 100}%`, background: "#4CC9F0", height: "100%", borderRadius: 6 }} />
                    </div>
                  </div>
                ))}
                {topPages.length === 0 && <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#aaa" }}>No data yet — visit some pages first</p>}
              </div>
            </Card>

            {/* Hourly today (last 24h) */}
            <Card style={{ gridColumn: "1 / -1" }}>
              <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 14, marginBottom: 14 }}>📊 HOURLY PAGE VIEWS (last 24h)</p>
              {(() => {
                const hours: number[] = Array(24).fill(0);
                const now2 = Date.now();
                for (const e of events) {
                  const age = now2 - e.ts;
                  if (age > msDay) continue;
                  const hr = 23 - Math.floor(age / 3600000);
                  if (hr >= 0 && hr < 24) hours[hr]++;
                }
                const max = Math.max(...hours, 1);
                return (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 80 }}>
                    {hours.map((count, i) => (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                        <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                          <div style={{ width: "100%", background: count > 0 ? "#4CC9F0" : "#f0f0f0", borderRadius: "3px 3px 0 0", height: `${(count / max) * 100}%`, minHeight: count > 0 ? 4 : 0, transition: "height 0.3s" }} title={`${count} views`} />
                        </div>
                        {i % 4 === 0 && <div style={{ fontFamily: "Fredoka,sans-serif", fontSize: 9, color: "#aaa", marginTop: 2 }}>{23 - i}h</div>}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </Card>
          </div>
        )}

        {/* ═══════════════ ACTIVITY TAB ═══════════════ */}
        {tab === "activity" && (
          <div>
            <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 16, marginBottom: 14 }}>⏱️ RECENT ACTIVITY (last 30 events)</p>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              {recentEvents.length === 0
                ? <div style={{ textAlign: "center", padding: "40px 0" }}><p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 14, color: "#aaa" }}>No activity yet</p></div>
                : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#1a1a1a" }}>
                          {["TIME","PAGE","SESSION","USER"].map(h => (
                            <th key={h} style={{ padding: "10px 14px", fontFamily: "Bungee,sans-serif", fontSize: 11, color: "#FFD93D", textAlign: "left" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {recentEvents.map((e: PageEvent, i) => {
                          const user2 = e.uid ? users.find(u => u.id === e.uid) : null;
                          const age = Math.round((Date.now() - e.ts) / 1000);
                          return (
                            <tr key={i} style={{ borderBottom: "1.5px solid #eee", background: i%2===0?"#fff":"#FFFBF0" }}>
                              <td style={{ padding: "8px 14px", fontFamily: "Fredoka,sans-serif", fontSize: 12, color: "#888" }}>
                                {age < 60 ? `${age}s ago` : age < 3600 ? `${Math.round(age/60)}m ago` : new Date(e.ts).toLocaleTimeString("nl-NL")}
                              </td>
                              <td style={{ padding: "8px 14px", fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#1a1a1a" }}>
                                {PAGE_LABELS[e.page] || e.page}
                              </td>
                              <td style={{ padding: "8px 14px", fontFamily: "monospace", fontSize: 11, color: "#aaa" }}>
                                {e.sid.slice(0, 8)}…
                              </td>
                              <td style={{ padding: "8px 14px", fontFamily: "Fredoka,sans-serif", fontSize: 13 }}>
                                {user2 ? <span style={{ color: "#6BCB77", fontWeight: 700 }}>👤 {user2.username}</span> : <span style={{ color: "#ccc" }}>—</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              }
            </Card>
          </div>
        )}

        <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 11, color: "#ccc", textAlign: "center", marginTop: 32 }}>
          VELOXFI ADMIN · CONFIDENTIAL · DO NOT SHARE
        </p>
      </div>
    </div>
  );
}
