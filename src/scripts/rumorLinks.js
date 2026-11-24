// ── Teams linked to a player in trade and signing news ────────────
// Cleanup shows small team logos next to a free agent (or a player "on the
// block") for each club recent reporting has connected him with.
//
// The insiders who break these stories post first on X, which Fanbase
// can't read (its API is paid, the site is behind a login, and Brian's rule
// is not to work around a site that blocks requests; Reddit and Bluesky's
// search refuse too). Outlets that relay those posts with attribution can be
// read: MLB Trade Rumors, Google News and the site's other feeds, all
// through rss-proxy.php. So a "link" here means a recent headline, or one
// sentence of a story's summary, that uses signing/trade language, names
// exactly one tracked player and names another club. Each logo links to the
// newest such story, so a reader can judge it; a link isn't a deal.
import { cleanFeedText } from './utils.js';
import { TEAM_CONFIG } from './teamConfig.js';

/** Stories older than this don't count. */
export const LINK_DAYS = 14;
/** Logos shown per player. */
export const MAX_LINKED = 5;

// Words that make a clause about a move rather than a box score
const MOVE_RE = /\b(sign(s|ed|ing)?|re-sign\w*|agree\w*|agreement|deal|contract|trade[sd]?|trading|acquir\w*|land(s|ed)?|interest(ed)?|pursu\w*|target\w*|linked|suitors?|talks|met with|meeting|offer\w*|in on|checked in|courting|rumou?rs?|frontrunners?|favorites?)\b/i;
// A clause that reports a deal, not just interest
const DEAL_RE = /\b(to sign|signs?|signed|signing with|agree\w* (to|with|on)|in agreement|land(s|ed)?|deal with|re-sign(s|ed)?|finaliz\w*|acquire[sd]?|trade[sd]? for|traded to)\b/;
// …and which club it's with: the one in the deal phrase ("Cubs to sign X",
// "X signing with the Mets"), not others the clause mentions ("…changes
// nothing for the Braves")
const DEAL_BEFORE = '(?:to sign|signs?|signed|agree\\w*|in agreement|land(?:s|ed)?|re-sign(?:s|ed)?|finaliz\\w*|acquire[sd]?|trade[sd]? for)';
const DEAL_AFTER = '(?:sign\\w* with|agree\\w* (?:to terms )?with|deal with|traded to|heading to|joins?)';
function dealWith(unit, teamRe) {
  const nick = teamRe.source.slice(2, -2);
  return new RegExp(`\\b${nick}\\b[^,;]{0,40}?\\b${DEAL_BEFORE}\\b|\\b${DEAL_AFTER}\\s+(?:the\\s+)?${nick}\\b`).test(unit);
}
// Opinion and what-ifs ("Should the Rockies sign Zach Eflin?", "How the
// signing could impact the Cubs") connect nobody
const SPECULATION_RE = /\?|\b(should|could|would|might|avoid|what if|makes? (too much )?sense|potential|hypothetical|predict\w*|fits?|ideal|dream)\b/;

const normText = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[.'’]/g, '').replace(/\s+/g, ' ').trim();

/** A player's name as matched in text: normalized, without Jr./Sr./II. */
export function playerKey(name) {
  return normText(name).replace(/\s+(jr|sr|ii|iii|iv)$/, '');
}

const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Each club's nickname, plus the short forms headlines use
const ALIASES = { 109: ['diamondbacks', 'dbacks'], 141: ['jays'], 120: ['nats'] };
const TEAM_RES = Object.values(TEAM_CONFIG).map(t => ({
  id: t.id,
  re: new RegExp(`\\b(${[t.name, ...(ALIASES[t.id] ?? [])].map(n => escRe(normText(n))).join('|')})\\b`),
}));

// Japanese and Korean clubs that share an MLB nickname: "the Hanshin
// Tigers' Teruaki Sato" isn't a Detroit link
const ABROAD_RE = /\b(hanshin tigers|yomiuri giants|kia tigers|lg twins|ssg landers|samsung lions|seibu lions|nippon-ham fighters|softbank hawks|orix buffaloes|lotte marines|rakuten eagles|chunichi dragons|yakult swallows|hiroshima carp|dena baystars)\b/g;

// Clubs a player used to play for: "former Tigers ace", "Ex-Orioles,
// White Sox OF Luis Robert" (a list after "ex-" counts too)
const NICKS = Object.values(TEAM_CONFIG).flatMap(t => [t.name, ...(ALIASES[t.id] ?? [])]).map(n => escRe(normText(n)));
const NICK_ALT = `(?:${NICKS.join('|')})`;
const FORMER_RE = new RegExp(`\\b(?:former|ex)[- ]${NICK_ALT}(?:\\s*(?:,|and|&|/)\\s*${NICK_ALT})*\\b`, 'g');

function teamsIn(text) {
  const ids = new Set();
  const clean = text.replace(ABROAD_RE, ' ').replace(FORMER_RE, ' ');
  for (const t of TEAM_RES) if (t.re.test(clean)) ids.add(t.id);
  return ids;
}

/**
 * Google News searches for the tracked players' names, a few names per
 * search, limited to signing and trade stories from the last LINK_DAYS.
 * Sources in feedSources.js's shape.
 */
export function newsSearchSources(names, perQuery = 8) {
  const out = [];
  for (let i = 0; i < names.length; i += perQuery) {
    const who = names.slice(i, i + perQuery).map(n => `"${n.replace(/"/g, '')}"`).join(' OR ');
    const q = `(${who}) (sign OR signs OR signing OR trade OR deal OR interest OR linked) when:${LINK_DAYS}d`;
    out.push({
      id: `gnews-links-${i / perQuery}`,
      name: 'Google News',
      url: `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`,
      titleHasSource: true,
    });
  }
  return out;
}

/**
 * Which teams each tracked player has been linked with.
 *   stories: [{ title, description, link, pubDate, sourceName }]
 *   players: [{ key: playerKey(name), past: Set of team ids to leave out }]
 * Returns Map key → [{ teamId, count, deal, story: newest { title, link, sourceName, time } }]:
 * `deal` when a story reports an agreement with that team. Reported deals
 * first, then the most-mentioned team.
 */
export function findRumorLinks(stories, players, now = new Date()) {
  const cutoff = now.getTime() - LINK_DAYS * 86400000;
  const matchers = players
    .filter(p => p.key && p.key.includes(' '))
    .map(p => ({ ...p, re: new RegExp(`\\b${escRe(p.key)}\\b`) }));
  const found = new Map();
  const seenLinks = new Set();

  for (const s of stories) {
    const date = Date.parse(s.pubDate ?? '');
    if (Number.isFinite(date) && date < cutoff) continue;
    if (!s.link || seenLinks.has(s.link)) continue;
    seenLinks.add(s.link);

    // Each clause of the headline ("MLB rumors: Mets land X; how will the
    // Phillies counter?") and each sentence of the summary, on its own
    const units = [
      ...String(s.title ?? '').split(/\s*(?::\s| [–—-] |\s\|\s|;\s)\s*/),
      ...cleanFeedText(s.description ?? '').split(/(?<=[.!?])\s+|;\s+/),
    ].map(normText).filter(u => u && MOVE_RE.test(u) && !SPECULATION_RE.test(u));
    const pairs = new Map();
    for (const unit of units) {
      const who = matchers.filter(m => m.re.test(unit));
      // Two players in one clause: can't tell which club goes with whom
      if (who.length !== 1) continue;
      const isDeal = DEAL_RE.test(unit);
      const teams = teamsIn(unit);
      const dealTeams = isDeal ? [...teams].filter(id => dealWith(unit, TEAM_RES.find(t => t.id === id).re)) : [];
      for (const teamId of teams) {
        if (who[0].past.has(teamId)) continue;
        // In a deal clause, the other clubs named are context, not links
        if (isDeal && dealTeams.length && !dealTeams.includes(teamId)) continue;
        const pair = `${who[0].key}|${teamId}`;
        pairs.set(pair, pairs.get(pair) || dealTeams.includes(teamId));
      }
    }
    for (const [pair, deal] of pairs) {
      const [key, id] = pair.split('|');
      const teamId = Number(id);
      const byTeam = found.get(key) ?? new Map();
      const cur = byTeam.get(teamId) ?? { teamId, count: 0, deal: false, story: null };
      cur.count += 1;
      // The logo links to the newest deal story once there is one
      const better = !cur.story || (deal && !cur.deal) || (deal === cur.deal && Number.isFinite(date) && date > cur.story.time);
      cur.deal ||= deal;
      if (better) {
        cur.story = { title: s.title, link: s.link, sourceName: s.sourceName, time: Number.isFinite(date) ? date : 0 };
      }
      byTeam.set(teamId, cur);
      found.set(key, byTeam);
    }
  }

  const out = new Map();
  for (const [key, byTeam] of found) {
    out.set(key, [...byTeam.values()].sort((a, b) => b.deal - a.deal || b.count - a.count || b.story.time - a.story.time));
  }
  return out;
}
