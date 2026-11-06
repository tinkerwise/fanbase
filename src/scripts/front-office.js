// ── Front Office page ─────────────────────────────────────────────
// The selected team's front office (#38): the brass and track record from
// its curated file (frontOfficeData.js), Home's four team widgets, open
// (sidebars.js), its last five drafts and front office news. Links to
// Roster, Trades, Draft and the league page are FrontOfficeLinks.astro.
import './theme.js';
import { requireTeam } from './teamPicker.js';
import { TEAM } from './config.js';
import { $, esc, teamLogoSrc } from './utils.js';
import { loadInjuryReport, loadTransactions, loadContracts, loadRoster } from './sidebars.js';
import { loadTeamFile, asOfLabel, loadGoogleNews } from './frontOfficeData.js';

function renderHero(team, file) {
  const logo = $('foLogo');
  if (logo) {
    logo.src = teamLogoSrc(team.id, 56);
    logo.alt = `${team.name} logo`;
  }
  const meta = [team.div, file?.ballpark, file?.owner && `Owner: ${file.owner}${file.ownerSince ? ` (since ${file.ownerSince})` : ''}`]
    .filter(Boolean).map(esc).join(' · ');
  if (meta) $('foMeta').innerHTML = meta + (file?.ownerNote ? `<br>${esc(file.ownerNote)}` : '');
}

function renderBrass(team, file) {
  const wrap = $('foBrass');
  const brass = file?.brass ?? [];
  if (!brass.length) {
    wrap.innerHTML = `<span class="sidebar-msg">The ${esc(team.fullName)} front office hasn't been filled in yet.</span>`;
    return;
  }
  const asOf = asOfLabel(file.asOf);
  if (asOf) $('foAsOf').textContent = `as of ${asOf}`;
  wrap.innerHTML = `<div class="fo-brass">${brass.map(p => `
    <div class="fo-brass-card${p.vacant ? ' fo-brass-card--vacant' : ''}">
      <span class="fo-brass-title">${esc(p.title)}</span>
      <span class="fo-brass-name">${esc(p.name)}</span>
      ${p.since ? `<span class="fo-brass-since">Since ${esc(p.since)}</span>` : ''}
      ${p.note ? `<span class="fo-brass-note">${esc(p.note)}</span>` : ''}
    </div>`).join('')}</div>`;
}

function renderRecord(file) {
  const wrap = $('foRecord');
  const rows = file?.eraRecord ?? [];
  if (!rows.length) {
    wrap.innerHTML = '<span class="sidebar-msg">Season records aren\'t available yet.</span>';
    return;
  }
  $('foRecordNote').textContent = `last ${rows.length} seasons`;
  const body = [...rows].reverse().map(r => {
    const winning = r.w > r.l;
    return `<tr>
      <th scope="row">${esc(r.year)}</th>
      <td class="fo-num${winning ? ' fo-win' : ''}">${esc(r.w)}</td>
      <td class="fo-num">${esc(r.l)}</td>
      <td class="fo-num">${esc(r.pct)}</td>
      <td>${esc(r.finish)}</td>
      <td class="fo-record-note">${esc(r.note)}</td>
    </tr>`;
  }).join('');
  wrap.innerHTML = `<div class="fo-table-wrap"><table class="fo-record">
    <thead><tr><th scope="col">Year</th><th scope="col" class="fo-num">W</th><th scope="col" class="fo-num">L</th><th scope="col" class="fo-num">Pct</th><th scope="col">Finish</th><th scope="col">Postseason</th></tr></thead>
    <tbody>${body}</tbody>
  </table></div>`;
}

function renderDrafts(file) {
  const wrap = $('foDrafts');
  const classes = (file?.recentDraftClasses ?? []).filter(c => c.picks?.length);
  if (!classes.length) {
    wrap.innerHTML = '<span class="sidebar-msg">Draft history isn\'t available yet.</span>';
    return;
  }
  wrap.innerHTML = `<div class="fo-drafts">${[...classes].reverse().map(c => `
    <div class="fo-draft-class">
      <span class="fo-draft-year">${esc(c.year)}</span>
      ${c.picks.map(p => `<div class="fo-draft-pick">
        <span class="fo-draft-slot">Rd ${esc(p.round)} · #${esc(p.overall)}</span>
        <span class="fo-draft-name">${esc(p.name)} <span class="fo-draft-pos">${esc(p.pos)}</span></span>
        <span class="fo-draft-status">${esc(p.status)}</span>
      </div>`).join('')}
    </div>`).join('')}</div>`;
}

async function loadCurated() {
  const file = await loadTeamFile(TEAM.id);
  renderHero(TEAM, file);
  renderBrass(TEAM, file);
  renderRecord(file);
  renderDrafts(file);
}

if (requireTeam()) {
  Promise.allSettled([
    loadCurated(),
    loadInjuryReport(),
    loadTransactions({ days: 60, limit: 20, badges: true }),
    loadContracts(),
    loadRoster(),
    // TEAM is the ?view= team when there is one, else yours (config.js)
    loadGoogleNews($('foNews'), `"${TEAM.fullName}" general manager OR "front office" OR "baseball operations"`),
  ]).then(() => {
    // A link to a section (#fo-drafts) jumped before the sections above it
    // filled in and pushed it down; jump again now they're in place
    if (location.hash.startsWith('#fo-')) document.querySelector(location.hash)?.scrollIntoView({ behavior: 'instant' });
  });
}
