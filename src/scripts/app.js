import { $ } from './utils.js';
import { requireTeam } from './teamPicker.js';
import { loadScores } from './scores.js';
import { loadFeeds } from './feeds.js';
import { setupFeedControls } from './feedControls.js';
import {
  loadStandings,
  loadOnDeck,
  loadRoster,
  loadTransactions,
  loadInjuryReport,
  loadLeaders,
  loadPodcast,
  loadVideos,
  loadContracts,
} from './sidebars.js';
import { triggerSevenNationArmy } from './easter-eggs.js';

// ── Refresh ───────────────────────────────────────────────────────
async function refresh() {
  const btn = $('refreshBtn');
  btn.disabled = true;
  btn.classList.add('spinning');
  await Promise.allSettled([loadFeeds(), loadScores(), loadStandings(), loadOnDeck(), loadRoster(), loadTransactions(), loadInjuryReport(), loadLeaders()]);
  btn.disabled = false;
  btn.classList.remove('spinning');
  const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  $('cacheLabel').textContent = `Updated ${now}`;
}

// ── Event setup ───────────────────────────────────────────────────
function setupEvents() {
  $('refreshBtn').addEventListener('click', refresh);
  // More in the tab bar has a Refresh for pages that have one
  document.querySelectorAll('[data-refresh]').forEach(btn => {
    btn.hidden = false;
    btn.addEventListener('click', refresh);
  });
  setupFeedControls();

  // Right sidebar accordion
  document.querySelectorAll('.section-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const section = toggle.closest('.sidebar-section');
      const sidebar = section.closest('.sidebar');
      const isRightSidebar = sidebar?.classList.contains('sidebar-right');

      if (!isRightSidebar) {
        section.classList.toggle('collapsed');
        return;
      }

      const isCollapsed = section.classList.contains('collapsed');
      sidebar.querySelectorAll('.sidebar-section').forEach(peer => {
        if (peer !== section) peer.classList.add('collapsed');
      });
      section.classList.toggle('collapsed', !isCollapsed);
    });
  });

  // Auto-refresh scores and transactions every 5 minutes while the tab is
  // visible; a tab that comes back after longer refreshes at once
  const REFRESH_MS = 5 * 60 * 1000;
  let lastRefresh = Date.now();
  const autoRefresh = () => {
    lastRefresh = Date.now();
    loadScores();
    loadTransactions();
  };
  setInterval(() => { if (!document.hidden) autoRefresh(); }, REFRESH_MS);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && Date.now() - lastRefresh >= REFRESH_MS) autoRefresh();
  });

  // ── Easter Eggs ──────────────────────────────────────────────────
  const konamiSeq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiIdx = 0;
  document.addEventListener('keydown', e => {
    if (e.key === konamiSeq[konamiIdx] || e.key.toLowerCase() === konamiSeq[konamiIdx]) {
      konamiIdx++;
      if (konamiIdx === konamiSeq.length) {
        konamiIdx = 0;
        triggerSevenNationArmy();
      }
    } else {
      konamiIdx = 0;
    }
  });
}

// ── Init ──────────────────────────────────────────────────────────
async function init() {
  setupEvents();
  // No team yet: the picker is open, so don't load anything until one's chosen
  if (!requireTeam()) return;

  await Promise.allSettled([
    loadScores(),
    loadStandings(),
    loadFeeds(),
    loadOnDeck(),
  ]);

  const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  $('cacheLabel').textContent = `Updated ${now}`;

  Promise.allSettled([
    loadRoster(),
    loadTransactions(),
    loadInjuryReport(),
    loadLeaders(),
    loadPodcast(),
    loadVideos(),
    loadContracts(),
  ]);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
