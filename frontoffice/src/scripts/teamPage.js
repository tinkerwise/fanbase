// ── Team page: live data ───────────────────────────────────────────
import { MLB, SEASON, PROXY, esc, relDate } from './config.js';

// ── Transactions ──────────────────────────────────────────────────
async function loadTransactions() {
  const wrap = document.getElementById('txWrap');
  if (!wrap) return;
  const teamId = wrap.dataset.teamId;
  if (!teamId) return;

  try {
    const since = new Date();
    since.setDate(since.getDate() - 90);
    const dateStr = since.toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    const url = `${MLB}/transactions?teamId=${teamId}&sportId=1&startDate=${dateStr}&endDate=${today}`;
    const data = await fetch(url).then(r => r.json());
    const txs = (data.transactions ?? []).slice(0, 25);

    if (!txs.length) {
      wrap.innerHTML = '<span class="empty-msg">No transactions in the last 90 days.</span>';
      return;
    }

    const items = txs.map(tx => {
      const desc = esc(tx.description ?? 'Transaction');
      const date = relDate(tx.date ?? tx.effectiveDate ?? '');
      const type = classifyTx(tx.description ?? '');
      return `<div class="tx-item">
        <span class="tx-type ${type.cls}">${type.label}</span>
        <span class="tx-desc">${desc}</span>
        <span class="tx-date">${esc(date)}</span>
      </div>`;
    }).join('');
    wrap.innerHTML = `<div class="tx-list">${items}</div>`;
  } catch {
    wrap.innerHTML = '<span class="empty-msg">Transactions unavailable — try refreshing.</span>';
  }
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

// ── Draft (live — current year round 1 from MLB API) ─────────────
async function loadDraft() {
  const wrap = document.getElementById('draftWrap');
  if (!wrap) return;
  const teamId = Number(wrap.dataset.teamId);
  if (!teamId) return;

  try {
    const data = await fetch(`${MLB}/draft/${SEASON}`).then(r => r.json());
    const allPicks = (data.drafts?.draftLists ?? []).flatMap(r => r.picks ?? []);
    const teamPicks = allPicks.filter(p => p.team?.id === teamId);

    if (!teamPicks.length) {
      // Only show message if wrap has no sibling curated content
      if (!wrap.previousElementSibling?.classList?.contains('draft-wrap')) {
        wrap.innerHTML = `<span class="empty-msg">No ${SEASON} draft picks found yet.</span>`;
      } else {
        wrap.style.display = 'none';
      }
      return;
    }

    const html = teamPicks.map(p => {
      const name = esc(`${p.person?.firstName ?? ''} ${p.person?.lastName ?? ''}`.trim() || '—');
      const pos = esc(p.person?.primaryPosition?.abbreviation ?? '—');
      const school = esc(p.school?.name ?? p.home?.state ?? '');
      return `<div class="draft-pick">
        <span class="pick-round">Rd ${p.pickRound} · #${p.pickNumber}</span>
        <span class="pick-name">${name}</span>
        <span class="pick-pos">${pos}</span>
        <span class="pick-school">${school}</span>
        <span class="pick-status">${SEASON} pick</span>
      </div>`;
    }).join('');

    // Prepend a year label
    wrap.innerHTML = `<div class="draft-year-label" style="margin-top:0;border-top:none;padding-top:0">${SEASON} Draft (Live)</div>${html}`;
  } catch {
    wrap.innerHTML = '';
  }
}

// ── Payroll (live from MLB roster API as fallback) ────────────────
async function loadPayroll() {
  const wrap = document.getElementById('payrollWrap');
  if (!wrap) return;
  const teamId = wrap.dataset.teamId;
  try {
    const data = await fetch(`${MLB}/teams/${teamId}/roster?rosterType=40Man&season=${SEASON}&hydrate=person(salary)`).then(r => r.json());
    const roster = (data.roster ?? []).filter(p => p.salary);
    if (!roster.length) {
      wrap.innerHTML = '<span class="empty-msg">Salary data not available via API.</span>';
      return;
    }
    const sorted = roster.sort((a, b) => (b.salary ?? 0) - (a.salary ?? 0)).slice(0, 10);
    const rows = sorted.map(p => {
      const name = esc(`${p.person?.fullName ?? '—'}`);
      const pos = esc(p.position?.abbreviation ?? '—');
      const sal = p.salary ? `$${Number(p.salary).toLocaleString()}` : '—';
      return `<tr><td class="player">${name}</td><td>${pos}</td><td class="aav">${sal}</td><td>—</td><td>—</td></tr>`;
    }).join('');
    wrap.innerHTML = `<table class="contracts-table"><thead><tr><th>Player</th><th>Pos</th><th>Salary</th><th>Years</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>`;
  } catch {
    wrap.innerHTML = '<span class="empty-msg">Payroll data unavailable.</span>';
  }
}

// ── News ─────────────────────────────────────────────────────────
async function loadNews() {
  const wrap = document.getElementById('newsWrap');
  if (!wrap) return;
  const query = wrap.dataset.query ?? '';
  const proxyBase = document.querySelector('base')?.href ?? '/frontoffice/';
  try {
    const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    const url = `${import.meta.env.BASE_URL}rss-proxy.php?url=${encodeURIComponent(feedUrl)}`;
    const data = await fetch(url).then(r => r.json());
    const items = data.items ?? [];
    if (!items.length) {
      wrap.innerHTML = '<span class="empty-msg">No news found.</span>';
      return;
    }
    const html = items.slice(0, 10).map(item => {
      const title = esc(item.title ?? 'Article');
      const desc = esc(item.description ?? '');
      const date = relDate(item.pubDate ?? '');
      const thumb = item.thumbnail ? `<img class="news-thumb" src="${esc(item.thumbnail)}" alt="" loading="lazy" decoding="async">` : '<div class="news-thumb-placeholder"></div>';
      return `<a class="news-item" href="${esc(item.link ?? '#')}" target="_blank" rel="noopener">
        ${thumb}
        <div class="news-body">
          <div class="news-title">${title}</div>
          ${desc ? `<div class="news-desc">${desc}</div>` : ''}
          <div class="news-date">${esc(date)}</div>
        </div>
      </a>`;
    }).join('');
    wrap.innerHTML = `<div class="news-list">${html}</div>`;
  } catch {
    wrap.innerHTML = '<span class="empty-msg">News unavailable.</span>';
  }
}

// Tab anchor scrolling
document.querySelectorAll('.page-tab').forEach(tab => {
  tab.addEventListener('click', e => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (href && href.startsWith('#')) {
      const el = document.getElementById(href.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    document.querySelectorAll('.page-tab').forEach(t => t.classList.remove('active'));
    e.currentTarget.classList.add('active');
  });
});

loadTransactions();
loadDraft();
loadPayroll();
loadNews();
