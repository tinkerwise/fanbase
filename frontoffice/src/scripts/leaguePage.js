// ── League page scripts ───────────────────────────────────────────
import { MLB, esc, relDate, newestFirst } from './config.js';
import { TEAM_CONFIG } from './teamConfig.js';

const base = import.meta.env.BASE_URL;

// ── League Transactions ───────────────────────────────────────────
let allTxs = [];
let activeFilter = '';

async function loadLeagueTx() {
  const wrap = document.getElementById('leagueTxWrap');
  if (!wrap) return;
  try {
    const since = new Date();
    since.setDate(since.getDate() - 14);
    const dateStr = since.toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    const data = await fetch(`${MLB}/transactions?sportId=1&startDate=${dateStr}&endDate=${today}`).then(r => r.json());
    allTxs = newestFirst(data.transactions ?? []);
    renderLeagueTx();
  } catch {
    wrap.innerHTML = '<span class="empty-msg">Transactions unavailable.</span>';
  }
}

function renderLeagueTx() {
  const wrap = document.getElementById('leagueTxWrap');
  if (!wrap) return;
  const filtered = activeFilter
    ? allTxs.filter(tx => String(tx.team?.id) === activeFilter)
    : allTxs;
  const shown = filtered.slice(0, 40);
  if (!shown.length) {
    wrap.innerHTML = '<span class="empty-msg">No transactions found.</span>';
    return;
  }
  const items = shown.map(tx => {
    const team = TEAM_CONFIG[tx.team?.id];
    const logo = team ? `<img class="activity-logo" src="https://www.mlbstatic.com/team-logos/${team.id}.svg" alt="${esc(team.abbr)}" width="22" height="22" loading="lazy">` : '';
    const desc = esc(tx.description ?? 'Transaction');
    const date = relDate(tx.date ?? tx.effectiveDate ?? '');
    const type = classifyTx(tx.description ?? '');
    return `<div class="tx-item">
      ${logo}
      <span class="tx-type ${type.cls}">${type.label}</span>
      <span class="tx-desc">${desc}</span>
      <span class="tx-date">${esc(date)}</span>
    </div>`;
  }).join('');
  wrap.innerHTML = `<div class="tx-list">${items}</div>`;
}

function classifyTx(desc) {
  const d = desc.toLowerCase();
  if (d.includes('signed') || d.includes('contract')) return { cls: 'sign', label: 'Signed' };
  if (d.includes('trade') || d.includes('traded')) return { cls: 'trade', label: 'Trade' };
  if (d.includes('designated for assignment') || d.includes('dfa')) return { cls: 'dfa', label: 'DFA' };
  if (d.includes('released')) return { cls: 'release', label: 'Release' };
  if (d.includes('claimed') || d.includes('waivers')) return { cls: 'claim', label: 'Claim' };
  return { cls: 'other', label: 'Move' };
}

// Filter buttons
const filterWrap = document.getElementById('txFilter');
if (filterWrap) {
  filterWrap.addEventListener('click', e => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    activeFilter = btn.dataset.filter ?? '';
    filterWrap.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderLeagueTx();
  });
}

// ── Executive News ────────────────────────────────────────────────
async function loadExecNews() {
  const wrap = document.getElementById('execNewsWrap');
  if (!wrap) return;
  try {
    const query = 'MLB front office GM fired hired baseball';
    const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    const proxyUrl = `${base}rss-proxy.php?url=${encodeURIComponent(feedUrl)}`;
    const data = await fetch(proxyUrl).then(r => r.json());
    const items = data.items ?? [];
    if (!items.length) { wrap.innerHTML = '<span class="empty-msg">No news found.</span>'; return; }
    const html = items.slice(0, 12).map(item => {
      const title = esc(item.title ?? 'Article');
      const date = relDate(item.pubDate ?? '');
      const thumb = item.thumbnail ? `<img class="news-thumb" src="${esc(item.thumbnail)}" alt="" loading="lazy">` : '<div class="news-thumb-placeholder"></div>';
      return `<a class="news-item" href="${esc(item.link ?? '#')}" target="_blank" rel="noopener">
        ${thumb}
        <div class="news-body">
          <div class="news-title">${title}</div>
          <div class="news-date">${esc(date)}</div>
        </div>
      </a>`;
    }).join('');
    wrap.innerHTML = `<div class="news-list">${html}</div>`;
  } catch {
    wrap.innerHTML = '<span class="empty-msg">News unavailable.</span>';
  }
}

// Tab scroll
document.querySelectorAll('.page-tab').forEach(tab => {
  tab.addEventListener('click', e => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (href?.startsWith('#')) document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    document.querySelectorAll('.page-tab').forEach(t => t.classList.remove('active'));
    e.currentTarget.classList.add('active');
  });
});

loadLeagueTx();
loadExecNews();
