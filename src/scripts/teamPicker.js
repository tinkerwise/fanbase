import { TEAMS, getActiveTeam } from './teamConfig.js';

const STORAGE_KEY = 'fanbase_team';

const DIVISIONS = [
  'AL East',
  'AL Central',
  'AL West',
  'NL East',
  'NL Central',
  'NL West',
];

function buildModal() {
  const activeId = getActiveTeam().id;

  const overlay = document.createElement('div');
  overlay.className = 'team-picker-overlay';
  overlay.id = 'team-picker-overlay';

  const modal = document.createElement('div');
  modal.className = 'team-picker-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Choose your team');

  modal.innerHTML = `<h2>Choose Your Team</h2>`;

  DIVISIONS.forEach(div => {
    const teams = Object.values(TEAMS).filter(t => t.division === div);
    if (teams.length === 0) return;

    const group = document.createElement('div');
    group.className = 'division-group';
    group.innerHTML = `<h3>${div}</h3>`;

    const grid = document.createElement('div');
    grid.className = 'team-grid';

    teams.forEach(team => {
      const btn = document.createElement('button');
      btn.className = 'team-btn' + (team.id === activeId ? ' active' : '');
      btn.type = 'button';
      btn.dataset.teamId = team.id;
      btn.innerHTML = `
        <img src="${team.logoUrl}" alt="${team.name} logo" width="44" height="44" loading="lazy" />
        <span class="team-name">${team.city}<br />${team.name.replace(team.city, '').trim()}</span>`;

      btn.addEventListener('click', () => {
        localStorage.setItem(STORAGE_KEY, String(team.id));
        window.location.reload();
      });

      grid.appendChild(btn);
    });

    group.appendChild(grid);
    modal.appendChild(group);
  });

  // Close on overlay click (outside modal)
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closePicker();
  });

  overlay.appendChild(modal);
  return overlay;
}

function openPicker() {
  // Remove stale instance if any
  document.getElementById('team-picker-overlay')?.remove();
  document.body.appendChild(buildModal());
  document.body.style.overflow = 'hidden';

  // Close on Escape
  const onKey = e => {
    if (e.key === 'Escape') {
      closePicker();
      document.removeEventListener('keydown', onKey);
    }
  };
  document.addEventListener('keydown', onKey);
}

function closePicker() {
  document.getElementById('team-picker-overlay')?.remove();
  document.body.style.overflow = '';
}

function injectChangeTeamButton() {
  const inner = document.querySelector('.header-inner');
  if (!inner || inner.querySelector('.change-team-btn')) return;

  const btn = document.createElement('button');
  btn.className = 'change-team-btn';
  btn.type = 'button';
  btn.textContent = 'Change Team';
  btn.addEventListener('click', openPicker);
  inner.appendChild(btn);
}

function init() {
  injectChangeTeamButton();

  // Show picker on first visit (no team stored)
  if (!localStorage.getItem(STORAGE_KEY)) {
    openPicker();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
