// ── Orioles player walkup songs ───────────────────────────────────
// Dynamic source: official Orioles walk-up page.
// Fallback map below is used when the live page cannot be fetched.

const ORIOLES_WALKUP_MUSIC_URL = 'https://www.mlb.com/orioles/ballpark/music';
const WALKUP_SONG_TTL_MS = 1000 * 60 * 60 * 6;

export const FALLBACK_WALKUP_SONGS = {
  683002: ['https://open.spotify.com/track/66ZcOcouenzZEnzTJvoFmH'], // Gunnar Henderson
  668939: ['https://open.spotify.com/track/23SZWX2IaDnxmhFsSLvkG2'], // Adley Rutschman
  683734: ['https://open.spotify.com/track/2CGNAOSuO1MEFCbBRgUzjd'], // Jackson Holliday
  663624: ['https://open.spotify.com/track/0JJP0IS4w0fJx01EcrfkDe'], // Ryan Mountcastle
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

function parseWalkupSongs(htmlText) {
  const byPlayerId = {};
  const byPlayerName = {};
  if (!htmlText) return { byPlayerId, byPlayerName };

  const doc = new DOMParser().parseFromString(String(htmlText), 'text/html');
  const anchors = [...doc.querySelectorAll('a[href]')];
  let currentPlayerId = '';
  let currentPlayerName = '';

  for (const anchor of anchors) {
    const rawHref = anchor.getAttribute('href') || '';
    let href = rawHref;
    try {
      href = new URL(rawHref, ORIOLES_WALKUP_MUSIC_URL).toString();
    } catch {}

    const label = String(anchor.textContent ?? '').replace(/\s+/g, ' ').trim();
    const playerId = extractPlayerIdFromHref(href);
    if (playerId && label) {
      currentPlayerId = playerId;
      currentPlayerName = label;
      continue;
    }

    if (!currentPlayerName || !/open\.spotify\.com\//i.test(href)) continue;
    const playerKey = normalizePlayerKey(currentPlayerName);
    if (!playerKey) continue;

    if (currentPlayerId) {
      byPlayerId[currentPlayerId] ??= [];
      if (!byPlayerId[currentPlayerId].includes(href)) byPlayerId[currentPlayerId].push(href);
    }
    byPlayerName[playerKey] ??= [];
    if (!byPlayerName[playerKey].includes(href)) byPlayerName[playerKey].push(href);
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
