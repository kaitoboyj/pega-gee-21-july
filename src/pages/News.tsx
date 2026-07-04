import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { PegasusAnimation } from '@/components/PegasusAnimation';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Clock, Newspaper, Flame, RefreshCw, Radio } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Item {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  image: string | null;
  creator: string | null;
  categories: string[];
}

const POLL_MS = 60_000; // refresh every minute

const timeAgo = (iso: string) => {
  const t = new Date(iso).getTime();
  if (!t) return '';
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const News = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('All');

  const load = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('coindesk-news');
      if (error) throw error;
      if (data?.items) {
        setItems((prev) => {
          // Merge by link, newest first, preserve order from API
          const map = new Map<string, Item>();
          (data.items as Item[]).forEach((i) => map.set(i.link, i));
          prev.forEach((i) => { if (!map.has(i.link)) map.set(i.link, i); });
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
          );
        });
        setLastUpdate(new Date());
        setError(null);
      }
    } catch (e: any) {
      console.error('News load error', e);
      setError(e?.message || 'Failed to load news');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(() => load(false), POLL_MS);
    return () => clearInterval(id);
  }, []);

  const allCategories = Array.from(
    new Set(items.flatMap((i) => i.categories).filter(Boolean))
  ).slice(0, 8);

  const filtered =
    category === 'All' ? items : items.filter((i) => i.categories.includes(category));

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <PegasusAnimation />
      <Navigation />

      <div className="relative z-10 container mx-auto px-3 sm:px-6 pt-36 md:pt-44 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card-strong mb-4">
            <Radio className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Live from Crypto News
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-3">
            Crypto News
          </h1>

          <div className="flex items-center justify-center gap-3 mt-3 text-xs text-muted-foreground">
            {lastUpdate && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> Updated {timeAgo(lastUpdate.toISOString())}
              </span>
            )}
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="flex items-center gap-1 hover:text-primary transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Category filter chips */}
        {allCategories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {['All', ...allCategories].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  category === c
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                    : 'glass-card text-muted-foreground hover:text-foreground'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {error && !loading && items.length === 0 && (
          <div className="text-center py-12 text-red-400 glass-card rounded-2xl max-w-xl mx-auto">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {loading && (
            <>
              <Skeleton className="h-80 w-full rounded-2xl" />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-2xl" />
                ))}
              </div>
            </>
          )}

          {!loading && featured && (
            <motion.a
              href={featured.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="block group relative overflow-hidden rounded-2xl glass-card-strong hover:scale-[1.005] transition-transform"
            >
              {featured.image && (
                <div className="relative h-64 md:h-96 overflow-hidden">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary/90 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3 h-3" /> Latest
                  </div>
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  <span className="font-semibold text-primary">Crypto News</span>
                  {featured.creator && <span>by {featured.creator}</span>}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {timeAgo(featured.pubDate)}
                  </span>
                </div>
                <h2 className="text-xl md:text-3xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {featured.title}
                </h2>
                <p className="text-sm md:text-base text-muted-foreground line-clamp-3">
                  {featured.description}
                </p>
                <div className="flex items-center gap-1 text-primary text-sm font-semibold mt-3">
                  Read More <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </motion.a>
          )}

          {!loading && rest.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.map((a, i) => (
                <motion.a
                  key={a.link}
                  href={a.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  className="group glass-card rounded-2xl overflow-hidden hover:bg-white/5 transition-all flex flex-col"
                >
                  {a.image && (
                    <div className="h-40 overflow-hidden">
                      <img
                        src={a.image}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                      />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Newspaper className="w-3 h-3 text-primary" />
                      <span className="font-semibold text-primary">Crypto News</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {timeAgo(a.pubDate)}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm md:text-base mb-1 line-clamp-3 group-hover:text-primary transition-colors">
                      {a.title}
                    </h3>
                    {a.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {a.description}
                      </p>
                    )}
                    {a.categories[0] && (
                      <span className="mt-3 inline-block self-start text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                        {a.categories[0]}
                      </span>
                    )}
                  </div>
                </motion.a>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && !error && (
            <div className="text-center py-12 text-muted-foreground glass-card rounded-2xl">
              No articles yet. Refresh in a moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default News;
