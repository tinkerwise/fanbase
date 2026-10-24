import { TEAM_CONFIG } from './teamConfig.js';

export const PROXY =`${import.meta.env.BASE_URL}rss-proxy.php`;

export const DIVISION_NAMES = {
  200: 'AL West', 201: 'AL East', 202: 'AL Central',
  203: 'NL West', 204: 'NL East', 205: 'NL Central',
};

export const TEAM_ABBREV = {
  108: 'LAA', 109: 'ARI', 110: 'BAL', 111: 'BOS', 112: 'CHC',
  113: 'CIN', 114: 'CLE', 115: 'COL', 116: 'DET', 117: 'HOU',
  118: 'KC',  119: 'LAD', 120: 'WSH', 121: 'NYM', 133: 'OAK',
  134: 'PIT', 135: 'SD',  136: 'SEA', 137: 'SF',  138: 'STL',
  139: 'TB',  140: 'TEX', 141: 'TOR', 142: 'MIN', 143: 'PHI',
  144: 'ATL', 145: 'CWS', 146: 'MIA', 147: 'NYY', 158: 'MIL',
};

export const TEAM_SLUG = {
  108: 'angels',    109: 'd-backs',      110: 'orioles',   111: 'red-sox',
  112: 'cubs',      113: 'reds',         114: 'guardians', 115: 'rockies',
  116: 'tigers',    117: 'astros',       118: 'royals',    119: 'dodgers',
  120: 'nationals', 121: 'mets',         133: 'athletics', 134: 'pirates',
  135: 'padres',    136: 'mariners',     137: 'giants',    138: 'cardinals',
  139: 'rays',      140: 'rangers',      141: 'blue-jays', 142: 'twins',
  143: 'phillies',  144: 'braves',       145: 'white-sox', 146: 'marlins',
  147: 'yankees',   158: 'brewers',
};

export const TEAM_PAGE = {
  108: 'angels',     109: 'dbacks',      110: 'orioles',    111: 'redsox',
  112: 'cubs',       113: 'reds',        114: 'guardians',  115: 'rockies',
  116: 'tigers',     117: 'astros',      118: 'royals',     119: 'dodgers',
  120: 'nationals',  121: 'mets',        133: 'athletics',  134: 'pirates',
  135: 'padres',     136: 'mariners',    137: 'giants',     138: 'cardinals',
  139: 'rays',       140: 'rangers',     141: 'bluejays',   142: 'twins',
  143: 'phillies',   144: 'braves',      145: 'whitesox',   146: 'marlins',
  147: 'yankees',    158: 'brewers',
};

export const MLB = 'https://statsapi.mlb.com/api/v1';
export const ORIOLES_ID = 110;
export const SEASON = new Date().getFullYear();

// ── Active team ───────────────────────────────────────────────────
// Chosen in the team picker and kept in localStorage. `?team=bal` (abbr or
// MLB id) overrides and saves, so a link can open the site as any team.
// The id is fixed for the page's lifetime: switching teams reloads.
// Layout.astro's inline head script resolves the same key and params for
// the theme and accent colors, so keep the two in step.
export const TEAM_KEY = 'fb_team';

export function teamIdFromParam(value) {
  const v = String(value ?? '').trim().toUpperCase();
  if (!v) return null;
  if (TEAM_CONFIG[Number(v)]) return Number(v);
  const hit = Object.values(TEAM_CONFIG).find(t => t.abbr === v);
  return hit ? hit.id : null;
}

function resolveTeamId() {
  const fromUrl = teamIdFromParam(new URLSearchParams(location.search).get('team'));
  if (fromUrl) {
    try { localStorage.setItem(TEAM_KEY, String(fromUrl)); } catch {}
    return fromUrl;
  }
  try {
    const saved = Number(localStorage.getItem(TEAM_KEY));
    if (TEAM_CONFIG[saved]) return saved;
  } catch {}
  return null;
}

// ── Viewing another team ──
// `?view=nyy` shows the site as another team without touching the saved
// pick. Nothing is written; Layout.astro carries the param on internal
// links and teamPicker.js shows the "Viewing as…" banner.
export const MY_TEAM_ID = resolveTeamId();
const VIEW_ID = teamIdFromParam(new URLSearchParams(location.search).get('view'));
export const VIEWING = Boolean(VIEW_ID && VIEW_ID !== MY_TEAM_ID);
export const MY_TEAM = TEAM_CONFIG[MY_TEAM_ID] ?? null;

// Null until a team is picked; pages show the picker instead of loading.
export const PICKED_TEAM_ID = VIEWING ? VIEW_ID : MY_TEAM_ID;
// Modules read TEAM_ID at import, so give them a valid id even before a
// pick; nothing fetches until PICKED_TEAM_ID is set (see requireTeam()).
export const TEAM_ID = PICKED_TEAM_ID ?? ORIOLES_ID;
export const TEAM = { ...TEAM_CONFIG[TEAM_ID], nick: TEAM_CONFIG[TEAM_ID].name };
export const TEAM_ABBR = TEAM.abbr;
export const TEAM_NICK = TEAM.nick;
export const TEAM_CONFERENCE = TEAM.div.split(' ')[0]; // 'AL' | 'NL'
export const TEAM_DIVISION = TEAM.div.split(' ')[1];   // 'East' | 'Central' | 'West'

/** The team the page shows: the ?view= team, else your own. */
export function getActiveTeamId() {
  return TEAM_ID;
}

/** True until a team is picked (and none is being viewed). */
export function isFirstVisit() {
  return !PICKED_TEAM_ID;
}

/**
 * URL for a site page (relative to the site root: '' for Home,
 * 'schedule/', …) as team `id`: your own team gets the plain path, any
 * other team a ?view= link that leaves your saved pick alone.
 */
export function viewUrl(id, page = '') {
  const t = TEAM_CONFIG[id];
  const path = `${import.meta.env.BASE_URL}${page}`;
  return !t || Number(id) === MY_TEAM_ID ? path : `${path}?view=${t.abbr.toLowerCase()}`;
}

export const PITCH_NAMES = {
  'Four-Seam Fastball': '4-Seam', 'Two-Seam Fastball': '2-Seam', 'Sinker': 'Sinker',
  'Slider': 'Slider', 'Curveball': 'Curve', 'Changeup': 'Changeup', 'Cutter': 'Cutter',
  'Splitter': 'Splitter', 'Sweeper': 'Sweeper', 'Knuckle Curve': 'K. Curve',
  'Knuckleball': 'Knuckle', 'Forkball': 'Forkball', 'Eephus': 'Eephus',
};

export const VENUE_COORDS = {
  1:    { lat: 33.800, lon: -117.882 },
  2:    { lat: 39.284, lon: -76.622 },
  3:    { lat: 42.346, lon: -71.097 },
  4:    { lat: 41.830, lon: -87.634 },
  5:    { lat: 41.496, lon: -81.685 },
  7:    { lat: 39.052, lon: -94.480 },
  12:   { lat: 27.768, lon: -82.653 },
  14:   { lat: 43.642, lon: -79.389 },
  15:   { lat: 33.445, lon: -112.067 },
  17:   { lat: 41.948, lon: -87.656 },
  19:   { lat: 39.756, lon: -104.994 },
  22:   { lat: 34.074, lon: -118.241 },
  31:   { lat: 40.447, lon: -80.006 },
  32:   { lat: 43.028, lon: -87.971 },
  680:  { lat: 47.591, lon: -122.333 },
  2392: { lat: 29.757, lon: -95.356 },
  2394: { lat: 42.339, lon: -83.049 },
  2395: { lat: 37.778, lon: -122.389 },
  2529: { lat: 38.580, lon: -121.512 },
  2602: { lat: 39.097, lon: -84.507 },
  2680: { lat: 32.708, lon: -117.157 },
  2681: { lat: 39.905, lon: -75.167 },
  2889: { lat: 38.623, lon: -90.193 },
  3289: { lat: 40.758, lon: -73.846 },
  3309: { lat: 38.873, lon: -77.008 },
  3312: { lat: 44.982, lon: -93.278 },
  3313: { lat: 40.829, lon: -73.927 },
  4169: { lat: 25.778, lon: -80.220 },
  4705: { lat: 33.891, lon: -84.468 },
  5325: { lat: 32.747, lon: -97.082 },
};
