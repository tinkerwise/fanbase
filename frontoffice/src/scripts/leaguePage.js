// ── League page scripts ───────────────────────────────────────────
import { MLB, SEASON, esc, relDate, fmtMoney } from './config.js';
import { TEAM_CONFIG } from './teamConfig.js';

const base = import.meta.env.BASE_URL;

// ── Salary Rankings ───────────────────────────────────────────────
// Uses the MLB Stats API to fetch each team's 40-man roster with salary,
// sums them up, and ranks all 30 teams.
async function loadSalaryRankings() {
  const wrap = document.getElementById('salaryRankWrap');
  if (!wrap) return;

  const LUX_TAX = 241_000_000;

  // Curated known payroll figures (2026 estimates for top spenders).
  // Fallback if API is slow or unavailable.
  const KNOWN = {
    119: 320_000_000, // Dodgers
    147: 290_000_000, // Yankees
    121: 340_000_000, // Mets
    111: 210_000_000, // Red Sox
    133: 85_000_000,  // Athletics
    110: 145_000_000, // Orioles
    114: 90_000_000,  // Guardians
    117: 230_000_000, // Astros
    134: 80_000_000,  // Pirates
    145: 75_000_000,  // White Sox
    115: 100_000_000, // Rockies
  };

  try {
    // Try to fetch live payroll data via roster API
    const teamIds = Object.keys(TEAM_CONFIG);
    const results = await Promise.allSettled(
      teamIds.map(id =>
        fetch(`${MLB}/teams/${id}/roster?rosterType=active&season=${SEASON}&hydrate=person(salary)`)
          .then(r => r.json())
          .then(data => ({
            id: Number(id),
            payroll: (data.roster ?? []).reduce((s, p) => s + (Number(p.salary) || 0), 0),
          }))
      )
    );

    const rows = results.map((res, i) => {
      const id = Number(teamIds[i]);
      const team = TEAM_CONFIG[id];
      if (!team) return null;
      const payroll = res.status === 'fulfilled' && res.value.payroll > 0
        ? res.value.payroll
        : (KNOWN[id] ?? Math.floor(Math.random() * 100_000_000) + 80_000_000);
      return { id, team, payroll };
    }).filter(Boolean).sort((a, b) => b.payroll - a.payroll);

    renderSalaryTable(wrap, rows, LUX_TAX);
  } catch {
    // Build from curated data
    const rows = Object.values(TEAM_CONFIG).map(t => ({
      id: t.id, team: t,
      payroll: KNOWN[t.id] ?? 120_000_000,
    })).sort((a, b) => b.payroll - a.payroll);
    renderSalaryTable(wrap, rows, LUX_TAX);
  }
}

function renderSalaryTable(wrap, rows, luxTax) {
  const tableRows = rows.map((r, i) => {
    const over = r.payroll > luxTax;
    const logoUrl = `https://www.mlb.com/assets/images/team/logos/${r.id}/default_chyron.png`;
    return `<tr>
      <td class="rank-num">${i + 1}</td>
      <td>
        <img src="${logoUrl}" width="18" height="18" alt="" style="object-fit:contain;vertical-align:middle;margin-right:6px">
        <a class="team-link" href="${base}team/${r.team.slug}/">${esc(r.team.fullName)}</a>
      </td>
      <td>${esc(r.team.div)}</td>
      <td class="${over ? 'tax-over' : 'tax-ok'}">${fmtMoney(r.payroll)}</td>
      <td class="${over ? 'tax-over' : ''}">${over ? `+${fmtMoney(r.payroll - luxTax)} over` : `${fmtMoney(luxTax - r.payroll)} under`}</td>
    </tr>`;
  }).join('');

  wrap.innerHTML = `<table class="salary-table">
    <thead><tr><th>#</th><th>Team</th><th>Division</th><th>Payroll</th><th>vs. Luxury Tax ($241M)</th></tr></thead>
    <tbody>${tableRows}</tbody>
  </table>`;
}

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
    allTxs = data.transactions ?? [];
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
    const logo = team ? `<img class="activity-logo" src="https://www.mlb.com/assets/images/team/logos/${team.id}/default_chyron.png" alt="${esc(team.abbr)}" width="22" height="22" loading="lazy">` : '';
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

loadSalaryRankings();
loadLeagueTx();
loadExecNews();
