// ── Depth Chart page ──────────────────────────────────────────────
import './theme.js';
import { MLB, TEAM_ID, SEASON } from './config.js';
import { requireTeam } from './teamPicker.js';
import { esc, savantUrl } from './utils.js';

const IL_LABEL = { D10: '10-Day IL', D15: '15-Day IL', D60: '60-Day IL' };
const IL_ORDER  = { D10: 0, D15: 1, D60: 2 };

function lastName(fullName) {
  return fullName.trim().split(/\s+/).at(-1);
}

function ilPill(p) {
  const code = p.status?.code;
  const label = IL_LABEL[code];
  return label ? `<span class="depth-chart-il-pill">${label}</span>` : '';
}

function renderFieldChip(posId, pos, players) {
  const el = document.getElementById(posId);
  if (!el) return;

  if (!players?.length) {
    el.innerHTML = `<span class="depth-chart-chip-pos">${esc(pos)}</span><span class="depth-chart-chip-empty">—</span>`;
    return;
  }

  const [starter, ...rest] = players;
  const backups = rest.slice(0, 2);

  const backupHtml = backups.map(p => {
    const pill = ilPill(p);
    return `<a class="depth-chart-chip-backup${pill ? ' depth-chart-chip-backup--il' : ''}" href="${esc(savantUrl(p.person.id))}" target="_blank" rel="noopener" data-pid="${p.person.id}" data-pname="${esc(p.person.fullName)}">${esc(lastName(p.person.fullName))}${pill}</a>`;
  }).join('');

  el.innerHTML = `
    <span class="depth-chart-chip-pos">${esc(pos)}</span>
    <a class="depth-chart-chip-starter" href="${esc(savantUrl(starter.person.id))}" target="_blank" rel="noopener" data-pid="${starter.person.id}" data-pname="${esc(starter.person.fullName)}">${esc(lastName(starter.person.fullName))}</a>
    ${ilPill(starter)}
    ${backupHtml ? `<div class="depth-chart-chip-backups">${backupHtml}</div>` : ''}
  `;
}

function renderPitchCol(elId, label, players) {
  const el = document.getElementById(elId);
  if (!el) return;

  const rows = players.slice(0, 10).map((p, i) => {
    const cls = i === 0 ? ' depth-chart-pit-row--starter' : '';
    const pill = ilPill(p);
    return `<div class="depth-chart-pit-row${cls}">
      <span class="depth-chart-pit-rank">${i + 1}</span>
      <a class="depth-chart-pit-name" href="${esc(savantUrl(p.person.id))}" target="_blank" rel="noopener" data-pid="${p.person.id}" data-pname="${esc(p.person.fullName)}">${esc(p.person.fullName)}</a>
      ${pill}
    </div>`;
  }).join('');

  el.innerHTML = `<div class="depth-chart-pit-label">${esc(label)}</div>${rows}`;
}

function renderIlSection(players) {
  const el = document.getElementById('dcIlSection');
  if (!el) return;

  const seen = new Set();
  const ilPlayers = players
    .filter(p => p.status?.code in IL_ORDER && !seen.has(p.person.id) && seen.add(p.person.id))
    .sort((a, b) => {
      const ao = IL_ORDER[a.status?.code] ?? 9;
      const bo = IL_ORDER[b.status?.code] ?? 9;
      return ao !== bo ? ao - bo : a.person.fullName.localeCompare(b.person.fullName);
    });

  if (!ilPlayers.length) {
    el.style.display = 'none';
    return;
  }

  const rows = ilPlayers.map(p => {
    const label = IL_LABEL[p.status?.code] ?? '';
    const pos   = p.position?.abbreviation ?? '';
    return `<div class="depth-chart-il-row">
      <span class="depth-chart-il-row-pos">${esc(pos)}</span>
      <a class="depth-chart-il-row-name" href="${esc(savantUrl(p.person.id))}" target="_blank" rel="noopener" data-pid="${p.person.id}">${esc(p.person.fullName)}</a>
      <span class="depth-chart-il-pill">${esc(label)}</span>
    </div>`;
  }).join('');

  el.innerHTML = `<div class="depth-chart-il-section-label">Injured List</div>${rows}`;
}

// Site search links here with ?player=<id>: mark that player, or say
// they're not on the chart (minor leaguers, recent call-ups)
function highlightPlayer(players) {
  const id = new URLSearchParams(location.search).get('player');
  if (!id) return;
  const el = document.querySelector(`[data-pid="${CSS.escape(id)}"]`);
  if (el) {
    el.classList.add('depth-chart-hl');
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    el.focus({ preventScroll: true });
    return;
  }
  const name = players.find(p => String(p.person.id) === id)?.person.fullName;
  const note = document.createElement('p');
  note.className = 'depth-chart-notice';
  note.innerHTML = `${name ? esc(name) : 'That player'} isn't on the depth chart right now. <a href="${esc(savantUrl(id))}" target="_blank" rel="noopener">View on Baseball Savant ↗</a>`;
  document.querySelector('.depth-chart-title')?.after(note);
}

async function loadDepthChart() {
  const overlay = document.getElementById('dcOverlay');
  try {
    const data = await fetch(
      `${MLB}/teams/${TEAM_ID}/roster?rosterType=depthChart&season=${SEASON}`
    ).then(r => r.json());

    const players = data.roster ?? [];
    if (!players.length) {
      overlay.innerHTML = '<span class="depth-chart-unavail">Depth chart unavailable</span>';
      return;
    }

    // Group by position abbreviation; API order = depth order
    const byPos = {};
    for (const p of players) {
      const pos = p.position?.abbreviation ?? 'UTIL';
      (byPos[pos] ??= []).push(p);
    }

    // Field positions
    renderFieldChip('depth-chart-C',  'C',  byPos['C']);
    renderFieldChip('depth-chart-1B', '1B', byPos['1B']);
    renderFieldChip('depth-chart-2B', '2B', byPos['2B']);
    renderFieldChip('depth-chart-3B', '3B', byPos['3B']);
    renderFieldChip('depth-chart-SS', 'SS', byPos['SS']);
    renderFieldChip('depth-chart-LF', 'LF', byPos['LF'] ?? byPos['OF']);
    renderFieldChip('depth-chart-CF', 'CF', byPos['CF'] ?? byPos['OF']);
    renderFieldChip('depth-chart-RF', 'RF', byPos['RF'] ?? byPos['OF']);
    renderFieldChip('depth-chart-DH', 'DH', byPos['DH']);

    // IL section (all positions, deduplicated, sorted by IL length)
    renderIlSection(players);

    // Pitching
    renderPitchCol('dcRotation', 'Rotation', byPos['SP'] ?? []);
    renderPitchCol('dcBullpen',  'Bullpen',  [...(byPos['RP'] ?? []), ...(byPos['P'] ?? [])]);

    highlightPlayer(players);

  } catch {
    overlay.innerHTML = '<span class="depth-chart-unavail">Unavailable</span>';
  }
}

if (requireTeam()) loadDepthChart();
