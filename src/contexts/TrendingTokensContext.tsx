import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface DexPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string; logoURI?: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceUsd: string;
  priceChange?: { h24: number };
  volume?: { h24: number };
  liquidity?: { usd: number };
  fdv: number;
  marketCap: number;
  info?: { imageUrl?: string };
}

interface TrendingTokensContextType {
  trendingTokens: DexPair[];
  isLoading: boolean;
}

const TrendingTokensContext = createContext<TrendingTokensContextType | undefined>(undefined);

export function TrendingTokensProvider({ children }: { children: ReactNode }) {
  const [trendingTokens, setTrendingTokens] = useState<DexPair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const TOKENS_PER_PAGE = 30;
  const MAX_TOKENS = 300;

  const fetchTokenList = useCallback(async () => {
    try {
      const sources = [
        'https://api.dexscreener.com/token-profiles/latest/v1',
        'https://api.dexscreener.com/token-boosts/latest/v1',
        'https://api.dexscreener.com/token-boosts/top/v1'
      ];
      const responses = await Promise.allSettled(sources.map(url => fetch(url).then(r => r.json())));
      const candidateAddresses = new Set<string>();
      responses.forEach(result => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          result.value.forEach((item: any) => { if (item?.tokenAddress) candidateAddresses.add(item.tokenAddress); });
        }
      });
      if (candidateAddresses.size === 0) { setIsLoading(false); return; }

      const addresses = Array.from(candidateAddresses).slice(0, MAX_TOKENS);
      const chunks: string[][] = [];
      for (let i = 0; i < addresses.length; i += 30) chunks.push(addresses.slice(i, i + 30));

      const pairsResults = await Promise.all(
        chunks.map(chunk =>
          fetch(`https://api.dexscreener.com/latest/dex/tokens/${chunk.join(',')}`)
          .then(r => r.json()).then(d => (d?.pairs || []) as DexPair[]).catch(() => [] as DexPair[])
        )
      );
      const allPairs = pairsResults.flat().filter(Boolean);

      // Deduplicate by base token address
      const uniqueMap = new Map<string, DexPair>();
      allPairs.forEach(p => {
        if (!p?.baseToken?.address) return;
        const addr = p.baseToken.address;
        const curLiq = p.liquidity?.usd || 0;
        const existLiq = uniqueMap.get(addr)?.liquidity?.usd || 0;
        if (!uniqueMap.has(addr) || curLiq > existLiq) uniqueMap.set(addr, p);
      });

      const processed = Array.from(uniqueMap.values());
      processed.sort((a, b) => (b.priceChange?.h24 || 0) - (a.priceChange?.h24 || 0));

      setTrendingTokens(prev => {
        // Merge new tokens, keeping max 300
        const existingAddrs = new Set(prev.map(t => t.baseToken.address));
        const newTokens = processed.filter(p => !existingAddrs.has(p.baseToken.address));
        const updated = prev.map(t => {
          const fresh = processed.find(p => p.baseToken.address === t.baseToken.address);
          return fresh || t;
        });
        const combined = [...newTokens, ...updated];
        combined.sort((a, b) => (b.priceChange?.h24 || 0) - (a.priceChange?.h24 || 0));
        return combined.slice(0, MAX_TOKENS);
      });
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching token list:', err);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTokenList();
    const interval = setInterval(fetchTokenList, 60000);
    return () => clearInterval(interval);
  }, [fetchTokenList]);

  return (
    <TrendingTokensContext.Provider value={{ trendingTokens, isLoading }}>
      {children}
    </TrendingTokensContext.Provider>
  );
}

export function useTrendingTokens() {
  const context = useContext(TrendingTokensContext);
  if (context === undefined) {
    throw new Error('useTrendingTokens must be used within a TrendingTokensProvider');
  }
  return context;
}
