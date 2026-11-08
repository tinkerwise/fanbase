// ── Schedule games: reschedules, suspensions, spring training ─────
// What a game entry from the MLB Stats API /schedule endpoint means for a
// calendar (#42). The API reflects reschedules as soon as MLB makes them,
// but in ways that are easy to misread:
//
// - A postponed game is listed twice under one gamePk: on its original day
//   (detailedState "Postponed", abstractGameState "Final", no score,
//   rescheduleGameDate = the makeup day) and on the makeup day
//   (rescheduledFromDate = the original day). Its officialDate on BOTH
//   entries is the makeup day, so officialDate can't place it on the
//   calendar: the day MLB lists the entry under (dates[].date) can.
// - A suspended game is listed on the day it started (resumeGameDate = the
//   day it finishes) and on the day it finishes (resumedFromDate). Once it
//   finishes, both entries carry the final score.
// - A cancelled game is "Final" with codedGameState "C" and no score.
// - status.startTimeTBD: the listed time isn't real (often game 2 of a
//   traditional doubleheader, which starts after game 1).
//
// So "Final" alone doesn't mean a result: only a final with a score does.

/** Every entry in a /schedule response, each tagged with `_day`: the
 * YYYY-MM-DD day MLB lists it under. */
export function flattenSchedule(data) {
  return (data?.dates ?? []).flatMap(d => (d.games ?? []).map(g => ({ ...g, _day: d.date })));
}

const hasScore = g => Number.isFinite(g.teams?.away?.score) && Number.isFinite(g.teams?.home?.score);

/**
 * What an entry means on the day it's listed:
 * {
 *   state: 'final' | 'live' | 'scheduled' | 'postponed' | 'cancelled' | 'suspended',
 *   makeupOn,     // postponed: the makeup day, or null if not set yet
 *   resumesOn,    // suspended: the day it finishes, or null if not set yet
 *   movedFrom,    // a makeup game: the day it was postponed from
 *   resumedFrom,  // the finish of a suspended game: the day it started
 *   reason,       // 'Rain', 'Inclement Weather'… when MLB gives one
 *   timeTBD,      // the listed start time isn't real
 *   afterGame1,   // game 2 of a traditional doubleheader, time TBD
 *   dhGame,       // 1 or 2 for either half of a doubleheader, else null
 *   spring,       // a spring training game
 * }
 */
export function gameStatus(g) {
  const st = g.status ?? {};
  const detailed = st.detailedState ?? '';
  const day = g._day ?? g.officialDate;
  let state;
  if (detailed === 'Postponed' || st.codedGameState === 'D') state = 'postponed';
  else if (detailed === 'Cancelled' || st.codedGameState === 'C') state = 'cancelled';
  else if (detailed.startsWith('Suspended') || (g.resumeGameDate && g.resumeGameDate !== day)) state = 'suspended';
  else if (st.abstractGameState === 'Final') state = hasScore(g) ? 'final' : 'cancelled';
  else if (st.abstractGameState === 'Live') state = 'live';
  else state = 'scheduled';

  const timeTBD = !!st.startTimeTBD;
  const dh = g.doubleHeader === 'Y' || g.doubleHeader === 'S';
  return {
    state,
    makeupOn: state === 'postponed' ? (g.rescheduleGameDate ?? null) : null,
    resumesOn: state === 'suspended' ? (g.resumeGameDate ?? null) : null,
    movedFrom: g.rescheduledFromDate ?? null,
    resumedFrom: g.resumedFromDate ?? null,
    reason: st.reason ?? null,
    timeTBD,
    afterGame1: timeTBD && g.doubleHeader === 'Y' && g.gameNumber === 2,
    dhGame: dh ? (g.gameNumber ?? null) : null,
    spring: g.gameType === 'S',
  };
}

/** True for the entry that represents the game actually being played:
 * not the postponed, cancelled or suspended-at listing of it. Only these
 * count toward series, results and "next game". */
export function isPlayedEntry(g) {
  const { state } = gameStatus(g);
  return state !== 'postponed' && state !== 'cancelled' && state !== 'suspended';
}

/** 'Fri 4/3' from 'YYYY-MM-DD'. */
export function shortDay(ymd, withWeekday = true) {
  if (!ymd) return '';
  const d = new Date(`${ymd}T12:00:00`);
  const md = `${d.getMonth() + 1}/${d.getDate()}`;
  return withWeekday ? `${d.toLocaleDateString('en-US', { weekday: 'short' })} ${md}` : md;
}

// ── Changes since last visit ──
// The API says where a game is now, not where it was. To point out a game
// that moved or got a new time since the visitor last looked, keep a small
// snapshot of upcoming games (gamePk → when it's played) per team.
const SNAP_KEY = teamId => `fb_schedule_snapshot_${teamId}`;

function snapshotOf(games) {
  const snap = {};
  // Games already under way or over (any listing of them) are left out:
  // once a makeup is played, only its postponed listing would be left
  const started = new Set(games.filter(g => ['final', 'live'].includes(gameStatus(g).state)).map(g => g.gamePk));
  for (const g of games) {
    if (started.has(g.gamePk)) continue;
    const s = gameStatus(g);
    // Where the game is played now: the playable entry's start, or the
    // postponement/cancellation when that's all there is
    if (isPlayedEntry(g)) snap[g.gamePk] = `${g.gameDate}${s.timeTBD ? '~tbd' : ''}`;
    else if (!(g.gamePk in snap)) snap[g.gamePk] = s.state;
  }
  return snap;
}

/**
 * gamePks of games whose day, time or status changed since the snapshot
 * this browser saved last time, then saves the new snapshot. Empty on a
 * first visit. Browser storage can be unavailable; then nothing is flagged.
 */
export function changedSinceLastVisit(teamId, games) {
  const now = snapshotOf(games);
  let before = null;
  try { before = JSON.parse(localStorage.getItem(SNAP_KEY(teamId)) ?? 'null'); } catch { /* ignore */ }
  try { localStorage.setItem(SNAP_KEY(teamId), JSON.stringify(now)); } catch { /* ignore */ }
  const changed = new Set();
  if (!before) return changed;
  for (const [pk, where] of Object.entries(now)) {
    const was = before[pk];
    if (was === undefined || was === where) continue;
    // A start time being set for a game listed "time TBD" isn't a change
    // worth flagging; a new day is
    if (was.endsWith('~tbd') && where.slice(0, 10) === was.slice(0, 10)) continue;
    changed.add(Number(pk));
  }
  return changed;
}
