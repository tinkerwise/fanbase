// ── FrontOffice config ────────────────────────────────────────────
import { TEAM_CONFIG, SLUG_TO_ID } from './teamConfig.js';

export const MLB = 'https://statsapi.mlb.com/api/v1';
export const SEASON = new Date().getFullYear();
export const PROXY = `${import.meta.env.BASE_URL}rss-proxy.php`;
export const BASE = import.meta.env.BASE_URL;

// All 30 teams as an array, sorted by division then name
export const ALL_TEAMS = Object.values(TEAM_CONFIG).sort((a, b) => {
  if (a.div < b.div) return -1;
  if (a.div > b.div) return 1;
  return a.name.localeCompare(b.name);
});

export function teamLogoSrc(id, size = 24) {
  return `https://www.mlb.com/assets/images/team/logos/${id}/default_chyron.png`;
}

// Salary formatting
export function fmtMoney(n) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

export function relDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 864e5);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  if (diff < 365) return `${Math.floor(diff / 30)}mo ago`;
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
