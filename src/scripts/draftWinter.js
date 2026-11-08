// ── Draft page: the winter drafts (#17, #18) ──────────────────────
// Besides the July MLB Draft (draft.js), clubs add players two more ways,
// and the Draft page leads with whichever comes next:
//
// - The Rule 5 Draft (November to a week after the draft): the 40-man
//   protection deadline, then the draft at the end of the Winter Meetings.
//   Results are live from /transactions: SE (contract selected, which is how
//   clubs protect prospects at the deadline), R5 (major league phase) and
//   R5M (Triple-A phase).
// - The international signing period (then through February): it opens
//   January 15. Signings are live from /transactions (intlSignings.js).
//
// Dates are the key dates in public/cleanup.json (ids rule5-protection,
// rule5-draft, intl-signing), the same list Cleanup shows. Links live under
// `winter` in public/draft-picks.json.
//
// ?asOf=YYYY-MM-DD previews another day (last December, say). A past cycle
// has no curated dates, so the Rule 5 Draft's date comes from its results
// and the signing period opens on its usual January 15.
import { MLB, TEAM_ID, TEAM } from './config.js';
import { TEAM_CONFIG } from './teamConfig.js';
import { esc, safeUrl, mlbPlayerUrl } from './utils.js';
import { localDate } from './season.js';
import { findIntlSignings } from './intlSignings.js';
import { loadGoogleNews } from './frontOfficeData.js';

const $ = id => document.getElementById(id);
const BASE = import.meta.env.BASE_URL;
const asOfParam = new URLSearchParams(location.search).get('asOf');
const AS_OF = /^\d{4}-\d{2}-\d{2}$/.test(asOfParam ?? '') ? asOfParam : null;
const NOW = AS_OF ? new Date(`${AS_OF}T12:00:00`) : new Date();
const TODAY = localDate(NOW);
const DAY = 24 * 60 * 60 * 1000;
// Rule 5 results stay at the top this long after the draft
const RESULTS_DAYS = 7;

const getJson = url => fetch(url).then(r => (r.ok ? r.json() : Promise.reject(new Error(`${r.status} ${url}`))));

function addDays(ymd, n) {
  const [y, m, d] = ymd.split('-').map(Number);
  return localDate(new Date(y, m - 1, d + n));
}
function fmtDay(ymd, opts = {}) {
  return new Date(`${ymd}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', ...opts });
}
function daysUntil(ymd) {
  return Math.round((new Date(`${ymd}T12:00:00`) - new Date(`${TODAY}T12:00:00`)) / DAY);
}
function whenText(ymd) {
  const n = daysUntil(ymd);
  if (n === 0) return 'today';
  if (n === 1) return 'tomorrow';
  if (n > 1) return `in ${n} days`;
  return n === -1 ? 'yesterday' : `${-n} days ago`;
}
const teamName = id => TEAM_CONFIG[id]?.name ?? 'another club';

// ── Which winter draft is next ──
// The offseason year: 2026 for November 2026 through February 2027
function cycleYear() {
  const m = NOW.getMonth();
  if (m >= 10) return NOW.getFullYear();
  if (m <= 1) return NOW.getFullYear() - 1;
  return null;
}

async function curatedDates() {
  try {
    const data = await getJson(`${BASE}cleanup.json`);
    return Object.fromEntries((data.keyDates ?? []).filter(k => k.id && k.date).map(k => [k.id, k]));
  } catch {
    return {};
  }
}

// The team's transactions over a stretch (they include moves from the team,
// like players taken from it in the Rule 5 Draft)
async function teamTransactions(start, end) {
  const data = await getJson(`${MLB}/transactions?teamId=${TEAM_ID}&startDate=${start}&endDate=${end}`);
  return data.transactions ?? [];
}

/** { phase: 'rule5' | 'intl', ... } or null outside the winter drafts. */
async function winterPlan() {
  const y = cycleYear();
  if (!y) return null;
  const curated = await curatedDates();
  const inCycle = (k, year) => (k?.date?.startsWith(`${year}-`) ? k : null);
  const protection = inCycle(curated['rule5-protection'], y);
  const rule5Curated = inCycle(curated['rule5-draft'], y);
  let rule5 = rule5Curated?.date ?? null;
  // A past cycle: the draft happened the day its picks were filed
  if (!rule5 && TODAY > `${y}-12-01`) {
    try {
      const league = await getJson(`${MLB}/transactions?sportId=1&startDate=${y}-12-01&endDate=${y}-12-31`);
      rule5 = (league.transactions ?? []).find(t => t.typeCode === 'R5')?.date?.slice(0, 10) ?? null;
    } catch { /* no date: say December */ }
  }
  const intlCurated = inCycle(curated['intl-signing'], y + 1);
  const intl = intlCurated?.date ?? `${y + 1}-01-15`;

  const rule5Over = rule5 ? TODAY > addDays(rule5, RESULTS_DAYS) : TODAY > `${y}-12-20`;
  if (!rule5Over) return { phase: 'rule5', year: y, protection, rule5, rule5Source: rule5Curated?.source };
  if (TODAY <= `${y + 1}-02-28`) return { phase: 'intl', year: y, intl, intlSource: intlCurated?.source };
  return null;
}

// ── Pieces ──
function playerLink(t) {
  const name = t.person?.fullName ?? 'Player';
  return t.person?.id
    ? `<a href="${mlbPlayerUrl(t.person.id)}" target="_blank" rel="noopener">${esc(name)}</a>`
    : esc(name);
}

// "RHP Jedixson Paez" → "RHP", from the transaction description
function position(t) {
  const name = t.person?.fullName;
  if (!name) return '';
  const m = (t.description ?? '').match(new RegExp(`\\b([A-Z0-9]{1,3})\\s+${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  return m ? m[1] : '';
}

// A list of rows; past `max`, the rest fold under "Show all"
function list(items, empty, max = 12) {
  if (!items.length) return `<p class="dw-empty">${esc(empty)}</p>`;
  if (items.length <= max) return `<ul class="dw-list">${items.join('')}</ul>`;
  return `<ul class="dw-list">${items.slice(0, max).join('')}</ul>
    <details class="dw-more"><summary>Show all ${items.length}</summary><ul class="dw-list">${items.slice(max).join('')}</ul></details>`;
}

function card(title, when, body, extraClass = '') {
  return `<article class="dw-card${extraClass}">
    <header class="dw-card-head">
      <h3 class="dw-card-title">${esc(title)}</h3>
      ${when ? `<span class="dw-card-when">${when}</span>` : ''}
    </header>
    ${body}
  </article>`;
}

function linksHtml(links = []) {
  const safe = links.map(l => ({ ...l, url: safeUrl(l.url) })).filter(l => l.url);
  if (!safe.length) return '';
  return `<div class="dw-links"><span class="dw-links-label">Read more</span>${safe.map(l =>
    `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('')}</div>`;
}

function sourceHtml(source) {
  const url = safeUrl(source?.url);
  return url ? ` <a class="dw-source" href="${esc(url)}" target="_blank" rel="noopener">Source</a>` : '';
}

async function fortyManCount() {
  try {
    const data = await getJson(`${MLB}/teams/${TEAM_ID}/roster?rosterType=40Man&date=${TODAY}`);
    return (data.roster ?? []).length;
  } catch {
    return null;
  }
}

// ── Rule 5 (#17) ──
async function renderRule5(plan, links) {
  const { year: y, protection, rule5 } = plan;
  const nick = TEAM.nick;
  const end = TODAY < `${y}-12-31` ? TODAY : `${y}-12-31`;
  const [txs, count] = await Promise.all([
    teamTransactions(`${y}-11-01`, end).catch(() => null),
    fortyManCount(),
  ]);

  // 1. Protection deadline
  // Without a curated date (a past cycle), the deadline falls in the week
  // before Thanksgiving: look across that stretch
  const pDate = protection?.date ?? null;
  const [pFrom, pTo] = pDate ? [addDays(pDate, -3), pDate] : [`${y}-11-14`, `${y}-11-22`];
  const pPassed = TODAY >= pTo;
  let protectBody;
  if (pPassed && txs) {
    const added = txs.filter(t => t.typeCode === 'SE' && t.toTeam?.id === TEAM_ID
      && t.date.slice(0, 10) >= pFrom && t.date.slice(0, 10) <= pTo);
    protectBody = `<p class="dw-text">Prospects the ${esc(nick)} added to the 40-man roster ahead of the deadline, so other clubs can't take them:</p>`
      + list(added.map(t => `<li><span class="dw-pos">${esc(position(t))}</span> ${playerLink(t)}</li>`), 'No additions reported.');
  } else {
    protectBody = `<p class="dw-text">Minor leaguers become eligible after four or five seasons, depending on how old they were when they signed. A club protects one by adding him to its 40-man roster; anyone left off can be taken.</p>`;
  }
  if (count != null) {
    protectBody += `<p class="dw-text dw-count"><strong>${count} of 40</strong> spots filled on the ${esc(nick)}' 40-man roster${count < 40 ? `, room for ${40 - count} more` : ', full'}. <a href="${BASE}front-office/#fo-players">See the roster</a></p>`;
  }
  const protectWhen = pDate
    ? `${esc(fmtDay(pDate))}${protection.detail?.match(/^\d.*?ET/) ? `, ${esc(protection.detail.match(/^\d.*?ET/)[0])}` : ''} · ${esc(whenText(pDate))}${sourceHtml(protection.source)}`
    : 'Late November';

  // 2. The draft
  const drafted = rule5 && TODAY >= rule5;
  let draftBody;
  if (drafted && txs) {
    const r5 = txs.filter(t => t.typeCode === 'R5' || t.typeCode === 'R5M');
    const row = (t, other) => `<li><span class="dw-pos">${esc(position(t))}</span> ${playerLink(t)}
      <span class="dw-meta">${other} · ${t.typeCode === 'R5' ? 'Major league phase' : 'Triple-A phase'}</span></li>`;
    const taken = r5.filter(t => t.toTeam?.id === TEAM_ID).map(t => row(t, `from the ${esc(teamName(t.fromTeam?.id))}`));
    const lost = r5.filter(t => t.fromTeam?.id === TEAM_ID).map(t => row(t, `to the ${esc(teamName(t.toTeam?.id))}`));
    draftBody = `<h4 class="dw-sub">Picked by the ${esc(nick)}</h4>${list(taken, 'No picks.')}
      <h4 class="dw-sub">Taken from the ${esc(nick)}</h4>${list(lost, 'Nobody taken.')}
      <p class="dw-text dw-note">A major league pick has to stay on his new team's big-league roster all season, or be offered back to his old club.</p>`;
  } else {
    draftBody = `<p class="dw-text">Held on the last day of the Winter Meetings. Clubs with an open 40-man spot pick, in reverse order of last season's standings.</p>
      <p class="dw-text">A major league pick has to stay on his new team's big-league roster all season, or be offered back to his old club. A Triple-A phase follows, with no such rule.</p>`;
  }
  const draftWhen = rule5
    ? `${esc(fmtDay(rule5))} · ${esc(whenText(rule5))}${sourceHtml(plan.rule5Source)}`
    : 'December';

  return {
    title: 'Rule 5 Draft',
    lead: drafted
      ? `The Rule 5 Draft was ${esc(whenText(rule5))}. Here's who the ${esc(nick)} added and lost.`
      : `Baseball's other draft: clubs pick eligible minor leaguers other teams left off their 40-man rosters.`,
    cards: [
      card('40-man protection deadline', protectWhen, protectBody, pPassed ? ' dw-card--done' : ''),
      card('The draft', draftWhen, draftBody),
    ],
    links: linksHtml(links),
  };
}

// ── International signing period (#18) ──
async function renderIntl(plan, links) {
  const { intl } = plan;
  const nick = TEAM.nick;
  const open = TODAY >= intl;

  let signBody;
  if (open) {
    let signings = null;
    try {
      const txs = await teamTransactions(intl, TODAY);
      signings = await findIntlSignings(txs, TEAM_ID);
    } catch { /* below */ }
    const n = signings?.length ?? 0;
    signBody = signings === null
      ? '<p class="dw-empty">Signings unavailable right now. Try refreshing.</p>'
      : list(signings
          .sort((a, b) => a.t.date.localeCompare(b.t.date))
          .map(({ t, person: p }) => `<li><span class="dw-pos">${esc(position(t))}</span> ${playerLink(t)}
            <span class="dw-meta">${esc(p.birthCountry)}, age ${esc(p.currentAge)} · ${esc(fmtDay(t.date.slice(0, 10), { weekday: undefined }))}</span></li>`),
        'No international signings filed yet.');
    if (n) signBody = `<p class="dw-text">${n} international amateur${n === 1 ? '' : 's'} signed so far.</p>${signBody}`;
  } else {
    signBody = `<p class="dw-text">The ${esc(nick)}' signings will show here once the period opens.</p>`;
  }

  const about = `<p class="dw-text">Players from outside the U.S., Canada and Puerto Rico don't go through the draft. Clubs sign them as amateurs, most at 16, out of a bonus pool set by MLB each year. The period stays open until December 15.</p>
    <p class="dw-text">The top prospects have usually agreed to terms with a club well before the period opens, and the deals are often reported early.</p>`;

  return {
    title: 'International Signing Period',
    lead: open
      ? `The signing period opened ${esc(whenText(intl))}.`
      : 'How clubs add amateur talent from around the world.',
    cards: [
      card(open ? `${nick} signings` : 'Signing day', `${esc(fmtDay(intl))} · ${esc(whenText(intl))}${sourceHtml(plan.intlSource)}`, signBody),
      card('How it works', '', about),
      card(`${nick} international news`, '', '<div id="dwNews"><span class="sidebar-msg">Loading…</span></div>'),
    ],
    links: linksHtml(links),
    news: true,
  };
}

// ── Page ──
export async function loadWinterDrafts() {
  const section = $('draftWinter');
  if (!section) return;
  let plan;
  try {
    plan = await winterPlan();
  } catch {
    plan = null;
  }
  if (!plan) return;

  let links = {};
  try { links = (await getJson(`${BASE}draft-picks.json`)).winter ?? {}; } catch { /* no links */ }
  const view = plan.phase === 'rule5'
    ? await renderRule5(plan, links.rule5?.links)
    : await renderIntl(plan, links.intl?.links);

  section.innerHTML = `
    <div class="dw-head">
      <span class="dw-kicker">${AS_OF ? `Previewing ${esc(fmtDay(AS_OF, { year: 'numeric' }))}` : 'Up next on the draft calendar'}</span>
      <p class="dw-lead">${view.lead}</p>
    </div>
    <div class="dw-grid">${view.cards.join('')}</div>
    ${view.links}`;
  section.hidden = false;

  // The page leads with this draft (the page title names it); the July
  // draft follows under its own head
  const h1 = document.querySelector('.event-title');
  if (h1) h1.textContent = view.title;
  const july = $('draftJulyHead');
  if (july) july.hidden = false;
  document.title = `${view.title} | Fanbase`;

  if (view.news) {
    loadGoogleNews($('dwNews'), `"${TEAM.fullName}" international signing OR "international prospect" OR "signing period"`, 6);
  }
}
