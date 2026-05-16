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

const USERS = [
  { name: "alphawolf.sol", wallet: "7VLx…vLNS", joined: "day 1", lvl: 47, mined: 184210, games: 412, balance: 241890, status: "online", flag: null },
  { name: "moonwolf42", wallet: "A99w…0pq2", joined: "day 3", lvl: 38, mined: 132420, games: 384, balance: 184210, status: "online", flag: null },
  { name: "pumpqueen.sol", wallet: "k9Lp…3cMx", joined: "day 4", lvl: 35, mined: 118200, games: 298, balance: 156440, status: "online", flag: null },
  { name: "fenrir77", wallet: "qM4z…7dRk", joined: "day 8", lvl: 33, mined: 88200, games: 412, balance: 132890, status: "idle", flag: "whale" },
  { name: "x4Fr_ks", wallet: "x4Fr…ksZZ", joined: "day 18", lvl: 8, mined: 1200, games: 12, balance: 800, status: "flagged", flag: "bot?" },
  { name: "cryptobaby", wallet: "rE1n…22Ph", joined: "day 12", lvl: 32, mined: 96100, games: 187, balance: 121200, status: "online", flag: null },
  { name: "fangmaster", wallet: "sR6h…91vQ", joined: "day 14", lvl: 30, mined: 64800, games: 524, balance: 118400, status: "idle", flag: null },
  { name: "shibakid", wallet: "tQ8m…14kR", joined: "day 6", lvl: 29, mined: 72100, games: 142, balance: 104200, status: "online", flag: null },
];

const ADMIN_TX = [
  { type: "CLAIM", color: "var(--lime)", label: "Daily claim — moonwolf42", from: "pool", to: "A99w…0pq2", amt: -428, hash: "7fX2k…Bb", time: "12s ago" },
  { type: "EMIT", color: "var(--cyan)", label: "Hourly mining emission", from: "mint", to: "pool", amt: 15400, hash: "k9Lp1…3c", time: "2m ago" },
  { type: "BURN", color: "var(--tomato)", label: "Game prize burn — Rocket", from: "pool", to: "burn", amt: -4820, hash: "qM4z9…7d", time: "8m ago" },
  { type: "WIN", color: "var(--magenta)", label: "Tetris payout — fenrir77", from: "pool", to: "qM4z…7dRk", amt: -320, hash: "rE1n2…22", time: "12m ago" },
  { type: "REF", color: "var(--yellow)", label: "Referral bonus pair", from: "pool", to: "tQ8m…/x4Fr…", amt: -500, hash: "sR6h6…91", time: "23m ago" },
  { type: "BUY", color: "var(--cyan)", label: "Treasury buyback", from: "jupiter", to: "pool", amt: 8200, hash: "tQ8m8…14", time: "1h ago" },
  { type: "CLAIM", color: "var(--lime)", label: "Daily claim — wolfkid", from: "pool", to: "7VLx…vLNS", amt: -428, hash: "uV3w3…5b", time: "1h ago" },
];

const GAMES_DATA = [
  { name: "Crypto Snake", tag: "SOLO", bg: "#C7F75F", dark: false, plays: 2140, payout: 42, edge: "—", boost: 1.5 },
  { name: "Battle Tetris", tag: "1v1", bg: "var(--magenta)", dark: true, plays: 1820, payout: 84, edge: "—", boost: 2.4 },
  { name: "Wolf Run", tag: "RUNNER", bg: "#FFB02E", dark: false, plays: 3140, payout: 56, edge: "—", boost: 1.8 },
  { name: "Rocket Miner", tag: "CRASH", bg: "#0B0B1A", dark: true, plays: 1240, payout: 124, edge: "12%", boost: 3.2 },
  { name: "Howl & Hunt", tag: "ROYALE", bg: "#1F1B2E", dark: true, plays: 480, payout: 240, edge: "8%", boost: 4.0, isNew: true },
  { name: "Pump Pulse", tag: "PREDICT", bg: "var(--cyan)", dark: false, plays: 920, payout: 180, edge: "10%", boost: 2.8, isNew: true },
];

function UserGrowthChart() {
  const data = [1200, 1320, 1480, 1540, 1820, 2100, 2440, 2820, 3210, 3580, 3920, 4320, 4820];
  const max = 5000;
  const pts = data.map((t, i) => `${(i / (data.length - 1)) * 100},${100 - (t / max) * 90}`).join(" L ");
  const area = `M 0,${100 - (data[0] / max) * 90} L ${pts} L 100,100 L 0,100 Z`;
  const line = `M 0,${100 - (data[0] / max) * 90} L ${pts}`;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="growGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75].map((y) => <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(11,11,26,0.12)" strokeWidth="0.2" />)}
      <path d={area} fill="url(#growGrad)" />
      <path d={line} stroke="var(--cyan)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
    </svg>
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
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div className="grid-4">
        <KpiCard label="Total holders" value="14,902" sub="+341 in 24h" color="var(--cyan)" />
        <KpiCard label="$BATTLE circulating" value="892M" sub="89.2% of max supply" color="var(--magenta)" />
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
              <div className="eyebrow">User growth · 30d</div>
              <h2 className="display" style={{ fontSize: 26, lineHeight: 1, marginTop: 4 }}>+4,820 wolves</h2>
            </div>
          </div>
          <div style={{ marginTop: 18, height: 200 }}><UserGrowthChart /></div>
        </div>

        <div className="card cream">
          <div className="eyebrow">Pool health · live</div>
          <div className="display" style={{ fontSize: 32, lineHeight: 1, marginTop: 6 }}>92% solid</div>
          <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 6 }}>
            Reserve covers another <b>5,400 days</b> at current burn. Next halving in 13d 04h.
          </div>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              ["Daily emission", "15,400 BATTLE", "var(--cyan)"],
              ["Game prize burn", "4,820 BATTLE", "var(--magenta)"],
              ["Referral payouts", "1,250 BATTLE", "var(--yellow)"],
              ["Pool deposits", "+8,200 BATTLE", "var(--lime)"],
            ].map(([n, v, c]) => (
              <div key={String(n)} className="row" style={{ justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed rgba(11,11,26,0.12)" }}>
                <div className="row" style={{ gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: String(c), border: "1px solid var(--ink)" }} />
                  <span style={{ fontSize: 13 }}>{n}</span>
                </div>
                <span className="display tabular" style={{ fontSize: 14 }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="row" style={{ marginTop: 14, gap: 8 }}>
            <button className="btn sm" style={{ flex: 1, justifyContent: "center" }}>Throttle emission</button>
            <button className="btn sm primary" style={{ flex: 1, justifyContent: "center" }}>Top up pool</button>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-title" style={{ marginBottom: 14 }}>
            <div><div className="eyebrow">Hot signals · 24h</div><h2 style={{ fontSize: 22 }}>Pump.fun + on-chain</h2></div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["Top wallet bought", "+428k BATTLE", "@7VRk…42x", "var(--lime)"],
              ["New listing detected", "Raydium pool", "auto-LP from team", "var(--cyan)"],
              ["Whale alert", "−180k BATTLE", "@A99w…0pq", "var(--tomato)"],
              ["X mentions", "+312% vs avg", "organic spike", "var(--magenta)"],
            ].map(([k, v, sub, c], i) => (
              <div key={i} className="row" style={{ padding: "10px 12px", borderRadius: 10, background: "var(--cream)", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: 99, background: String(c), border: "1.5px solid var(--ink)", flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{k}</div>
                <div className="display tabular" style={{ fontSize: 14 }}>{v}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--mute)", width: 110, textAlign: "right" }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card ink" style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
          <div className="section-title" style={{ marginBottom: 14, position: "relative" }}>
            <div><div className="eyebrow" style={{ color: "var(--cyan)" }}>Alerts</div><h2 style={{ fontSize: 22, color: "white" }}>Needs your attention</h2></div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
            {[
              { sev: "high", msg: "Rocket Miner payout cap reached at 18:00", cta: "Review" },
              { sev: "med", msg: "Suspicious claim pattern · wallet @x4Fr…ks", cta: "Inspect" },
              { sev: "low", msg: "Tetris bot reports up 12% this week", cta: "Ignore" },
              { sev: "low", msg: "New report from user @nightbite", cta: "Open" },
            ].map((a, i) => (
              <div key={i} className="row" style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)", gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: a.sev === "high" ? "var(--tomato)" : a.sev === "med" ? "var(--yellow)" : "var(--cyan)", flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 13, color: "white" }}>{a.msg}</div>
                <button className="btn sm" style={{ background: "transparent", borderColor: "rgba(255,255,255,0.3)", color: "white" }}>{a.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminUsers() {
  const [filter, setFilter] = useState("all");
  return (
    <div>
      <div className="row" style={{ marginBottom: 16, gap: 12 }}>
        <input className="input" placeholder="Search wallet or callsign…" style={{ maxWidth: 320 }} />
        <div className="tabs">
          {[["all", "All · 14,902"], ["active", "Active · 3,217"], ["whale", "Whales · 84"], ["flagged", "Flagged · 12"]].map(([id, label]) => (
            <div key={id} className={`tab${filter === id ? " active" : ""}`} onClick={() => setFilter(id)}>{label}</div>
          ))}
        </div>
        <div className="grow" />
        <button className="btn sm">📋 Export CSV</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="row" style={{ padding: "12px 22px", borderBottom: "2.5px solid var(--ink)", background: "var(--cream)", fontSize: 11, color: "var(--mute)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, gap: 0 }}>
          <div style={{ width: 30 }}><input type="checkbox" /></div>
          <div style={{ flex: 1.5 }}>Wolf</div>
          <div style={{ flex: 1 }}>Wallet</div>
          <div style={{ width: 70 }}>LVL</div>
          <div style={{ width: 90, textAlign: "right" }}>Mined</div>
          <div style={{ width: 70, textAlign: "right" }}>Games</div>
          <div style={{ width: 100, textAlign: "right" }}>Balance</div>
          <div style={{ width: 90 }}>Status</div>
          <div style={{ width: 80, textAlign: "right" }}>Actions</div>
        </div>
        {USERS.map((u, i) => (
          <div key={i} className="row" style={{ padding: "12px 22px", borderBottom: i < USERS.length - 1 ? "1px dashed rgba(11,11,26,0.12)" : "none", background: u.flag === "bot?" ? "var(--cream-soft)" : "var(--paper)", gap: 0 }}>
            <div style={{ width: 30 }}><input type="checkbox" /></div>
            <div style={{ flex: 1.5, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, overflow: "hidden", border: "2px solid var(--ink)", background: "linear-gradient(140deg,#1a1d3a,#2b1a4d)", flexShrink: 0 }}>
                <img src="/mascot.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>joined {u.joined}</div>
              </div>
            </div>
            <div style={{ flex: 1 }} className="mono"><span style={{ fontSize: 11, color: "var(--ink-soft)" }}>{u.wallet}</span></div>
            <div style={{ width: 70 }} className="display tabular">LVL {u.lvl}</div>
            <div style={{ width: 90, textAlign: "right" }} className="mono">{u.mined.toLocaleString()}</div>
            <div style={{ width: 70, textAlign: "right" }} className="mono">{u.games}</div>
            <div style={{ width: 100, textAlign: "right" }} className="display tabular">{u.balance.toLocaleString()}</div>
            <div style={{ width: 90 }}>
              <span className="pill" style={{ fontSize: 10, background: u.flag === "bot?" ? "var(--tomato)" : u.status === "online" ? "var(--lime)" : "var(--cream)", color: u.flag === "bot?" ? "white" : "var(--ink)", padding: "2px 7px" }}>
                {u.flag ? `⚠ ${u.flag}` : u.status}
              </span>
            </div>
            <div style={{ width: 80, textAlign: "right", display: "flex", gap: 4, justifyContent: "flex-end" }}>
              <button className="btn sm ghost" style={{ padding: "4px 8px" }}>👁</button>
              <button className="btn sm ghost" style={{ padding: "4px 8px" }}>⚙</button>
            </div>
          </div>
        ))}
      </div>

      <div className="row" style={{ marginTop: 14, justifyContent: "space-between", fontSize: 12, color: "var(--mute)" }}>
        <span>Showing 1 — 8 of 14,902 wolves</span>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn sm">‹</button>
          <button className="btn sm ink">1</button>
          <button className="btn sm">2</button>
          <button className="btn sm">3</button>
          <span className="mono">…</span>
          <button className="btn sm">1,863</button>
          <button className="btn sm">›</button>
        </div>
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

function AdminGames() {
  return (
    <div>
      <div className="grid-3" style={{ marginBottom: 22 }}>
        {[
          { l: "Sessions · 24h", v: "24,810", s: "+18%", c: "var(--paper)" },
          { l: "Avg session", v: "4m 12s", s: "+22s", c: "var(--cyan)" },
          { l: "Cheat reports", v: "3 open", s: "−5 vs last week", c: "var(--yellow)" },
        ].map((s) => (
          <div className="card" key={s.l} style={{ background: s.c }}>
            <div className="stat-label">{s.l}</div>
            <div className="stat-num tabular">{s.v}</div>
            <div style={{ fontSize: 12, color: "var(--mute)", marginTop: 4 }}>{s.s}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="row" style={{ padding: "14px 22px", borderBottom: "2.5px solid var(--ink)", background: "var(--cream)" }}>
          <div className="display" style={{ fontSize: 22 }}>Game balance</div>
          <div className="grow" />
          <span className="pill yellow" style={{ fontSize: 11 }}>Auto-tune ON</span>
        </div>
        {GAMES_DATA.map((g, i) => (
          <div key={g.name} className="row" style={{ padding: "16px 22px", borderBottom: i < GAMES_DATA.length - 1 ? "1px dashed rgba(11,11,26,0.12)" : "none", gap: 16 }}>
            <div style={{ width: 48, height: 48, background: g.bg, border: "2.5px solid var(--ink)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22 }}>
              {["🐍", "⬛", "🐺", "🚀", "🎯", "📈"][i]}
            </div>
            <div style={{ flex: 1.5 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{g.name} {g.isNew && <span className="pill magenta" style={{ fontSize: 9, padding: "1px 5px" }}>NEW</span>}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>{g.tag}</div>
            </div>
            <div style={{ width: 110 }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>PLAYS · 24H</div>
              <div className="display tabular" style={{ fontSize: 16 }}>{g.plays.toLocaleString()}</div>
            </div>
            <div style={{ width: 110 }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>AVG PAYOUT</div>
              <div className="display tabular" style={{ fontSize: 16 }}>{g.payout} BATTLE</div>
            </div>
            <div style={{ width: 90 }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>HOUSE EDGE</div>
              <div className="display tabular" style={{ fontSize: 16 }}>{g.edge}</div>
            </div>
            <div style={{ width: 100 }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>BOOST CAP</div>
              <input className="input" defaultValue={`×${g.boost}`} style={{ padding: "4px 8px", fontSize: 12, width: 70, marginTop: 4 }} />
            </div>
            <span className="pill" style={{ background: "var(--lime)", fontSize: 11 }}>Live</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminTx() {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "14px 22px", borderBottom: "2.5px solid var(--ink)", background: "var(--cream)" }} className="row">
        <div>
          <div className="eyebrow">Last 50 system transactions</div>
          <div className="display" style={{ fontSize: 22, marginTop: 2 }}>On-chain log</div>
        </div>
        <div className="grow" />
        <span className="pill dot">RPC connected</span>
      </div>
      {ADMIN_TX.map((t, i) => (
        <div key={i} className="row" style={{ padding: "12px 22px", borderBottom: i < ADMIN_TX.length - 1 ? "1px dashed rgba(11,11,26,0.12)" : "none", gap: 14 }}>
          <span className="pill" style={{ background: t.color, fontSize: 10, padding: "2px 8px", minWidth: 60, justifyContent: "center" }}>{t.type}</span>
          <div style={{ flex: 2, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{t.label}</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--mute)" }}>{t.from} → {t.to}</div>
          </div>
          <div style={{ width: 90, textAlign: "right" }} className="display tabular">
            <span style={{ color: t.amt > 0 ? "#0E6A2A" : "var(--tomato)", fontSize: 13 }}>{t.amt > 0 ? "+" : ""}{t.amt.toLocaleString()}</span>
          </div>
          <div className="mono" style={{ width: 90, fontSize: 11, color: "var(--cyan)", textAlign: "right" }}>{t.hash}</div>
          <div className="mono" style={{ width: 70, fontSize: 11, color: "var(--mute)", textAlign: "right" }}>{t.time}</div>
        </div>
      ))}
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
          <div className="tabs" style={{ width: "auto" }}>
            {[["overview", "Overview"], ["users", "Users · 14.9k"], ["pool", "Mining pool"], ["games", "Game balance"], ["tx", "Transactions"]].map(([id, label]) => (
              <div key={id} className={`tab${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>{label}</div>
            ))}
          </div>

          {tab === "overview" && <AdminOverview />}
          {tab === "users" && <AdminUsers />}
          {tab === "pool" && <AdminPool />}
          {tab === "games" && <AdminGames />}
          {tab === "tx" && <AdminTx />}

        </div>
      </main>
    </div>
  );
}
