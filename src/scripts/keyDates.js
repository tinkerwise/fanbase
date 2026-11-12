// ── Key dates (#42) ───────────────────────────────────────────────
// public/key-dates.json is the one list of baseball's key dates that every
// calendar reads: Schedule (markers, tag `schedule`), Cleanup (`cleanup`),
// Hardball's timeline (`hardball`, merged in by season.js) and the Draft
// page (`draft`). Most entries are hand-curated with a source.
//
// MLB's season dates (spring training, Opening Day, All-Star Game, end of
// the regular season, postseason) are kept current on the site itself:
// each page merges in what the Stats API says now (seasonDates.js, cached
// and re-checked once a week). A date in the file is the one first
// announced; if MLB's differs, the page shows MLB's date. A season MLB has
// scheduled but the file doesn't list yet is added, and entries more than
// two weeks past drop off.
//
// A date that moved keeps the old one in `history`, but pages show only the
// current date (Brian: no inline change markers; a footnote under each list
// says the dates are kept current). `status` says when one was postponed or
// canceled, and every calendar says so the same way.
import { loadSeasonDates } from './seasonDates.js';
import { SEASON_DATE_KINDS, SEASON_DATES_SOURCE, PRUNE_DAYS } from './seasonDateKinds.js';

let load = null;

function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const lastDay = e => e.dateEnd ?? e.date ?? e.sort;

/**
 * `entries` with MLB's current season dates for `seasons` ({ year: season
 * record or null }) merged in, and entries more than PRUNE_DAYS past
 * dropped. Doesn't change `entries`.
 */
export function mergeSeasonDates(entries, seasons, today = ymd(new Date())) {
  const out = entries.map(e => ({ ...e }));
  for (const [year, season] of Object.entries(seasons)) {
    if (!season) continue;
    for (const k of SEASON_DATE_KINDS) {
      const date = season[k.field];
      if (!date) continue;
      const dateEnd = k.endField ? season[k.endField] : undefined;
      const id = `${k.kind}-${year}`;
      const entry = out.find(e => e.id === id);
      if (!entry) {
        // Only dates still ahead are worth adding
        if ((dateEnd ?? date) >= today) {
          out.push({ id, from: 'api', date, ...(dateEnd ? { dateEnd } : {}), title: k.title, detail: '', tags: k.tags, source: SEASON_DATES_SOURCE });
        }
        continue;
      }
      if (entry.date === date && (!dateEnd || entry.dateEnd === dateEnd)) continue;
      // MLB moved it: keep the file's date in history
      entry.history = [...(entry.history ?? []), {
        ...(entry.date ? { date: entry.date } : {}),
        ...(entry.dateEnd ? { dateEnd: entry.dateEnd } : {}),
        source: SEASON_DATES_SOURCE.label,
      }].filter(h => h.date);
      entry.date = date;
      if (dateEnd) entry.dateEnd = dateEnd;
      delete entry.dateText;
      delete entry.sort;
      entry.source = SEASON_DATES_SOURCE;
      // Notes written for the old date ("The season opener is March 24…")
      // would contradict the new one
      entry.detail = '';
      delete entry.hardballDetail;
      delete entry.hardballSource;
    }
  }
  const [y, m, d] = today.split('-').map(Number);
  const cutoff = ymd(new Date(y, m - 1, d - PRUNE_DAYS));
  return out
    .filter(e => !lastDay(e) || lastDay(e) >= cutoff)
    .sort((a, b) => (a.date ?? a.sort ?? '').localeCompare(b.date ?? b.sort ?? ''));
}

/**
 * Every entry, fetched once per page: the file with MLB's current season
 * dates for this year and next merged in. If the Stats API can't be reached
 * (and nothing is cached), the file's dates stand. Empty if the file can't
 * load.
 */
export function loadKeyDates() {
  const year = new Date().getFullYear();
  load ??= Promise.all([
    fetch(`${import.meta.env.BASE_URL}key-dates.json`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`key-dates.json ${r.status}`))))
      .then(d => d.dates ?? [])
      .catch(() => []),
    ...[year, year + 1].map(y => loadSeasonDates(y).catch(() => null)),
  ]).then(([dates, cur, next]) => mergeSeasonDates(dates, { [year]: cur, [year + 1]: next }));
  return load;
}

/** The entries a page shows (`tag`: schedule, cleanup, hardball, draft). */
export async function keyDatesFor(tag) {
  return (await loadKeyDates()).filter(e => e.tags?.includes(tag));
}

/** Entries by id. */
export async function keyDatesById() {
  return Object.fromEntries((await loadKeyDates()).map(e => [e.id, e]));
}

/**
 * 'Canceled' or 'Postponed' when that's what happened, else ''. A date that
 * moved just shows its new date: Brian wants no inline change markers, and
 * each list's footnote says the dates are kept current. The old date stays
 * in `history`.
 */
export function keyDateNote(entry) {
  if (entry?.status === 'canceled') return 'Canceled';
  if (entry?.status === 'postponed') return 'Postponed';
  return '';
}

/** True if the entry won't happen on its date. */
export function isOff(entry) {
  return entry?.status === 'canceled' || entry?.status === 'postponed';
}
