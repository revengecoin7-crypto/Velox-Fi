// Thin wrapper around the public Solana JSON-RPC. We use it for two things:
//   1) Verify a pump.fun buy transaction (parse SOL spent + $BATTLE received)
//   2) Fetch a wallet's current $BATTLE balance (sell-detection)
//
// Public mainnet RPC is rate limited (~10-40 req/s). For the buy-bonus
// volumes we expect at launch this is plenty; if it ever isn't we can swap
// in a paid provider by changing RPC_URL.

const RPC_URL = process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";
const BATTLE_MINT = "HAytudteqxtE4yFUF9Y8SN7LJz7VeCSERKVdwggDpump";
const LAMPORTS_PER_SOL = 1_000_000_000;

interface JsonRpcResponse<T> {
  jsonrpc: "2.0";
  id: number;
  result?: T;
  error?: { code: number; message: string };
}

async function rpc<T>(method: string, params: unknown[]): Promise<T | null> {
  try {
    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const j = (await res.json()) as JsonRpcResponse<T>;
    if (j.error) {
      console.error(`Solana RPC ${method} error:`, j.error);
      return null;
    }
    return j.result ?? null;
  } catch (e) {
    console.error(`Solana RPC ${method} threw:`, e);
    return null;
  }
}

export interface BuyTxResult {
  ok: true;
  buyerWallet: string;
  solSpent: number;       // SOL (decimal, not lamports)
  battleReceived: number; // $BATTLE (decimal, accounting for 6 decimals)
}

export interface BuyTxError {
  ok: false;
  error: string;
}

interface TxMeta {
  err: unknown;
  preBalances?: number[];
  postBalances?: number[];
  preTokenBalances?: TokenBalance[];
  postTokenBalances?: TokenBalance[];
}

interface TokenBalance {
  accountIndex: number;
  mint: string;
  owner?: string;
  uiTokenAmount: { uiAmount: number | null; decimals: number; amount: string };
}

interface ParsedTransaction {
  meta: TxMeta | null;
  transaction: {
    message: {
      accountKeys: Array<string | { pubkey: string }>;
    };
  };
}

/** Verify a tx-signature represents a real $BATTLE buy. Returns the buyer
 *  wallet, SOL spent and $BATTLE received so the caller can credit the
 *  buy-bonus tier. */
export async function verifyBuyTransaction(signature: string): Promise<BuyTxResult | BuyTxError> {
  if (!signature || typeof signature !== "string" || signature.length < 80 || signature.length > 100) {
    return { ok: false, error: "Invalid transaction signature format." };
  }

  const tx = await rpc<ParsedTransaction>("getTransaction", [
    signature,
    { encoding: "jsonParsed", maxSupportedTransactionVersion: 0, commitment: "confirmed" },
  ]);
  if (!tx) return { ok: false, error: "Transaction not found on-chain. Wait a few seconds after the swap and try again." };
  if (!tx.meta) return { ok: false, error: "Transaction metadata missing." };
  if (tx.meta.err) return { ok: false, error: "On-chain transaction failed. Try a different one." };

  // Pull the account list — first entry is the fee payer (= buyer wallet).
  const keys = tx.transaction.message.accountKeys.map((k) => (typeof k === "string" ? k : k.pubkey));
  if (keys.length === 0) return { ok: false, error: "Transaction has no accounts." };
  const buyer = keys[0];

  // Find token balance entries for $BATTLE that the buyer owns. We look at
  // owner == buyer + mint == BATTLE_MINT, then compute postAmount - preAmount.
  const pre = tx.meta.preTokenBalances ?? [];
  const post = tx.meta.postTokenBalances ?? [];

  let battleReceived = 0;
  for (const p of post) {
    if (p.mint !== BATTLE_MINT) continue;
    if (p.owner && p.owner !== buyer) continue;
    const preMatch = pre.find((x) => x.accountIndex === p.accountIndex && x.mint === BATTLE_MINT);
    const postAmt = Number(p.uiTokenAmount.uiAmount ?? 0);
    const preAmt = preMatch ? Number(preMatch.uiTokenAmount.uiAmount ?? 0) : 0;
    const delta = postAmt - preAmt;
    if (delta > 0) battleReceived += delta;
  }
  if (battleReceived <= 0) {
    return { ok: false, error: "This transaction did not transfer $BATTLE to the buyer. Make sure you submitted a BUY tx, not a sell." };
  }

  // SOL spent = preBalance[0] - postBalance[0] (excluding fee paid). Fee is
  // negligible (~5000 lamports) so we don't need to subtract it precisely.
  const preBalances = tx.meta.preBalances ?? [];
  const postBalances = tx.meta.postBalances ?? [];
  if (preBalances.length === 0 || postBalances.length === 0) {
    return { ok: false, error: "Cannot read SOL balance change." };
  }
  const lamportsSpent = preBalances[0] - postBalances[0];
  const solSpent = lamportsSpent / LAMPORTS_PER_SOL;
  if (solSpent <= 0) {
    return { ok: false, error: "Buyer did not spend SOL in this transaction." };
  }

  return { ok: true, buyerWallet: buyer, solSpent, battleReceived };
}

/** Fetch the wallet's current $BATTLE balance (uiAmount, decimal). Returns
 *  null if the call fails — caller should treat that as "unknown, skip
 *  sell-check this round". */
export async function getBattleBalance(walletAddress: string): Promise<number | null> {
  const r = await rpc<{ value: Array<{ account: { data: { parsed: { info: { tokenAmount: { uiAmount: number | null } } } } } }> }>(
    "getTokenAccountsByOwner",
    [walletAddress, { mint: BATTLE_MINT }, { encoding: "jsonParsed" }]
  );
  if (!r || !Array.isArray(r.value)) return null;
  let total = 0;
  for (const acc of r.value) {
    const ui = acc.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
    if (typeof ui === "number") total += ui;
  }
  return total;
}

/** Cumulative-buy → multiplier tier mapping. */
export function tierForSol(totalSol: number): number {
  if (totalSol >= 1) return 1000;
  if (totalSol >= 0.1) return 100;
  if (totalSol >= 0.01) return 10;
  return 1;
}
