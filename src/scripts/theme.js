// ── Theme ─────────────────────────────────────────────────────────
import { loadPrefs, savePrefs } from './storage.js';
import { getActiveTeamId, ORIOLES_ID } from './config.js';

export function applyTheme(theme) {
  const resolved = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    : theme;
  document.documentElement.setAttribute('data-theme', resolved);
  savePrefs({ theme });
}

// Apply saved theme immediately on import
const _isOrioles = getActiveTeamId() === ORIOLES_ID;
let _savedTheme = loadPrefs().theme || 'light';

// City Connect is Orioles-only; silently fall back to light for other teams
if (_savedTheme === 'city-connect' && !_isOrioles) {
  _savedTheme = 'light';
  savePrefs({ theme: 'light' });
}

applyTheme(_savedTheme);

// Auto City Connect on Fridays — Orioles fans only
if (new Date().getDay() === 5 && _isOrioles && _savedTheme !== 'city-connect') {
  document.documentElement.setAttribute('data-theme', 'city-connect');
}
