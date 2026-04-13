// ── Theme ─────────────────────────────────────────────────────────
import { loadPrefs, savePrefs } from './storage.js';

export function applyTheme(theme) {
  const resolved = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    : theme;
  document.documentElement.setAttribute('data-theme', resolved);
  savePrefs({ theme });
}

// Apply saved theme immediately on import
const _savedTheme = loadPrefs().theme || 'dark';
applyTheme(_savedTheme);

// Auto City Connect on Fridays (without overwriting the user's saved preference)
if (new Date().getDay() === 5 && _savedTheme !== 'city-connect') {
  document.documentElement.setAttribute('data-theme', 'city-connect');
}
