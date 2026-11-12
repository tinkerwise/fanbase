// ── MLB season dates, cached (#42) ────────────────────────────────
// One /seasons/{year} call feeds both the season phase (season.js: is it
// the offseason?) and the key dates every calendar shows (keyDates.js:
// spring training, Opening Day, All-Star Game, end of the regular season,
// postseason). Cached in localStorage per year and re-checked on a pace set
// by the time of year, per Brian: often in the offseason, when dates get
// set and can move (a lockout can push back spring training and Opening
// Day), and rarely during the season, when they're settled.
import { MLB } from './config.js';

const KEY = 'fb_season_dates';
const VERSION = 2;
const HOUR = 3600 * 1000;
export const OFFSEASON_TTL = 6 * HOUR;
export const IN_SEASON_TTL = 7 * 24 * HOUR;

/** YYYY-MM-DD in local time. */
function ymd(now) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

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

// Opening Day through the last day of the postseason, from any cached year
function inSeason(today) {
  const c = read(Number(today.slice(0, 4)));
  const end = c?.season?.postSeasonEndDate ?? c?.season?.regularSeasonEndDate;
  return Boolean(c?.season?.regularSeasonStartDate && end && today >= c.season.regularSeasonStartDate && today <= end);
}

/** How long cached season dates stay fresh today. */
export function seasonDatesTtl(now = new Date()) {
  return inSeason(ymd(now)) ? IN_SEASON_TTL : OFFSEASON_TTL;
}

const pending = new Map();

/**
 * MLB's season record for `year` (springStartDate, regularSeasonStartDate,
 * allStarDate, regularSeasonEndDate, postSeasonStartDate, postSeasonEndDate…),
 * from the cache while it's fresh. If the API fails, a stale copy is better
 * than nothing; with no copy at all it rejects. Rejects for a year MLB
 * hasn't scheduled yet.
 */
export function loadSeasonDates(year, now = new Date()) {
  if (pending.has(year)) return pending.get(year);
  const cached = read(year);
  if (cached && Date.now() - cached.at < seasonDatesTtl(now)) return Promise.resolve(cached.season);
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
