// ── Orioles player walkup songs ───────────────────────────────────
// Dynamic source: official Orioles walk-up page.
// Fallback map below is used when the live page cannot be fetched.

const ORIOLES_WALKUP_MUSIC_URL = 'https://www.mlb.com/orioles/ballpark/music';
const WALKUP_SONG_TTL_MS = 1000 * 60 * 60 * 6;

export const FALLBACK_WALKUP_SONGS = {
  683002: ['https://open.spotify.com/track/66ZcOcouenzZEnzTJvoFmH'], // Gunnar Henderson – The Sweet Escape (Gwen Stefani)
  668939: ['https://open.spotify.com/track/2ueM6ZRm1HJZo5FBatt7Qm'], // Adley Rutschman – Alive (nightmare) (Kid Cudi & Ratatat)
  683734: ['https://open.spotify.com/track/2CGNAOSuO1MEFCbBRgUzjd'], // Jackson Holliday – luther (Kendrick Lamar & SZA)
  663624: ['https://open.spotify.com/track/0JJP0IS4w0fJx01EcrfkDe'], // Ryan Mountcastle – Dear Maria, Count Me In (All Time Low)
  641933: ['https://open.spotify.com/track/2tUL6dZf1mywCj5WvCPZw6'], // Tyler O'Neill – No Friends In The Industry (Drake)
  676059: ['https://open.spotify.com/track/1OLkuTadZZSdfzgUeemRsU'], // Jordan Westburg – The Name (KB ft. Koryn Hawthorne)
  681297: ['https://open.spotify.com/track/1EiLrPd8JMTcQUr1aLEUKi'], // Colton Cowser – Work (Gang Starr)
  624413: ['https://open.spotify.com/track/0k9JIBszlCqCa4SpXI353F'], // Pete Alonso – BIRDS (Turnstile)
  691723: ['https://open.spotify.com/track/28DySuOwKC5m8We3yRPS04'], // Coby Mayo – End of Beginning (Djo)
  665750: ['https://open.spotify.com/track/7uH27oIt4a6cIFCA8ZPcyG'], // Leody Taveras – Baila Baila Baila (Ozuna)
};

const walkupSongsCache = {
  loadedAt: 0,
  byPlayerId: { ...FALLBACK_WALKUP_SONGS },
  byPlayerName: {},
};
let walkupSongsPromise = null;

function normalizePlayerKey(name) {
  return String(name ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}

function extractPlayerIdFromHref(href) {
  const match = String(href ?? '').match(/\/player\/[^/?#]*-(\d{5,8})(?:[/?#]|$)/i);
  return match ? match[1] : '';
}

// Normalise any Spotify URL (including embed variants) to the canonical
// open.spotify.com/track/ID form stored in the cache.
function normalizeSpotifyUrl(rawUrl) {
  try {
    const url = new URL(String(rawUrl));
    if (!/open\.spotify\.com/i.test(url.hostname)) return null;
    const m = url.pathname.match(/^\/(?:embed\/)?(track|playlist|album)\/([A-Za-z0-9]+)/i);
    if (!m) return null;
    return `https://open.spotify.com/${m[1].toLowerCase()}/${m[2]}`;
  } catch {
    return null;
  }
}

function addSongToMaps(url, playerId, playerName, byPlayerId, byPlayerName) {
  const key = normalizePlayerKey(playerName);
  if (playerId) {
    byPlayerId[playerId] ??= [];
    if (!byPlayerId[playerId].includes(url)) byPlayerId[playerId].push(url);
  }
  if (key) {
    byPlayerName[key] ??= [];
    if (!byPlayerName[key].includes(url)) byPlayerName[key].push(url);
  }
}

// Recursively walk a Next.js __NEXT_DATA__ object looking for objects that
// contain both a player identity (id + name) and one or more Spotify track URLs.
function walkObjectForSongs(obj, byPlayerId, byPlayerName, depth) {
  if (!obj || typeof obj !== 'object' || depth > 25) return;
  if (Array.isArray(obj)) {
    for (const item of obj) walkObjectForSongs(item, byPlayerId, byPlayerName, depth + 1);
    return;
  }

  let playerId = '';
  let playerName = '';
  const spotifyUrls = [];

  for (const [key, val] of Object.entries(obj)) {
    if (val == null) continue;
    if (typeof val === 'string') {
      if (/open\.spotify\.com\/(embed\/)?track\//i.test(val)) {
        const norm = normalizeSpotifyUrl(val);
        if (norm) spotifyUrls.push(norm);
      } else if (/^\d{5,8}$/.test(val) && /\bid\b|player|person/i.test(key)) {
        playerId = val;
      } else if (val.length > 1 && val.length < 60 && /^(?:full)?name$/i.test(key)) {
        playerName = val;
      }
    } else if (typeof val === 'number') {
      const s = String(val);
      if (/^\d{5,8}$/.test(s) && /\bid\b|player|person/i.test(key)) {
        playerId = s;
      }
    }
  }

  if ((playerId || playerName) && spotifyUrls.length > 0) {
    for (const url of spotifyUrls) {
      addSongToMaps(url, playerId, playerName, byPlayerId, byPlayerName);
    }
  }

  for (const val of Object.values(obj)) {
    if (val && typeof val === 'object') {
      walkObjectForSongs(val, byPlayerId, byPlayerName, depth + 1);
    }
  }
}

function parseWalkupSongs(htmlText) {
  const byPlayerId = {};
  const byPlayerName = {};
  if (!htmlText) return { byPlayerId, byPlayerName };

  const doc = new DOMParser().parseFromString(String(htmlText), 'text/html');

  // ── 1. Next.js __NEXT_DATA__ JSON (most reliable when present) ────
  const nextDataEl = doc.querySelector('script#__NEXT_DATA__');
  if (nextDataEl?.textContent) {
    try {
      walkObjectForSongs(JSON.parse(nextDataEl.textContent), byPlayerId, byPlayerName, 0);
    } catch {}
  }
  if (Object.keys(byPlayerId).length + Object.keys(byPlayerName).length > 0) {
    return { byPlayerId, byPlayerName };
  }

  // ── 2. DOM scan: anchors + Spotify iframes in document order ──────
  // querySelectorAll guarantees document order for compound selectors.
  let currentPlayerId = '';
  let currentPlayerName = '';

  for (const el of doc.querySelectorAll('a[href], iframe[src]')) {
    if (el.tagName === 'A') {
      const rawHref = el.getAttribute('href') || '';
      let href = rawHref;
      try { href = new URL(rawHref, ORIOLES_WALKUP_MUSIC_URL).href; } catch {}

      const playerId = extractPlayerIdFromHref(href);
      if (playerId) {
        // This is a player profile link — establish current context.
        currentPlayerId = playerId;
        currentPlayerName = String(el.textContent ?? '').replace(/\s+/g, ' ').trim();
        continue;
      }
      if (!currentPlayerName) continue;
      if (/open\.spotify\.com\//i.test(href)) {
        const url = normalizeSpotifyUrl(href);
        if (url) addSongToMaps(url, currentPlayerId, currentPlayerName, byPlayerId, byPlayerName);
      }
    } else if (el.tagName === 'IFRAME') {
      // Spotify embeds use <iframe src="https://open.spotify.com/embed/track/...">
      if (!currentPlayerName) continue;
      const src = el.getAttribute('src') || '';
      if (/open\.spotify\.com\//i.test(src)) {
        const url = normalizeSpotifyUrl(src);
        if (url) addSongToMaps(url, currentPlayerId, currentPlayerName, byPlayerId, byPlayerName);
      }
    }
  }

  return { byPlayerId, byPlayerName };
}

function hasFreshWalkupSongs() {
  return (Date.now() - walkupSongsCache.loadedAt) < WALKUP_SONG_TTL_MS;
}

export async function ensureWalkupSongsLoaded(proxyBaseUrl) {
  if (hasFreshWalkupSongs()) return walkupSongsCache;
  if (walkupSongsPromise) return walkupSongsPromise;
  if (!proxyBaseUrl) return walkupSongsCache;

  const targetUrl = `${proxyBaseUrl}?url=${encodeURIComponent(ORIOLES_WALKUP_MUSIC_URL)}&format=text`;
  walkupSongsPromise = fetch(targetUrl)
    .then(r => r.json())
    .then(payload => {
      const parsed = parseWalkupSongs(payload?.text ?? '');
      const mergedById = {};
      for (const [id, urls] of Object.entries(FALLBACK_WALKUP_SONGS)) {
        mergedById[id] = [...urls];
      }
      for (const [id, urls] of Object.entries(parsed.byPlayerId)) {
        mergedById[id] ??= [];
        for (const url of urls) {
          if (!mergedById[id].includes(url)) mergedById[id].push(url);
        }
      }
      walkupSongsCache.byPlayerId = {
        ...mergedById,
      };
      walkupSongsCache.byPlayerName = parsed.byPlayerName;
      walkupSongsCache.loadedAt = Date.now();
      return walkupSongsCache;
    })
    .catch(() => walkupSongsCache)
    .finally(() => {
      walkupSongsPromise = null;
    });

  return walkupSongsPromise;
}

export function getWalkupSongUrls(playerId, fullName = '') {
  if (playerId != null) {
    const byId = walkupSongsCache.byPlayerId[String(playerId)];
    if (Array.isArray(byId) && byId.length) return byId;
  }
  const key = normalizePlayerKey(fullName);
  const byName = key ? (walkupSongsCache.byPlayerName[key] ?? []) : [];
  return Array.isArray(byName) ? byName : [];
}
