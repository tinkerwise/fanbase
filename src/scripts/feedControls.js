// ── News feed controls ────────────────────────────────────────────
// Wires the NewsFeed.astro toolbar (search, category pills, source filter,
// sort, date range, show read, view toggle) and the reader overlay. Shared
// by Home (app.js) and the News page (news.js). Settings changes made on
// any page reach the feed through the events settings.js dispatches.
import { savePrefs } from './storage.js';
import { state } from './state.js';
import { $ } from './utils.js';
import {
  loadFeeds,
  renderArticles,
  renderSourceFilters,
  setViewMode,
  syncShowReadButton,
  closeReader,
} from './feeds.js';
import { triggerOriolesMagic } from './easter-eggs.js';

export function setupFeedControls() {
  // Search (Home has it in the left sidebar, News above the feed)
  let searchTimer;
  $('searchInput')?.addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.searchQuery = e.target.value.trim();
      renderArticles();
    }, 220);
  });
  $('searchInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.value.trim().toLowerCase() === 'magic') {
      e.preventDefault();
      triggerOriolesMagic();
    }
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

  // Settings (settings.js) changed the sources or the default view
  window.addEventListener('fanbase:sources-changed', () => {
    renderSourceFilters();
    loadFeeds();
  });
  window.addEventListener('fanbase:default-view', e => setViewMode(e.detail));
}
