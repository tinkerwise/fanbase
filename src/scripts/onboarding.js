// ── Welcome (onboarding) ──────────────────────────────────────────
// Three short steps shown once after a visitor gets their first team (a
// pick in the team picker, or a shared ?team= link; both set
// ONBOARD_PENDING_KEY, in teamPicker.js and Layout.astro's head script):
//   1. Welcome, in the team's colors
//   2. Make it yours: theme (the same setting as the Settings panel,
//      applied live behind the dialog)
//   3. Get around: search, browsing other teams, Add to Home Screen
// Skip works on every step and counts as seen. Existing visitors never see
// it: the flag is only set when no team was saved before. Every page loads
// this (Layout.astro), so it shows on whichever page the pick lands on.
import { applyTheme } from './theme.js';
import { loadPrefs } from './storage.js';
import { TEAM, TEAM_ID, PICKED_TEAM_ID, VIEWING, ORIOLES_ID, ONBOARD_PENDING_KEY } from './config.js';
import { esc, teamLogoSrc } from './utils.js';
import { openSearch } from './search.js';

const SEEN_KEY = 'fb_onboarded';
const STEPS = 3;
const THEMES = [['light', 'Light'], ['dark', 'Dark'], ['system', 'System'],
  ...(TEAM_ID === ORIOLES_ID ? [['city-connect', 'City Connect']] : [])];

let overlay = null;
let step = 0;

function store(fn) { try { fn(localStorage); } catch { /* storage blocked */ } }

function device() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

function homeScreenTip() {
  const kind = device();
  if (kind === 'ios') return 'In Safari, tap <b>Share</b>, then <b>Add to Home Screen</b> to open Fanbase like an app.';
  if (kind === 'android') return 'In Chrome, tap the <b>⋮</b> menu, then <b>Add to Home screen</b> to open Fanbase like an app.';
  return 'On your phone, add Fanbase to your Home Screen to open it like an app.';
}

function body() {
  if (step === 0) {
    return `<div class="ob-hero">
        <img class="ob-team-logo" src="${esc(teamLogoSrc(TEAM_ID, 96))}" alt="" width="96" height="96">
        <h2 class="ob-title" id="obTitle">Welcome, ${esc(TEAM.name)} fans</h2>
        <p class="ob-text">News, scores, standings and your roster for the ${esc(TEAM.fullName)}, all in your team's colors.</p>
      </div>`;
  }
  if (step === 1) {
    const theme = loadPrefs().theme || 'light';
    return `<h2 class="ob-title" id="obTitle">Make it yours</h2>
      <p class="ob-sub">Theme</p>
      <div class="theme-toggle ob-themes" role="radiogroup" aria-label="Theme">
        ${THEMES.map(([v, label]) => `<button class="theme-btn${v === theme ? ' active' : ''}" type="button" role="radio" aria-checked="${v === theme}" data-ob-theme="${v}">${label}</button>`).join('')}
      </div>
      <p class="ob-text ob-text--small">You can change this any time in Settings, along with your news sources.</p>`;
  }
  return `<h2 class="ob-title" id="obTitle">Get around</h2>
    <ul class="ob-tips">
      <li><b>Get around</b> with the tabs at the bottom: Home, <b>Dugout</b> (all your team's news), Schedule and Roster. <b>More</b> has Postseason, Trades, Draft, Search and Settings. On a computer they're under the header.</li>
      <li><b>Search</b> any team, player or page, or press <kbd>/</kbd> or <kbd>⌘K</kbd>. <button class="ob-link" type="button" data-ob="search">Try it</button></li>
      <li><b>Other teams:</b> the team button, top right, lets you browse any club without switching yours.</li>
      <li>${homeScreenTip()}</li>
    </ul>`;
}

function render() {
  const last = step === STEPS - 1;
  overlay.innerHTML = `
    <div class="ob-dialog" role="dialog" aria-modal="true" aria-labelledby="obTitle">
      <button class="ob-close" type="button" aria-label="Skip welcome" data-ob="skip">✕</button>
      <div class="ob-body">${body()}</div>
      <div class="ob-dots" aria-hidden="true">${Array.from({ length: STEPS }, (_, i) => `<span class="ob-dot${i === step ? ' active' : ''}"></span>`).join('')}</div>
      <div class="ob-actions">
        ${step === 0 ? '<button class="ob-skip" type="button" data-ob="skip">Skip</button>' : '<button class="ob-skip" type="button" data-ob="back">Back</button>'}
        <button class="ob-next" type="button" data-ob="${last ? 'done' : 'next'}">${last ? "Let's go" : 'Next'}</button>
      </div>
    </div>`;
  overlay.querySelector('.ob-next')?.focus();
}

function close() {
  store(ls => { ls.setItem(SEEN_KEY, '1'); ls.removeItem(ONBOARD_PENDING_KEY); });
  overlay?.classList.add('hidden');
  document.body.style.overflow = '';
}

export function openOnboarding() {
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'ob-overlay hidden';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => {
      const theme = e.target.closest('[data-ob-theme]');
      if (theme) { applyTheme(theme.dataset.obTheme); render(); return; }
      const action = e.target.closest('[data-ob]')?.dataset.ob;
      if (action === 'next') { step = Math.min(step + 1, STEPS - 1); render(); }
      else if (action === 'back') { step = Math.max(step - 1, 0); render(); }
      else if (action === 'skip' || action === 'done') close();
      else if (action === 'search') { close(); openSearch(); }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay && !overlay.classList.contains('hidden')) close();
    });
  }
  step = 0;
  render();
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function maybeShowOnboarding() {
  if (!PICKED_TEAM_ID || VIEWING) return;
  let pending = false, seen = false;
  store(ls => { pending = ls.getItem(ONBOARD_PENDING_KEY) === '1'; seen = ls.getItem(SEEN_KEY) === '1'; });
  if (pending && !seen) openOnboarding();
  else if (pending) store(ls => ls.removeItem(ONBOARD_PENDING_KEY));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', maybeShowOnboarding);
else maybeShowOnboarding();
