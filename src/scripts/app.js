import { loadPrefs, savePrefs, getDisabledSources, saveDisabledSources, loadCustomFeeds, addCustomFeed, removeCustomFeed } from './storage.js';
import { state } from './state.js';
import { applyTheme } from './theme.js';
import { $, syncOriolesLogos } from './utils.js';
import { initTeamPicker } from './teamPicker.js';
import { getActiveTeamId, ORIOLES_ID, TEAM_ABBREV, isFirstVisit } from './config.js';
import { TEAM_CONFIG } from './teamConfig.js';
import { loadScores } from './scores.js';
import {
  loadFeeds,
  renderArticles,
  renderSourceFilters,
  setViewMode,
  syncShowReadButton,
  closeReader,
  getAllSources,
} from './feeds.js';
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
import {
  triggerOriolesMagic,
  triggerSevenNationArmy,
  toggleOpacyTheme,
  triggerCityConnectBanner,
} from './easter-eggs.js';

// ── Source settings ───────────────────────────────────────────────
function renderSourceSettings() {
  const container = $('settingsSourcesList');
  if (!container) return;
  const sources = getAllSources();
  const disabled = getDisabledSources();

  if (!sources.length) {
    container.innerHTML = '<span class="settings-sources-empty">Loading…</span>';
    return;
  }

  const teamName = TEAM_CONFIG[getActiveTeamId()]?.name ?? 'Team';
  const groups = [
    { key: 'orioles', label: teamName },
    { key: 'mlb',     label: 'MLB'    },
    { key: 'milb',    label: 'MiLB'   },
    { key: 'custom',  label: 'Custom' },
  ];

  const enabledCount = sources.filter(s => !disabled.has(s.id)).length;
  const warnHtml = enabledCount === 0
    ? '<div class="source-setting-warning">No sources selected — no articles will load.</div>'
    : '';

  let html = warnHtml;
  for (const { key, label } of groups) {
    const srcs = sources.filter(s => s.category === key);
    if (!srcs.length) continue;
    html += `<div class="source-setting-group">
      <div class="source-setting-group-label">${label}</div>
      ${srcs.map(s => `
        <label class="source-setting-row">
          <input type="checkbox" class="source-setting-cb" data-source-id="${s.id}"${disabled.has(s.id) ? '' : ' checked'}>
          <span class="source-toggle-track"></span>
          <span class="source-setting-name">${s.name}</span>
        </label>`).join('')}
    </div>`;
  }

  html += '<button class="source-setting-reset" id="sourceResetBtn">Reset to defaults</button>';
  container.innerHTML = html;

  container.querySelectorAll('.source-setting-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      const newDisabled = new Set(
        [...container.querySelectorAll('.source-setting-cb')]
          .filter(c => !c.checked)
          .map(c => c.dataset.sourceId)
      );
      const remaining = sources.length - newDisabled.size;
      let warn = container.querySelector('.source-setting-warning');
      if (remaining === 0) {
        if (!warn) {
          warn = document.createElement('div');
          warn.className = 'source-setting-warning';
          container.prepend(warn);
        }
        warn.textContent = 'No sources selected — no articles will load.';
      } else {
        warn?.remove();
      }
      saveDisabledSources(newDisabled);
      renderSourceFilters();
      loadFeeds();
    });
  });

  $('sourceResetBtn')?.addEventListener('click', () => {
    saveDisabledSources(new Set());
    renderSourceFilters();
    renderSourceSettings();
    loadFeeds();
  });
}

// ── Custom Feed Settings ──────────────────────────────────────────
function renderCustomFeedSettings() {
  const wrap = $('customFeedsWrap');
  if (!wrap) return;

  const feeds = loadCustomFeeds();
  const listHtml = feeds.length
    ? feeds.map(f => `
        <div class="custom-feed-row" data-id="${f.id}">
          <span class="custom-feed-name">${f.name}</span>
          <button class="custom-feed-remove" data-id="${f.id}" aria-label="Remove ${f.name}">✕</button>
        </div>`).join('')
    : '<span class="custom-feeds-empty">No custom feeds added yet.</span>';

  wrap.innerHTML = `
    <div class="custom-feeds-list">${listHtml}</div>
    <form class="custom-feed-form" id="customFeedForm" autocomplete="off">
      <input class="custom-feed-input" id="customFeedName" type="text" placeholder="Feed name" required maxlength="60">
      <input class="custom-feed-input" id="customFeedUrl" type="url" placeholder="RSS feed URL" required>
      <button class="custom-feed-add-btn" type="submit">Add Feed</button>
    </form>
    <div class="custom-feed-error hidden" id="customFeedError"></div>`;

  wrap.querySelectorAll('.custom-feed-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      removeCustomFeed(btn.dataset.id);
      renderCustomFeedSettings();
      loadFeeds();
    });
  });

  $('customFeedForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const nameInput = $('customFeedName');
    const urlInput = $('customFeedUrl');
    const errorEl = $('customFeedError');
    const name = nameInput.value.trim();
    const url = urlInput.value.trim();
    errorEl.classList.add('hidden');
    errorEl.textContent = '';

    const existing = loadCustomFeeds();
    if (existing.some(f => f.url === url)) {
      errorEl.textContent = 'This feed URL is already added.';
      errorEl.classList.remove('hidden');
      return;
    }

    const id = `custom_${Date.now()}`;
    addCustomFeed({ id, name, url, category: 'custom', color: '#6366f1' });
    nameInput.value = '';
    urlInput.value = '';
    renderCustomFeedSettings();
    renderSourceSettings();
    loadFeeds();
  });
}

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

  // Search
  let searchTimer;
  $('searchInput').addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.searchQuery = e.target.value.trim();
      renderArticles();
    }, 220);
  });

  // Sort
  $('sortSelect').addEventListener('change', e => {
    state.sortBy = e.target.value;
    renderArticles();
  });

  $('showReadBtn').addEventListener('click', () => {
    state.showRead = !state.showRead;
    savePrefs({ showRead: state.showRead });
    syncShowReadButton();
    renderArticles();
  });

  // Date range filter
  $('dateRangeSelect').addEventListener('change', e => {
    state.dateRange = Number(e.target.value);
    renderArticles();
  });

  // Initial UI state
  $('viewToggle').querySelectorAll('.view-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.view === state.viewMode));
  $('dateRangeSelect').value = String(state.dateRange);
  syncShowReadButton();

  // View toggle
  $('viewToggle').addEventListener('click', e => {
    const btn = e.target.closest('[data-view]');
    if (!btn) return;
    setViewMode(btn.dataset.view);
  });

  // Category filters
  $('categoryFilters').addEventListener('click', e => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    state.activeCategory = pill.dataset.category;
    $('categoryFilters').querySelectorAll('.pill').forEach(p =>
      p.classList.toggle('active', p.dataset.category === state.activeCategory));
    renderArticles();
  });

  // Settings
  $('settingsBtn').addEventListener('click', () => {
    $('settingsOverlay').classList.toggle('hidden');
    const p = loadPrefs();
    const isOrioles = getActiveTeamId() === ORIOLES_ID;
    $('themeToggle').querySelectorAll('.theme-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.theme === (p.theme || 'light')));
    // City Connect is Orioles-only — hide the button for other teams
    const ccBtn = $('themeToggle').querySelector('.theme-btn--cc');
    if (ccBtn) ccBtn.style.display = isOrioles ? '' : 'none';
    $('defaultViewToggle').querySelectorAll('.theme-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.defview === (p.defaultView || 'list')));
    renderSourceSettings();
    renderCustomFeedSettings();
  });
  $('settingsClose').addEventListener('click', () => $('settingsOverlay').classList.add('hidden'));
  $('settingsOverlay').addEventListener('click', e => {
    if (e.target === $('settingsOverlay')) $('settingsOverlay').classList.add('hidden');
  });
  $('themeToggle').addEventListener('click', e => {
    const btn = e.target.closest('[data-theme]');
    if (!btn) return;
    const newTheme = btn.dataset.theme;
    if (newTheme === 'city-connect' && getActiveTeamId() !== ORIOLES_ID) return;
    const wasCC = document.documentElement.getAttribute('data-theme') === 'city-connect';
    applyTheme(newTheme);
    syncOriolesLogos();
    $('themeToggle').querySelectorAll('.theme-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.theme === newTheme));
    if (newTheme === 'city-connect' && !wasCC) triggerCityConnectBanner();
  });
  $('defaultViewToggle').addEventListener('click', e => {
    const btn = e.target.closest('[data-defview]');
    if (!btn) return;
    savePrefs({ defaultView: btn.dataset.defview });
    setViewMode(btn.dataset.defview, { render: false });
    $('defaultViewToggle').querySelectorAll('.theme-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.defview === btn.dataset.defview));
    renderArticles();
  });
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
    const p = loadPrefs();
    if (p.theme === 'system') applyTheme('system');
  });

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

  // Source filter popover
  $('sourceFilterBtn').addEventListener('click', () => {
    $('sourcePopover').classList.toggle('hidden');
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.source-filter-wrap')) {
      $('sourcePopover').classList.add('hidden');
    }
  });

  // Reader close
  $('readerClose').addEventListener('click', closeReader);
  $('readerOverlay').addEventListener('click', e => {
    if (e.target === $('readerOverlay')) closeReader();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeReader();
  });

  // Auto-refresh scores and transactions every 5 minutes
  setInterval(() => {
    loadScores();
    loadTransactions();
  }, 5 * 60 * 1000);

  // ── Easter Eggs ──────────────────────────────────────────────────
  $('searchInput').addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const trigger = e.target.value.trim().toLowerCase();
    if (trigger === 'magic') {
      e.preventDefault();
      triggerOriolesMagic();
    }
  });

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

  let themeClickCount = 0;
  let themeClickTimer = null;
  $('themeToggle').addEventListener('click', () => {
    themeClickCount++;
    clearTimeout(themeClickTimer);
    themeClickTimer = setTimeout(() => { themeClickCount = 0; }, 500);
    if (themeClickCount >= 3) {
      themeClickCount = 0;
      toggleOpacyTheme();
    }
  });

  // First-visit tooltip on settings button
  if (isFirstVisit()) {
    const settingsBtn = $('settingsBtn');
    if (settingsBtn) {
      settingsBtn.classList.add('btn-settings--tooltip');
      const tip = document.createElement('div');
      tip.className = 'settings-btn-tooltip';
      tip.textContent = 'Customize your feeds!';
      settingsBtn.appendChild(tip);
      const dismiss = () => {
        settingsBtn.classList.remove('btn-settings--tooltip');
        tip.remove();
        document.removeEventListener('click', handler, true);
      };
      const handler = e => { if (!settingsBtn.contains(e.target)) dismiss(); };
      document.addEventListener('click', handler, true);
      settingsBtn.addEventListener('click', dismiss, { once: true });
    }
  }
}

// ── Team pill update ──────────────────────────────────────────────
function updateTeamPill() {
  const activeTeamId = getActiveTeamId();
  const teamName = TEAM_CONFIG[activeTeamId]?.name ?? TEAM_ABBREV[activeTeamId] ?? 'Team';
  const logo = document.getElementById('teamPillLogo');
  const label = document.getElementById('teamPillLabel');
  if (logo) logo.src = `https://www.mlbstatic.com/team-logos/${activeTeamId}.svg`;
  if (label) label.textContent = teamName;
}

// ── Init ──────────────────────────────────────────────────────────
async function init() {
  initTeamPicker();
  updateTeamPill();
  setupEvents();

  // First-visit / no-team-selected state
  if (isFirstVisit()) {
    document.body.classList.add('fanbase--no-team');
    // Default the feed to the MLB tab so new users see general news right away
    state.activeCategory = 'mlb';
    document.querySelectorAll('#categoryFilters .pill').forEach(p => {
      p.classList.toggle('active', p.dataset.category === 'mlb');
    });
  }

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
