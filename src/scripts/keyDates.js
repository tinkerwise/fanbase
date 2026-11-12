// ── Key dates (#42) ───────────────────────────────────────────────
// public/key-dates.json is the one list of baseball's key dates that every
// calendar reads: Schedule (markers, tag `schedule`), Cleanup (`cleanup`),
// Hardball's timeline (`hardball`, merged in by season.js) and the Draft
// page (`draft`). MLB's season dates in it are refreshed daily from the
// Stats API (npm run refresh-key-dates); the rest are hand-curated.
//
// A date that moved keeps the old one in `history`, and `status` says when
// one was postponed or canceled, so every calendar can say so the same way.

let load = null;

/** Every entry, fetched once per page. Empty if the file can't load. */
export function loadKeyDates() {
  load ??= fetch(`${import.meta.env.BASE_URL}key-dates.json`)
    .then(r => (r.ok ? r.json() : Promise.reject(new Error(`key-dates.json ${r.status}`))))
    .then(d => d.dates ?? [])
    .catch(() => []);
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

const md = ymd => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/** Where a moved date used to be: 'Mar 20' (or a range), else null. */
export function movedFrom(entry) {
  const last = entry?.history?.at(-1);
  if (!last?.date) return null;
  return last.dateEnd ? `${md(last.date)}–${md(last.dateEnd)}` : md(last.date);
}

/** 'Canceled', 'Postponed', 'Moved from Mar 20' or '' for an entry. */
export function keyDateNote(entry) {
  if (entry?.status === 'canceled') return 'Canceled';
  if (entry?.status === 'postponed') return 'Postponed';
  const from = movedFrom(entry);
  return from ? `Moved from ${from}` : '';
}

/** True if the entry won't happen on its date. */
export function isOff(entry) {
  return entry?.status === 'canceled' || entry?.status === 'postponed';
}
