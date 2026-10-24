// ── Theme ─────────────────────────────────────────────────────────
// The head script in Layout.astro applies the theme and team accent before
// first paint; these apply a change made in Settings or by an easter egg.
import { loadPrefs, savePrefs } from './storage.js';
import { getActiveTeamId, ORIOLES_ID } from './config.js';

export function applyTheme(theme) {
  const resolved = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    : theme;
  document.documentElement.setAttribute('data-theme', resolved);
  syncThemeColor(resolved);
  savePrefs({ theme });
}

// Points the status bar color at the app's theme. The theme-color metas in
// Layout.astro follow the system setting, so drop their media queries.
export function syncThemeColor(theme) {
  const color = theme === 'dark' || theme === 'opacy' ? '#111111' : '#ffffff';
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => {
    m.removeAttribute('media');
    m.setAttribute('content', color);
  });
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
  syncThemeColor('city-connect');
}
