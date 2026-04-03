import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

/* ───────────────────────────────────────────
   Types
─────────────────────────────────────────── */
interface PhantomProvider {
  isPhantom: boolean;
  publicKey: { toBase58(): string } | null;
  isConnected: boolean;
  connect(opts?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toBase58(): string } }>;
  disconnect(): Promise<void>;
  signAndSendTransaction(tx: unknown): Promise<{ signature: string }>;
  on(event: string, handler: (...args: unknown[]) => void): void;
  off(event: string, handler: (...args: unknown[]) => void): void;
}

declare global {
  interface Window {
    phantom?: { solana?: PhantomProvider };
    solana?: PhantomProvider;
  }
}

type WalletStatus = "disconnected" | "connecting" | "connected" | "not_installed";

interface WalletContextValue {
  status: WalletStatus;
  address: string | null;
  shortAddress: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isPhantomInstalled: boolean;
}

/* ───────────────────────────────────────────
   Helpers
─────────────────────────────────────────── */
function getProvider(): PhantomProvider | null {
  if (typeof window === "undefined") return null;
  return window.phantom?.solana ?? window.solana ?? null;
}

function shorten(addr: string): string {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

const AUTO_CONNECT_KEY = "vfx_wallet_auto_connect";

/* ───────────────────────────────────────────
   Context
─────────────────────────────────────────── */
const WalletContext = createContext<WalletContextValue>({
  status: "disconnected",
  address: null,
  shortAddress: null,
  connect: async () => {},
  disconnect: async () => {},
  isPhantomInstalled: false,
});

/* ───────────────────────────────────────────
   Provider
─────────────────────────────────────────── */
export function WalletProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<WalletStatus>("disconnected");
  const [address, setAddress] = useState<string | null>(null);

  const provider = getProvider();
  const isPhantomInstalled = Boolean(provider?.isPhantom);

  /* Derive short address */
  const shortAddress = address ? shorten(address) : null;

  /* Handle wallet events */
  useEffect(() => {
    if (!provider) return;

    const onConnect = (pubkey: { toBase58(): string }) => {
      const addr = pubkey.toBase58();
      setAddress(addr);
      setStatus("connected");
      localStorage.setItem(AUTO_CONNECT_KEY, "1");
    };

    const onDisconnect = () => {
      setAddress(null);
      setStatus("disconnected");
      localStorage.removeItem(AUTO_CONNECT_KEY);
    };

    const onAccountChanged = (pubkey: { toBase58(): string } | null) => {
      if (pubkey) {
        setAddress(pubkey.toBase58());
      } else {
        setAddress(null);
        setStatus("disconnected");
        localStorage.removeItem(AUTO_CONNECT_KEY);
      }
    };

    provider.on("connect", onConnect);
    provider.on("disconnect", onDisconnect);
    provider.on("accountChanged", onAccountChanged);

    return () => {
      provider.off("connect", onConnect);
      provider.off("disconnect", onDisconnect);
      provider.off("accountChanged", onAccountChanged);
    };
  }, [provider]);

  /* Auto-connect if previously connected */
  useEffect(() => {
    if (!provider || !localStorage.getItem(AUTO_CONNECT_KEY)) return;
    provider
      .connect({ onlyIfTrusted: true })
      .then(({ publicKey }) => {
        setAddress(publicKey.toBase58());
        setStatus("connected");
      })
      .catch(() => {
        localStorage.removeItem(AUTO_CONNECT_KEY);
      });
  }, [provider]);

  /* connect() */
  const connect = useCallback(async () => {
    if (!provider) {
      setStatus("not_installed");
      return;
    }
    try {
      setStatus("connecting");
      const { publicKey } = await provider.connect();
      setAddress(publicKey.toBase58());
      setStatus("connected");
      localStorage.setItem(AUTO_CONNECT_KEY, "1");
    } catch {
      setStatus("disconnected");
    }
  }, [provider]);

  /* disconnect() */
  const disconnect = useCallback(async () => {
    if (!provider) return;
    try {
      await provider.disconnect();
    } catch {
      /* ignore */
    }
    setAddress(null);
    setStatus("disconnected");
    localStorage.removeItem(AUTO_CONNECT_KEY);
  }, [provider]);

  return (
    <WalletContext.Provider
      value={{ status, address, shortAddress, connect, disconnect, isPhantomInstalled }}
    >
      {children}
    </WalletContext.Provider>
  );
}

/* ───────────────────────────────────────────
   Hook
─────────────────────────────────────────── */
export function useWallet() {
  return useContext(WalletContext);
}
