import { motion } from 'framer-motion';
import { Flame, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useTrendingTokens } from '@/contexts/TrendingTokensContext';
import { useNavigate } from 'react-router-dom';

export const TrendingTokens = () => {
  const { trendingTokens, isLoading } = useTrendingTokens();
  const navigate = useNavigate();
  const topTenTokens = trendingTokens.slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-2xl mx-auto mt-8"
    >
      <div className="flex items-center gap-2 mb-4 px-2">
        <Flame className="w-5 h-5 text-orange-400" />
        <h2 className="text-lg font-bold text-foreground">Find Cooking Tokens</h2>
        <span className="text-xs text-muted-foreground ml-auto">Top 10 trending · scroll →</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="relative">
          <div
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 px-1 scrollbar-thin"
            style={{ scrollbarWidth: 'thin' }}
          >
            {topTenTokens.map((token, i) => {
              const change = token.priceChange?.h24;
              const positive = (change ?? 0) >= 0;
              return (
                <Card
                  key={token.baseToken.address + token.pairAddress}
                  className="snap-start shrink-0 w-[calc((100%-2.25rem)/4)] min-w-[140px] p-3 bg-card/60 backdrop-blur border-primary/20 hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => navigate('/dex', { state: { preselectedToken: token.baseToken.address } })}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={token.info?.imageUrl || token.baseToken.logoURI || ''}
                      alt={token.baseToken.symbol}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">
                        {token.baseToken.symbol.toUpperCase()}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {token.baseToken.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-foreground">
                    ${Number(token.priceUsd) < 0.01 ? Number(token.priceUsd).toExponential(2) : Number(token.priceUsd).toFixed(4)}
                  </div>
                  {change !== undefined && (
                    <div
                      className={`text-xs flex items-center gap-1 mt-1 ${
                        positive ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(change).toFixed(2)}%
                    </div>
                  )}
                  <div className="text-[10px] text-muted-foreground mt-1">#{i + 1}</div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};
