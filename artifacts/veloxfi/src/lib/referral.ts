const KEY = "vfx_pending_referral";

// Saves a pending referral code (referrer's username). Survives navigation
// so the register form can pick it up even if the user clicks around first.
export function setPendingReferral(code: string): void {
  const trimmed = code.trim();
  if (!trimmed) return;
  try { localStorage.setItem(KEY, trimmed); } catch {}
}

export function getPendingReferral(): string {
  try { return localStorage.getItem(KEY) ?? ""; } catch { return ""; }
}

export function clearPendingReferral(): void {
  try { localStorage.removeItem(KEY); } catch {}
}

// Reads ?ref=... from the current URL (if present) and stores it. Returns
// the captured code (or empty string). Safe to call repeatedly.
export function captureReferralFromUrl(): string {
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && ref.trim()) {
      setPendingReferral(ref);
      return ref.trim();
    }
  } catch {}
  return "";
}
