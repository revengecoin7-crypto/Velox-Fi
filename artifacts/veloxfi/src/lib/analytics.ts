const EVENTS_KEY  = "vfx_analytics_v2";
const LIVE_KEY    = "vfx_live_v2";
const MAX_EVENTS  = 8000;
const LIVE_TTL_MS = 2 * 60 * 1000; // 2 minutes = "live"

export interface PageEvent {
  ts: number;
  page: string;
  sid: string;
  uid: string | null;
}

export interface LiveSession {
  ts: number;
  page: string;
}

// ── session id (per browser tab, persists through page nav) ──
export function getSessionId(): string {
  let sid = sessionStorage.getItem("vfx_sid");
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("vfx_sid", sid);
  }
  return sid;
}

// ── record a page view ──────────────────────────────────────
export function recordPageView(page: string) {
  const sid = getSessionId();
  const sessionRaw = localStorage.getItem("vfx_session_v3");
  const uid = sessionRaw ? (() => { try { return JSON.parse(sessionRaw)?.username ?? null; } catch { return null; } })() : null;

  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    const events: PageEvent[] = raw ? JSON.parse(raw) : [];
    events.push({ ts: Date.now(), page, sid, uid });
    if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch { /* quota exceeded — skip */ }

  heartbeat(page, sid);
}

// ── update "live" presence ───────────────────────────────────
export function heartbeat(page: string, sid?: string) {
  const _sid = sid ?? getSessionId();
  try {
    const live: Record<string, LiveSession> = JSON.parse(localStorage.getItem(LIVE_KEY) || "{}");
    // prune stale sessions
    const now = Date.now();
    for (const k of Object.keys(live)) {
      if (now - live[k].ts > LIVE_TTL_MS + 10_000) delete live[k];
    }
    live[_sid] = { ts: now, page };
    localStorage.setItem(LIVE_KEY, JSON.stringify(live));
  } catch { /* ignore */ }
}

// ── read helpers (used by admin) ─────────────────────────────
export function getEvents(): PageEvent[] {
  try { return JSON.parse(localStorage.getItem(EVENTS_KEY) || "[]"); }
  catch { return []; }
}

export function getLiveSessions(): Record<string, LiveSession> {
  try {
    const live: Record<string, LiveSession> = JSON.parse(localStorage.getItem(LIVE_KEY) || "{}");
    const now = Date.now();
    const result: Record<string, LiveSession> = {};
    for (const [k, v] of Object.entries(live)) {
      if (now - v.ts <= LIVE_TTL_MS) result[k] = v;
    }
    return result;
  } catch { return {}; }
}

export function getLiveCount(): number {
  return Object.keys(getLiveSessions()).length;
}

export const LIVE_TTL = LIVE_TTL_MS;
