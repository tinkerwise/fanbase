#!/usr/bin/env node
// ── npm run refresh-key-dates (#42) ───────────────────────────────
// Optional upkeep for public/key-dates.json, the one list of baseball's key
// dates that every calendar reads (Schedule, Cleanup, Hardball, Draft).
// The site already merges MLB's current season dates in live
// (src/scripts/keyDates.js), so nothing needs to run on a schedule. This
// writes the same changes into the file itself: handy before a deploy, so
// the file's fallback dates stay current if the Stats API goes dark.
//
// Season dates come from the MLB Stats API (/seasons/{year}) for this year
// and next: spring training games, Opening Day, the All-Star Game, the end
// of the regular season and the postseason. The API only says where a date
// is now, so when one moves this records the old date in the entry's
// `history` (pages show only the current date). Hand-curated entries (Rule 5
// Draft, Winter Meetings, international signing…) are left alone: they are
// edited by hand from the news.
//
// Entries whose last day is more than PRUNE_DAYS ago are dropped.
//
// Prints what changed and writes the file only when something did, so
// `git diff --quiet public/key-dates.json` tells whether there's
// anything to commit. `--dry-run` prints without writing.
import { readFile, writeFile } from 'node:fs/promises';
import { SEASON_DATE_KINDS, SEASON_DATES_SOURCE, PRUNE_DAYS } from '../src/scripts/seasonDateKinds.js';

const FILE = new URL('../public/key-dates.json', import.meta.url);
const MLB = 'https://statsapi.mlb.com/api/v1';
const DRY = process.argv.includes('--dry-run');

const today = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
})();
function addDays(ymd, n) {
  const [y, m, d] = ymd.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

const SEASON_DATES = SEASON_DATE_KINDS;
const API_SOURCE = SEASON_DATES_SOURCE;

async function seasonDates(year) {
  const res = await fetch(`${MLB}/seasons/${year}?sportId=1`);
  if (!res.ok) throw new Error(`/seasons/${year}: ${res.status}`);
  return (await res.json()).seasons?.[0] ?? null;
}

const lastDay = e => e.dateEnd ?? e.date ?? e.sort;
const fmt = e => (e.dateEnd ? `${e.date}–${e.dateEnd}` : e.date);

async function main() {
  const data = JSON.parse(await readFile(FILE, 'utf8'));
  const byDate = (a, b) => (a.date ?? a.sort).localeCompare(b.date ?? b.sort) || a.id.localeCompare(b.id);
  const before = JSON.stringify([...data.dates].sort(byDate));
  const log = [];
  const year = Number(today.slice(0, 4));

  for (const y of [year, year + 1]) {
    let season;
    try {
      season = await seasonDates(y);
    } catch (err) {
      console.warn(`Skipping ${y}: ${err.message}`);
      continue;
    }
    if (!season) continue;
    for (const def of SEASON_DATES) {
      const date = season[def.field];
      if (!date) continue;
      const dateEnd = def.endField ? season[def.endField] : undefined;
      const id = `${def.kind}-${y}`;
      const entry = data.dates.find(e => e.id === id);
      if (!entry) {
        // Only dates still ahead are worth adding
        if ((dateEnd ?? date) < today) continue;
        data.dates.push({ id, from: 'api', date, ...(dateEnd ? { dateEnd } : {}), title: def.title, detail: '', tags: def.tags, source: API_SOURCE });
        log.push(`Added ${id}: ${dateEnd ? `${date}–${dateEnd}` : date}`);
        continue;
      }
      if (entry.date !== date || (dateEnd && entry.dateEnd !== dateEnd)) {
        const old = fmt(entry);
        entry.history = [...(entry.history ?? []), { date: entry.date, ...(entry.dateEnd ? { dateEnd: entry.dateEnd } : {}), recorded: today, source: API_SOURCE.label }];
        entry.date = date;
        if (dateEnd) entry.dateEnd = dateEnd;
        log.push(`Moved ${id}: ${old} → ${fmt(entry)}`);
      }
    }
  }

  // Drop entries well past
  const cutoff = addDays(today, -PRUNE_DAYS);
  data.dates = data.dates.filter(e => {
    if (lastDay(e) >= cutoff) return true;
    log.push(`Pruned ${e.id} (${lastDay(e)})`);
    return false;
  });
  data.dates.sort(byDate);

  if (JSON.stringify(data.dates) === before) {
    console.log('No changes.');
    return;
  }
  data.updated = today;
  console.log(log.join('\n'));
  if (DRY) {
    console.log('(dry run: not written)');
    return;
  }
  await writeFile(FILE, `${JSON.stringify(data, null, 2)}\n`);
  console.log('Wrote public/key-dates.json');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
