// ── Site search ───────────────────────────────────────────────────
// One box for teams, players and pages. Opened from the header's search
// button, or "/" and Cmd/Ctrl+K on a keyboard. Every page loads it
// (Layout.astro).
//
// Teams and pages are local. Players are every active MLB player from the
// Stats API (fields trimmed to what a row needs), loaded the first time
// search opens. A player opens their team's Depth Chart with them
// highlighted (depth-chart.js reads ?player=); other teams open as a view
// (?view=, config.js).
import { TEAM_CONFIG } from './teamConfig.js';
import { MLB, SEASON, viewUrl } from './config.js';
import { esc, teamLogoSrc } from './utils.js';

const BASE = import.meta.env.BASE_URL;
const PAGES = [
  ['Home', '', 'scores standings leaders dashboard'],
  ['Dugout', 'dugout/', 'news articles stories headlines feed'],
  ['Schedule', 'schedule/', 'games calendar record'],
  ['Roster', 'depth-chart/', 'depth chart lineup rotation bullpen injured list il'],
  ['Around the Horn', 'around-the-horn/', 'league news stories'],
  ['Hardball', 'hardball/', 'labor cba collective bargaining lockout strike union mlbpa salary cap negotiations'],
  ['Cleanup', 'cleanup/', 'free agents free agency signings hot stove offseason trades acquisitions rumors winter meetings non-tender'],
  ['Trades', 'trades/', 'transactions trade deadline rumors signings'],
  ['Draft', 'draft/', 'prospects picks amateur'],
  ['Postseason', 'postseason/', 'playoffs bracket wild card world series'],
];
const PLAYERS_URL = `${MLB}/sports/1/players?season=${SEASON}`
  + '&fields=people,id,fullName,primaryNumber,currentTeam,primaryPosition,abbreviation';
const MAX_TEAMS = 4;
const MAX_PLAYERS = 8;
const SEARCH_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';

let overlay, input, list;
let index = null;          // { players: [{ id, name, team, pos, jersey, key }], failed? }
let indexLoad = null;

// "J.P. Crawford" and "jp crawford" both become "jp crawford"; accents dropped
const norm = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[.'’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

function loadIndex() {
  indexLoad ??= fetch(PLAYERS_URL)
    .then(r => (r.ok ? r.json() : Promise.reject()))
    .then(d => {
      index = {
        players: (d.people ?? [])
          .filter(p => p.id && p.fullName && TEAM_CONFIG[p.currentTeam?.id])
          .map(p => ({
            id: p.id, name: p.fullName, team: p.currentTeam.id,
            pos: p.primaryPosition?.abbreviation ?? '', jersey: p.primaryNumber ?? '', key: norm(p.fullName),
          })),
      };
      render();
    })
    .catch(() => { index = { players: [], failed: true }; render(); });
  return indexLoad;
}

// The URL of a player on their team's Depth Chart
function playerUrl(p) {
  const url = new URL(viewUrl(p.team, 'depth-chart/'), location.href);
  url.searchParams.set('player', p.id);
  return url.pathname + url.search;
}

// Scores a name match, lower is better: the whole name, then a whole word
// ("judge" → Aaron Judge before Judge-anything), then the start of the name
// or a word
function nameScore(key, q) {
  if (key === q) return 0;
  const words = key.split(' ');
  if (words.includes(q)) return 1;
  if (key.startsWith(q)) return 2;
  if (words.some(w => w.startsWith(q))) return 3;
  const qs = q.split(' ');
  if (qs.length > 1 && qs.every(t => words.some(w => w.startsWith(t)))) return 4;
  return key.includes(q) ? 5 : -1;
}

function teamRow(t) {
  return `<a class="srch-item" href="${esc(viewUrl(t.id, ''))}">
    <img src="${esc(teamLogoSrc(t.id, 24))}" alt="" width="24" height="24" loading="lazy">
    <span class="srch-main">${esc(t.fullName)}</span><span class="srch-meta">${esc(t.div)}</span></a>`;
}

function playerRow(p) {
  return `<a class="srch-item" href="${esc(playerUrl(p))}">
    <img src="${esc(teamLogoSrc(p.team, 24))}" alt="" width="24" height="24" loading="lazy">
    <span class="srch-main">${esc(p.name)}</span>
    <span class="srch-meta">${esc([p.pos, p.jersey ? `#${p.jersey}` : '', TEAM_CONFIG[p.team].name].filter(Boolean).join(' · '))}</span></a>`;
}

function group(title, rows) {
  return rows.length ? `<div class="srch-group"><div class="srch-group-title">${title}</div>${rows.join('')}</div>` : '';
}

function render() {
  if (!overlay) return;
  const q = norm(input.value);
  if (!q) {
    list.innerHTML = '<p class="srch-hint">Search teams, players and pages. Try “Judge”, “Orioles” or “bullpen”.</p>';
    return;
  }
  const out = [];

  const teams = Object.values(TEAM_CONFIG).filter(t =>
    [t.fullName, t.abbr].some(s => norm(s).startsWith(q) || norm(s).split(' ').some(w => w.startsWith(q))));
  out.push(group('Teams', teams.slice(0, MAX_TEAMS).map(teamRow)));

  if (!index) {
    out.push('<div class="srch-group"><div class="srch-group-title">Players</div><p class="srch-hint">Loading players…</p></div>');
  } else if (index.failed) {
    out.push('<p class="srch-hint">Player search is unavailable right now.</p>');
  } else if (q.length >= 2) {
    const players = index.players
      .map(p => [p, nameScore(p.key, q)]).filter(([, s]) => s >= 0)
      .sort((a, b) => a[1] - b[1] || a[0].name.localeCompare(b[0].name))
      .slice(0, MAX_PLAYERS).map(([p]) => playerRow(p));
    out.push(group('Players', players));
  }

  const pages = PAGES.filter(([label, , words]) => norm(`${label} ${words}`).split(' ').some(w => w.startsWith(q)));
  out.push(group('Pages', pages.map(([label, path]) =>
    `<a class="srch-item" href="${BASE}${path}"><span class="srch-page-icon" aria-hidden="true">→</span><span class="srch-main">${esc(label)}</span></a>`)));

  list.innerHTML = out.join('') || `<p class="srch-hint">Nothing matches “${esc(input.value.trim())}”.</p>`;
}

function items() { return [...list.querySelectorAll('.srch-item')]; }

function move(step) {
  const all = items();
  if (!all.length) return;
  const i = all.indexOf(list.querySelector('.srch-item.is-active'));
  all[i]?.classList.remove('is-active');
  const next = all[(i + step + all.length) % all.length];
  next.classList.add('is-active');
  next.scrollIntoView({ block: 'nearest' });
}

function build() {
  overlay = document.createElement('div');
  overlay.className = 'srch-overlay hidden';
  overlay.innerHTML = `
    <div class="srch-panel" role="dialog" aria-modal="true" aria-label="Search">
      <div class="srch-bar">
        ${SEARCH_ICON}
        <input class="srch-input" type="search" placeholder="Teams, players, pages" autocomplete="off" spellcheck="false" aria-label="Search" />
        <button class="srch-close" type="button" aria-label="Close search">Esc</button>
      </div>
      <div class="srch-results"></div>
    </div>`;
  document.body.appendChild(overlay);
  input = overlay.querySelector('.srch-input');
  list = overlay.querySelector('.srch-results');

  let t;
  input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(render, 80); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') {
      const target = list.querySelector('.srch-item.is-active') ?? items()[0];
      if (target) { e.preventDefault(); target.click(); }
    }
  });
  overlay.addEventListener('click', e => {
    if (e.target === overlay || e.target.closest('.srch-close')) closeSearch();
  });
}

export function openSearch() {
  if (!overlay) build();
  loadIndex();
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  render();
  input.focus();
  input.select();
}

export function closeSearch() {
  overlay?.classList.add('hidden');
  document.body.style.overflow = '';
}

// Headers render the button statically (PageHeader.astro, index.astro) so
// nothing shifts; this only adds one where a page has no button of its own.
function addHeaderButton() {
  if (document.querySelector('.btn-search')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn-search';
  btn.setAttribute('aria-label', 'Search');
  btn.title = 'Search (/ or ⌘K)';
  btn.innerHTML = SEARCH_ICON;
  btn.dataset.openSearch = '';
  // Home: beside Refresh. Other pages: at the end of the header.
  const refresh = document.getElementById('refreshBtn');
  if (refresh) refresh.before(btn);
  else document.querySelector('.site-header .header-inner')?.appendChild(btn);
}

function init() {
  addHeaderButton();
  document.addEventListener('click', e => {
    if (e.target.closest('[data-open-search]')) { e.preventDefault(); openSearch(); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay && !overlay.classList.contains('hidden')) { closeSearch(); return; }
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey)) {
      e.preventDefault();
      openSearch();
    }
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
