// ── MLB season dates as key dates (#42) ───────────────────────────
// Which fields of the Stats API's /seasons/{year} become entries in the
// key dates list, and on which pages (`tags`). Shared by the site, which
// merges them in live (keyDates.js), and `npm run refresh-key-dates`
// (scripts/refresh-key-dates.mjs). No imports, so Node can load it too.

export const SEASON_DATE_KINDS = [
  { kind: 'spring-start', field: 'springStartDate', title: 'Spring training games begin', tags: ['cleanup', 'hardball', 'schedule'] },
  { kind: 'opening-day', field: 'regularSeasonStartDate', title: 'Opening Day', tags: ['cleanup', 'hardball', 'schedule'] },
  { kind: 'all-star', field: 'allStarDate', title: 'All-Star Game', tags: ['schedule'] },
  { kind: 'season-end', field: 'regularSeasonEndDate', title: 'Regular season ends', tags: ['schedule'] },
  { kind: 'postseason', field: 'postSeasonStartDate', endField: 'postSeasonEndDate', title: 'Postseason', tags: ['schedule'] },
];

export const SEASON_DATES_SOURCE = {
  label: 'MLB Stats API: season dates',
  url: 'https://statsapi.mlb.com/api/v1/seasons?sportId=1',
};

/** Entries more than this many days past are dropped. */
export const PRUNE_DAYS = 45;
