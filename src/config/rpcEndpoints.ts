// Central RPC endpoint configuration.
// Primary providers are QuickNode / Covalent. Alchemy is configured as an
// automatic backup so the site keeps working when the primary APIs fail.

import { Connection } from '@solana/web3.js';
import type { Commitment, ConnectionConfig } from '@solana/web3.js';

export const ALCHEMY_KEY = '4ktChsUHziUE8O7iKgSBY';

// New Covalent (GoldRush) API key — replaces the previous key everywhere.
export const COVALENT_API_KEY = 'cqt_rQJhYVghJTyV4q3whPMJqqfm9vg6';

// -----------------------------
// Solana endpoints (with failover)
// -----------------------------
export const SOLANA_QUICKNODE_RPC =
  'https://dawn-methodical-layer.solana-mainnet.quiknode.pro/d565449f2840f6f56e70de4d61e6eacd1387b03e/';
export const SOLANA_QUICKNODE_WSS =
  'wss://dawn-methodical-layer.solana-mainnet.quiknode.pro/d565449f2840f6f56e70de4d61e6eacd1387b03e/';
export const SOLANA_ALCHEMY_RPC = `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`;

// Ordered list: primary first, backups after. All failover helpers iterate this
// array so callers automatically fall through when the primary is down.
export const SOLANA_RPCS: readonly string[] = [
  SOLANA_QUICKNODE_RPC,
  SOLANA_ALCHEMY_RPC,
];

export const SOLANA_PRIMARY_RPC = SOLANA_RPCS[0];

// -----------------------------
// EVM endpoints (with failover)
// -----------------------------
export const EVM_QUICKNODE_RPCS: Record<number, string> = {
  1: 'https://serene-greatest-putty.quiknode.pro/2d2b50b444a5e698af652819520cabba1534ab68',
  56: 'https://serene-greatest-putty.bsc.quiknode.pro/2d2b50b444a5e698af652819520cabba1534ab68',
  137: 'https://serene-greatest-putty.matic.quiknode.pro/2d2b50b444a5e698af652819520cabba1534ab68',
  8453: 'https://serene-greatest-putty.base-mainnet.quiknode.pro/2d2b50b444a5e698af652819520cabba1534ab68',
};

export const EVM_ALCHEMY_RPCS: Record<number, string> = {
  1: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  56: `https://bnb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  137: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  8453: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
};

export const EVM_ALCHEMY_WSS: Record<number, string> = {
  1: `wss://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  56: `wss://bnb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  137: `wss://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  8453: `wss://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
};

export function getEvmRpcs(chainId: number): string[] {
  return [EVM_QUICKNODE_RPCS[chainId], EVM_ALCHEMY_RPCS[chainId]].filter(Boolean) as string[];
}

// -----------------------------
// Covalent chain names
// -----------------------------
export const COVALENT_CHAIN_NAMES: Record<number, string> = {
  1: 'eth-mainnet',
  56: 'bsc-mainnet',
  137: 'matic-mainnet',
  8453: 'base-mainnet',
};

// -----------------------------
// Failover helpers
// -----------------------------

/** Fire a single JSON-RPC request against Solana, falling through backups. */
export async function solanaRpc<T = any>(method: string, params: unknown[]): Promise<T> {
  let lastErr: unknown;
  for (const url of SOLANA_RPCS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error?.message || 'RPC error');
      return data.result as T;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('All Solana RPC endpoints failed');
}

/** Batched JSON-RPC against Solana, falling through backups on network failure. */
export async function solanaRpcBatch<T = any>(payload: any[]): Promise<T[]> {
  let lastErr: unknown;
  for (const url of SOLANA_RPCS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as T[];
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('All Solana RPC endpoints failed');
}

/** Fire an EVM JSON-RPC request for a chain, falling through backups. */
export async function evmRpc<T = any>(chainId: number, method: string, params: unknown[]): Promise<T> {
  const urls = getEvmRpcs(chainId);
  if (urls.length === 0) throw new Error(`No RPC configured for chain ${chainId}`);
  let lastErr: unknown;
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error?.message || 'RPC error');
      return data.result as T;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(`All RPC endpoints failed for chain ${chainId}`);
}

/**
 * Run a callback against a Solana Connection, retrying on the next configured
 * endpoint if the primary throws.
 */
export async function withSolanaConnection<T>(
  fn: (connection: Connection) => Promise<T>,
  config: Commitment | ConnectionConfig = 'confirmed',
): Promise<T> {
  let lastErr: unknown;
  for (const url of SOLANA_RPCS) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const connection = new Connection(url, config as any);
      return await fn(connection);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('All Solana RPC endpoints failed');
}
