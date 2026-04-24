// ── Team Picker ───────────────────────────────────────────────────
import { TEAM_CONFIG } from './teamConfig.js';
import { ORIOLES_ID, getActiveTeamId } from './config.js';

const STORAGE_KEY = 'fanbase_team';

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function applyTeamColor(teamId) {
  const cfg = TEAM_CONFIG[teamId] ?? TEAM_CONFIG[ORIOLES_ID];
  const rgb = hexToRgb(cfg.color);
  document.documentElement.style.setProperty('--orange', cfg.color);
  document.documentElement.style.setProperty('--orange-dim', `rgba(${rgb},0.12)`);
}

let overlay = null;

function createOverlay() {
  overlay = document.createElement('div');
  overlay.className = 'team-picker-overlay hidden';

  const sorted = Object.entries(TEAM_CONFIG)
    .sort((a, b) => a[1].name.localeCompare(b[1].name));

  overlay.innerHTML = `
    <div class="team-picker-modal">
      <div class="team-picker-header">
        <h2 class="team-picker-title">Choose Your Team</h2>
        <button class="team-picker-close" aria-label="Close">✕</button>
      </div>
      <div class="team-picker-grid">
        ${sorted.map(([id, team]) => `
          <button class="team-picker-btn" data-team-id="${id}" title="${team.fullName}">
            <img class="team-picker-logo" src="https://www.mlbstatic.com/team-logos/${id}.svg"
              alt="${team.name}" width="48" height="48" loading="lazy">
            <span class="team-picker-name">${team.name}</span>
          </button>
        `).join('')}
      </div>
    </div>`;

  document.body.appendChild(overlay);

  overlay.querySelector('.team-picker-close').addEventListener('click', closeOverlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeOverlay(); });

  overlay.querySelectorAll('.team-picker-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const teamId = Number(btn.dataset.teamId);
      try { localStorage.setItem(STORAGE_KEY, String(teamId)); } catch { /* ignore */ }
      window.location.reload();
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) closeOverlay();
  });
}

function openOverlay() {
  if (!overlay) createOverlay();
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeOverlay() {
  overlay?.classList.add('hidden');
  document.body.style.overflow = '';
}

function isFirstLoad() {
  try { return !localStorage.getItem(STORAGE_KEY); } catch { return false; }
}

function dismissTooltip(btn) {
  btn.classList.remove('btn-team-picker--tooltip');
  const tip = btn.querySelector('.team-picker-tooltip');
  if (tip) tip.remove();
}

function attachTooltip(btn) {
  if (!isFirstLoad()) return;
  btn.classList.add('btn-team-picker--tooltip');
  const tip = document.createElement('div');
  tip.className = 'team-picker-tooltip';
  tip.textContent = 'Pick your team!';
  btn.appendChild(tip);
  // Dismiss on any click outside
  const handler = e => {
    if (!btn.contains(e.target)) { dismissTooltip(btn); document.removeEventListener('click', handler, true); }
  };
  document.addEventListener('click', handler, true);
}

export function initTeamPicker() {
  const headerRight = document.querySelector('.header-right');
  if (!headerRight) return;

  const activeTeamId = getActiveTeamId();
  const teamName = TEAM_CONFIG[activeTeamId]?.name ?? 'Team';
  applyTeamColor(activeTeamId);

  const btn = document.createElement('button');
  btn.className = 'btn-team-picker';
  btn.setAttribute('aria-label', 'Change team');
  btn.title = `My Team: ${teamName}`;
  btn.innerHTML = `
    <img class="team-picker-active-logo" src="https://www.mlbstatic.com/team-logos/${activeTeamId}.svg"
      alt="${teamName}" width="20" height="20" loading="eager"
      onerror="this.style.display='none'">
    <span class="team-picker-active-name">${teamName}</span>`;
  btn.addEventListener('click', () => { dismissTooltip(btn); openOverlay(); });
  headerRight.prepend(btn);

  // Show tooltip on first load or after localStorage is cleared
  attachTooltip(btn);
}
