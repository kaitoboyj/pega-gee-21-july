import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const FEEDS = [
  'https://www.coindesk.com/arc/outboundfeeds/rss/',
  'https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml',
];

interface Item {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  image: string | null;
  creator: string | null;
  categories: string[];
}

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

const stripHtml = (s: string) => decode(s).replace(/<[^>]+>/g, '').trim();

const pickTag = (block: string, tag: string): string => {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = block.match(re);
  return m ? decode(m[1]).trim() : '';
};

const pickAllTags = (block: string, tag: string): string[] => {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  const out: string[] = [];
  let m;
  while ((m = re.exec(block)) !== null) out.push(decode(m[1]).trim());
  return out;
};

const extractImage = (block: string): string | null => {
  const mediaContent = block.match(/<media:content[^>]+url="([^"]+)"/i);
  if (mediaContent) return mediaContent[1];
  const mediaThumb = block.match(/<media:thumbnail[^>]+url="([^"]+)"/i);
  if (mediaThumb) return mediaThumb[1];
  const enclosure = block.match(/<enclosure[^>]+url="([^"]+)"[^>]*type="image/i);
  if (enclosure) return enclosure[1];
  const desc = pickTag(block, 'description');
  const imgInDesc = decode(desc).match(/<img[^>]+src="([^"]+)"/i);
  if (imgInDesc) return imgInDesc[1];
  return null;
};

const parseRss = (xml: string): Item[] => {
  const items: Item[] = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const block = m[1];
    items.push({
      title: stripHtml(pickTag(block, 'title')),
      link: stripHtml(pickTag(block, 'link')),
      description: stripHtml(pickTag(block, 'description')).slice(0, 300),
      pubDate: pickTag(block, 'pubDate'),
      image: extractImage(block),
      creator: stripHtml(pickTag(block, 'dc:creator')) || null,
      categories: pickAllTags(block, 'category').map(stripHtml).filter(Boolean),
    });
  }
  return items;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  for (const url of FEEDS) {
    try {
      const r = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LovableNewsBot/1.0)',
          Accept: 'application/rss+xml, application/xml, text/xml',
        },
      });
      if (!r.ok) continue;
      const xml = await r.text();
      const items = parseRss(xml);
      if (items.length > 0) {
        return new Response(
          JSON.stringify({ items, source: 'coindesk', fetchedAt: new Date().toISOString() }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (e) {
      console.error('Feed fetch failed', url, e);
    }
  }

  return new Response(
    JSON.stringify({ items: [], error: 'All feeds failed' }),
    { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
