import { defineConfig } from 'astro/config';

// Dev proxy: forward rss-proxy.php requests to fetch RSS/XML feeds.
// Mirrors the same plugin in fanbase so dev builds work without PHP.
function rssProxyDevPlugin() {
  return {
    name: 'rss-proxy-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.includes('rss-proxy.php')) return next();
        const { searchParams } = new URL(req.url, 'http://localhost');
        const feedUrl = searchParams.get('url');
        const format = searchParams.get('format');
        if (!/^https?:\/\//i.test(feedUrl ?? '')) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing or invalid url parameter' }));
          return;
        }
        try {
          const response = await fetch(feedUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FrontOffice/1.0)', Accept: 'application/rss+xml,application/xml,text/xml,*/*' },
          });
          const xml = await response.text();
          function extractTag(src, tag) {
            const re = new RegExp(`<${tag}[^>]*>\\s*(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/${tag}>`, 'i');
            return (src.match(re)?.[1] ?? src.match(re)?.[2] ?? '').trim();
          }
          const items = [];
          for (const [, itemXml] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
            if (items.length >= 15) break;
            const title = extractTag(itemXml, 'title');
            const pubDate = extractTag(itemXml, 'pubDate');
            let link = extractTag(itemXml, 'link');
            if (!link) link = itemXml.match(/<link[^>]+href="([^"]+)"/)?.[1] ?? '';
            const rawDesc = extractTag(itemXml, 'description');
            const description = rawDesc.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 280);
            const mediaUrl = itemXml.match(/<media:(?:content|thumbnail)[^>]+url="([^"]+)"/)?.[1] ?? null;
            items.push({ title, link, pubDate, description, thumbnail: mediaUrl });
          }
          const feedTitle = extractTag(xml.match(/<channel>([\s\S]*)/)?.[1] ?? '', 'title');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ feedTitle, items }));
        } catch {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to fetch feed' }));
        }
      });
    },
  };
}

export default defineConfig({
  site: 'https://www.briancsmith.org',
  base: '/fanbase/frontoffice/',
  output: 'static',
  build: {
    assets: 'assets',
  },
  vite: {
    plugins: [rssProxyDevPlugin()],
    build: {
      rolldownOptions: {
        output: {
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name][extname]',
        },
      },
    },
  },
});
