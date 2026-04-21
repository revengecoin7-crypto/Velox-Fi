import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, RefreshCw, LogOut, Download, Check, X, Users, ArrowRightLeft, TrendingUp, Activity } from "lucide-react";
import { getEvents, getLiveSessions, type PageEvent } from "@/lib/analytics";

// ── constants ──────────────────────────────────────────────
const AUTH_KEY = "vfx_admin_auth";
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
const ADMIN_PW = "veloxfi2025";

// ── types ──────────────────────────────────────────────────
interface ApiUser {
  username: string; email: string; tokens: number; createdAt: string;
  walletAddress: string | null; claimedAt: string | null;
  totalBattles: number; totalTokensEarned: number; wolf?: number;
}
interface ApiClaim {
  id: number; username: string; walletAddress: string; amount: number;
  requestedAt: string; paidAt: string | null;
}
interface AdminStats {
  totalUsers: number; battlesAllTime: number; tokensAllTime: number;
  battlesToday: number; tokensToday: number;
  users: ApiUser[]; recentBattles: unknown[]; dailyBattles: unknown[];
}

// ── helpers ────────────────────────────────────────────────
function fmt(n: number) { return n.toLocaleString(); }
function dateStr(iso: string) { try { return new Date(iso).toLocaleString("nl-NL"); } catch { return iso; } }
function shortWallet(w: string | null) {
  if (!w) return "—";
  return w.length > 12 ? `${w.slice(0, 6)}…${w.slice(-4)}` : w;
}
function todayStr() { return new Date().toISOString().slice(0, 10); }

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<{ ok: boolean; data: T }> {
  try {
    const r = await fetch(`${API_BASE}/api${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": ADMIN_PW,
        ...(options.headers ?? {}),
      },
    });
    const data = await r.json();
    return { ok: r.ok, data };
  } catch {
    return { ok: false, data: null as unknown as T };
  }
}

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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { ok } = await adminFetch("/veloxfi/admin/verify", {
      method: "POST",
      headers: { "x-admin-password": pw },
      body: JSON.stringify({ password: pw }),
    });
    setLoading(false);
    if (ok) { sessionStorage.setItem(AUTH_KEY, "1"); onLogin(); }
    else setErr("Incorrect password");
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
  const [stats,  setStats]  = useState<AdminStats | null>(null);
  const [claims, setClaims] = useState<ApiClaim[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [tab, setTab] = useState<"overview" | "claims" | "users" | "traffic" | "activity">("overview");

  const events    = getEvents();
  const liveSess  = getLiveSessions();
  const liveCount = Object.keys(liveSess).length;
  const now       = Date.now();
  const msDay     = 86400000;
  const msWeek    = 7 * msDay;
  const eventsToday = events.filter(e => now - e.ts < msDay);
  const eventsWeek  = events.filter(e => now - e.ts < msWeek);
  const uniqueSids  = new Set(events.map(e => e.sid)).size;
  const uniqueToday = new Set(eventsToday.map(e => e.sid)).size;
  const recentEvents = [...events].reverse().slice(0, 30);
  const pageBreakdown: Record<string, number> = {};
  for (const e of events) pageBreakdown[e.page] = (pageBreakdown[e.page] || 0) + 1;
  const topPages = Object.entries(pageBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 12);

  const loadData = useCallback(async () => {
    if (!authed) return;
    setLoadingData(true);
    const [statsRes, claimsRes] = await Promise.all([
      adminFetch<AdminStats>("/veloxfi/admin/stats"),
      adminFetch<ApiClaim[]>("/veloxfi/admin/claims"),
    ]);
    if (statsRes.ok && statsRes.data) setStats(statsRes.data);
    if (claimsRes.ok && Array.isArray(claimsRes.data)) setClaims(claimsRes.data);
    setLoadingData(false);
  }, [authed]);

  useEffect(() => {
    void loadData();
    const id = setInterval(() => void loadData(), 30000);
    return () => clearInterval(id);
  }, [loadData]);

  async function markPaid(id: number) {
    await adminFetch(`/veloxfi/admin/claims/${id}/paid`, { method: "PUT" });
    void loadData();
  }

  async function markUnpaid(id: number) {
    await adminFetch(`/veloxfi/admin/claims/${id}/paid`, { method: "DELETE" });
    void loadData();
  }

  function exportClaimsCsv() {
    const header = ["ID", "Username", "Wallet", "Amount (WOLF)", "Requested", "Paid"];
    const rows = claims.map(c => [
      c.id, c.username, c.walletAddress, c.amount,
      dateStr(c.requestedAt), c.paidAt ? dateStr(c.paidAt) : "PENDING",
    ]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `veloxfi-claims-${todayStr()}.csv`;
    a.click();
  }

  function exportUsersCsv() {
    if (!stats?.users) return;
    const header = ["Username", "Email", "Tokens ($BATTLE)", "Wallet", "Created", "Battles", "Tokens Earned"];
    const rows = stats.users.map(u => [
      u.username, u.email, u.tokens.toFixed(4), u.walletAddress || "",
      dateStr(u.createdAt), u.totalBattles, u.totalTokensEarned,
    ]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `veloxfi-users-${todayStr()}.csv`;
    a.click();
  }

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const pendingClaims = claims.filter(c => !c.paidAt);
  const users = stats?.users ?? [];

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
      <div style={{ background: "#1a1a1a", borderBottom: "2.5px solid #1a1a1a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>🛡️</span>
            <div>
              <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 18, color: "#FFD93D", margin: 0 }}>VELOXFI ADMIN</p>
              <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 12, color: "#666", margin: 0 }}>Dashboard · Live database data</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#6BCB77", border: "2px solid #6BCB77", borderRadius: 20, padding: "5px 14px" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
              <span style={{ fontFamily: "Bungee,sans-serif", fontSize: 12, color: "#fff" }}>{liveCount} LIVE</span>
            </div>
            <button onClick={() => void loadData()} disabled={loadingData}
              style={{ background: "#FFD93D", border: "2px solid #FFD93D", borderRadius: 10, padding: "6px 14px", fontFamily: "Bungee,sans-serif", fontSize: 12, cursor: "pointer", color: "#1a1a1a", display: "flex", alignItems: "center", gap: 6 }}>
              <RefreshCw size={14} /> {loadingData ? "…" : "REFRESH"}
            </button>
            <button onClick={() => { sessionStorage.removeItem(AUTH_KEY); setAuthed(false); }}
              style={{ background: "#FF6B6B", border: "2px solid #FF6B6B", borderRadius: 10, padding: "6px 14px", fontFamily: "Bungee,sans-serif", fontSize: 12, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
              <LogOut size={14} /> LOGOUT
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>

        {/* ── TOP STATS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
          <StatTile label="Live Visitors"    value={liveCount}           sub="Right now on site"       color="#6BCB77" icon={<Activity size={20} />} />
          <StatTile label="Visitors Today"   value={uniqueToday}         sub="Unique sessions"         color="#4CC9F0" icon={<Eye size={20} />} />
          <StatTile label="Total Visitors"   value={fmt(uniqueSids)}     sub="All-time unique"         color="#A29BFE" icon={<Users size={20} />} />
          <StatTile label="Page Views"       value={fmt(events.length)}  sub={`Today: ${eventsToday.length}`} color="#FF9F43" icon={<TrendingUp size={20} />} />
          <StatTile label="Registered Users" value={stats?.totalUsers ?? "—"} sub="In database"      color="#FFD93D" icon={<Users size={20} />} />
          <StatTile label="Battles All Time" value={stats ? fmt(stats.battlesAllTime) : "—"} sub={`Today: ${stats?.battlesToday ?? 0}`} color="#6BCB77" icon={<Activity size={20} />} />
          <StatTile label="Pending Claims"   value={pendingClaims.length} sub="Awaiting WOLF send"   color="#FF6B6B" icon={<ArrowRightLeft size={20} />} />
          <StatTile label="Total Claims"     value={claims.length}       sub="All WOLF claims"        color="#A29BFE" icon={<ArrowRightLeft size={20} />} />
        </div>

        {/* ── PENDING CLAIMS ALERT ── */}
        {pendingClaims.length > 0 && (
          <div style={{ background: "#FF6B6B", border: "2.5px solid #1a1a1a", borderRadius: 16, padding: "14px 20px", marginBottom: 20, boxShadow: "4px 4px 0 #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>⚠️</span>
              <div>
                <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 15, color: "#fff", margin: 0 }}>{pendingClaims.length} CLAIM{pendingClaims.length !== 1 ? "S" : ""} NEED ATTENTION</p>
                <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "rgba(255,255,255,0.8)", margin: 0 }}>Send WOLF tokens and mark as paid</p>
              </div>
            </div>
            <button onClick={() => setTab("claims")} style={{ background: "#fff", border: "2px solid #1a1a1a", borderRadius: 10, padding: "8px 18px", fontFamily: "Bungee,sans-serif", fontSize: 13, cursor: "pointer", color: "#FF6B6B" }}>
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
                  <span style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13 }}>{PAGE_LABELS[s.page] || s.page}</span>
                  <span style={{ fontFamily: "Fredoka,sans-serif", fontSize: 11, color: "#aaa" }}>{Math.round((Date.now() - s.ts) / 1000)}s ago</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TABS ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
          <button onClick={() => setTab("overview")} style={tabStyle(tab === "overview", "#FFD93D")}>📊 Overview</button>
          <button onClick={() => setTab("claims")}   style={tabStyle(tab === "claims",   "#FF6B6B")}>🪙 Claims {pendingClaims.length > 0 && `(${pendingClaims.length})`}</button>
          <button onClick={() => setTab("users")}    style={tabStyle(tab === "users",    "#6BCB77")}>👥 Users</button>
          <button onClick={() => setTab("traffic")}  style={tabStyle(tab === "traffic",  "#4CC9F0")}>📈 Traffic</button>
          <button onClick={() => setTab("activity")} style={tabStyle(tab === "activity", "#A29BFE")}>⏱️ Activity</button>
        </div>

        {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>

            <Card>
              <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 14, marginBottom: 14 }}>📊 PLATFORM STATS</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Total registered users", value: stats?.totalUsers ?? "—" },
                  { label: "Battles all time",        value: stats ? fmt(stats.battlesAllTime) : "—" },
                  { label: "Battles today",           value: stats?.battlesToday ?? "—" },
                  { label: "Tokens distributed",      value: stats ? fmt(stats.tokensAllTime) : "—" },
                  { label: "Tokens today",            value: stats?.tokensToday ?? "—" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#FFFBF0", borderRadius: 8, border: "1.5px solid #eee" }}>
                    <span style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#666" }}>{label}</span>
                    <span style={{ fontFamily: "Bungee,sans-serif", fontSize: 14, color: "#1a1a1a" }}>{value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 14, marginBottom: 14 }}>🥇 TOP TOKEN HOLDERS</p>
              {users.length === 0
                ? <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#aaa" }}>No users yet</p>
                : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[...users].sort((a, b) => b.tokens - a.tokens).slice(0, 5).map((u, i) => (
                      <div key={u.username} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: i === 0 ? "#FFFBF0" : "transparent", borderRadius: 8, border: i === 0 ? "1.5px solid #FFD93D" : "none" }}>
                        <span style={{ fontFamily: "Bungee,sans-serif", fontSize: 14, color: ["#FFD93D", "#888", "#CD7F32"][i] || "#aaa", minWidth: 20 }}>#{i + 1}</span>
                        <span style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, flex: 1, fontWeight: 700 }}>{u.username}</span>
                        <span style={{ fontFamily: "Bungee,sans-serif", fontSize: 13, color: "#6BCB77" }}>{u.tokens.toFixed(2)} $B</span>
                      </div>
                    ))}
                  </div>
                )
              }
            </Card>

            <Card>
              <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 14, marginBottom: 14 }}>🪙 CLAIMS SUMMARY</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Total claims",           value: claims.length },
                  { label: "Pending",                value: pendingClaims.length, color: "#FF6B6B" },
                  { label: "Paid",                   value: claims.filter(c => c.paidAt).length, color: "#6BCB77" },
                  { label: "Total WOLF claimed",     value: fmt(claims.reduce((s, c) => s + c.amount, 0)) },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#FFFBF0", borderRadius: 8, border: "1.5px solid #eee" }}>
                    <span style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#666" }}>{label}</span>
                    <span style={{ fontFamily: "Bungee,sans-serif", fontSize: 14, color: color || "#1a1a1a" }}>{value}</span>
                  </div>
                ))}
              </div>
            </Card>

          </div>
        )}

        {/* ═══════════════ CLAIMS TAB ═══════════════ */}
        {tab === "claims" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 16, margin: 0 }}>
                🪙 ALL CLAIMS ({claims.length})
                {pendingClaims.length > 0 && <span style={{ marginLeft: 10, color: "#FF6B6B" }}>· {pendingClaims.length} PENDING</span>}
              </p>
              {claims.length > 0 && (
                <button onClick={exportClaimsCsv} style={{ background: "#4CC9F0", border: "2px solid #1a1a1a", borderRadius: 10, padding: "7px 16px", fontFamily: "Bungee,sans-serif", fontSize: 12, cursor: "pointer", boxShadow: "2px 2px 0 #1a1a1a", color: "#1a1a1a", display: "flex", alignItems: "center", gap: 6 }}>
                  <Download size={14} /> EXPORT CSV
                </button>
              )}
            </div>

            {claims.length === 0 ? (
              <Card><div style={{ textAlign: "center", padding: "40px 0" }}><div style={{ fontSize: 56 }}>🪙</div><p style={{ fontFamily: "Bungee,sans-serif", fontSize: 18 }}>NO CLAIMS YET</p></div></Card>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {claims.map(c => (
                  <div key={c.id} style={{ background: "#fff", border: `2.5px solid ${!c.paidAt ? "#FF6B6B" : "#6BCB77"}`, borderRadius: 16, padding: "16px 20px", boxShadow: `4px 4px 0 ${!c.paidAt ? "#FF6B6B" : "#6BCB77"}`, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                    <div style={{ minWidth: 90, textAlign: "center", background: !c.paidAt ? "#FF6B6B" : "#6BCB77", border: "2px solid #1a1a1a", borderRadius: 8, padding: "4px 10px" }}>
                      <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 11, color: "#fff", margin: 0 }}>{c.paidAt ? "PAID" : "PENDING"}</p>
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 15, margin: "0 0 2px" }}>
                        {fmt(c.amount)} WOLF
                      </p>
                      <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#666", margin: 0 }}>👤 {c.username}</p>
                      <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 12, color: "#888", margin: "2px 0 0" }}>🕐 {dateStr(c.requestedAt)}</p>
                    </div>
                    <div style={{ minWidth: 160 }}>
                      <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 11, color: "#888", margin: "0 0 2px" }}>SEND TO WALLET:</p>
                      <p style={{ fontFamily: "monospace", fontSize: 12, color: "#1a1a1a", margin: 0, wordBreak: "break-all" }}>{c.walletAddress}</p>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {!c.paidAt ? (
                        <button onClick={() => void markPaid(c.id)} style={{ background: "#6BCB77", border: "2.5px solid #1a1a1a", borderRadius: 10, padding: "8px 14px", fontFamily: "Bungee,sans-serif", fontSize: 12, cursor: "pointer", boxShadow: "2px 2px 0 #1a1a1a", color: "#1a1a1a", display: "flex", alignItems: "center", gap: 5 }}>
                          <Check size={14} /> MARK PAID
                        </button>
                      ) : (
                        <button onClick={() => void markUnpaid(c.id)} style={{ background: "#f0f0f0", border: "2px solid #ccc", borderRadius: 10, padding: "8px 14px", fontFamily: "Bungee,sans-serif", fontSize: 12, cursor: "pointer", color: "#888", display: "flex", alignItems: "center", gap: 5 }}>
                          <X size={14} /> UNPAY
                        </button>
                      )}
                    </div>
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
                        {["USERNAME", "EMAIL", "$BATTLE", "WALLET", "REGISTERED", "BATTLES"].map(h => (
                          <th key={h} style={{ padding: "12px 14px", fontFamily: "Bungee,sans-serif", fontSize: 11, color: "#FFD93D", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...users].sort((a, b) => b.tokens - a.tokens).map((u, i) => (
                        <tr key={u.username} style={{ borderBottom: "1.5px solid #eee", background: i % 2 === 0 ? "#fff" : "#FFFBF0" }}>
                          <td style={{ padding: "10px 14px", fontFamily: "Bungee,sans-serif", fontSize: 13 }}>{u.username}</td>
                          <td style={{ padding: "10px 14px", fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#666" }}>{u.email}</td>
                          <td style={{ padding: "10px 14px", fontFamily: "Bungee,sans-serif", fontSize: 13, color: "#6BCB77" }}>{u.tokens.toFixed(4)}</td>
                          <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: 12, color: u.walletAddress ? "#1a1a1a" : "#ccc" }}>{shortWallet(u.walletAddress)}</td>
                          <td style={{ padding: "10px 14px", fontFamily: "Fredoka,sans-serif", fontSize: 12, color: "#888" }}>{dateStr(u.createdAt)}</td>
                          <td style={{ padding: "10px 14px", fontFamily: "Fredoka,sans-serif", fontSize: 13 }}>{u.totalBattles}</td>
                        </tr>
                      ))}
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
            <Card>
              <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 14, marginBottom: 14 }}>📅 PERIOD STATS</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Page views today",         value: fmt(eventsToday.length) },
                  { label: "Unique visitors today",    value: fmt(uniqueToday) },
                  { label: "Page views this week",     value: fmt(eventsWeek.length) },
                  { label: "Unique visitors week",     value: fmt(new Set(eventsWeek.map(e => e.sid)).size) },
                  { label: "All-time page views",      value: fmt(events.length) },
                  { label: "All-time unique visitors", value: fmt(uniqueSids) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#FFFBF0", borderRadius: 8, border: "1.5px solid #eee" }}>
                    <span style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#666" }}>{label}</span>
                    <span style={{ fontFamily: "Bungee,sans-serif", fontSize: 14, color: "#4CC9F0" }}>{value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 14, marginBottom: 14 }}>🗂️ TOP PAGES (all time)</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {topPages.map(([page, count]) => (
                  <div key={page}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13 }}>{PAGE_LABELS[page] || page}</span>
                      <span style={{ fontFamily: "Bungee,sans-serif", fontSize: 12, color: "#4CC9F0" }}>{fmt(count)}</span>
                    </div>
                    <div style={{ background: "#f0f0f0", borderRadius: 6, height: 7, overflow: "hidden" }}>
                      <div style={{ width: `${(count / (topPages[0]?.[1] || 1)) * 100}%`, background: "#4CC9F0", height: "100%", borderRadius: 6 }} />
                    </div>
                  </div>
                ))}
                {topPages.length === 0 && <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, color: "#aaa" }}>No data yet</p>}
              </div>
            </Card>

            <Card style={{ gridColumn: "1 / -1" }}>
              <p style={{ fontFamily: "Bungee,sans-serif", fontSize: 14, marginBottom: 14 }}>📊 HOURLY PAGE VIEWS (last 24h)</p>
              {(() => {
                const hours: number[] = Array(24).fill(0);
                for (const e of events) {
                  const age = now - e.ts;
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
                          <div style={{ width: "100%", background: count > 0 ? "#4CC9F0" : "#f0f0f0", borderRadius: "3px 3px 0 0", height: `${(count / max) * 100}%`, minHeight: count > 0 ? 4 : 0 }} title={`${count} views`} />
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
                          {["TIME", "PAGE", "SESSION"].map(h => (
                            <th key={h} style={{ padding: "10px 14px", fontFamily: "Bungee,sans-serif", fontSize: 11, color: "#FFD93D", textAlign: "left" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {recentEvents.map((e: PageEvent, i) => {
                          const age = Math.round((Date.now() - e.ts) / 1000);
                          return (
                            <tr key={i} style={{ borderBottom: "1.5px solid #eee", background: i % 2 === 0 ? "#fff" : "#FFFBF0" }}>
                              <td style={{ padding: "8px 14px", fontFamily: "Fredoka,sans-serif", fontSize: 12, color: "#888" }}>
                                {age < 60 ? `${age}s ago` : age < 3600 ? `${Math.round(age / 60)}m ago` : new Date(e.ts).toLocaleTimeString("nl-NL")}
                              </td>
                              <td style={{ padding: "8px 14px", fontFamily: "Fredoka,sans-serif", fontSize: 13 }}>{PAGE_LABELS[e.page] || e.page}</td>
                              <td style={{ padding: "8px 14px", fontFamily: "monospace", fontSize: 11, color: "#aaa" }}>{e.sid.slice(0, 8)}…</td>
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
