// ── Hardball page (#20) ───────────────────────────────────────────
// The MLB/MLBPA labor page. Status, issues, timeline and explainer come
// from public/hardball.json (hand-curated, every position sourced and
// dated); the news is labor stories filtered by keyword from the
// league-wide feeds plus hardball.json's newsSources. League-wide only, so
// it works before a team is picked.
import './theme.js';
import { esc, safeUrl, renderNewsThumbCard, cleanFeedText, extractThumbnail } from './utils.js';
import { fetchFeedItems } from './feedSources.js';
import { loadHardball, nextKeyDate, countdownText } from './season.js';

const STATUS = {
  talks: { label: 'Negotiating', tone: 'talks' },
  expired: { label: 'CBA expired', tone: 'warn' },
  lockout: { label: 'Lockout', tone: 'stop' },
  tentative: { label: 'Tentative deal', tone: 'deal' },
  ratified: { label: 'Deal ratified', tone: 'deal' },
};
// Stories about the labor fight, not every mention of "cap" or "union"
const LABOR_RE = /\b(CBA|collective[- ]bargaining|labor (talks|deal|negotiations?|dispute|war|fight|battle)|lockout|work stoppage|MLBPA|players'? (union|association)|salary cap|salary floor|competitive integrity tax|revenue sharing|Bruce Meyer|bargaining)\b/i;
const MAX_NEWS = 12;
const STALE_DAYS = 21;

const $ = id => document.getElementById(id);

// "2026-05-28" → "May 28, 2026" (dates are calendar days, not instants)
function formatDate(iso, { year = true } = {}) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(year ? { year: 'numeric' } : {}) });
}

function sourceLinks(sources = []) {
  return sources
    .filter(s => safeUrl(s.url))
    .map(s => `<a href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener">${esc(s.label)}</a>`)
    .join(' · ');
}

function renderStatus(data) {
  const s = data.status ?? {};
  const meta = STATUS[s.code] ?? { label: 'Status', tone: 'talks' };
  const next = nextKeyDate(data);
  $('hbStatus').innerHTML = `
    <div class="hb-status-top">
      <span class="hb-badge hb-badge--${meta.tone}">${esc(meta.label)}</span>
      ${next ? `<span class="hb-countdown">${esc(countdownText(next))}</span>` : ''}
    </div>
    <h2 class="hb-status-headline">${esc(s.headline ?? '')}</h2>
    <p class="hb-status-summary">${esc(s.summary ?? '')}</p>
    <p class="hb-status-meta">As of ${esc(formatDate(s.asOf ?? data.lastUpdated))}${s.sources?.length ? ` · ${sourceLinks(s.sources)}` : ''}</p>`;
}

function renderSide(key, side, party) {
  return `<div class="hb-side hb-side--${key}">
    <div class="hb-side-name" title="${esc(party?.full ?? '')}">${esc(party?.name ?? key.toUpperCase())}</div>
    <p class="hb-side-position">${esc(side?.position ?? 'No position reported yet.')}</p>
    ${side?.date ? `<p class="hb-side-source">Reported ${esc(formatDate(side.date))}${side.sources?.length ? ` · ${sourceLinks(side.sources)}` : ''}</p>` : ''}
  </div>`;
}

function renderIssues(data) {
  $('hbIssues').innerHTML = (data.issues ?? []).map(issue => `
    <article class="hb-issue" id="issue-${esc(issue.id)}">
      <header class="hb-issue-head">
        <h3 class="hb-issue-title">${esc(issue.title)}</h3>
        ${issue.status && issue.status !== 'open' ? `<span class="hb-issue-status">${esc(issue.status === 'agreed' ? 'Agreed' : issue.status)}</span>` : ''}
      </header>
      <p class="hb-issue-summary">${esc(issue.summary ?? '')}</p>
      <div class="hb-sides">
        ${renderSide('mlb', issue.mlb, data.parties?.mlb)}
        ${renderSide('mlbpa', issue.mlbpa, data.parties?.mlbpa)}
      </div>
    </article>`).join('');
}

function renderTimeline(data) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const items = [...(data.timeline ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  $('hbTimeline').innerHTML = items.map(t => {
    const upcoming = t.date > today;
    return `<li class="hb-event${upcoming ? ' hb-event--upcoming' : ''}${t.key ? ' hb-event--key' : ''}">
      <time class="hb-event-date" datetime="${esc(t.date)}">${esc(formatDate(t.date))}</time>
      <div class="hb-event-body">
        <span class="hb-event-title">${esc(t.title)}${upcoming ? ' <span class="hb-event-tag">Upcoming</span>' : ''}</span>
        ${t.detail ? `<span class="hb-event-detail">${esc(t.detail)}</span>` : ''}
        ${t.source && safeUrl(t.source.url) ? `<a class="hb-event-source" href="${esc(safeUrl(t.source.url))}" target="_blank" rel="noopener">${esc(t.source.label)}</a>` : ''}
      </div>
    </li>`;
  }).join('');
}

function renderExplainer(data) {
  $('hbExplainer').innerHTML = (data.explainer ?? []).map(e => `
    <details class="hb-faq">
      <summary>${esc(e.q)}</summary>
      <p>${esc(e.a)}</p>
    </details>`).join('');
}

function renderFootnote(data) {
  const age = (Date.now() - new Date(`${data.lastUpdated}T12:00:00`)) / (24 * 3600 * 1000);
  const active = ['talks', 'expired', 'lockout', 'tentative'].includes(data.status?.code);
  $('hbFootnote').innerHTML =
    `Positions are summarized as each side stated or proposed them, with sources; Fanbase doesn't take a side. Last updated ${esc(formatDate(data.lastUpdated))}.` +
    (active && age > STALE_DAYS ? ' <strong>This summary may be out of date: check the news for the latest.</strong>' : '');
}

async function loadNews(data) {
  const wrap = $('hbNews');
  try {
    const feeds = await fetch(`${import.meta.env.BASE_URL}feeds.json`).then(r => r.json());
    const sources = [...feeds.filter(f => f.teamId === 0), ...(data.newsSources ?? [])];
    const results = await Promise.allSettled(sources.map(async source => ({ source, data: await fetchFeedItems(source) })));
    const seen = new Set();
    const stories = [];
    for (const r of results) {
      if (r.status !== 'fulfilled') continue;
      for (const item of r.value.data.items ?? []) {
        let title = cleanFeedText(item.title ?? '');
        let sourceName = r.value.source.name;
        // Google News titles end in " - Publisher": show the publisher instead
        const byline = r.value.source.titleHasSource && title.match(/^(.*\S)\s+-\s+([^-]+)$/);
        if (byline) [, title, sourceName] = byline;
        const link = safeUrl(item.link);
        if (!link || seen.has(link) || !LABOR_RE.test(`${title} ${cleanFeedText(item.description ?? '')}`)) continue;
        seen.add(link);
        stories.push({ title, link, pubDate: item.pubDate, sourceName, thumbnail: extractThumbnail(item) });
      }
    }
    stories.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    wrap.innerHTML = stories.length
      ? stories.slice(0, MAX_NEWS).map(renderNewsThumbCard).join('')
      : '<span class="sidebar-msg">No labor stories in the feeds right now.</span>';
  } catch {
    wrap.innerHTML = '<span class="sidebar-msg">News is unavailable right now.</span>';
  }
}

async function init() {
  let data;
  try {
    data = await loadHardball();
  } catch {
    $('hbStatus').innerHTML = '<span class="sidebar-msg">Hardball is unavailable right now.</span>';
    return;
  }
  renderStatus(data);
  renderIssues(data);
  renderTimeline(data);
  renderExplainer(data);
  renderFootnote(data);
  loadNews(data);
}

init();
