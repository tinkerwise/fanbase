import { TEAMS, getActiveTeam } from './teamConfig.js';

// Backward-compat constants (Orioles defaults)
export const ORIOLES_ID = 110;
export const TEAM_NAME = 'Baltimore Orioles';
export const TEAM_ABBREV = 'BAL';
export const PRIMARY_COLOR = '#DF4601';
export const ACCENT_COLOR = '#000000';

export const MLB_API_BASE = 'https://statsapi.mlb.com/api/v1';
export const SEASON = new Date().getFullYear();

/** Returns the currently active team's MLB Stats API ID (defaults to 110). */
export function getActiveTeamId() {
  return getActiveTeam().id;
}

export { TEAMS, getActiveTeam };
