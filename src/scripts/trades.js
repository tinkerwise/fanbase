// ── Trades page ──────────────────────────────────────────────────
// The trade deadline hub for the active team: its confirmed trades, its
// names in the rumor mill, and its whole organization cross-checked
// against rumor text. League-wide details (deadline, reporters) come from
// public/trades.json.
import './theme.js';
import { MLB, TEAM_ID, TEAM, TEAM_NICK, SEASON } from './config.js';
import { TEAM_CONFIG } from './teamConfig.js';
import { requireTeam } from './teamPicker.js';
import { loadFeedSources, fetchFeedItems } from './feedSources.js';
import { $, esc, relativeDate, cleanFeedText, extractThumbnail, renderNewsThumbCard, fetchOgImage, fetchPlayerIndex, savantUrl, teamLogoSrc, decodeHtmlEntities, mlbPlayerUrl } from './utils.js';

// ── Team Moves — confirmed trades only, straight from MLB's own
// transaction log (not the rumor mill above) ─────────────────────
async function loadTeamMoves() {
  const el = $('tdMoves');
  if (!el) return;
  try {
    const start = `${SEASON}-06-01`;
    const end = new Date().toISOString().slice(0, 10);
    const data = await fetch(`${MLB}/transactions?teamId=${TEAM_ID}&startDate=${start}&endDate=${end}`).then(r => r.json());
    // MLB's own transaction log double-lists some trades (same description,
    // same date, once per team side of the query) — dedupe on that pair.
    const seen = new Set();
    const trades = (data.transactions ?? [])
      .filter(t => t.typeCode === 'TR')
      .filter(t => {
        const key = `${t.date || t.effectiveDate}|${t.description}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => new Date(b.date || b.effectiveDate) - new Date(a.date || a.effectiveDate));

    if (!trades.length) {
      el.innerHTML = '<span class="sidebar-msg">No trades made yet this deadline season</span>';
      return;
    }

    el.innerHTML = `<div class="txn-list">${trades.map(t => {
      const date = new Date(t.date || t.effectiveDate);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const pid = t.person?.id;
      const playerName = t.person?.fullName ?? '';
      const desc = t.description || '';
      const descHtml = pid && playerName
        ? desc.replace(playerName, `<a class="txn-player" href="${mlbPlayerUrl(pid)}" target="_blank" rel="noopener">${esc(playerName)}</a>`)
        : esc(desc);
      return `<div class="txn-item">
        <span class="txn-date">${esc(dateStr)}</span>
        <span class="txn-desc">${descHtml}</span>
      </div>`;
    }).join('')}</div>`;
  } catch {
    el.innerHTML = '<span class="sidebar-msg">Unavailable</span>';
  }
}

// ── Deadline info (date + countdown) ────────────────────────────
function loadDeadlineInfo(data) {
  const el = $('tdInfo');
  if (!el) return;

  let countdownHtml = '';
  const deadline = data.deadlineTime ? new Date(data.deadlineTime) : null;
  const diffMs = deadline ? deadline.getTime() - Date.now() : 0;
  if (diffMs > 0) {
    const days = Math.floor(diffMs / 864e5);
    const hours = Math.floor((diffMs % 864e5) / 36e5);
    countdownHtml = `<div class="event-countdown">${days}d ${hours}h until the deadline</div>`;
  } else {
    countdownHtml = '<div class="event-countdown">The deadline has passed</div>';
  }

  el.innerHTML = `
    <div class="event-game-card">
      <div class="event-game-date">${esc(data.dates ?? '')}</div>
      ${countdownHtml}
    </div>
    <a class="widget-link" href="https://www.mlb.com/trade-deadline" target="_blank" rel="noopener">MLB Trade Deadline hub ↗</a>
  `;
}

// ── Reporters to watch ───────────────────────────────────────────
function loadReportersToWatch(data) {
  const el = $('tdReporters');
  if (!el) return;
  const reporters = data.reporters ?? [];
  if (!reporters.length) {
    el.innerHTML = '<span class="sidebar-msg">Unavailable</span>';
    return;
  }
  el.innerHTML = reporters.map(r => `
    <a class="reporter-item" href="${esc(r.link)}" target="_blank" rel="noopener">
      <span class="reporter-name">${esc(r.name)}</span>
      <span class="reporter-outlet">${esc(r.outlet)}</span>
    </a>
  `).join('');
}

async function loadOverview(data) {
  const updatedEl = $('tdUpdated');
  if (updatedEl && data.lastUpdated) {
    updatedEl.textContent = `Updated ${relativeDate(data.lastUpdated)}`;
  }
  loadDeadlineInfo(data);
  loadReportersToWatch(data);
}

async function init() {
  try {
    const data = await fetch(`${import.meta.env.BASE_URL}trades.json`).then(r => r.json());
    loadOverview(data);
  } catch {
    $('tdInfo').innerHTML = '<span class="sidebar-msg">Unavailable</span>';
    $('tdReporters').innerHTML = '<span class="sidebar-msg">Unavailable</span>';
  }
}

// ── On the Block — the team's names mentioned in trade rumors ────
// Headline/description text-matching only: this can't tell "being shopped"
// from "rumored trade target" from "reporter floated the idea," so it's
// framed honestly as mentions, not confirmed direction.
// Matches the team's nickname, plus its city where no other club shares it
// ("Baltimore" yes; "New York", "Chicago", "Los Angeles" no).
function teamMentionRe() {
  const cityShared = Object.values(TEAM_CONFIG).filter(t => t.city === TEAM.city).length > 1;
  const words = [TEAM.nick, ...(cityShared ? [] : [TEAM.city])]
    .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`\\b(${words.join('|')})\\b`, 'i');
}

function findMentionedPlayers(text, playerIndex) {
  const lower = text.toLowerCase();
  return playerIndex.filter(p => lower.includes(p.fullName.toLowerCase()));
}

function renderMentionRow(entry) {
  const { player, count } = entry;
  return `<a class="mention-item" href="${savantUrl(player.id)}" target="_blank" rel="noopener"
      data-player-id="${player.id}" data-team-id="${player.teamId ?? ''}" data-player-name="${esc(player.fullName)}">
    ${player.teamId ? `<img class="event-team-logo" src="${teamLogoSrc(player.teamId, 16)}" alt="" width="16" height="16" loading="lazy">` : ''}
    <span class="mention-name">${esc(player.fullName)}</span>
    <span class="mention-count">${count} mention${count === 1 ? '' : 's'}</span>
  </a>`;
}

// ── Hover profile card — headshot, position, current stat line, and a
// Spotrac link for the contract situation. ──
const profileCache = new Map();
let profilePopoverEl = null;

function ensureProfilePopover() {
  if (!profilePopoverEl) {
    profilePopoverEl = document.createElement('div');
    profilePopoverEl.className = 'player-hover-card hidden';
    document.body.appendChild(profilePopoverEl);
  }
  return profilePopoverEl;
}

async function fetchPlayerProfile(playerId) {
  if (profileCache.has(playerId)) return profileCache.get(playerId);
  const promise = (async () => {
    const bioData = await fetch(`${MLB}/people/${playerId}`).then(r => r.json()).catch(() => null);
    const person = bioData?.people?.[0] ?? null;
    const group = person?.primaryPosition?.type === 'Pitcher' ? 'pitching' : 'hitting';
    const statsData = await fetch(`${MLB}/people/${playerId}/stats?stats=season&season=${SEASON}&group=${group}`).then(r => r.json()).catch(() => null);
    const stat = statsData?.stats?.[0]?.splits?.[0]?.stat ?? null;
    return { person, group, stat };
  })();
  profileCache.set(playerId, promise);
  return promise;
}

function renderProfileCard(playerName, profile) {
  if (!profile) {
    return `<div class="phc-header">
      <div class="phc-photo phc-photo--empty"></div>
      <div class="phc-id"><div class="phc-name">${esc(playerName)}</div><div class="phc-meta">Loading…</div></div>
    </div>`;
  }

  const { person, group, stat } = profile;
  const photoUrl = person
    ? `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${person.id}/headshot/67/current`
    : '';
  const pos = person?.primaryPosition?.abbreviation ?? '';
  const teamName = person?.currentTeam?.name ?? '';
  const statLine = stat
    ? (group === 'hitting'
      ? `${stat.avg ?? '.---'}/${stat.obp ?? '.---'}/${stat.slg ?? '.---'}, ${stat.homeRuns ?? 0} HR`
      : `${stat.era ?? '-.--'} ERA, ${stat.strikeOuts ?? 0} K`)
    : `No ${SEASON} stats yet`;
  const contractHtml = `<a class="phc-contract-link" href="${esc(`https://www.spotrac.com/search?q=${encodeURIComponent(playerName)}`)}" target="_blank" rel="noopener">Contract details on Spotrac ↗</a>`;

  return `
    <div class="phc-header">
      ${photoUrl ? `<img class="phc-photo" src="${photoUrl}" alt="" loading="lazy">` : '<div class="phc-photo phc-photo--empty"></div>'}
      <div class="phc-id">
        <div class="phc-name">${esc(playerName)}</div>
        <div class="phc-meta">${esc([pos, teamName].filter(Boolean).join(' · '))}</div>
      </div>
    </div>
    <div class="phc-stat">${esc(statLine)}</div>
    ${contractHtml}
  `;
}

function positionProfilePopover(popover, anchorEl) {
  const rect = anchorEl.getBoundingClientRect();
  const popRect = popover.getBoundingClientRect();
  let left = rect.left + window.scrollX;
  let top = rect.bottom + window.scrollY + 6;
  if (left + popRect.width > window.scrollX + window.innerWidth - 12) {
    left = window.scrollX + window.innerWidth - popRect.width - 12;
  }
  if (rect.bottom + popRect.height > window.innerHeight - 12) {
    top = rect.top + window.scrollY - popRect.height - 6;
  }
  popover.style.left = `${Math.max(8, left)}px`;
  popover.style.top = `${Math.max(8, top)}px`;
}

function setupPlayerHoverCards(containerEl) {
  const popover = ensureProfilePopover();
  let hideTimer = null;

  const show = async (anchorEl) => {
    clearTimeout(hideTimer);
    const { playerId, playerName } = anchorEl.dataset;
    popover.innerHTML = renderProfileCard(playerName, null);
    popover.classList.remove('hidden');
    positionProfilePopover(popover, anchorEl);
    const profile = await fetchPlayerProfile(Number(playerId));
    if (popover.dataset.forPlayer !== playerId) return;
    popover.innerHTML = renderProfileCard(playerName, profile);
    positionProfilePopover(popover, anchorEl);
  };
  const hide = () => {
    hideTimer = setTimeout(() => popover.classList.add('hidden'), 120);
  };

  containerEl.addEventListener('mouseover', e => {
    const item = e.target.closest('.mention-item');
    if (!item) return;
    popover.dataset.forPlayer = item.dataset.playerId;
    show(item);
  });
  containerEl.addEventListener('mouseout', e => {
    if (e.target.closest('.mention-item')) hide();
  });
  containerEl.addEventListener('focusin', e => {
    const item = e.target.closest('.mention-item');
    if (item) show(item);
  });
  containerEl.addEventListener('focusout', e => {
    if (e.target.closest('.mention-item')) hide();
  });
  popover.addEventListener('mouseover', () => clearTimeout(hideTimer));
  popover.addEventListener('mouseout', hide);
}

async function loadOnTheBlock(matches) {
  const el = $('tdOnBlock');
  if (!el) return;
  try {
    const playerIndex = await fetchPlayerIndex();
    const mine = new Map();
    const others = new Map();
    const teamRe = teamMentionRe();

    for (const a of matches) {
      const text = decodeHtmlEntities(`${a.title} ${a.description || ''}`);
      if (!teamRe.test(text)) continue;
      const mentioned = findMentionedPlayers(text, playerIndex);
      for (const p of mentioned) {
        const bucket = p.teamId === TEAM_ID ? mine : others;
        if (!bucket.has(p.id)) bucket.set(p.id, { player: p, count: 0, link: a.link });
        bucket.get(p.id).count++;
      }
    }

    const sortByCount = m => [...m.values()].sort((a, b) => b.count - a.count).slice(0, 6);
    const mineTop = sortByCount(mine);
    const othersTop = sortByCount(others);

    if (!mineTop.length) {
      el.innerHTML = `<span class="sidebar-msg">No ${esc(TEAM_NICK)} names in recent rumors</span>`;
      return;
    }

    el.innerHTML = `
      <div class="roster-group-label">${esc(TEAM_NICK)} Names in the Mix</div>
      ${mineTop.map(renderMentionRow).join('')}
      ${othersTop.length ? `
        <div class="roster-group-label">Mentioned Alongside the ${esc(TEAM_NICK)}</div>
        ${othersTop.map(renderMentionRow).join('')}
      ` : ''}
    `;
    setupPlayerHoverCards(el);
  } catch {
    el.innerHTML = '<span class="sidebar-msg">Unavailable</span>';
  }
}

// ── Long Shots — headlines using speculative/outlier language, pulled
// from the same trade-rumor set rather than a separate curated list, so
// it stays live and never goes stale. ────────────────────────────
const LONGSHOT_RE = /long shot|longshot|long-shot|wild card scenario|blockbuster|dream scenario|far-fetched|farfetched|pie[- ]in[- ]the[- ]sky|shocking trade|stunning trade|surprise trade|outside[- ]the[- ]box|unlikely|swing for the fences|dark horse|fantasy trade/i;

async function loadLongShots(matches) {
  const el = $('tdLongShots');
  if (!el) return;
  try {
    const hits = matches.filter(a => LONGSHOT_RE.test(decodeHtmlEntities(`${a.title} ${a.description || ''}`))).slice(0, 6);
    if (!hits.length) {
      el.innerHTML = '<span class="sidebar-msg">No outlier rumors surfaced recently</span>';
      return;
    }
    await Promise.all(hits.map(async a => {
      if (!a.thumbnail) a.thumbnail = await fetchOgImage(a.link);
    }));
    el.innerHTML = `<div class="news-thumb-list">${hits.map(renderNewsThumbCard).join('')}</div>`;
  } catch {
    el.innerHTML = '<span class="sidebar-msg">Unavailable</span>';
  }
}

// ── Organization Watch — the full 40-man + full-season MiLB system,
// with anyone turning up in trade-rumor text highlighted in place. ──
const ORG_LEVEL_ORDER = ['40-Man', 'AAA', 'AA', 'A+', 'A', 'Rook'];
// MLB sport id → level label for minor-league affiliates
const MILB_LEVELS = { 11: 'AAA', 12: 'AA', 13: 'A+', 14: 'A', 16: 'Rook' };

// One affiliate per level, looked up by parent club. Rookie ball has the
// stateside complex team plus Dominican Summer League clubs; keep the
// complex team, as the DSL rosters rarely surface in rumors.
async function fetchAffiliates() {
  const ids = Object.keys(MILB_LEVELS).join(',');
  const data = await fetch(`${MLB}/teams?sportIds=${ids}&season=${SEASON}`).then(r => r.json()).catch(() => ({ teams: [] }));
  const byLevel = new Map();
  for (const t of data.teams ?? []) {
    const level = MILB_LEVELS[t.sport?.id];
    if (t.parentOrgId !== TEAM_ID || !level) continue;
    if (!byLevel.has(level) || /^DSL\b/.test(byLevel.get(level).team)) byLevel.set(level, { id: t.id, level, team: t.name });
  }
  return ORG_LEVEL_ORDER.map(l => byLevel.get(l)).filter(Boolean);
}

async function fetchOrgRoster() {
  const affiliates = await fetchAffiliates();
  const [mlbData, ...affData] = await Promise.all([
    fetch(`${MLB}/teams/${TEAM_ID}/roster?rosterType=40Man&season=${SEASON}`).then(r => r.json()).catch(() => ({ roster: [] })),
    ...affiliates.map(a =>
      fetch(`${MLB}/teams/${a.id}/roster?rosterType=active&season=${SEASON}`).then(r => r.json()).catch(() => ({ roster: [] }))),
  ]);

  const seen = new Set();
  const org = [];
  for (const p of mlbData.roster ?? []) {
    if (!p.person?.id || seen.has(p.person.id)) continue;
    seen.add(p.person.id);
    org.push({ id: p.person.id, name: p.person.fullName, pos: p.position?.abbreviation ?? '', level: '40-Man' });
  }
  affiliates.forEach((aff, i) => {
    for (const p of affData[i]?.roster ?? []) {
      if (!p.person?.id || seen.has(p.person.id)) continue;
      seen.add(p.person.id);
      org.push({ id: p.person.id, name: p.person.fullName, pos: p.position?.abbreviation ?? '', level: aff.level, team: aff.team });
    }
  });
  return org;
}

function renderOrgRoster(org, mentionedIds) {
  const groups = ORG_LEVEL_ORDER
    .map(level => ({ level, players: org.filter(p => p.level === level) }))
    .filter(g => g.players.length);

  return groups.map(g => {
    // Mentioned players float to the top of their level so they aren't
    // buried in a 25-30 player affiliate roster.
    const sorted = [...g.players].sort((a, b) => (mentionedIds.has(b.id) ? 1 : 0) - (mentionedIds.has(a.id) ? 1 : 0));
    const label = g.level === '40-Man' ? '40-Man Roster' : `${g.level} · ${esc(g.players[0].team ?? '')}`;
    return `<div class="roster-group-label">${label}</div>
      ${sorted.map(p => {
        return `
        <div class="roster-item${mentionedIds.has(p.id) ? ' org-player--mentioned' : ''}">
          <a class="roster-name" href="${savantUrl(p.id)}" target="_blank" rel="noopener">${esc(p.name)}</a>
          <span class="roster-pos">${esc(p.pos)}</span>
          ${mentionedIds.has(p.id) ? '<span class="roster-badge roster-badge--replacement">Rumor Mill</span>' : ''}
        </div>
      `;
      }).join('')}`;
  }).join('');
}

async function loadOrgWatch(matches) {
  const el = $('tdOrgRoster');
  if (!el) return;
  try {
    const org = await fetchOrgRoster();
    const mentionedIds = new Set();
    for (const a of matches) {
      const text = decodeHtmlEntities(`${a.title} ${a.description || ''}`);
      for (const p of org) {
        if (text.toLowerCase().includes(p.name.toLowerCase())) mentionedIds.add(p.id);
      }
    }
    const countEl = $('tdOrgCount');
    if (countEl) countEl.textContent = `${org.length} players · ${mentionedIds.size} in the rumor mill`;
    el.innerHTML = renderOrgRoster(org, mentionedIds);
  } catch {
    el.innerHTML = '<span class="sidebar-msg">Unavailable</span>';
  }
}

// ── Trade rumor news (reuses the site's existing RSS sources) ────
async function loadDeadlineNews() {
  const wrap = $('tdNews');
  if (!wrap) return;
  try {
    const feeds = await loadFeedSources();
    const results = await Promise.allSettled(feeds.map(source =>
      fetchFeedItems(source)
        .then(data => ({ source, articles: data.items ?? [] }))
    ));

    const cutoff = Date.now() - 14 * 864e5;
    const tradeRe = /trade deadline|trade rumor|traded to|traded for|trade target|acquire[sd]?|dealt to|deadline deal/i;
    const matches = [];
    for (const r of results) {
      if (r.status !== 'fulfilled') continue;
      const { source, articles } = r.value;
      for (const a of articles) {
        const title = cleanFeedText(a.title || '');
        if (!tradeRe.test(title) && !tradeRe.test(a.description || '')) continue;
        const d = new Date(a.pubDate);
        if (isNaN(d) || d.getTime() < cutoff) continue;
        matches.push({ title, link: a.link, pubDate: a.pubDate, sourceName: source.name, thumbnail: extractThumbnail(a), description: a.description });
      }
    }

    matches.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    loadOnTheBlock(matches);
    loadLongShots(matches);
    loadOrgWatch(matches);

    const top = matches.slice(0, 8);
    if (!top.length) {
      wrap.innerHTML = '<span class="sidebar-msg">No recent trade rumors</span>';
      return;
    }

    await Promise.all(top.map(async a => {
      if (!a.thumbnail) a.thumbnail = await fetchOgImage(a.link);
    }));

    wrap.innerHTML = `<div class="news-thumb-list">${top.map(renderNewsThumbCard).join('')}</div>`;
  } catch {
    wrap.innerHTML = '<span class="sidebar-msg">Unavailable</span>';
  }
}

// ── Sidebar accordion (mirrors app.js behavior for the right sidebar) ──
function setupAccordion() {
  document.querySelectorAll('.section-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const section = toggle.closest('.sidebar-section');
      const sidebar = section.closest('.sidebar');
      const isCollapsed = section.classList.contains('collapsed');
      sidebar?.querySelectorAll('.sidebar-section.collapsible').forEach(peer => {
        if (peer !== section) peer.classList.add('collapsed');
      });
      section.classList.toggle('collapsed', !isCollapsed);
    });
  });
}

setupAccordion();
if (requireTeam()) {
  init();
  loadTeamMoves();
  loadDeadlineNews();
}
