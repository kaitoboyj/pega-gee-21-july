// Alchemy Prices API — used as a price fallback when DexScreener/Jupiter fail.
// Docs: https://docs.alchemy.com/reference/get-token-prices-by-address
import { ALCHEMY_KEY } from '@/config/rpcEndpoints';

const ALCHEMY_NETWORK_BY_CHAIN_ID: Record<number, string> = {
  1: 'eth-mainnet',
  56: 'bnb-mainnet',
  137: 'polygon-mainnet',
  8453: 'base-mainnet',
};

const PRICES_URL = `https://api.g.alchemy.com/prices/v1/${ALCHEMY_KEY}/tokens/by-address`;
const SYMBOL_URL = `https://api.g.alchemy.com/prices/v1/${ALCHEMY_KEY}/tokens/by-symbol`;

async function callAlchemyPrices(body: unknown): Promise<number> {
  try {
    const res = await fetch(PRICES_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return 0;
    const data = await res.json();
    const value = data?.data?.[0]?.prices?.[0]?.value;
    return value ? Number(value) : 0;
  } catch {
    return 0;
  }
}

/** EVM token price via Alchemy Prices. Returns 0 on any failure. */
export async function fetchEvmPriceFromAlchemy(address: string, chainId: number): Promise<number> {
  const network = ALCHEMY_NETWORK_BY_CHAIN_ID[chainId];
  if (!network || !address) return 0;
  return callAlchemyPrices({ addresses: [{ network, address }] });
}

/** Solana token price via Alchemy Prices. */
export async function fetchSolanaPriceFromAlchemy(mint: string): Promise<number> {
  if (!mint) return 0;
  return callAlchemyPrices({ addresses: [{ network: 'solana-mainnet', address: mint }] });
}

/** Native token price by symbol (ETH, BNB, MATIC…) via Alchemy. */
export async function fetchNativePriceFromAlchemy(symbol: string): Promise<number> {
  try {
    const res = await fetch(`${SYMBOL_URL}?symbols=${encodeURIComponent(symbol)}`, {
      headers: { accept: 'application/json' },
    });
    if (!res.ok) return 0;
    const data = await res.json();
    const value = data?.data?.[0]?.prices?.[0]?.value;
    return value ? Number(value) : 0;
  } catch {
    return 0;
  }
}
