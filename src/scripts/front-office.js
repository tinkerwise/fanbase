// ── Front Office page ─────────────────────────────────────────────
// Home's Front Office sidebar group as a page: the four team widgets, open,
// plus links to Roster, Trades and Draft (FrontOfficeLinks.astro).
import './theme.js';
import { requireTeam } from './teamPicker.js';
import { loadInjuryReport, loadTransactions, loadContracts, loadRoster } from './sidebars.js';

if (requireTeam()) {
  loadInjuryReport();
  loadTransactions();
  loadContracts();
  loadRoster();
}
