/**
 * Comprehensive DexScreener API client.
 * Reference: https://docs.dexscreener.com/api/reference
 * All endpoints are public and require no auth.
 */

const DS_BASE = 'https://api.dexscreener.com';

export interface DexScreenerPairInfo {
  imageUrl?: string;
  header?: string;
  openGraph?: string;
  websites?: { url: string; label?: string }[];
  socials?: { url: string; type: string }[];
}

export interface DexScreenerTokenInfo {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  labels?: string[];
  baseToken: { address: string; name: string; symbol: string; logoURI?: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceNative: string;
  priceUsd: string;
  txns: Record<'m5' | 'h1' | 'h6' | 'h24', { buys: number; sells: number }>;
  volume: Record<'h24' | 'h6' | 'h1' | 'm5', number>;
  priceChange: Partial<Record<'m5' | 'h1' | 'h6' | 'h24', number>>;
  liquidity?: { usd: number; base: number; quote: number };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
  info?: DexScreenerPairInfo;
}

export interface DexScreenerProfile {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon?: string;
  header?: string | null;
  description?: string | null;
  links?: { type?: string; label?: string; url: string }[] | null;
}

export interface DexScreenerBoost extends DexScreenerProfile {
  amount: number;
  totalAmount: number;
}

export interface DexScreenerOrder {
  type: 'tokenProfile' | 'communityTakeover' | 'tokenAd' | 'trendingBarAd';
  status: 'processing' | 'cancelled' | 'on-hold' | 'approved' | 'rejected';
  paymentTimestamp: number;
}

const safeJson = async <T>(url: string): Promise<T | null> => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (e) {
    console.error('DexScreener fetch failed:', url, e);
    return null;
  }
};

/* ---------- Pairs & token lookups (300 req/min) ---------- */

/** GET /latest/dex/tokens/{addresses} — up to 30 comma-separated addresses */
export const fetchPairsByToken = async (
  tokenAddresses: string | string[]
): Promise<DexScreenerTokenInfo[]> => {
  const list = Array.isArray(tokenAddresses) ? tokenAddresses.join(',') : tokenAddresses;
  const data = await safeJson<{ pairs: DexScreenerTokenInfo[] | null }>(
    `${DS_BASE}/latest/dex/tokens/${list}`
  );
  return data?.pairs ?? [];
};

/** GET /latest/dex/pairs/{chainId}/{pairId} */
export const fetchPair = async (
  chainId: string,
  pairId: string
): Promise<DexScreenerTokenInfo | null> => {
  const data = await safeJson<{ pairs: DexScreenerTokenInfo[] | null }>(
    `${DS_BASE}/latest/dex/pairs/${chainId}/${pairId}`
  );
  return data?.pairs?.[0] ?? null;
};

/** GET /latest/dex/search?q= */
export const searchPairs = async (query: string): Promise<DexScreenerTokenInfo[]> => {
  const data = await safeJson<{ pairs: DexScreenerTokenInfo[] | null }>(
    `${DS_BASE}/latest/dex/search?q=${encodeURIComponent(query)}`
  );
  return data?.pairs ?? [];
};

/** GET /token-pairs/v1/{chainId}/{tokenAddress} */
export const fetchTokenPairs = async (
  chainId: string,
  tokenAddress: string
): Promise<DexScreenerTokenInfo[]> => {
  const data = await safeJson<DexScreenerTokenInfo[]>(
    `${DS_BASE}/token-pairs/v1/${chainId}/${tokenAddress}`
  );
  return data ?? [];
};

/** GET /tokens/v1/{chainId}/{tokenAddresses} — up to 30 comma-separated */
export const fetchTokensOnChain = async (
  chainId: string,
  tokenAddresses: string | string[]
): Promise<DexScreenerTokenInfo[]> => {
  const list = Array.isArray(tokenAddresses) ? tokenAddresses.join(',') : tokenAddresses;
  const data = await safeJson<DexScreenerTokenInfo[]>(
    `${DS_BASE}/tokens/v1/${chainId}/${list}`
  );
  return data ?? [];
};

/* ---------- Profiles, boosts, orders (60 req/min) ---------- */

export const fetchLatestProfiles = async (): Promise<DexScreenerProfile[]> => {
  const data = await safeJson<DexScreenerProfile[] | DexScreenerProfile>(
    `${DS_BASE}/token-profiles/latest/v1`
  );
  return Array.isArray(data) ? data : data ? [data] : [];
};

export const fetchLatestBoosts = async (): Promise<DexScreenerBoost[]> => {
  const data = await safeJson<DexScreenerBoost[] | DexScreenerBoost>(
    `${DS_BASE}/token-boosts/latest/v1`
  );
  return Array.isArray(data) ? data : data ? [data] : [];
};

export const fetchTopBoosts = async (): Promise<DexScreenerBoost[]> => {
  const data = await safeJson<DexScreenerBoost[] | DexScreenerBoost>(
    `${DS_BASE}/token-boosts/top/v1`
  );
  return Array.isArray(data) ? data : data ? [data] : [];
};

export const fetchTokenOrders = async (
  chainId: string,
  tokenAddress: string
): Promise<DexScreenerOrder[]> => {
  const data = await safeJson<DexScreenerOrder[]>(
    `${DS_BASE}/orders/v1/${chainId}/${tokenAddress}`
  );
  return data ?? [];
};

/* ---------- High-level helpers ---------- */

/** Pick the best (most-liquid) pair, optionally filtered by chain/token. */
export const pickBestPair = (
  pairs: DexScreenerTokenInfo[],
  opts: { chainId?: string; tokenAddress?: string } = {}
): DexScreenerTokenInfo | null => {
  let filtered = pairs;
  if (opts.chainId) {
    filtered = filtered.filter((p) => p.chainId === opts.chainId);
  }
  if (opts.tokenAddress) {
    const addr = opts.tokenAddress.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.baseToken?.address?.toLowerCase() === addr ||
        p.quoteToken?.address?.toLowerCase() === addr
    );
  }
  if (filtered.length === 0) return null;
  return filtered.sort(
    (a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0)
  )[0];
};

export interface DexScreenerToken {
  chainId: string;
  address: string;
  symbol: string;
  name: string;
  logoURI?: string;
  header?: string;
  priceUsd?: number;
  priceChange24h?: number;
  liquidityUsd?: number;
  fdv?: number;
  marketCap?: number;
  volume24h?: number;
  pairAddress?: string;
  dexId?: string;
  url?: string;
  websites?: { url: string; label?: string }[];
  socials?: { url: string; type: string }[];
}

/**
 * Resolve full token data (logo, name, symbol, price, links) for ANY chain
 * via DexScreener. Returns null if not indexed.
 */
export const detectToken = async (
  tokenAddress: string,
  chainId?: string
): Promise<DexScreenerToken | null> => {
  const pairs = chainId
    ? await fetchTokensOnChain(chainId, tokenAddress)
    : await fetchPairsByToken(tokenAddress);
  const best = pickBestPair(pairs, { chainId, tokenAddress });
  if (!best) return null;

  const addr = tokenAddress.toLowerCase();
  const isBase = best.baseToken?.address?.toLowerCase() === addr;
  const tok = isBase ? best.baseToken : best.quoteToken;
  const priceUsdNum = Number(best.priceUsd) || 0;
  const priceNativeNum = Number(best.priceNative) || 0;
  // If queried token is the quote token, priceUsd is the base token's price.
  const tokenPriceUsd =
    isBase ? priceUsdNum : priceNativeNum > 0 ? priceUsdNum / priceNativeNum : 0;

  return {
    chainId: best.chainId,
    address: tok.address,
    symbol: tok.symbol,
    name: tok.name,
    logoURI: best.info?.imageUrl,
    header: best.info?.header,
    priceUsd: tokenPriceUsd,
    priceChange24h: best.priceChange?.h24,
    liquidityUsd: best.liquidity?.usd,
    fdv: best.fdv,
    marketCap: best.marketCap,
    volume24h: best.volume?.h24,
    pairAddress: best.pairAddress,
    dexId: best.dexId,
    url: best.url,
    websites: best.info?.websites,
    socials: best.info?.socials,
  };
};

/** Back-compat: best pair for an address (any chain). */
export const fetchTokenInfo = async (
  tokenAddress: string
): Promise<DexScreenerTokenInfo | null> => {
  const pairs = await fetchPairsByToken(tokenAddress);
  return pickBestPair(pairs, { tokenAddress });
};

export const fetchLatestTokens = async (): Promise<DexScreenerTokenInfo[]> => {
  const pairs = await searchPairs('solana');
  return pairs.filter((p) => p.chainId === 'solana').slice(0, 40);
};