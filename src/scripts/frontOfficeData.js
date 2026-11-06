// ── Front Office data ─────────────────────────────────────────────
// Shared by the Front Office page (front-office.js) and its league page
// (front-office-league.js): the curated team files, transaction labels and
// Google News lists. These came from the separate Front Office site (#38).
//
// src/data/front-office/<slug>.json, one per team: owner, the brass
// (president, GM, manager; hand-curated, MLB first then ESPN, see #35),
// plus ballpark, eraRecord and recentDraftClasses, which
// `npm run refresh-front-office` refreshes from the MLB Stats API.
import { TEAM_SLUG } from './teamConfig.js';
import { PROXY } from './config.js';
import { esc, relativeDate, safeUrl } from './utils.js';

// One small chunk per team, fetched only when a page asks for it
const FILES = import.meta.glob('../data/front-office/*.json', { import: 'default' });

/** The curated file for a team, or null if there isn't one. */
export async function loadTeamFile(teamId) {
  const load = FILES[`../data/front-office/${TEAM_SLUG[teamId]}.json`];
  if (!load) return null;
  try { return await load(); } catch { return null; }
}

/** Every team's file, keyed by MLB id (the league page's directory). */
export async function loadAllTeamFiles() {
  const ids = Object.keys(TEAM_SLUG).map(Number);
  const files = await Promise.all(ids.map(loadTeamFile));
  return Object.fromEntries(ids.map((id, i) => [id, files[i]]));
}

/** 'November 5, 2026' from the file's asOf ('2026-11-05'). */
export function asOfLabel(asOf) {
  if (!asOf) return '';
  return new Date(`${asOf}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// MLB Stats API typeCode → badge. Careful: 'DFA' is Declared Free Agency;
// designated for assignment is 'DES'.
const TX_KINDS = {
  SFA: ['sign', 'Signed'], SGN: ['sign', 'Signed'], CP: ['sign', 'Purchased'],
  TR: ['trade', 'Trade'],
  DES: ['dfa', 'DFA'], REL: ['release', 'Released'], OUT: ['release', 'Outrighted'],
  CLW: ['claim', 'Claimed'],
  DFA: ['other', 'Free agent'],
  SE: ['other', 'Selected'], CU: ['other', 'Recalled'], OPT: ['other', 'Optioned'], RTN: ['other', 'Returned'],
};

/** A transaction's kind, for its badge. */
export function classifyTx(tx = {}) {
  const known = TX_KINDS[tx.typeCode];
  if (known) return { cls: known[0], label: known[1] };
  const d = String(tx.description ?? '').toLowerCase();
  if (d.includes('injured list')) return { cls: 'other', label: 'IL' };
  if (d.includes('signed')) return { cls: 'sign', label: 'Signed' };
  if (d.includes('traded')) return { cls: 'trade', label: 'Trade' };
  return { cls: 'other', label: tx.typeDesc && tx.typeDesc !== 'Status Change' ? tx.typeDesc : 'Move' };
}

/** Newest first: the API returns transactions oldest first. */
export function newestFirst(txs) {
  return [...txs].sort((a, b) => (b.date ?? b.effectiveDate ?? '').localeCompare(a.date ?? a.effectiveDate ?? ''));
}

/** Fill `wrap` with Google News results for `query`. Titles only: Google
 * News descriptions are just the headline again, as HTML. */
export async function loadGoogleNews(wrap, query, max = 10) {
  if (!wrap) return;
  try {
    const feed = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    const data = await fetch(`${PROXY}?url=${encodeURIComponent(feed)}`).then(r => r.json());
    const items = (data.items ?? []).slice(0, max);
    if (!items.length) {
      wrap.innerHTML = '<span class="sidebar-msg">No news found.</span>';
      return;
    }
    wrap.innerHTML = `<div class="fo-news">${items.map(item => `
      <a class="fo-news-item" href="${esc(safeUrl(item.link) || '#')}" target="_blank" rel="noopener">
        <span class="fo-news-title">${esc(item.title ?? 'Article')}</span>
        <span class="fo-news-date">${esc(relativeDate(item.pubDate))}</span>
      </a>`).join('')}</div>`;
  } catch {
    wrap.innerHTML = '<span class="sidebar-msg">News unavailable. Try refreshing.</span>';
  }
}
