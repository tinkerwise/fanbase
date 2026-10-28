// ── The Dugout (news page, /news/) ─────────────────────────────────
// The news feed on its own: Home's middle column without the sidebars.
import './theme.js';
import { requireTeam } from './teamPicker.js';
import { loadFeeds } from './feeds.js';
import { setupFeedControls } from './feedControls.js';

function init() {
  setupFeedControls();
  if (!requireTeam()) return;
  loadFeeds();
  // More in the tab bar has a Refresh for pages that have one
  document.querySelectorAll('[data-refresh]').forEach(btn => {
    btn.hidden = false;
    btn.addEventListener('click', () => loadFeeds());
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
