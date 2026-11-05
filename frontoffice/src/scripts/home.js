// ── Home page: league activity + payroll snapshot ─────────────────
import { MLB, SEASON, esc, relDate, fmtMoney } from './config.js';
import { TEAM_CONFIG } from './teamConfig.js';

const TEAM_BY_ID = TEAM_CONFIG;

// ── League Recent Transactions (front-office types) ───────────────
async function loadLeagueActivity() {
  const wrap = document.getElementById('leagueActivity');
  if (!wrap) return;
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const dateStr = since.toISOString().slice(0, 10);
    const url = `${MLB}/transactions?sportId=1&startDate=${dateStr}&endDate=${new Date().toISOString().slice(0,10)}`;
    const data = await fetch(url).then(r => r.json());
    const txs = (data.transactions ?? []).filter(tx => {
      const desc = (tx.description ?? '').toLowerCase();
      return desc.includes('general manager') || desc.includes('manager') ||
             desc.includes('president') || desc.includes('vice president') ||
             desc.includes(' gm ') || desc.includes('hired') || desc.includes('fired') ||
             desc.includes('named') || desc.includes('promoted');
    }).slice(0, 8);

    if (!txs.length) {
      // Fall back to showing recent transactions of any type
      const allTx = (data.transactions ?? []).slice(0, 8);
      renderActivity(wrap, allTx);
      return;
    }
    renderActivity(wrap, txs);
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
    const logo = team ? `<img class="activity-logo" src="https://www.mlb.com/assets/images/team/logos/${team.id}/default_chyron.png" alt="" width="22" height="22" loading="lazy">` : '';
    const desc = esc(tx.description ?? 'Transaction');
    const date = relDate(tx.date ?? tx.effectiveDate ?? '');
    return `<div class="activity-item">${logo}<span class="activity-text">${desc}</span><span class="activity-date">${esc(date)}</span></div>`;
  }).join('');
  wrap.innerHTML = `<div class="activity-list">${items}</div>`;
}

// ── Payroll Snapshot ──────────────────────────────────────────────
// Uses the curated team JSON for known totals. If not available, shows placeholder.
async function loadPayrollSnapshot() {
  const wrap = document.getElementById('payrollSnapshot');
  if (!wrap) return;

  // Load a few teams' payroll from their JSON files to give a top-5 snapshot
  const base = document.querySelector('base')?.href ?? '/frontoffice/';
  const slugs = ['dodgers', 'mets', 'yankees', 'red-sox', 'orioles'];
  try {
    const teams = await Promise.allSettled(
      slugs.map(s => fetch(`${location.origin}${import.meta.env.BASE_URL}data-teams/${s}.json`).then(r => r.json()))
    );
    const rows = teams.map((res, i) => {
      if (res.status !== 'fulfilled') return null;
      const d = res.value;
      const total = d.payroll?.topContracts?.reduce((sum, c) => sum + (c.total ?? 0), 0) ?? 0;
      return { name: d.name, slug: slugs[i], total };
    }).filter(Boolean).sort((a, b) => b.total - a.total);

    if (!rows.length) throw new Error('no data');
    const html = rows.map(r =>
      `<div class="activity-item" style="padding:7px 0;border:none;background:none">
        <span class="activity-text"><a href="${import.meta.env.BASE_URL}team/${r.slug}/" style="color:var(--text)">${esc(r.name)}</a></span>
        <span class="activity-date" style="color:var(--accent-text);font-weight:600">${fmtMoney(r.total)}</span>
      </div>`
    ).join('');
    wrap.innerHTML = `<div style="padding:0 0 4px">${html}</div><a class="nav-link" href="${import.meta.env.BASE_URL}league/" style="font-size:.78rem;padding:6px 0">Full salary table →</a>`;
  } catch {
    wrap.innerHTML = `<p style="font-size:.8rem;color:var(--text-3);padding:4px 0">See <a href="${import.meta.env.BASE_URL}league/">the league page</a> for full salary rankings.</p>`;
  }
}

loadLeagueActivity();
loadPayrollSnapshot();
