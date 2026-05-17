import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";

const ADMIN_PW = "veloxfi2025";

interface AdminSupply {
  cap: number;
  distributed: number;
  remaining: number;
  percentUsed: number;
  waitlistCount: number;
  waitlistBattleSum: number;
}

interface WaitlistEntry {
  id: number;
  username: string;
  wolfAmount: number;
  battleAmount: number;
  walletAddress: string | null;
  requestedAt: string;
  fulfilledAt: string | null;
}

function adminHeaders(): HeadersInit {
  return { "Content-Type": "application/json", "x-admin-password": ADMIN_PW };
}

function fmtBattle(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(2);
}

function useAdminSupply() {
  const [data, setData] = useState<AdminSupply | null>(null);
  const refresh = () => fetch("/api/veloxfi/admin/supply", { headers: adminHeaders() }).then(r => r.json()).then(setData).catch(() => {});
  useEffect(() => { refresh(); const id = setInterval(refresh, 30_000); return () => clearInterval(id); }, []);
  return { supply: data, refresh };
}

function useAdminWaitlist() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const refresh = () => fetch("/api/veloxfi/admin/waitlist", { headers: adminHeaders() }).then(r => r.json()).then(setEntries).catch(() => {});
  useEffect(() => { refresh(); const id = setInterval(refresh, 30_000); return () => clearInterval(id); }, []);
  return { entries, refresh };
}

interface AdminUser {
  username:          string;
  email:             string;
  tokens:            number;
  wolf:              number;
  createdAt:         string;
  walletAddress:     string | null;
  claimedAt:         string | null;
  totalBattles:      number;
  totalTokensEarned: number;
}

interface AdminStats {
  totalUsers:     number;
  battlesAllTime: number;
  tokensAllTime:  number;
  battlesToday:   number;
  tokensToday:    number;
  recentBattles:  any[];
  users:          AdminUser[];
  dailyBattles:   { date: string; count: number }[];
}

function useAdminStats() {
  const [data, setData] = useState<AdminStats | null>(null);
  const refresh = () => fetch("/api/veloxfi/admin/stats", { headers: adminHeaders() }).then(r => r.json()).then(setData).catch(() => {});
  useEffect(() => { refresh(); const id = setInterval(refresh, 30_000); return () => clearInterval(id); }, []);
  return { stats: data, refresh };
}

interface AdminClaim {
  id:           number;
  username:     string;
  walletAddress: string;
  amount:       number;
  requestedAt:  string;
  paidAt:       string | null;
}

function useAdminClaims() {
  const [claims, setClaims] = useState<AdminClaim[]>([]);
  const refresh = () => fetch("/api/veloxfi/admin/claims", { headers: adminHeaders() }).then(r => r.json()).then(setClaims).catch(() => {});
  useEffect(() => { refresh(); const id = setInterval(refresh, 30_000); return () => clearInterval(id); }, []);
  return { claims, refresh };
}

function shortAddr(addr: string | null | undefined): string {
  if (!addr || addr.length < 10) return addr ?? "—";
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

function relTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const diff = Math.max(0, Date.now() - then);
  const s = Math.floor(diff / 1000);
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function AdminTabs({ tab, setTab }: { tab: string; setTab: (v: string) => void }) {
  const { stats } = useAdminStats();
  const userLabel = stats ? `Users · ${stats.totalUsers.toLocaleString()}` : "Users";
  return (
    <div className="tabs" style={{ width: "auto" }}>
      {[["overview", "Overview"], ["users", userLabel], ["pool", "Mining pool"], ["tx", "Transactions"]].map(([id, label]) => (
        <div key={id} className={`tab${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>{label}</div>
      ))}
    </div>
  );
}

function KpiCard({ label, value, sub, color, down }: { label: string; value: string; sub: string; color: string; down?: boolean }) {
  return (
    <div className="card">
      <div className="stat-label">{label}</div>
      <div className="display tabular" style={{ fontSize: 34, lineHeight: 1, marginTop: 4 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: down ? "var(--tomato)" : "#0E6A2A", marginTop: 4 }}>
        {down ? "↓" : "↑"} {sub}
      </div>
      <div style={{ height: 10, background: color, borderRadius: 999, marginTop: 10, opacity: 0.4 }} />
    </div>
  );
}

function SliderRow({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
        <span className="display tabular" style={{ fontSize: 14 }}>{value}</span>
      </div>
      <div style={{ position: "relative", height: 18 }}>
        <div className="bar thick" style={{ position: "absolute", inset: 0 }}>
          <div className="bar-fill" style={{ width: `${pct}%`, background: "var(--cyan)" }} />
        </div>
        <div style={{ position: "absolute", left: `calc(${pct}% - 9px)`, top: -3, width: 22, height: 22, borderRadius: 99, background: "var(--ink)", border: "2.5px solid var(--ink)", boxShadow: "inset 0 0 0 2px var(--paper)" }} />
      </div>
    </div>
  );
}

function AdminOverview() {
  const { supply } = useAdminSupply();
  const { stats } = useAdminStats();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div className="grid-4">
        <KpiCard
          label="Total holders"
          value={stats ? stats.totalUsers.toLocaleString() : "—"}
          sub={stats ? `${stats.battlesToday} battles today` : ""}
          color="var(--cyan)"
        />
        <KpiCard
          label="$BATTLE earned · all-time"
          value={stats ? fmtBattle(stats.tokensAllTime) : "—"}
          sub={stats ? `${stats.battlesAllTime.toLocaleString()} battles played` : ""}
          color="var(--magenta)"
        />
        <KpiCard
          label="Distributed · all-time"
          value={supply ? fmtBattle(supply.distributed) : "—"}
          sub={supply ? `${supply.percentUsed.toFixed(2)}% of pool used` : ""}
          color="var(--yellow)"
        />
        <KpiCard
          label="Pool remaining"
          value={supply ? fmtBattle(supply.remaining) : "—"}
          sub={supply ? `Waitlist: ${supply.waitlistCount} pending` : ""}
          color="var(--lime)"
          down={!!supply && supply.percentUsed >= 90}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="eyebrow">Battles · last 7 days</div>
              <h2 className="display" style={{ fontSize: 26, lineHeight: 1, marginTop: 4 }}>
                {stats ? `${stats.dailyBattles.reduce((s, d) => s + d.count, 0).toLocaleString()} battles` : "—"}
              </h2>
            </div>
          </div>
          <div style={{ marginTop: 18, height: 200 }}>
            {stats && stats.dailyBattles.length > 0 ? <DailyBattlesChart data={stats.dailyBattles} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--mute)" }}>No battle data yet.</div>}
          </div>
        </div>

        <div className="card cream">
          <div className="eyebrow">Pool health · live</div>
          <div className="display" style={{ fontSize: 32, lineHeight: 1, marginTop: 6 }}>
            {supply ? `${(100 - supply.percentUsed).toFixed(1)}% available` : "—"}
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 6 }}>
            {supply
              ? <>Distribution pool has <b>{fmtBattle(supply.remaining)} $BATTLE</b> remaining of <b>{fmtBattle(supply.cap)}</b> bought back on pump.fun.</>
              : "Loading pool data…"}
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="bar thick"><div className="bar-fill" style={{ width: `${Math.min(100, supply?.percentUsed ?? 0)}%`, background: (supply?.percentUsed ?? 0) >= 90 ? "var(--tomato)" : "var(--lime)" }} /></div>
          </div>
          {supply && supply.waitlistCount > 0 && (
            <div className="mono" style={{ fontSize: 11, marginTop: 12, color: "var(--tomato)" }}>
              ⚠ {supply.waitlistCount} request{supply.waitlistCount === 1 ? "" : "s"} on waitlist ({fmtBattle(supply.waitlistBattleSum)} $BATTLE pending)
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 14 }}>
          <div><div className="eyebrow">Recent battles</div><h2 style={{ fontSize: 22 }}>Last 10 fights</h2></div>
        </div>
        {stats && stats.recentBattles.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {stats.recentBattles.slice(0, 10).map((b: any) => (
              <div key={b.id} className="row" style={{ padding: "8px 10px", borderRadius: 8, background: "var(--cream)", gap: 10, fontSize: 13 }}>
                <span className="pill" style={{ fontSize: 10, background: b.result === "win" ? "var(--lime)" : "var(--tomato)", color: b.result === "win" ? "var(--ink)" : "white", padding: "2px 7px" }}>{b.result}</span>
                <div style={{ flex: 1, fontWeight: 600 }}>{b.username}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>+{b.tokensEarned} BATTLE</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>{relTime(b.createdAt)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "var(--mute)", textAlign: "center", padding: 14 }}>No battles played yet.</div>
        )}
      </div>
    </div>
  );
}

function DailyBattlesChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(1, ...data.map(d => d.count));
  const w = data.length > 0 ? 100 / data.length : 100;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      {[0, 25, 50, 75].map(y => <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(11,11,26,0.12)" strokeWidth="0.3" />)}
      {data.map((d, i) => {
        const h = (d.count / max) * 90;
        return <rect key={d.date} x={i * w + 0.5} y={100 - h} width={w - 1} height={h} fill="var(--cyan)" />;
      })}
    </svg>
  );
}

function AdminUsers() {
  const { stats, refresh } = useAdminStats();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "wallet" | "noClaim">("all");
  const [resetting, setResetting] = useState<string>("");

  const users = stats?.users ?? [];

  const filtered = users.filter(u => {
    if (search) {
      const q = search.toLowerCase();
      const matches = u.username.toLowerCase().includes(q) || (u.walletAddress ?? "").toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (filter === "wallet")  return !!u.walletAddress;
    if (filter === "noClaim") return !u.claimedAt;
    return true;
  });

  const withWallet = users.filter(u => !!u.walletAddress).length;
  const noClaim    = users.filter(u => !u.claimedAt).length;

  async function resetBalance(username: string) {
    if (!confirm(`Reset ${username}'s WOLF and $BATTLE balance to 0?\n\nThis cannot be undone.`)) return;
    setResetting(username);
    try {
      await fetch(`/api/veloxfi/admin/users/${encodeURIComponent(username)}/reset`, {
        method: "PUT",
        headers: adminHeaders(),
      });
      refresh();
    } finally {
      setResetting("");
    }
  }

  return (
    <div>
      <div className="row" style={{ marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <input
          className="input"
          placeholder="Search username, wallet or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        <div className="tabs">
          {([["all", `All · ${users.length}`], ["wallet", `Linked · ${withWallet}`], ["noClaim", `No claim · ${noClaim}`]] as const).map(([id, label]) => (
            <div key={id} className={`tab${filter === id ? " active" : ""}`} onClick={() => setFilter(id)}>{label}</div>
          ))}
        </div>
        <div className="grow" />
        <a className="btn sm" href="/api/veloxfi/admin/export-csv" target="_blank" rel="noreferrer">📋 Export CSV</a>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="row" style={{ padding: "12px 22px", borderBottom: "2.5px solid var(--ink)", background: "var(--cream)", fontSize: 11, color: "var(--mute)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, gap: 0 }}>
          <div style={{ flex: 1.5 }}>Wolf</div>
          <div style={{ flex: 1 }}>Wallet</div>
          <div style={{ width: 90, textAlign: "right" }}>WOLF</div>
          <div style={{ width: 110, textAlign: "right" }}>$BATTLE</div>
          <div style={{ width: 110 }}>Wallet status</div>
          <div style={{ width: 80, textAlign: "right" }}>Actions</div>
        </div>
        {stats == null ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--mute)" }}>Loading users…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--mute)" }}>No users match this filter.</div>
        ) : (
          filtered.map((u, i) => (
            <div key={u.username} className="row" style={{ padding: "12px 22px", borderBottom: i < filtered.length - 1 ? "1px dashed rgba(11,11,26,0.12)" : "none", background: "var(--paper)", gap: 0 }}>
              <div style={{ flex: 1.5, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, overflow: "hidden", border: "2px solid var(--ink)", background: "linear-gradient(140deg,#1a1d3a,#2b1a4d)", flexShrink: 0 }}>
                  <img src="/mascot.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis" }}>{u.username}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>joined {relTime(u.createdAt)}</div>
                </div>
              </div>
              <div style={{ flex: 1 }} className="mono">
                <span style={{ fontSize: 11, color: u.walletAddress ? "var(--ink-soft)" : "var(--mute)" }}>{shortAddr(u.walletAddress)}</span>
              </div>
              <div style={{ width: 90, textAlign: "right" }} className="mono">{(u.wolf ?? 0).toLocaleString()}</div>
              <div style={{ width: 110, textAlign: "right" }} className="display tabular">{(u.tokens ?? 0).toLocaleString()}</div>
              <div style={{ width: 110 }}>
                <span className="pill" style={{ fontSize: 10, background: u.walletAddress ? "var(--lime)" : "var(--cream)", padding: "2px 7px" }}>
                  {u.walletAddress ? "✓ linked" : "no wallet"}
                </span>
              </div>
              <div style={{ width: 80, textAlign: "right" }}>
                <button
                  className="btn sm"
                  style={{ background: "var(--tomato)", color: "white", fontSize: 11 }}
                  disabled={resetting === u.username}
                  onClick={() => resetBalance(u.username)}
                  title="Reset WOLF and $BATTLE to 0"
                >
                  {resetting === u.username ? "…" : "🗑 Reset"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="row" style={{ marginTop: 14, justifyContent: "space-between", fontSize: 12, color: "var(--mute)" }}>
        <span>Showing {filtered.length} of {users.length} wolves</span>
      </div>
    </div>
  );
}

function AdminPool() {
  const { supply, refresh: refreshSupply } = useAdminSupply();
  const { entries, refresh: refreshWaitlist } = useAdminWaitlist();
  const pending = entries.filter(e => !e.fulfilledAt);

  async function markFulfilled(id: number) {
    if (!confirm("Mark this waitlist entry as paid out?")) return;
    await fetch(`/api/veloxfi/admin/waitlist/${id}/fulfill`, { method: "PUT", headers: adminHeaders() });
    refreshWaitlist();
    refreshSupply();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Pool + waitlist summary */}
      <div className="grid-2">
        <div className="card ink" style={{ padding: 24 }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--cyan)", letterSpacing: 1.5 }}>DISTRIBUTION POOL</div>
          <div className="display tabular" style={{ fontSize: 48, color: "white", lineHeight: 1, marginTop: 6 }}>
            {supply ? fmtBattle(supply.remaining) : "—"} <span style={{ fontSize: 18, color: "var(--magenta)" }}>BATTLE left</span>
          </div>
          <div className="mono" style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>
            of {supply ? fmtBattle(supply.cap) : "—"} bought back on pump.fun
          </div>
          {supply && (
            <>
              <div className="bar thick" style={{ marginTop: 18, background: "rgba(255,255,255,0.08)" }}>
                <div
                  className="bar-fill"
                  style={{
                    width: `${Math.min(100, supply.percentUsed)}%`,
                    background: supply.remaining <= 0 ? "var(--tomato)" : supply.percentUsed >= 90 ? "var(--yellow)" : "var(--lime)",
                  }}
                />
              </div>
              <div className="row" style={{ justifyContent: "space-between", marginTop: 10 }}>
                <div className="mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
                  {supply.distributed.toLocaleString(undefined, { maximumFractionDigits: 2 })} distributed
                </div>
                <div className="mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
                  {supply.percentUsed.toFixed(2)}% used
                </div>
              </div>
            </>
          )}
        </div>

        <div className="card cream" style={{ padding: 24 }}>
          <div className="eyebrow">Waitlist</div>
          <div className="display tabular" style={{ fontSize: 48, lineHeight: 1, marginTop: 6 }}>
            {supply?.waitlistCount ?? 0} <span style={{ fontSize: 18, color: "var(--magenta)" }}>pending</span>
          </div>
          <div className="mono" style={{ fontSize: 12, color: "var(--mute)", marginTop: 4 }}>
            Total owed: {supply ? supply.waitlistBattleSum.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "—"} $BATTLE
          </div>
          <div style={{ marginTop: 18, fontSize: 13, color: "var(--ink-soft)" }}>
            When the pool runs dry, conversion requests land here. Top up the pool by buying more $BATTLE on pump.fun, then pay out each entry from your wallet.
          </div>
          <div className="row" style={{ marginTop: 14, gap: 8 }}>
            <a href="https://pump.fun/coin/HAytudteqxtE4yFUF9Y8SN7LJz7VeCSERKVdwggDpump" target="_blank" rel="noreferrer" className="btn sm primary">Buy more on pump.fun</a>
            <button className="btn sm" onClick={() => { refreshSupply(); refreshWaitlist(); }}>Refresh</button>
          </div>
        </div>
      </div>

      {/* Waitlist entries */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="row" style={{ padding: "14px 22px", borderBottom: "2.5px solid var(--ink)", background: "var(--cream)" }}>
          <div className="display" style={{ fontSize: 22 }}>Waitlist queue</div>
          <div className="grow" />
          <span className="pill" style={{ background: pending.length > 0 ? "var(--yellow)" : "var(--lime)", fontSize: 11 }}>
            {pending.length} pending
          </span>
        </div>
        {entries.length === 0 ? (
          <div style={{ padding: 28, textAlign: "center", color: "var(--mute)", fontSize: 13 }}>
            No waitlist entries — pool is healthy.
          </div>
        ) : (
          entries.map((e, i) => (
            <div key={e.id} className="row" style={{ padding: "12px 22px", borderBottom: i < entries.length - 1 ? "1px dashed rgba(11,11,26,0.12)" : "none", gap: 14, flexWrap: "wrap" }}>
              <div style={{ flex: 1.5, minWidth: 120 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{e.username}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>
                  {new Date(e.requestedAt).toLocaleString()}
                </div>
              </div>
              <div style={{ flex: 2, minWidth: 180 }} className="mono">
                <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                  {e.walletAddress ? `${e.walletAddress.slice(0, 6)}…${e.walletAddress.slice(-4)}` : <em style={{ color: "var(--tomato)" }}>no wallet</em>}
                </span>
              </div>
              <div style={{ width: 110, textAlign: "right" }} className="display tabular">
                {e.wolfAmount.toLocaleString()} <span style={{ fontSize: 10, color: "var(--mute)" }}>WOLF</span>
              </div>
              <div style={{ width: 130, textAlign: "right" }} className="display tabular">
                {e.battleAmount.toFixed(4)} <span style={{ fontSize: 10, color: "var(--magenta)" }}>BATTLE</span>
              </div>
              <div style={{ width: 130, textAlign: "right" }}>
                {e.fulfilledAt ? (
                  <span className="pill" style={{ background: "var(--lime)", fontSize: 10 }}>✓ Paid out</span>
                ) : (
                  <button className="btn sm primary" onClick={() => markFulfilled(e.id)}>Mark paid</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AdminTx() {
  const { claims, refresh } = useAdminClaims();

  async function markPaid(id: number) {
    if (!confirm("Mark this claim as paid?")) return;
    await fetch(`/api/veloxfi/admin/claims/${id}/paid`, { method: "PUT", headers: adminHeaders() });
    refresh();
  }

  async function markUnpaid(id: number) {
    if (!confirm("Revert this claim to pending?")) return;
    await fetch(`/api/veloxfi/admin/claims/${id}/paid`, { method: "DELETE", headers: adminHeaders() });
    refresh();
  }

  const pending = claims.filter(c => !c.paidAt);
  const paid    = claims.filter(c => !!c.paidAt);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 22px", borderBottom: "2.5px solid var(--ink)", background: "var(--cream)" }} className="row">
          <div>
            <div className="eyebrow">$BATTLE claim requests</div>
            <div className="display" style={{ fontSize: 22, marginTop: 2 }}>{pending.length} pending · {paid.length} paid</div>
          </div>
          <div className="grow" />
          <span className="pill dot">Live</span>
        </div>
        {claims.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--mute)", fontSize: 13 }}>No claims requested yet.</div>
        ) : claims.map((c, i) => (
          <div key={c.id} className="row" style={{ padding: "12px 22px", borderBottom: i < claims.length - 1 ? "1px dashed rgba(11,11,26,0.12)" : "none", gap: 14, background: c.paidAt ? "var(--cream-soft)" : "var(--paper)" }}>
            <span className="pill" style={{ background: c.paidAt ? "var(--lime)" : "var(--yellow)", fontSize: 10, padding: "2px 8px", minWidth: 60, justifyContent: "center" }}>
              {c.paidAt ? "PAID" : "PENDING"}
            </span>
            <div style={{ flex: 2, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{c.username}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>{shortAddr(c.walletAddress)}</div>
            </div>
            <div style={{ width: 110, textAlign: "right" }} className="display tabular">
              <span style={{ color: "#0E6A2A", fontSize: 13 }}>{c.amount.toLocaleString()} $BATTLE</span>
            </div>
            <div className="mono" style={{ width: 90, fontSize: 11, color: "var(--mute)", textAlign: "right" }}>{relTime(c.requestedAt)}</div>
            <div style={{ width: 100, textAlign: "right" }}>
              {c.paidAt
                ? <button className="btn sm ghost" onClick={() => markUnpaid(c.id)}>Revert</button>
                : <button className="btn sm primary" onClick={() => markPaid(c.id)}>Mark paid</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [pw, setPw] = useState("");
  const [unlocked, setUnlocked] = useState(() => {
    try { return sessionStorage.getItem("velox-admin") === "1"; } catch { return false; }
  });
  const [tab, setTab] = useState("overview");

  function handleUnlock() {
    if (pw === ADMIN_PW) {
      setUnlocked(true);
      try { sessionStorage.setItem("velox-admin", "1"); } catch {}
    }
  }

  function handleLock() {
    setUnlocked(false);
    try { sessionStorage.removeItem("velox-admin"); } catch {}
  }

  if (!unlocked) {
    return (
      <div className="app-shell">
        <Sidebar />
        <main style={{ minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="card" style={{ width: 420, padding: 28 }}>
            <div className="row" style={{ gap: 10 }}>
              <div style={{ width: 44, height: 44, background: "var(--ink)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "2.5px solid var(--ink)", fontSize: 20 }}>🔒</div>
              <div>
                <div className="display" style={{ fontSize: 22, lineHeight: 1 }}>Admin only</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--mute)", marginTop: 3 }}>VELOXFI · /admin</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "var(--mute)", marginTop: 14 }}>
              Restricted area. Enter the admin password to manage users, mining pool, prize pool and game balance.
            </p>
            <input
              className="input"
              type="password"
              placeholder="Admin password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              style={{ marginTop: 14 }}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            />
            <button className="btn lg ink" style={{ width: "100%", marginTop: 12, justifyContent: "center" }} onClick={handleUnlock}>
              🛡 Unlock
            </button>
            <div className="mono" style={{ fontSize: 10, color: "var(--mute)", marginTop: 12, textAlign: "center" }}>All admin actions are logged.</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ minWidth: 0 }}>
        <div className="app-main" style={{ display: "flex", flexDirection: "column", gap: 22 }}>

          {/* Top bar */}
          <div className="topbar">
            <div className="crumb">Home / <b>Admin</b></div>
            <div className="display" style={{ fontSize: 28, lineHeight: 1, flex: 1 }}>Pack control.</div>
            <span className="pill dot">SYSTEMS NOMINAL</span>
            <button className="btn sm" onClick={handleLock}>Sign out</button>
          </div>

          {/* Tabs */}
          <AdminTabs tab={tab} setTab={setTab} />

          {tab === "overview" && <AdminOverview />}
          {tab === "users" && <AdminUsers />}
          {tab === "pool" && <AdminPool />}
          {tab === "tx" && <AdminTx />}

        </div>
      </main>
    </div>
  );
}
