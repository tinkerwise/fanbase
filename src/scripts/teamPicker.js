// ── Team Picker ───────────────────────────────────────────────────
// Every page imports this. It adds the team button to the header, fills
// the team-name placeholders in the static markup, and, until a team is
// picked, shows the picker instead of letting the page load data (pages
// gate their loaders on requireTeam()). It also shows the "Viewing as…"
// banner when ?view= shows another team, and the picker's Browse mode,
// which opens a team that way instead of making it yours.
import { TEAM_CONFIG } from './teamConfig.js';
import { TEAM, TEAM_ID, PICKED_TEAM_ID, MY_TEAM_ID, MY_TEAM, VIEWING, TEAM_KEY, TEAM_PAGE, ONBOARD_PENDING_KEY, viewUrl } from './config.js';
import { esc } from './utils.js';

const logoUrl = id => `https://www.mlbstatic.com/team-logos/${id}.svg`;
const PICK_SUB = 'News, scores, and your roster, in your colors. You can switch any time.';

let overlay = null;
let browsing = false;

// The current page, relative to the site root ('' for Home, 'schedule/', …)
function currentPage() {
  const base = import.meta.env.BASE_URL;
  return location.pathname.startsWith(base) ? location.pathname.slice(base.length) : '';
}

function pickTeam(id) {
  try {
    // A first team gets the welcome (onboarding.js) after the reload
    if (!MY_TEAM_ID) localStorage.setItem(ONBOARD_PENDING_KEY, '1');
    localStorage.setItem(TEAM_KEY, String(id));
  } catch { /* ignore */ }
  // Drop a ?team= or ?view= override so the reload lands on the new pick
  const url = new URL(location.href);
  url.searchParams.delete('team');
  url.searchParams.delete('view');
  location.href = url.href;
}

function buildOverlay() {
  const sorted = Object.values(TEAM_CONFIG).sort((a, b) => a.name.localeCompare(b.name));

  overlay = document.createElement('div');
  overlay.className = 'team-picker-overlay hidden';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'teamPickerTitle');
  overlay.innerHTML = `
    <div class="team-picker-modal">
      <div class="team-picker-header">
        <div>
          <h2 class="team-picker-title" id="teamPickerTitle">Choose Your Team</h2>
          <p class="team-picker-sub">${PICK_SUB}</p>
          ${MY_TEAM ? '<button class="team-picker-mode" type="button" data-mode-toggle>Just looking? Browse a team without switching</button>' : ''}
        </div>
        ${PICKED_TEAM_ID ? '<button class="team-picker-close" aria-label="Close">✕</button>' : ''}
      </div>
      <div class="team-picker-grid">
        ${sorted.map(team => `
          <button class="team-picker-btn${team.id === (MY_TEAM_ID ?? PICKED_TEAM_ID) ? ' active' : ''}" data-team-id="${team.id}" title="${esc(team.fullName)}">
            <img class="team-picker-logo" src="${logoUrl(team.id)}"
              alt="${esc(team.name)}" width="48" height="48" loading="lazy">
            <span class="team-picker-name">${esc(team.name)}</span>
          </button>
        `).join('')}
      </div>
    </div>`;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', e => {
    const btn = e.target.closest('.team-picker-btn');
    if (btn) {
      if (browsing) location.href = viewUrl(Number(btn.dataset.teamId), currentPage());
      else pickTeam(Number(btn.dataset.teamId));
      return;
    }
    if (e.target.closest('[data-mode-toggle]')) { setBrowsing(!browsing); return; }
    // First visit: no team yet, so there's nothing to close back to
    if (PICKED_TEAM_ID && (e.target === overlay || e.target.closest('.team-picker-close'))) closeTeamPicker();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && PICKED_TEAM_ID && !overlay.classList.contains('hidden')) closeTeamPicker();
  });
}

function setBrowsing(on) {
  browsing = on;
  overlay.classList.toggle('team-picker-overlay--browse', on);
  overlay.querySelector('.team-picker-title').textContent = on ? 'Browse a Team' : 'Choose Your Team';
  overlay.querySelector('.team-picker-sub').textContent = on
    ? `See any team's news, scores and schedule.${MY_TEAM ? ` Your team stays the ${MY_TEAM.name}.` : ''}`
    : PICK_SUB;
  const toggle = overlay.querySelector('[data-mode-toggle]');
  if (toggle) toggle.textContent = on ? 'Make a team yours instead' : 'Just looking? Browse a team without switching';
}

// browse: open in Browse mode (view a team) rather than Pick mode
export function openTeamPicker({ browse = false } = {}) {
  if (!overlay) buildOverlay();
  setBrowsing(browse);
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

export function closeTeamPicker() {
  overlay?.classList.add('hidden');
  document.body.style.overflow = '';
}

function dismissTooltip(btn) {
  btn.classList.remove('btn-team-picker--tooltip');
  btn.querySelector('.team-picker-tooltip')?.remove();
}

// Nudge toward the picker while no team is saved
function attachTooltip(btn) {
  if (MY_TEAM) return;
  btn.classList.add('btn-team-picker--tooltip');
  const tip = document.createElement('div');
  tip.className = 'team-picker-tooltip';
  tip.textContent = 'Pick your team!';
  btn.appendChild(tip);
  const handler = e => {
    if (!btn.contains(e.target)) { dismissTooltip(btn); document.removeEventListener('click', handler, true); }
  };
  document.addEventListener('click', handler, true);
}

// Shows your own team, also while viewing another.
function addHeaderButton() {
  const headerRight = document.querySelector('.site-header .header-right');
  if (!headerRight) return;
  const btn = document.createElement('button');
  btn.className = 'btn-team-picker';
  btn.type = 'button';
  btn.setAttribute('aria-label', MY_TEAM ? `My team: ${MY_TEAM.fullName}. Change team` : 'Pick your team');
  btn.title = MY_TEAM ? `My Team: ${MY_TEAM.name}` : 'Pick your team';
  btn.innerHTML = MY_TEAM
    ? `<img class="team-picker-active-logo" src="${logoUrl(MY_TEAM_ID)}"
        alt="" width="20" height="20" loading="eager" onerror="this.style.display='none'">
       <span class="team-picker-active-name">${esc(MY_TEAM.name)}</span>`
    : '<span class="team-picker-active-name">Pick team</span>';
  btn.addEventListener('click', () => { dismissTooltip(btn); openTeamPicker(); });
  headerRight.prepend(btn);
  attachTooltip(btn);
}

function addViewBanner() {
  if (!VIEWING) return;
  const back = new URL(location.href);
  back.searchParams.delete('view');
  const bar = document.createElement('div');
  bar.className = 'view-banner';
  bar.setAttribute('role', 'status');
  bar.innerHTML = `
    <img class="view-banner-logo" src="${logoUrl(TEAM_ID)}" alt="" width="22" height="22" decoding="async">
    <span class="view-banner-text">Viewing as the <b>${esc(TEAM.fullName)}</b></span>
    <button class="view-banner-btn" type="button" data-browse>Other teams</button>
    ${MY_TEAM
      ? `<a class="view-banner-btn view-banner-back" href="${esc(back.href)}" data-no-view>Back to ${esc(MY_TEAM.name)}</a>`
      : '<button class="view-banner-btn view-banner-back" type="button" data-pick>Pick your team</button>'}
    <button class="view-banner-close" type="button" aria-label="Dismiss" data-dismiss>✕</button>`;
  bar.addEventListener('click', e => {
    if (e.target.closest('[data-browse]')) openTeamPicker({ browse: true });
    else if (e.target.closest('[data-pick]')) openTeamPicker();
    else if (e.target.closest('[data-dismiss]')) bar.remove();
  });
  const header = document.querySelector('.site-header');
  if (header) header.after(bar); else document.body.prepend(bar);
}

// Static markup carries placeholders the build can't know:
// data-team-text="nick|name|fullName|city|abbr" swaps text, data-team-href
// takes a URL template with {abbr} {slug} {page} {id} filled from the active
// team ({page} is its mlb.com path, e.g. 'redsox'),
// and img[data-team-logo] gets the team's logo.
function fillPlaceholders() {
  if (!PICKED_TEAM_ID) return;
  const slug = TEAM.fullName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const vars = { abbr: TEAM.abbr.toLowerCase(), slug, page: TEAM_PAGE[TEAM_ID], id: TEAM_ID };
  document.querySelectorAll('[data-team-text]').forEach(el => {
    el.textContent = TEAM[el.dataset.teamText] ?? el.textContent;
  });
  document.querySelectorAll('[data-team-href]').forEach(el => {
    el.href = el.dataset.teamHref.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
  });
  document.querySelectorAll('img[data-team-logo]').forEach(el => {
    el.src = logoUrl(TEAM_ID);
  });
}

// True when the page can load team data; otherwise shows the picker.
export function requireTeam() {
  if (PICKED_TEAM_ID) return true;
  document.documentElement.classList.add('no-team');
  openTeamPicker();
  return false;
}

function init() {
  addHeaderButton();
  addViewBanner();
  fillPlaceholders();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
