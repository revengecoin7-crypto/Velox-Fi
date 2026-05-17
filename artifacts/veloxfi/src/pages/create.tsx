import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import {
  Swords, Upload, Globe, Coins, Wallet, AlertCircle,
  ImageIcon, Zap, ChevronRight, CheckCircle2,
} from "lucide-react";
import ConnectWalletButton from "@/components/ConnectWalletButton";
import { useWallet } from "@/context/WalletContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Sidebar } from "@/components/Sidebar";

/* ── Live Preview Card ── */
function CoinPreview({ name, ticker, description, imageUrl }: { name: string; ticker: string; description: string; imageUrl: string | null; }) {
  const displayName   = name.trim()   || "YOUR COIN";
  const displayTicker = ticker.trim() || "???";
  return (
    <div className="rounded-2xl overflow-hidden sticky top-24"
      style={{ background: "rgba(255,255,255,0.025)", border: "2px solid rgba(124,58,237,0.25)", boxShadow: "0 0 20px rgba(124,58,237,0.08)" }}>
      <div className="px-4 py-2.5 flex items-center justify-between"
        style={{ background: "rgba(124,58,237,0.1)", borderBottom: "1px solid rgba(124,58,237,0.18)" }}>
        <span className="font-orbitron text-xs tracking-widest" style={{ color: "#a78bfa" }}>👁️ LIVE PREVIEW</span>
        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
          style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399", fontFamily: "Inter, sans-serif" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" /> DRAFT
        </span>
      </div>
      <div className="p-5 flex flex-col items-center gap-4">
        <div className="w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden relative"
          style={{ background: imageUrl ? "transparent" : "linear-gradient(135deg,rgba(37,99,235,0.2),rgba(124,58,237,0.2))", border: "2px solid rgba(124,58,237,0.3)" }}>
          {imageUrl ? <img src={imageUrl} alt="coin" className="w-full h-full object-cover" /> : <span style={{ fontSize: "40px" }}>🪙</span>}
        </div>
        <div className="text-center">
          <div className="font-orbitron font-black text-xl tracking-wider mb-1" style={{ color: name.trim() ? "white" : "#374151", transition: "color 0.2s" }}>
            {displayName}
          </div>
          <div className="font-orbitron text-sm tracking-widest px-3 py-1 rounded-full inline-block"
            style={{ background: "linear-gradient(135deg,rgba(37,99,235,0.15),rgba(124,58,237,0.15))", border: "1px solid rgba(124,58,237,0.2)", color: ticker.trim() ? "#a78bfa" : "#374151", transition: "color 0.2s" }}>
            ${displayTicker.toUpperCase()}
          </div>
        </div>
        <p className="text-center text-xs leading-relaxed line-clamp-3"
          style={{ fontFamily: "Inter, sans-serif", color: description.trim() ? "#6b7280" : "#2d3748", minHeight: "48px", transition: "color 0.2s" }}>
          {description.trim() || "Your coin description will appear here…"}
        </p>
        <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
          {[{ label: "PRICE", value: "TBA" }, { label: "SUPPLY", value: "1B" }, { label: "CHAIN", value: "SOL" }].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="font-black text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#4b5563" }}>{value}</div>
              <div className="font-orbitron text-gray-700" style={{ fontSize: "9px", letterSpacing: "0.12em" }}>{label}</div>
            </div>
          ))}
        </div>
        <div className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl"
          style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)" }}>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" style={{ color: "#60a5fa" }} />
            <span className="font-orbitron text-xs tracking-wider" style={{ color: "#4b5563" }}>CREATION FEE</span>
          </div>
          <span className="font-black text-sm" style={{ fontFamily: "Inter, sans-serif", background: "linear-gradient(135deg,#2563eb,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            1 $BATTLE
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Field wrapper ── */
function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode; }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <label className="font-orbitron text-xs tracking-widest" style={{ color: "#9ca3af" }}>{label}</label>
        {required && <span className="text-xs" style={{ color: "#ef4444" }}>*</span>}
        {hint && <span className="text-xs ml-auto" style={{ fontFamily: "Inter, sans-serif", color: "#374151" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const INPUT_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  color: "white",
  padding: "12px 16px",
  fontFamily: "Inter, sans-serif",
  fontSize: "14px",
  width: "100%",
  outline: "none",
  transition: "border-color 0.2s",
};

export default function Create() {
  usePageMeta({
    title: "Launch Coin — Create Your Memecoin | VeloxFi",
    description: "Create and launch your own memecoin on Solana, then challenge rivals in the VeloxFi battle arena. $BATTLE token required.",
    canonical: "https://veloxfi.io/#/create",
  });
  const [, navigate] = useLocation();
  const { status } = useWallet();

  const [name,         setName]        = useState("");
  const [ticker,       setTicker]      = useState("");
  const [description,  setDescription] = useState("");
  const [website,      setWebsite]     = useState("");
  const [twitterUrl,   setTwitterUrl]  = useState("");
  const [imageUrl,     setImageUrl]    = useState<string | null>(null);
  const [dragOver,     setDragOver]    = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImageUrl(URL.createObjectURL(file));
  }, []);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function focusStyle(field: string): React.CSSProperties {
    return {
      ...INPUT_STYLE,
      borderColor: focusedField === field ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)",
      boxShadow: focusedField === field ? "0 0 0 3px rgba(124,58,237,0.06)" : "none",
    };
  }

  const canCreate = name.trim().length > 0 && ticker.trim().length > 0;

  return (
    <div className="app-shell"><Sidebar /><main style={{ minWidth: 0, background: "#FFFBF0" }}>
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-20">

        {/* ── HEADER ── */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-orbitron tracking-widest"
            style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.3)", color: "#60a5fa" }}>
            <Coins className="w-3 h-3" /> 🔥 COIN FORGE
          </div>
          <h1 className="font-orbitron font-black text-5xl md:text-6xl text-white leading-tight mb-2 meme-title">
            🪙 CREATE YOUR{" "}
            <span style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              COIN
            </span>
          </h1>
          <p className="text-gray-500 text-lg" style={{ fontFamily: "Inter, sans-serif" }}>
            Your coin. Your battle. Your glory. ⚔️
          </p>
        </div>

        {/* ── TWO-COL LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

          {/* ── LEFT: Form ── */}
          <div className="flex flex-col gap-6">

            {/* Coin Identity */}
            <div className="rounded-2xl p-6 flex flex-col gap-5"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-orbitron text-xs tracking-widest flex items-center gap-2" style={{ color: "#4b5563" }}>
                <span>🪙</span> COIN IDENTITY
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-4">
                <Field label="COIN NAME" required>
                  <input type="text" placeholder="e.g. Moon Doggo" value={name} maxLength={40}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField("name")} onBlur={() => setFocusedField(null)}
                    style={focusStyle("name")} />
                </Field>
                <Field label="TICKER" required hint={`${ticker.length}/6`}>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#4b5563", fontFamily: "Inter, sans-serif", fontSize: "14px", pointerEvents: "none" }}>$</span>
                    <input type="text" placeholder="MDGO" value={ticker} maxLength={6}
                      onChange={(e) => setTicker(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                      onFocus={() => setFocusedField("ticker")} onBlur={() => setFocusedField(null)}
                      style={{ ...focusStyle("ticker"), paddingLeft: "28px" }} />
                  </div>
                </Field>
              </div>
              <Field label="DESCRIPTION" hint={`${description.length}/280`}>
                <textarea placeholder="Describe your memecoin — what makes it legendary?" value={description} maxLength={280} rows={4}
                  onChange={(e) => setDescription(e.target.value)}
                  onFocus={() => setFocusedField("desc")} onBlur={() => setFocusedField(null)}
                  style={{ ...focusStyle("desc"), resize: "none", lineHeight: "1.6" }} />
              </Field>
            </div>

            {/* Image Upload */}
            <div className="rounded-2xl p-6 flex flex-col gap-4"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-orbitron text-xs tracking-widest flex items-center gap-2" style={{ color: "#4b5563" }}>
                <span>🖼️</span> COIN IMAGE
              </div>
              <div onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className="rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200"
                style={{ border: dragOver ? "2px dashed rgba(124,58,237,0.6)" : "2px dashed rgba(255,255,255,0.1)", background: dragOver ? "rgba(124,58,237,0.05)" : "transparent", padding: "32px 24px", minHeight: "160px" }}>
                {imageUrl ? (
                  <>
                    <img src={imageUrl} alt="preview" className="w-24 h-24 rounded-xl object-cover" style={{ border: "2px solid rgba(124,58,237,0.4)" }} />
                    <span className="text-xs font-orbitron tracking-wider" style={{ color: "#a78bfa" }}>CLICK TO CHANGE</span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
                      <ImageIcon className="w-6 h-6" style={{ color: "#7c3aed" }} />
                    </div>
                    <div className="text-center">
                      <div className="font-orbitron text-xs tracking-wider mb-1" style={{ color: "#6b7280" }}>DRAG & DROP OR CLICK TO UPLOAD</div>
                      <div className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#374151" }}>PNG, JPG, GIF up to 5MB</div>
                    </div>
                    <button type="button" className="btn-outline px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-orbitron tracking-wider"
                      onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                      <Upload className="w-3.5 h-3.5" /> CHOOSE FILE
                    </button>
                  </>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              </div>
            </div>

            {/* Socials */}
            <div className="rounded-2xl p-6 flex flex-col gap-5"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between">
                <div className="font-orbitron text-xs tracking-widest flex items-center gap-2" style={{ color: "#4b5563" }}>
                  <span>🌐</span> SOCIALS
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-orbitron tracking-wider"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#374151" }}>
                  OPTIONAL
                </span>
              </div>
              <Field label="WEBSITE">
                <div style={{ position: "relative" }}>
                  <Globe className="w-4 h-4" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#374151", pointerEvents: "none" }} />
                  <input type="url" placeholder="https://yourproject.xyz" value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    onFocus={() => setFocusedField("website")} onBlur={() => setFocusedField(null)}
                    style={{ ...focusStyle("website"), paddingLeft: "40px" }} />
                </div>
              </Field>
              <Field label="TWITTER / X">
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#374151", fontWeight: "bold", fontSize: "13px", pointerEvents: "none", fontFamily: "Inter, sans-serif" }}>𝕏</span>
                  <input type="url" placeholder="https://x.com/yourcoin" value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    onFocus={() => setFocusedField("twitter")} onBlur={() => setFocusedField(null)}
                    style={{ ...focusStyle("twitter"), paddingLeft: "40px" }} />
                </div>
              </Field>
            </div>

            {/* Fee Info */}
            <div className="rounded-xl p-4 flex items-center justify-between"
              style={{ background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.2)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.2)" }}>
                  <Zap className="w-4 h-4" style={{ color: "#60a5fa" }} />
                </div>
                <div>
                  <div className="font-orbitron text-xs tracking-wider text-white mb-0.5">CREATION FEE</div>
                  <div className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#4b5563" }}>Deducted from your $BATTLE balance on creation</div>
                </div>
              </div>
              <div className="font-black text-lg flex-shrink-0" style={{ fontFamily: "Inter, sans-serif", background: "linear-gradient(135deg,#2563eb,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                1 $BATTLE
              </div>
            </div>

            {/* CTA */}
            {status === "connected" ? (
              <>
                <button disabled={!canCreate}
                  className="w-full btn-meme py-5 rounded-2xl text-base flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", boxShadow: canCreate ? "0 0 25px rgba(37,99,235,0.35)" : "none" }}>
                  {canCreate ? (
                    <><Swords className="w-5 h-5" /> ⚔️ FORGE YOUR COIN</>
                  ) : (
                    "FILL IN NAME + TICKER TO CONTINUE"
                  )}
                </button>

                {canCreate && (
                  <div className="rounded-xl p-4 flex gap-3"
                    style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.15)" }}>
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#34d399" }} />
                    <p className="text-xs leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: "#6b7280" }}>
                      1 $BATTLE will be deducted from your wallet. Coin creation launches after presale.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl p-6 text-center"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Wallet className="w-4 h-4" style={{ color: "#60a5fa" }} />
                  <span className="font-orbitron text-xs tracking-widest" style={{ color: "#4b5563" }}>WALLET REQUIRED TO LAUNCH</span>
                </div>
                <ConnectWalletButton className="w-full justify-center py-4 mb-4" />
                <p className="text-xs text-gray-600" style={{ fontFamily: "Inter, sans-serif" }}>You need $BATTLE tokens to create a coin.</p>
              </div>
            )}

            {/* Pre-launch notice */}
            <div className="rounded-xl p-4 flex items-start gap-3"
              style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.12)" }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
              <p className="text-xs leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: "#6b7280" }}>
                <strong style={{ color: "#f59e0b" }}>Pre-launch:</strong> Coin creation is available on the demo now. Real on-chain creation goes live when the presale closes. Secure your $BATTLE tokens during presale to be first into the arena.
              </p>
            </div>

            {/* Steps */}
            <div className="rounded-2xl p-6 flex flex-col gap-4"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="font-orbitron text-xs tracking-widest flex items-center gap-2" style={{ color: "#4b5563" }}>
                <ChevronRight className="w-3.5 h-3.5" /> HOW IT WORKS
              </div>
              {[
                { step: "01", icon: "🪙", title: "Create your coin",  desc: "Fill in name, ticker, image and description."             },
                { step: "02", icon: "🎯", title: "Pick a rival",       desc: "Select an opponent coin and set battle duration."         },
                { step: "03", icon: "⚔️", title: "Enter the arena",   desc: "Fans buy your coin. Highest % surge wins the battle."     },
                { step: "04", icon: "🏆", title: "Claim rewards",      desc: "Winner gets 30% of loser tokens. 20% burned forever."     },
              ].map(({ step, icon, title, desc }) => (
                <div key={step} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                    style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.15)" }}>
                    {icon}
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium mb-0.5" style={{ fontFamily: "Inter, sans-serif" }}>{title}</div>
                    <div className="text-gray-600 text-xs" style={{ fontFamily: "Inter, sans-serif" }}>{desc}</div>
                  </div>
                  <span className="font-orbitron font-black text-xs ml-auto flex-shrink-0" style={{ color: "#1e3a5f" }}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Preview ── */}
          <div>
            <CoinPreview name={name} ticker={ticker} description={description} imageUrl={imageUrl} />
            <div className="mt-4 text-center">
              <p className="text-xs font-orbitron tracking-widest text-gray-700 mb-3">NOT READY? TRY THE DEMO FIRST</p>
              <button onClick={() => navigate("/demo")} className="btn-meme w-full py-3 rounded-xl text-xs"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af" }}>
                🎮 TRY DEMO BATTLE →
              </button>
            </div>
          </div>
        </div>
      </div>
    </main></div>
  );
}
