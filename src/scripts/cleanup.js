// ── Cleanup page (#22) ────────────────────────────────────────────
// Offseason free agency and trades for the active team. Live from the MLB
// Stats API: /people/freeAgents (who's a free agent, where they signed and
// the contract type), /transactions (trades, waiver claims, Rule 5, and
// signings that /people tells apart as international by age and birth
// country), and the depth chart (team needs). Hand-curated in
// public/cleanup.json: the free-agent ranking, contract dollars once
// reported, optional team-need notes, and key dates, all sourced. Hardball
// (#20) supplies the labor status: a lockout freezes major-league moves.
//
// ?asOf=YYYY-MM-DD previews another day (last offseason, say) so the page
// can be reviewed before this offseason has data.
import './theme.js';
import { MLB, TEAM_ID, TEAM } from './config.js';
import { TEAM_CONFIG } from './teamConfig.js';
import { requireTeam } from './teamPicker.js';
import { esc, safeUrl, cleanFeedText, extractThumbnail, renderNewsThumbCard, teamLogoSrc } from './utils.js';
import { loadFeedSources, fetchFeedItems } from './feedSources.js';
import { loadHardball, offseasonWindow, localDate } from './season.js';

const $ = id => document.getElementById(id);
const asOfParam = new URLSearchParams(location.search).get('asOf');
const AS_OF = /^\d{4}-\d{2}-\d{2}$/.test(asOfParam ?? '') ? asOfParam : null;
const NOW = AS_OF ? new Date(`${AS_OF}T12:00:00`) : new Date();
const TODAY = localDate(NOW);
const PAGE_SIZE = 25;
// Players born here go through the draft, not the international market
const DRAFT_COUNTRIES = new Set(['USA', 'Canada', 'Puerto Rico']);
const HOT_STOVE_RE = /\b(sign(s|ed|ing)?|re-sign|trade[sd]?|trading|deal|agree[sd]?|interest(ed)?|pursu\w*|target\w*|linked|rumou?rs?|free agen\w*|acquir\w*|offer\w*|non-tender\w*|extension|claim\w*|DFA|designated)\b/i;
const BLOCK_RE = /\b(trade[sd]?|trading|shop\w*|on the block|available|deal|swap|move)\b/i;

const norm = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[.'’]/g, '').replace(/\s+/g, ' ').trim();
const teamName = id => TEAM_CONFIG[id]?.name ?? '';
const words = n => ({ one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 }[n] ?? Number(n));

function fmtDate(iso, opts = {}) {
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...opts });
}

function getJson(url) {
  return fetch(url).then(r => (r.ok ? r.json() : Promise.reject(new Error(`${r.status} ${url}`))));
}

function logo(id) {
  return TEAM_CONFIG[id] ? `<img class="cu-logo" src="${esc(teamLogoSrc(id, 20))}" alt="" width="20" height="20" loading="lazy">` : '';
}

// The free-agents API's `notes`: contract type, or how the player moved
function classify(notes) {
  const raw = String(notes ?? '').trim().replace(/\.$/, '');
  const n = raw.toLowerCase();
  if (!n) return { kind: 'none', label: '' };
  if (n.includes('minor league free agent')) return { kind: 'minor-fa', label: 'Minor-league free agent' };
  if (n.includes('minor league')) return { kind: 'minor', label: n.includes('invitation') ? 'Minor-league deal, spring training invite' : 'Minor-league deal' };
  if (n.includes('waivers')) return { kind: 'waiver', label: 'Claimed off waivers' };
  if (n.includes('rule 5')) return { kind: 'rule5', label: 'Rule 5 Draft selection' };
  if (n.startsWith('traded') || / trade /.test(n)) return { kind: 'trade', label: raw };
  const yrs = n.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+)[- ]year/);
  if (yrs) { const y = words(yrs[1]); return { kind: 'major', label: `${y}-year contract`, years: y }; }
  if (n.includes('qualifying offer accepted')) return { kind: 'major', label: 'Accepted qualifying offer', years: 1 };
  if (n.includes('club option exercised')) return { kind: 'major', label: 'Club option exercised' };
  if (n.includes('non-tendered')) return { kind: 'status', label: 'Non-tendered' };
  if (n.includes('option declined')) return { kind: 'status', label: 'Club option declined' };
  if (n.includes('retired')) return { kind: 'status', label: 'Retired' };
  return { kind: 'other', label: raw };
}

// Position groups for the free-agent filter ('3B/OF' is in both)
function posGroups(pos) {
  const parts = String(pos ?? '').toUpperCase().split('/');
  const groups = new Set();
  for (const p of parts) {
    if (/^(RHP|LHP|SP|RP|P)$/.test(p)) groups.add('P');
    else if (p === 'C') groups.add('C');
    else if (/^(1B|2B|3B|SS|IF)$/.test(p)) groups.add('IF');
    else if (/^(LF|CF|RF|OF)$/.test(p)) groups.add('OF');
  }
  return groups;
}

const mlbtrSearch = name => `https://www.mlbtraderumors.com/?s=${encodeURIComponent(name)}`;

// ── Labor ─────────────────────────────────────────────────────────
function renderLabor(hardball, win) {
  const el = $('cuLabor');
  const code = hardball?.status?.code;
  const expiry = hardball?.timeline?.find(t => /CBA expires/i.test(t.title))?.date ?? '';
  const link = `<a href="${import.meta.env.BASE_URL}hardball/">Follow it on Hardball</a>`;
  let html = '';
  if (code === 'lockout') {
    html = `<strong>Lockout: free agency is frozen.</strong> Major-league signings and trades are on hold until there's a new CBA; minor-league deals can still happen. ${link}.`;
    el.dataset.tone = 'stop';
  } else if (code === 'expired') {
    html = `<strong>The CBA has expired.</strong> Teams can keep signing and trading for now, but a lockout would freeze it all. ${link}.`;
    el.dataset.tone = 'warn';
  } else if (code === 'talks' && expiry && TODAY >= win.start && TODAY <= expiry) {
    html = `<strong>Labor deadline:</strong> the CBA expires ${esc(fmtDate(expiry, { month: 'long' }))}. A lockout would freeze major-league signings and trades. ${link}.`;
    el.dataset.tone = 'info';
  }
  el.innerHTML = html;
  el.hidden = !html;
}

// ── Key free agents ───────────────────────────────────────────────
let faFilter = 'all';

function faStatus(player, fa, win) {
  if (player.signed?.team) {
    const s = player.signed;
    return { tone: 'signed', text: `Signed: ${teamName(s.team)}`, terms: s.terms, source: s.source, team: s.team };
  }
  const to = fa?.newTeam?.id;
  if (to && fa.dateSigned && fa.dateSigned <= TODAY) {
    const c = classify(fa.notes);
    const back = player.teams.includes(to);
    return { tone: 'signed', text: `${back ? 'Re-signed' : 'Signed'}: ${teamName(to)}`, terms: c.label, team: to };
  }
  // Players posted from Japan aren't on MLB's free-agent list: once the
  // offseason starts, everyone unsigned is available
  if (fa || TODAY >= win.start) return { tone: 'open', text: 'Available' };
  return { tone: 'pending', text: 'Becomes a free agent after the World Series' };
}

function renderFaList(players) {
  const visible = players.filter(p => faFilter === 'all'
    || (faFilter === 'mine' ? p.mine : p.groups.has(faFilter)));
  $('cuFaList').innerHTML = visible.length ? visible.map(p => `
    <li class="cu-fa${p.mine ? ' cu-fa--mine' : ''}">
      <span class="cu-fa-rank">${p.rank}</span>
      <span class="cu-fa-main">
        <span class="cu-fa-name">${esc(p.name)}</span>
        <span class="cu-fa-meta">${esc([p.pos, p.age ? `age ${p.age}` : '', p.from].filter(Boolean).join(' · '))}</span>
      </span>
      <span class="cu-status cu-status--${p.status.tone}">
        ${p.status.team ? logo(p.status.team) : ''}<span>${esc(p.status.text)}${p.status.terms ? `<span class="cu-status-terms">${esc(p.status.terms)}</span>` : ''}</span>
      </span>
    </li>`).join('') : '<li class="sidebar-msg">No ranked free agents match.</li>';
}

function renderFreeAgents(cleanup, faByName, faList, win) {
  const players = (cleanup.rankings?.players ?? []).map(p => {
    const fa = faByName.get(norm(p.name));
    const teams = p.teams?.length ? p.teams : (fa?.originalTeam?.id ? [fa.originalTeam.id] : []);
    const from = p.from || teams.map(teamName).join(' and ');
    return { ...p, teams, from, mine: teams.includes(TEAM_ID), groups: posGroups(p.pos), status: faStatus({ ...p, teams }, fa, win) };
  });
  renderFaList(players);
  $('cuFaFilters').addEventListener('click', e => {
    const btn = e.target.closest('[data-fa-filter]');
    if (!btn) return;
    faFilter = btn.dataset.faFilter;
    $('cuFaFilters').querySelectorAll('.pill').forEach(b => b.classList.toggle('active', b === btn));
    renderFaList(players);
  });

  // The team's own free agents: everyone who filed from this club except
  // minor-league free agents, plus ranked players who were here in 2026
  const own = faList.filter(f => f.originalTeam?.id === TEAM_ID && classify(f.notes).kind !== 'minor-fa');
  const ownNames = new Set(own.map(f => norm(f.player?.fullName)));
  const rankedMine = players.filter(p => p.mine && !ownNames.has(norm(p.name)));
  const ownEl = $('cuOwnFa');
  if (!own.length && !rankedMine.length) {
    ownEl.innerHTML = TODAY < win.start
      ? `<p class="cu-note">The ${esc(TEAM.name)}' free agents file the day after the World Series; they'll be listed here.</p>`
      : '';
    return;
  }
  const chips = [
    ...own.map(f => {
      const to = f.newTeam?.id;
      const c = classify(f.notes);
      const state = to === TEAM_ID ? `re-signed · ${c.label}` : to ? `signed with ${teamName(to)}` : 'available';
      return `<li><strong>${esc(f.player?.fullName)}</strong> <span class="cu-dim">${esc(f.position?.abbreviation ?? '')}</span> · ${esc(state)}</li>`;
    }),
    ...rankedMine.map(p => `<li><strong>${esc(p.name)}</strong> <span class="cu-dim">${esc(p.pos)} · No. ${p.rank}</span> · ${esc(p.status.text)}</li>`),
  ];
  const OWN_MAX = 12;
  ownEl.innerHTML = `<h3 class="cu-sub">${esc(TEAM.name)} free agents</h3><ul class="cu-own-list">${chips.slice(0, OWN_MAX).join('')}</ul>`
    + (chips.length > OWN_MAX ? `<p class="cu-note">And ${chips.length - OWN_MAX} more; see Signings for where they went.</p>` : '');
}

// ── Team needs ────────────────────────────────────────────────────
const FIELD = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];

function renderNeeds(cleanup, depth, faList) {
  const items = [];
  const curated = cleanup.teamNeeds?.[String(TEAM_ID)];
  if (curated?.note) {
    const src = curated.source && safeUrl(curated.source.url)
      ? ` <a href="${esc(safeUrl(curated.source.url))}" target="_blank" rel="noopener">${esc(curated.source.label)}</a>` : '';
    items.push(`<li class="cu-need cu-need--note"><span class="cu-tag">Reported</span> ${esc(curated.note)}${curated.date ? ` <span class="cu-dim">(${esc(fmtDate(curated.date, { year: 'numeric' }))})</span>` : ''}${src}</li>`);
  }

  // Departures: the team's major-league free agents who haven't re-signed
  const gone = faList.filter(f => f.originalTeam?.id === TEAM_ID && f.newTeam?.id !== TEAM_ID
    && !['minor-fa', 'minor', 'status'].includes(classify(f.notes).kind) && !/minor league/i.test(f.notes ?? ''));
  const how = { trade: 'was traded to', waiver: 'was claimed by', rule5: 'was taken in the Rule 5 Draft by' };
  for (const f of gone) {
    const to = f.newTeam?.id;
    const verb = how[classify(f.notes).kind] ?? 'signed with';
    items.push(`<li class="cu-need"><span class="cu-tag">${esc(f.position?.abbreviation ?? '—')}</span> Replace ${esc(f.player?.fullName)}${to ? `, who ${verb} the ${esc(teamName(to))}` : ' (free agent)'}</li>`);
  }

  if (depth) {
    const byPos = {};
    for (const p of depth) (byPos[p.position?.abbreviation ?? '?'] ??= []).push(p);
    const healthy = list => (list ?? []).filter(p => !/^D\d+/.test(p.status?.code ?? ''));
    for (const pos of FIELD) {
      if (!healthy(byPos[pos] ?? (['LF', 'CF', 'RF'].includes(pos) ? byPos.OF : null)).length) {
        items.push(`<li class="cu-need"><span class="cu-tag">${pos}</span> No healthy ${pos} on the depth chart</li>`);
      }
    }
    const sp = healthy(byPos.SP).length;
    if (sp < 5) items.push(`<li class="cu-need"><span class="cu-tag">SP</span> Rotation: ${sp} healthy starter${sp === 1 ? '' : 's'} on the depth chart</li>`);
    const rp = healthy([...(byPos.RP ?? []), ...(byPos.P ?? [])]).length;
    if (rp < 7) items.push(`<li class="cu-need"><span class="cu-tag">RP</span> Bullpen: ${rp} healthy reliever${rp === 1 ? '' : 's'} on the depth chart</li>`);
    const longIl = depth.filter(p => p.status?.code === 'D60');
    if (longIl.length) {
      items.push(`<li class="cu-need cu-need--soft"><span class="cu-tag">IL</span> On the 60-day IL: ${esc([...new Set(longIl.map(p => p.person?.fullName))].join(', '))}</li>`);
    }
  }

  $('cuNeeds').innerHTML = items.length
    ? `<ul class="cu-needs-list">${items.join('')}</ul><p class="cu-note">From the ${esc(TEAM.name)}' depth chart and free agents${curated ? ', plus reporting' : ''}.</p>`
    : `<p class="cu-note">No obvious holes on the depth chart right now.</p>`;
}

// ── Signings ──────────────────────────────────────────────────────
let signScope = 'mine';
let signShown = PAGE_SIZE;

function renderSignings(all, win, ranked) {
  const list = signScope === 'mine'
    ? all.filter(s => s.to === TEAM_ID || s.from === TEAM_ID)
    : all.filter(s => s.kind === 'major');
  const el = $('cuSignings');
  if (TODAY < win.start) {
    el.innerHTML = '<li class="sidebar-msg">Signings start when free agency opens, five days after the World Series.</li>';
    return;
  }
  if (!list.length) {
    el.innerHTML = `<li class="sidebar-msg">${signScope === 'mine' ? `No ${esc(TEAM.name)} signings yet.` : 'No major-league signings yet.'}</li>`;
    return;
  }
  el.innerHTML = list.slice(0, signShown).map(s => {
    const lost = signScope === 'mine' && s.to !== TEAM_ID;
    const r = ranked.get(norm(s.name));
    const terms = r?.signed?.terms ? `${r.signed.terms} · ${s.label}` : s.label;
    return `<li class="cu-item${lost ? ' cu-item--lost' : ''}">
      <time class="cu-item-date" datetime="${esc(s.date)}">${esc(fmtDate(s.date))}</time>
      ${logo(s.to)}
      <span class="cu-item-body">
        <span class="cu-item-title">${lost ? `<span class="cu-tag cu-tag--lost">Lost</span> ` : ''}${esc(s.name)} <span class="cu-dim">${esc(s.pos)}</span>${r ? ` <span class="cu-tag">No. ${r.rank}</span>` : ''}</span>
        <span class="cu-item-meta">${esc(teamName(s.to) || 'Unknown team')}${s.from && s.from !== s.to ? ` · from ${esc(teamName(s.from))}` : ''} · ${esc(terms || 'Terms not reported')} · <a href="${esc(mlbtrSearch(s.name))}" target="_blank" rel="noopener">Details</a></span>
      </span>
    </li>`;
  }).join('') + (list.length > signShown
    ? `<li><button class="pill cu-more" type="button" data-more="sign">Show more (${list.length - signShown})</button></li>` : '');
}

// ── Trades and acquisitions ───────────────────────────────────────
let tradeScope = 'mine';
let tradeShown = PAGE_SIZE;
const KIND_LABEL = { trade: 'Trade', waiver: 'Waivers', rule5: 'Rule 5', intl: 'International' };

function renderTrades(moves, win) {
  const list = tradeScope === 'mine' ? moves.filter(m => m.mine) : moves.filter(m => m.kind === 'trade' && m.league);
  const el = $('cuTrades');
  if (TODAY < win.start) {
    el.innerHTML = '<li class="sidebar-msg">Offseason trades and claims show up here after the World Series.</li>';
    return;
  }
  if (!list.length) {
    el.innerHTML = `<li class="sidebar-msg">${tradeScope === 'mine' ? `No ${esc(TEAM.name)} trades or acquisitions yet.` : 'No trades yet.'}</li>`;
    return;
  }
  el.innerHTML = list.slice(0, tradeShown).map(m => `
    <li class="cu-item">
      <time class="cu-item-date" datetime="${esc(m.date)}">${esc(fmtDate(m.date))}</time>
      <span class="cu-tag cu-tag--${m.kind}">${KIND_LABEL[m.kind]}</span>
      <span class="cu-item-body"><span class="cu-item-text">${esc(m.text)}</span></span>
    </li>`).join('') + (list.length > tradeShown
    ? `<li><button class="pill cu-more" type="button" data-more="trade">Show more (${list.length - tradeShown})</button></li>` : '');
}

async function buildMoves(transactions) {
  const seen = new Set();
  const moves = [];
  const intlCandidates = [];
  for (const t of transactions) {
    const to = t.toTeam?.id;
    const from = t.fromTeam?.id;
    const desc = t.description ?? '';
    if (t.typeCode === 'TR') {
      const key = `${t.date}|${desc}`;
      if (seen.has(key)) continue; // each trade is listed once per team
      seen.add(key);
      const teams = [...transactions.filter(x => x.typeCode === 'TR' && x.date === t.date && x.description === desc)
        .flatMap(x => [x.toTeam?.id, x.fromTeam?.id])];
      moves.push({ kind: 'trade', date: t.date, text: desc, mine: teams.includes(TEAM_ID), league: TEAM_CONFIG[to] && TEAM_CONFIG[from] });
    } else if (t.typeCode === 'CLW' && to === TEAM_ID) {
      moves.push({ kind: 'waiver', date: t.date, text: desc, mine: true });
    } else if ((t.typeCode === 'R5' || t.typeCode === 'R5M') && (to === TEAM_ID || from === TEAM_ID)) {
      moves.push({ kind: 'rule5', date: t.date, text: desc, mine: true });
    } else if (t.typeCode === 'SFA' && to === TEAM_ID && /minor league/i.test(desc) && t.person?.id) {
      intlCandidates.push(t);
    }
  }
  // International amateurs: young minor-league signees born outside the
  // draft countries (one /people call for the team's signings)
  if (intlCandidates.length) {
    try {
      const ids = [...new Set(intlCandidates.map(t => t.person.id))].slice(0, 300);
      const people = await getJson(`${MLB}/people?personIds=${ids.join(',')}&fields=people,id,currentAge,birthCountry`);
      const info = new Map((people.people ?? []).map(p => [p.id, p]));
      for (const t of intlCandidates) {
        const p = info.get(t.person.id);
        if (p && p.currentAge <= 19 && p.birthCountry && !DRAFT_COUNTRIES.has(p.birthCountry)) {
          moves.push({ kind: 'intl', date: t.date, text: `${t.description} (${p.birthCountry}, age ${p.currentAge})`, mine: true });
        }
      }
    } catch { /* leave international signings out */ }
  }
  return moves.sort((a, b) => b.date.localeCompare(a.date));
}

// ── Rumors and On the Block ───────────────────────────────────────
async function renderRumors(roster) {
  try {
    const sources = await loadFeedSources();
    const results = await Promise.allSettled(sources.map(async s => ({ source: s, data: await fetchFeedItems(s) })));
    const teamRe = new RegExp(`\\b(${[TEAM.name, TEAM.city, TEAM.fullName].filter(Boolean).map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'i');
    const seen = new Set();
    const stories = [];
    for (const r of results) {
      if (r.status !== 'fulfilled') continue;
      const teamSource = r.value.source.teamFeed || r.value.source.teamId === TEAM_ID;
      for (const item of r.value.data.items ?? []) {
        const title = cleanFeedText(item.title ?? '');
        const text = `${title} ${cleanFeedText(item.description ?? '')}`;
        const link = safeUrl(item.link);
        if (!link || seen.has(link) || !HOT_STOVE_RE.test(title) || !(teamSource || teamRe.test(text))) continue;
        seen.add(link);
        stories.push({ title, text, link, pubDate: item.pubDate, sourceName: r.value.source.name, thumbnail: extractThumbnail(item) });
      }
    }
    stories.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    $('cuRumors').innerHTML = stories.length
      ? stories.slice(0, 10).map(renderNewsThumbCard).join('')
      : '<span class="sidebar-msg">No hot stove headlines about the team right now.</span>';

    // On the Block: 40-man players named in trade headlines
    const block = new Map();
    for (const p of roster) {
      const name = p.person?.fullName;
      if (!name) continue;
      const hit = stories.find(s => BLOCK_RE.test(s.title) && s.text.includes(name));
      if (hit) block.set(name, { pos: p.position?.abbreviation ?? '', link: hit.link, title: hit.title });
    }
    $('cuOnBlock').innerHTML = block.size ? `
      <h3 class="cu-sub">On the Block</h3>
      <ul class="cu-block-list">${[...block].map(([name, b]) => `
        <li><a href="${esc(b.link)}" target="_blank" rel="noopener" title="${esc(b.title)}"><strong>${esc(name)}</strong> <span class="cu-dim">${esc(b.pos)}</span></a></li>`).join('')}
      </ul>
      <p class="cu-note">${esc(TEAM.name)} players named in trade headlines. A mention isn't a confirmation.</p>` : '';
  } catch {
    $('cuRumors').innerHTML = '<span class="sidebar-msg">Rumors are unavailable right now.</span>';
  }
}

// ── Key dates ─────────────────────────────────────────────────────
function renderDates(cleanup, hardball) {
  const freeze = ['lockout', 'expired'].includes(hardball?.status?.code);
  const dates = [...(cleanup.keyDates ?? [])].sort((a, b) => (a.date ?? a.sort).localeCompare(b.date ?? b.sort));
  $('cuDates').innerHTML = dates.map(d => {
    const when = d.dateText ?? (d.dateEnd ? `${fmtDate(d.date)}–${fmtDate(d.dateEnd)}` : fmtDate(d.date));
    const last = d.dateEnd ?? d.date ?? d.sort;
    const past = last < TODAY;
    const title = d.hardball ? `<a href="${import.meta.env.BASE_URL}hardball/">${esc(d.title)}</a>` : esc(d.title);
    return `<li class="cu-date${past ? ' cu-date--past' : ''}">
      <span class="cu-date-when">${esc(when)}</span>
      <span class="cu-date-body">
        <span class="cu-date-title">${title}${d.laborRisk && !past ? ` <span class="cu-tag cu-tag--risk">${freeze ? 'On hold' : 'Lockout risk'}</span>` : ''}</span>
        ${d.detail ? `<span class="cu-date-detail">${esc(d.detail)}</span>` : ''}
      </span>
    </li>`;
  }).join('');
}

// ── Init ──────────────────────────────────────────────────────────
async function init() {
  if (!requireTeam()) return;
  const win = await offseasonWindow(NOW);
  const started = TODAY >= win.start;
  const fields = 'transactions,id,date,typeCode,description,person,id,fullName,toTeam,fromTeam';

  const [cleanupR, hardballR, faR, txR, depthR, rosterR] = await Promise.allSettled([
    getJson(`${import.meta.env.BASE_URL}cleanup.json`),
    loadHardball(),
    getJson(`${MLB}/people/freeAgents?season=${win.season}`),
    started ? getJson(`${MLB}/transactions?startDate=${win.start}&endDate=${TODAY}&sportId=1&fields=${fields}`) : Promise.resolve({ transactions: [] }),
    getJson(`${MLB}/teams/${TEAM_ID}/roster?rosterType=depthChart`),
    getJson(`${MLB}/teams/${TEAM_ID}/roster?rosterType=40Man`),
  ]);
  const cleanup = cleanupR.value ?? {};
  const hardball = hardballR.value ?? null;
  const faList = faR.value?.freeAgents ?? [];
  const transactions = txR.value?.transactions ?? [];

  // A preview shows the offseason it falls in, not the curated one
  const seasonLabel = AS_OF || !cleanup.season ? `${win.season}-${String(win.season + 1).slice(2)}` : cleanup.season;
  $('cuSeason').textContent = `${seasonLabel} offseason${AS_OF ? ` · previewing ${fmtDate(AS_OF, { year: 'numeric' })}` : ''}`;
  renderLabor(hardball, win);
  renderDates(cleanup, hardball);

  const faByName = new Map(faList.map(f => [norm(f.player?.fullName), f]));
  if (cleanupR.status === 'fulfilled') renderFreeAgents(cleanup, faByName, faList, win);
  else $('cuFaList').innerHTML = '<li class="sidebar-msg">The free-agent list is unavailable right now.</li>';
  const src = cleanup.rankings?.source;
  $('cuFaSource').innerHTML = src && safeUrl(src.url)
    ? `Ranking: <a href="${esc(safeUrl(src.url))}" target="_blank" rel="noopener">${esc(src.label)}</a>, ${esc(fmtDate(src.date, { year: 'numeric' }))}. Status from MLB's free-agent list.` : '';

  renderNeeds(cleanup, depthR.value?.roster ?? null, faList);

  // Signings: who signed where this offseason, with the contract type
  const ranked = new Map((cleanup.rankings?.players ?? []).map(p => [norm(p.name), p]));
  const signings = faList
    .filter(f => f.newTeam?.id && f.dateSigned && f.dateSigned >= win.start && f.dateSigned <= TODAY)
    .map(f => {
      const c = classify(f.notes);
      return { name: f.player?.fullName ?? '', pos: f.position?.abbreviation ?? '', to: f.newTeam.id, from: f.originalTeam?.id, date: f.dateSigned, kind: c.kind, label: c.label };
    })
    .filter(s => s.kind === 'major' || s.kind === 'minor')
    .sort((a, b) => b.date.localeCompare(a.date));
  renderSignings(signings, win, ranked);

  const moves = await buildMoves(transactions);
  renderTrades(moves, win);

  document.querySelector('main').addEventListener('click', e => {
    const sign = e.target.closest('[data-sign-scope]');
    const trade = e.target.closest('[data-trade-scope]');
    const more = e.target.closest('[data-more]');
    if (sign || trade) {
      const btn = sign ?? trade;
      btn.parentElement.querySelectorAll('.pill').forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', String(b === btn));
      });
      if (sign) { signScope = btn.dataset.signScope; signShown = PAGE_SIZE; renderSignings(signings, win, ranked); }
      else { tradeScope = btn.dataset.tradeScope; tradeShown = PAGE_SIZE; renderTrades(moves, win); }
    } else if (more?.dataset.more === 'sign') {
      signShown += PAGE_SIZE; renderSignings(signings, win, ranked);
    } else if (more?.dataset.more === 'trade') {
      tradeShown += PAGE_SIZE; renderTrades(moves, win);
    }
  });

  $('cuFootnote').innerHTML = `Signings, trades and claims come from MLB's transaction data; contract dollars aren't in it, so they're added for ranked free agents from reporting. Curated content last updated ${esc(fmtDate(cleanup.lastUpdated ?? TODAY, { year: 'numeric' }))}.`;

  renderRumors(rosterR.value?.roster ?? []);
}

init();
