// ── MLB season dates, cached (#42) ────────────────────────────────
// One /seasons/{year} call feeds both the season phase (season.js: is it
// the offseason?) and the key dates every calendar shows (keyDates.js:
// spring training, Opening Day, All-Star Game, end of the regular season,
// postseason). Cached in localStorage per year and re-checked once a week,
// all year (Brian's call): season dates rarely move, and a week is soon
// enough to catch one that does.
import { MLB } from './config.js';

const KEY = 'fb_season_dates';
const VERSION = 2;
export const TTL = 7 * 24 * 3600 * 1000;

function read(year) {
  try {
    const c = JSON.parse(localStorage.getItem(`${KEY}_${year}`));
    return c?.v === VERSION && c.year === year ? c : null;
  } catch {
    return null;
  }
}

function write(entry) {
  try { localStorage.setItem(`${KEY}_${entry.year}`, JSON.stringify(entry)); } catch { /* storage blocked */ }
}

const pending = new Map();

/**
 * MLB's season record for `year` (springStartDate, regularSeasonStartDate,
 * allStarDate, regularSeasonEndDate, postSeasonStartDate, postSeasonEndDate…),
 * from the cache while it's under a week old. If the API fails, a stale
 * copy is better than nothing; with no copy at all it rejects. Rejects for
 * a year MLB hasn't scheduled yet.
 */
export function loadSeasonDates(year) {
  if (pending.has(year)) return pending.get(year);
  const cached = read(year);
  if (cached && Date.now() - cached.at < TTL) return Promise.resolve(cached.season);
  const load = fetch(`${MLB}/seasons/${year}?sportId=1`)
    .then(r => (r.ok ? r.json() : Promise.reject(new Error(`seasons/${year} ${r.status}`))))
    .then(data => {
      const season = data.seasons?.[0];
      if (!season?.regularSeasonStartDate) throw new Error(`No ${year} season dates`);
      write({ v: VERSION, year, at: Date.now(), season });
      return season;
    })
    .catch(err => {
      if (cached) return cached.season;
      throw err;
    });
  pending.set(year, load);
  return load;
}
