import { useEffect, useState } from "react";

interface FlyToken {
  id: number;
  x: number;
  y: number;
  dx: number;
  targetX: number;
  targetY: number;
}

interface TokenFlyProps {
  count: number;
  show: boolean;
  fromX?: number;
  fromY?: number;
  onComplete?: () => void;
}

const TOKEN_STYLES = `
  @keyframes tokenFly {
    0%   { opacity: 1; transform: translate(0, 0) scale(1.2); }
    30%  { opacity: 1; transform: translate(var(--tx-mid), var(--ty-mid)) scale(1); }
    80%  { opacity: 0.8; transform: translate(var(--tx), var(--ty)) scale(0.6); }
    100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0.3); }
  }
  .token-fly-item {
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    font-size: 22px;
    animation: tokenFly 1.1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }
`;

export default function TokenFly({ count, show, fromX, fromY, onComplete }: TokenFlyProps) {
  const [tokens, setTokens] = useState<FlyToken[]>([]);

  useEffect(() => {
    if (!show || count <= 0) return;

    const startX = fromX ?? window.innerWidth / 2;
    const startY = fromY ?? window.innerHeight * 0.6;

    // Target: top-right area where balance is shown in nav
    const targetX = window.innerWidth - 100;
    const targetY = 60;

    const tokenCount = Math.min(count, 12);
    const newTokens: FlyToken[] = Array.from({ length: tokenCount }, (_, i) => ({
      id: Date.now() + i,
      x: startX + (Math.random() - 0.5) * 60,
      y: startY + (Math.random() - 0.5) * 30,
      dx: (Math.random() - 0.5) * 80,
      targetX,
      targetY,
    }));

    setTokens(newTokens);

    const timer = setTimeout(() => {
      setTokens([]);
      onComplete?.();
    }, 1300);

    return () => clearTimeout(timer);
  }, [show, count]);

  if (tokens.length === 0) return null;

  return (
    <>
      <style>{TOKEN_STYLES}</style>
      {tokens.map((t, i) => {
        const tx = t.targetX - t.x;
        const ty = t.targetY - t.y;
        const txMid = tx * 0.3 + t.dx;
        const tyMid = ty * 0.4 - 60;
        return (
          <div
            key={t.id}
            className="token-fly-item"
            style={{
              left: t.x,
              top: t.y,
              animationDelay: `${i * 60}ms`,
              // @ts-ignore
              "--tx": `${tx}px`,
              "--ty": `${ty}px`,
              "--tx-mid": `${txMid}px`,
              "--ty-mid": `${tyMid}px`,
            } as React.CSSProperties}
          >
            🐺
          </div>
        );
      })}
    </>
  );
}
