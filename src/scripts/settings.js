// ── Settings ──────────────────────────────────────────────────────
// The SettingsPanel.astro overlay, on every page (Layout.astro). Any
// [data-open-settings] button opens it: the header gear, More in the tab
// bar, or the feed's "no sources" message. Theme applies at once; source
// and default-view changes are saved and announced as events
// (fanbase:sources-changed, fanbase:default-view) for pages with a feed.
import { loadPrefs, savePrefs, getDisabledSources, saveDisabledSources } from './storage.js';
import { applyTheme } from './theme.js';
import { $, esc, syncOriolesLogos } from './utils.js';
import { getActiveTeamId, ORIOLES_ID } from './config.js';
import { TEAM_CONFIG } from './teamConfig.js';
import { loadFeedSources } from './feedSources.js';
import { toggleOpacyTheme, triggerCityConnectBanner } from './easter-eggs.js';

let sourcesLoad = null;

async function renderSourceSettings() {
  const container = $('settingsSourcesList');
  if (!container) return;
  sourcesLoad ??= loadFeedSources().catch(() => []);
  const sources = await sourcesLoad;
  const disabled = getDisabledSources();

  if (!sources.length) {
    container.innerHTML = '<span class="settings-sources-empty">Sources are unavailable right now.</span>';
    return;
  }

  const teamName = TEAM_CONFIG[getActiveTeamId()]?.name ?? 'Team';
  const groups = [
    { key: 'orioles', label: teamName },
    { key: 'mlb',     label: 'MLB'    },
    { key: 'milb',    label: 'MiLB'   },
  ];

  const enabledCount = sources.filter(s => !disabled.has(s.id)).length;
  let html = enabledCount === 0
    ? '<div class="source-setting-warning">No sources selected — no articles will load.</div>'
    : '';
  for (const { key, label } of groups) {
    const srcs = sources.filter(s => s.category === key);
    if (!srcs.length) continue;
    html += `<div class="source-setting-group">
      <div class="source-setting-group-label">${esc(label)}</div>
      ${srcs.map(s => `
        <label class="source-setting-row">
          <input type="checkbox" class="source-setting-cb" data-source-id="${esc(s.id)}"${disabled.has(s.id) ? '' : ' checked'}>
          <span class="source-toggle-track"></span>
          <span class="source-setting-name">${esc(s.name)}</span>
        </label>`).join('')}
    </div>`;
  }
  html += '<button class="source-setting-reset" id="sourceResetBtn" type="button">Reset to defaults</button>';
  container.innerHTML = html;

  container.querySelectorAll('.source-setting-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      const newDisabled = new Set(
        [...container.querySelectorAll('.source-setting-cb')]
          .filter(c => !c.checked)
          .map(c => c.dataset.sourceId)
      );
      let warn = container.querySelector('.source-setting-warning');
      if (sources.length - newDisabled.size === 0) {
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
      window.dispatchEvent(new Event('fanbase:sources-changed'));
    });
  });

  $('sourceResetBtn')?.addEventListener('click', () => {
    saveDisabledSources(new Set());
    renderSourceSettings();
    window.dispatchEvent(new Event('fanbase:sources-changed'));
  });
}

export function openSettings() {
  const p = loadPrefs();
  $('themeToggle').querySelectorAll('.theme-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.theme === (p.theme || 'light')));
  // City Connect is Orioles-only — hide the button for other teams
  const ccBtn = $('themeToggle').querySelector('.theme-btn--cc');
  if (ccBtn) ccBtn.style.display = getActiveTeamId() === ORIOLES_ID ? '' : 'none';
  $('defaultViewToggle').querySelectorAll('.theme-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.defview === (p.defaultView || 'list')));
  $('settingsOverlay').classList.remove('hidden');
  renderSourceSettings();
}

export function closeSettings() {
  $('settingsOverlay')?.classList.add('hidden');
}

function init() {
  if (!$('settingsOverlay')) return;

  document.addEventListener('click', e => {
    if (e.target.closest('[data-open-settings]')) { e.preventDefault(); openSettings(); }
  });
  $('settingsClose').addEventListener('click', closeSettings);
  $('settingsOverlay').addEventListener('click', e => {
    if (e.target === $('settingsOverlay')) closeSettings();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('settingsOverlay').classList.contains('hidden')) closeSettings();
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
    $('defaultViewToggle').querySelectorAll('.theme-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.defview === btn.dataset.defview));
    window.dispatchEvent(new CustomEvent('fanbase:default-view', { detail: btn.dataset.defview }));
  });
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
    if (loadPrefs().theme === 'system') applyTheme('system');
  });

  // Easter egg: three quick clicks on the theme buttons
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
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
