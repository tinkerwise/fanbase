// ── Home page: league activity ─────────────────
import { MLB, esc, relDate, newestFirst } from './config.js';
import { TEAM_CONFIG } from './teamConfig.js';

const TEAM_BY_ID = TEAM_CONFIG;

// ── League Recent Transactions ───────────────
async function loadLeagueActivity() {
  const wrap = document.getElementById('leagueActivity');
  if (!wrap) return;
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const dateStr = since.toISOString().slice(0, 10);
    const url = `${MLB}/transactions?sportId=1&startDate=${dateStr}&endDate=${new Date().toISOString().slice(0,10)}`;
    const data = await fetch(url).then(r => r.json());
    renderActivity(wrap, newestFirst(data.transactions ?? []).slice(0, 8));
  } catch {
    wrap.innerHTML = '<span class="empty-msg">Unable to load activity</span>';
  }
}

function renderActivity(wrap, txs) {
  if (!txs.length) {
    wrap.innerHTML = '<span class="empty-msg">No recent activity found</span>';
    return;
  }
  const items = txs.map(tx => {
    const team = TEAM_BY_ID[tx.team?.id];
    const logo = team ? `<img class="activity-logo" src="https://www.mlbstatic.com/team-logos/${team.id}.svg" alt="" width="22" height="22" loading="lazy">` : '';
    const desc = esc(tx.description ?? 'Transaction');
    const date = relDate(tx.date ?? tx.effectiveDate ?? '');
    return `<div class="activity-item">${logo}<span class="activity-text">${desc}</span><span class="activity-date">${esc(date)}</span></div>`;
  }).join('');
  wrap.innerHTML = `<div class="activity-list">${items}</div>`;
}

loadLeagueActivity();
