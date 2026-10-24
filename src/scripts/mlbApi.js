// ── MLB Stats API wrappers ───────────────────────────────────────────
// Fetch-and-parse for Stats API endpoints. Only postseason.js uses these
// today; the other modules still build their own ${MLB}/… URLs inline.
// No caching here.
import { MLB } from './config.js';

function getJson(url) {
  return fetch(url).then(r => r.json());
}

export function fetchStandings(season, standingsType) {
  return getJson(`${MLB}/standings?leagueId=103,104&season=${season}&standingsTypes=${standingsType}`);
}

export function fetchLeagueLeaders(leaderCategories, season, { leaderGameTypes = 'R', leagueId, playerPool = 'Qualified', limit } = {}) {
  const leagueParam = leagueId ? `&leagueId=${leagueId}` : '';
  const limitParam = limit ? `&limit=${limit}` : '';
  return getJson(`${MLB}/stats/leaders?leaderCategories=${leaderCategories}&season=${season}&leaderGameTypes=${leaderGameTypes}${leagueParam}&playerPool=${playerPool}${limitParam}`);
}
