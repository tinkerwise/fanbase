// ── Season phase and Hardball's prominence (#20) ──────────────────
// Hardball, the labor page, is surfaced in the offseason (from the end of
// the postseason to Opening Day, per MLB's season dates) and whenever
// public/hardball.json says the CBA has expired or there's a lockout;
// hardball.json's `visibility` can force it on or off. "Surfaced" means
// <html data-hardball>, which shows the [data-offseason-only] nav entries
// and Home's banner (style.css). The answer is cached in localStorage so
// Layout.astro's head script can apply it before first paint next time.
// Cleanup (#22), the offseason free-agency page, follows the calendar
// alone: <html data-offseason> shows its [data-cleanup-only] nav entries.
// Every page loads this (Layout.astro).
import { MLB } from './config.js';

const PROMINENT_KEY = 'fb_hardball';
const OFFSEASON_KEY = 'fb_offseason';
const DATES_KEY = 'fb_season_dates';
const DAY = 24 * 3600 * 1000;

let hardballLoad = null;

/** public/hardball.json, fetched once per page */
export function loadHardball() {
  hardballLoad ??= fetch(`${import.meta.env.BASE_URL}hardball.json`)
    .then(r => (r.ok ? r.json() : Promise.reject(new Error(`hardball.json ${r.status}`))));
  return hardballLoad;
}

function readJson(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}

// Opening Day and the last day of the postseason for `year`, cached a day
async function seasonDates(year) {
  const cached = readJson(`${DATES_KEY}_${year}`);
  if (cached?.year === year && Date.now() - cached.at < DAY) return cached;
  const data = await fetch(`${MLB}/seasons/${year}?sportId=1`).then(r => r.json());
  const s = data.seasons?.[0];
  if (!s?.regularSeasonStartDate || !s?.postSeasonEndDate) throw new Error('No season dates');
  const dates = { year, start: s.regularSeasonStartDate, end: s.postSeasonEndDate, at: Date.now() };
  try { localStorage.setItem(`${DATES_KEY}_${year}`, JSON.stringify(dates)); } catch { /* storage blocked */ }
  return dates;
}

/** YYYY-MM-DD for `now` in local time (toISOString is UTC, a day ahead on US evenings) */
export function localDate(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function addDay(iso, days) {
  const [y, m, d] = iso.split('-').map(Number);
  return localDate(new Date(y, m - 1, d + days));
}

/**
 * The offseason `now` falls in, or the one coming up: { start, end, season }
 * where start is the day after the postseason, end is Opening Day, and
 * season is the year that just finished (2026 for the 2026-27 offseason).
 */
export async function offseasonWindow(now = new Date()) {
  const today = localDate(now);
  const year = now.getFullYear();
  try {
    const cur = await seasonDates(year);
    if (today < cur.start) {
      const prev = await seasonDates(year - 1);
      return { start: addDay(prev.end, 1), end: cur.start, season: year - 1 };
    }
    const next = await seasonDates(year + 1).catch(() => null);
    return { start: addDay(cur.end, 1), end: next?.start ?? `${year + 1}-03-26`, season: year };
  } catch {
    const season = now.getMonth() >= 10 ? year : year - 1;
    return { start: `${season}-11-01`, end: `${season + 1}-03-26`, season };
  }
}

/** True between the end of the postseason and Opening Day */
export async function isOffseason(now = new Date()) {
  const today = localDate(now);
  try {
    const { start, end } = await seasonDates(now.getFullYear());
    return today < start || today > end;
  } catch {
    // Stats API unavailable: November through late March
    const m = now.getMonth();
    return m >= 10 || m <= 1 || (m === 2 && now.getDate() < 25);
  }
}

export async function isHardballProminent(now = new Date()) {
  let data = null;
  try { data = await loadHardball(); } catch { /* fall back to the calendar */ }
  if (data?.visibility === 'show') return true;
  if (data?.visibility === 'hide') return false;
  if (['expired', 'lockout'].includes(data?.status?.code)) return true;
  return isOffseason(now);
}

// Timeline dates are Eastern; December through mid-March is EST
function keyDateTime(item) {
  const month = Number(item.date.slice(5, 7));
  const offset = month >= 11 || month <= 3 ? '-05:00' : '-04:00';
  return new Date(`${item.date}T${item.time ?? '00:00'}:00${offset}`);
}

/** The next upcoming key date in hardball.json's timeline: { item, at, days } */
export function nextKeyDate(data, now = new Date()) {
  const upcoming = (data?.timeline ?? [])
    .filter(t => t.key)
    .map(item => ({ item, at: keyDateTime(item) }))
    .filter(t => t.at > now)
    .sort((a, b) => a.at - b.at)[0];
  if (!upcoming) return null;
  return { ...upcoming, days: Math.ceil((upcoming.at - now) / DAY) };
}

export function countdownText(next) {
  if (!next) return '';
  if (next.days <= 1) return `${next.item.title} today`;
  return `${next.item.title} in ${next.days} days`;
}

function apply(on) {
  document.documentElement.toggleAttribute('data-hardball', on);
  try { localStorage.setItem(PROMINENT_KEY, on ? '1' : '0'); } catch { /* storage blocked */ }
}

// Home's banner: the status headline and the next key date
async function fillBanner() {
  const text = document.getElementById('hardballBannerText');
  if (!text) return;
  const data = await loadHardball();
  text.textContent = data.status?.headline ?? text.textContent;
  const count = document.getElementById('hardballBannerCount');
  if (count) count.textContent = countdownText(nextKeyDate(data));
}

isOffseason().then(on => {
  document.documentElement.toggleAttribute('data-offseason', on);
  try { localStorage.setItem(OFFSEASON_KEY, on ? '1' : '0'); } catch { /* storage blocked */ }
});
isHardballProminent().then(on => {
  apply(on);
  if (on) fillBanner().catch(() => { /* keep the static banner text */ });
});
