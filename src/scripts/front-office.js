// ── Front Office page ─────────────────────────────────────────────
// The selected team's front office (#38): its chain of command (owner →
// president → GM → manager, #40) and track record from its curated file
// (frontOfficeData.js), Home's four team widgets, open (sidebars.js), its
// last five drafts and front office news. Each job in the chain opens a
// popover (foLearn.js, #43) that links into the Front Office Explainer
// (/front-office/explainer/). Links to Roster, Trades, Draft and the
// league page are FrontOfficeLinks.astro.
import './theme.js';
import { requireTeam } from './teamPicker.js';
import { TEAM } from './config.js';
import { $, esc, teamLogoSrc } from './utils.js';
import { loadInjuryReport, loadTransactions, loadContracts, loadRoster } from './sidebars.js';
import { loadTeamFile, asOfLabel, chainOfCommand, loadGoogleNews } from './frontOfficeData.js';
import { learnButton } from './foLearn.js';

function renderHero(team, file) {
  const logo = $('foLogo');
  if (logo) {
    logo.src = teamLogoSrc(team.id, 56);
    logo.alt = `${team.name} logo`;
  }
  // The owner moved into the chain of command below (#40)
  const meta = [team.div, file?.ballpark].filter(Boolean).join(' · ');
  if (meta) $('foMeta').textContent = meta;
}

// What each rung of the chain does, in a sentence, and the popover topic
// (foLearn.js) that goes deeper
const RUNGS = {
  owner: {
    label: 'Ownership',
    does: 'Owns the club. Sets the budget, signs off on the biggest contracts and hires the top baseball executive.',
    learn: 'owner',
  },
  // Generic: the card shows the club's own title (President, Chief Baseball
  // Officer, President & CEO)
  president: {
    label: 'Head of Baseball Operations',
    does: 'Runs the whole baseball side. Sets the long-term plan, makes the final call on major trades and signings, and hires the GM and manager.',
    learn: 'president',
  },
  combined: {
    label: 'President & General Manager',
    does: 'Holds both jobs: sets the long-term plan and also builds the roster day to day, working the phones on trades and contracts.',
    learn: 'president',
  },
  gm: {
    label: 'General Manager',
    does: 'Builds the roster day to day: works the phones on trades, negotiates contracts and pulls together scouting, analytics and player development.',
    learn: 'gm',
  },
  topGm: {
    label: 'General Manager',
    does: 'The top baseball executive here, reporting straight to ownership. Sets the plan and builds the roster: trades, contracts, scouting, analytics and player development.',
    learn: 'gm',
  },
  manager: {
    label: 'Manager',
    does: 'Runs the team on the field: lineups, pitching changes and the clubhouse, with a staff of coaches. Works from the front office\'s plans and data.',
    learn: 'manager',
  },
};

function personCard(p) {
  return `<div class="fo-brass-card${p.vacant ? ' fo-brass-card--vacant' : ''}">
      <span class="fo-brass-title">${esc(p.title)}</span>
      <span class="fo-brass-name">${esc(p.name)}</span>
      ${p.since ? `<span class="fo-brass-since">Since ${esc(p.since)}</span>` : ''}
      ${p.note ? `<span class="fo-brass-note">${esc(p.note)}</span>` : ''}
    </div>`;
}

// One rung: the job and what it does on the left, who holds it on the right.
// `gap` is a rung with nobody in it because the club doesn't have the job.
function rung(key, person, gap) {
  const r = RUNGS[key];
  return `<li class="fo-rung${gap ? ' fo-rung--gap' : ''}">
    <div class="fo-rung-role">
      <span class="fo-rung-label">${esc(r.label)}</span>
      <p class="fo-rung-does">${esc(r.does)}</p>
      ${learnButton(r.learn, 'How this job works')}
    </div>
    <div class="fo-rung-people">${person ? personCard(person) : `<p class="fo-rung-gap">${esc(gap)}</p>`}</div>
  </li>`;
}

function renderChain(team, file) {
  const wrap = $('foBrass');
  const chain = chainOfCommand(file);
  if (!chain.owner && !chain.president && !chain.gm && !chain.manager) {
    wrap.innerHTML = `<span class="sidebar-msg">The ${esc(team.fullName)} front office hasn't been filled in yet.</span>`;
    return;
  }
  const asOf = asOfLabel(file.asOf);
  if (asOf) $('foAsOf').textContent = `as of ${asOf}`;

  const rungs = [];
  if (chain.owner) rungs.push(rung('owner', chain.owner));
  if (chain.combined) {
    rungs.push(rung('combined', chain.president));
  } else {
    if (chain.president) rungs.push(rung('president', chain.president));
    else if (chain.gm) rungs.push(rung('president', null, 'No separate head of baseball operations. The GM answers straight to ownership.'));
    if (chain.gm) rungs.push(rung(chain.president ? 'gm' : 'topGm', chain.gm));
    else if (chain.president) rungs.push(rung('gm', null, `No general manager listed. The ${chain.president.title.toLowerCase()} and staff cover the job.`));
  }
  if (chain.manager) rungs.push(rung('manager', chain.manager));
  // Anyone whose title fits none of the rungs still gets a card
  const placed = new Set([chain.president, chain.gm, chain.manager]);
  const others = (file?.brass ?? []).filter(p => !placed.has(p));
  wrap.innerHTML = `<ol class="fo-chain">${rungs.join('')}</ol>`
    + (others.length ? `<div class="fo-brass fo-brass--others">${others.map(personCard).join('')}</div>` : '');
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
  renderChain(TEAM, file);
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
