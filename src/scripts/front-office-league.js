// ── League Front Offices page ─────────────────────────────────────
// /front-office/league/ (#38): a directory of who runs all 30 clubs (from
// the curated team files), the league's transactions with a team filter,
// and executive news. Needs no team, so it doesn't wait for the picker.
import './theme.js';
import './teamPicker.js';
import { MLB, MY_TEAM_ID, viewUrl } from './config.js';
import { TEAM_CONFIG } from './teamConfig.js';
import { $, esc, localDateStr, teamLogoSrc } from './utils.js';
import { loadAllTeamFiles, chainOfCommand, classifyTx, newestFirst, loadGoogleNews } from './frontOfficeData.js';

const DIVISIONS = ['AL East', 'AL Central', 'AL West', 'NL East', 'NL Central', 'NL West'];

// The directory's three columns, from the shared chain of command
const ROLES = [
  ['Top exec', c => c.president],
  ['GM', c => c.gm],
  ['Manager', c => c.manager],
];

function personCell(p) {
  if (!p) return '<span class="fo-dir-empty">—</span>';
  if (p.vacant) return '<span class="fo-dir-vacant">Vacant</span>';
  return esc(p.name);
}

async function loadDirectory() {
  const wrap = $('foDirectory');
  const files = await loadAllTeamFiles();
  wrap.innerHTML = `<div class="fo-directory">${DIVISIONS.map(div => {
    const teams = Object.values(TEAM_CONFIG).filter(t => t.div === div).sort((a, b) => a.name.localeCompare(b.name));
    return `<div class="fo-dir-div">
      <h3 class="fo-dir-div-title">${div}</h3>
      ${teams.map(t => {
        const chain = chainOfCommand(files[t.id]);
        return `<a class="fo-dir-row${t.id === MY_TEAM_ID ? ' fo-dir-row--mine' : ''}" href="${esc(viewUrl(t.id, 'front-office/'))}">
          <img class="fo-dir-logo" src="${teamLogoSrc(t.id, 24)}" alt="" width="24" height="24" loading="lazy">
          <span class="fo-dir-team">${esc(t.name)}</span>
          <span class="fo-dir-people">${ROLES.map(([label, pick]) =>
            `<span class="fo-dir-person"><span class="fo-dir-role">${label}</span> ${personCell(pick(chain))}</span>`).join('')}</span>
        </a>`;
      }).join('')}
    </div>`;
  }).join('')}</div>`;
}

// ── Transactions ──
let allTxs = [];

// The clubs a move involves: the API has toTeam and fromTeam (both for a
// trade), no `team`. Minor league affiliates are left out.
function mlbTeams(tx) {
  return [tx.toTeam, tx.fromTeam].map(t => TEAM_CONFIG[t?.id]).filter(Boolean);
}

function renderTx() {
  const wrap = $('foLeagueTx');
  const filter = $('foTxFilter').value;
  const shown = (filter ? allTxs.filter(tx => mlbTeams(tx).some(t => String(t.id) === filter)) : allTxs).slice(0, 50);
  if (!shown.length) {
    wrap.innerHTML = '<span class="sidebar-msg">No transactions in the last 14 days.</span>';
    return;
  }
  wrap.innerHTML = `<div class="txn-list fo-league-tx">${shown.map(tx => {
    const team = mlbTeams(tx)[0];
    const kind = classifyTx(tx);
    const date = new Date(tx.date || tx.effectiveDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `<div class="txn-item">
      <span class="txn-date">${esc(date)}</span>
      ${team ? `<img class="fo-tx-logo" src="${teamLogoSrc(team.id, 18)}" alt="${esc(team.abbr)}" title="${esc(team.name)}" width="18" height="18" loading="lazy">` : ''}
      <span class="fo-tx-type fo-tx-type--${kind.cls}">${kind.label}</span>
      <span class="txn-desc">${esc(tx.description ?? 'Transaction')}</span>
    </div>`;
  }).join('')}</div>`;
}

async function loadLeagueTx() {
  const start = new Date();
  start.setDate(start.getDate() - 14);
  try {
    const data = await fetch(`${MLB}/transactions?sportId=1&startDate=${start.toISOString().slice(0, 10)}&endDate=${localDateStr(0)}`).then(r => r.json());
    // MLB teams only: the feed also carries minor league affiliates' moves
    // A trade is listed once per club; keep one
    const seen = new Set();
    allTxs = newestFirst((data.transactions ?? []).filter(tx => {
      const key = `${tx.date}|${tx.description}`;
      if (!mlbTeams(tx).length || seen.has(key)) return false;
      seen.add(key);
      return true;
    }));
    renderTx();
  } catch {
    $('foLeagueTx').innerHTML = '<span class="sidebar-msg">Transactions unavailable. Try refreshing.</span>';
  }
}

$('foTxFilter').addEventListener('change', renderTx);
loadDirectory();
loadLeagueTx();
loadGoogleNews($('foExecNews'), 'MLB "general manager" OR "president of baseball operations" hired OR fired OR named', 12);
