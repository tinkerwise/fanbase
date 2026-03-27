const express = require('express');
const RSSParser = require('rss-parser');
const path = require('path');

const app = express();
const parser = new RSSParser({
  timeout: 10000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OriolesNews/1.0; +https://github.com/tinkerwise/orioles-magic)' },
  customFields: {
    item: [
      ['media:content', 'media:content', { keepArray: false }],
      ['media:thumbnail', 'media:thumbnail', { keepArray: false }],
    ],
  },
});

const PORT = process.env.PORT || 3000;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

const FEEDS = [
  {
    id: 'orioles',
    name: 'Baltimore Orioles',
    url: 'https://www.mlb.com/orioles/feeds/news/rss.xml',
    color: '#DF4601',
    category: 'orioles',
  },
  {
    id: 'bbn',
    name: 'Baltimore Baseball',
    url: 'https://www.baltimorebaseball.com/feed/',
    color: '#F97316',
    category: 'orioles',
  },
  {
    id: 'banner',
    name: 'The Banner',
    url: 'https://www.thebanner.com/author/andy-kostka/feed/',
    color: '#A855F7',
    category: 'orioles',
  },
  {
    id: 'mlb',
    name: 'MLB.com',
    url: 'https://www.mlb.com/feeds/news/rss.xml',
    color: '#002D72',
    category: 'mlb',
  },
  {
    id: 'mlbtr',
    name: 'MLB Trade Rumors',
    url: 'https://www.mlbtraderumors.com/baltimore-orioles/feed',
    color: '#EAB308',
    category: 'mlb',
  },
  {
    id: 'espn',
    name: 'ESPN MLB',
    url: 'https://www.espn.com/espn/rss/mlb/news',
    color: '#CC0000',
    category: 'mlb',
  },
  {
    id: 'fangraphs',
    name: 'FanGraphs',
    url: 'https://blogs.fangraphs.com/feed/',
    color: '#22C55E',
    category: 'mlb',
  },
];

// In-memory cache
let cache = null;
let cacheTime = 0;

function stripHtml(str = '') {
  return str.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 240);
}

function extractImage(item) {
  const mc = item['media:content'];
  if (mc) {
    if (typeof mc === 'string') return mc;
    if (mc.$ && mc.$.url) return mc.$.url;
    if (mc.url) return mc.url;
  }
  const mt = item['media:thumbnail'];
  if (mt) {
    if (typeof mt === 'string') return mt;
    if (mt.$ && mt.$.url) return mt.$.url;
  }
  if (item.enclosure && item.enclosure.url) {
    const u = item.enclosure.url;
    if (/\.(jpe?g|png|webp|gif)(\?|$)/i.test(u)) return u;
  }
  const content = item.content || item['content:encoded'] || '';
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match) return match[1];
  return null;
}

async function fetchFeed(source) {
  try {
    const feed = await parser.parseURL(source.url);
    return {
      source: { id: source.id, name: source.name, color: source.color, category: source.category },
      articles: feed.items.slice(0, 20).map((item) => ({
        title: (item.title || '').trim(),
        link: item.link || '',
        pubDate: item.isoDate || item.pubDate || '',
        description: stripHtml(item.contentSnippet || item.summary || item.content || ''),
        thumbnail: extractImage(item),
      })),
      error: false,
    };
  } catch (err) {
    console.error(`[${source.name}] fetch failed: ${err.message}`);
    return {
      source: { id: source.id, name: source.name, color: source.color, category: source.category },
      articles: [],
      error: true,
    };
  }
}

async function loadFeeds() {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));
  return results.map((r) => (r.status === 'fulfilled' ? r.value : null)).filter(Boolean);
}

async function getFeeds(force = false) {
  if (!force && cache && Date.now() - cacheTime < CACHE_TTL) {
    return { feeds: cache, cachedAt: new Date(cacheTime).toISOString(), fromCache: true };
  }
  cache = await loadFeeds();
  cacheTime = Date.now();
  return { feeds: cache, cachedAt: new Date(cacheTime).toISOString(), fromCache: false };
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/feeds', async (req, res) => {
  try {
    const data = await getFeeds();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feeds' });
  }
});

app.post('/api/refresh', async (req, res) => {
  try {
    const data = await getFeeds(true);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to refresh feeds' });
  }
});

app.listen(PORT, () => {
  console.log(`Orioles Magic running at http://localhost:${PORT}`);
});
