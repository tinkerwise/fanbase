// ── Team data ─────────────────────────────────────────────────────
// Pure data, no browser globals, so Layout.astro can import it at build
// time for the head color script. MLB team id → id, nickname, full name,
// abbreviation, and `color`, the brand color the site themes itself with
// (stored as-is; Layout.astro lightens or darkens it per theme until it has
// enough contrast). `colorDark` is used instead in dark mode where the
// primary is black or near-navy: those teams use their secondary color.
export const TEAM_CONFIG = {
  108: { id: 108, name: 'Angels',    fullName: 'Los Angeles Angels',    abbr: 'LAA', color: '#BA0021' },
  109: { id: 109, name: 'D-backs',   fullName: 'Arizona Diamondbacks',  abbr: 'ARI', color: '#A71930' },
  110: { id: 110, name: 'Orioles',   fullName: 'Baltimore Orioles',     abbr: 'BAL', color: '#DF4601' },
  111: { id: 111, name: 'Red Sox',   fullName: 'Boston Red Sox',        abbr: 'BOS', color: '#BD3039' },
  112: { id: 112, name: 'Cubs',      fullName: 'Chicago Cubs',          abbr: 'CHC', color: '#0E3386', colorDark: '#CC3433' },
  113: { id: 113, name: 'Reds',      fullName: 'Cincinnati Reds',       abbr: 'CIN', color: '#C6011F' },
  114: { id: 114, name: 'Guardians', fullName: 'Cleveland Guardians',   abbr: 'CLE', color: '#E31937' },
  115: { id: 115, name: 'Rockies',   fullName: 'Colorado Rockies',      abbr: 'COL', color: '#8B5EA5' },
  116: { id: 116, name: 'Tigers',    fullName: 'Detroit Tigers',        abbr: 'DET', color: '#FA4616' },
  117: { id: 117, name: 'Astros',    fullName: 'Houston Astros',        abbr: 'HOU', color: '#EB6E1F' },
  118: { id: 118, name: 'Royals',    fullName: 'Kansas City Royals',    abbr: 'KC',  color: '#004687', colorDark: '#BD9B60' },
  119: { id: 119, name: 'Dodgers',   fullName: 'Los Angeles Dodgers',   abbr: 'LAD', color: '#005A9C' },
  120: { id: 120, name: 'Nationals', fullName: 'Washington Nationals',  abbr: 'WSH', color: '#AB0003' },
  121: { id: 121, name: 'Mets',      fullName: 'New York Mets',         abbr: 'NYM', color: '#002D72', colorDark: '#FF5910' },
  133: { id: 133, name: 'Athletics', fullName: 'Oakland Athletics',     abbr: 'OAK', color: '#EFB21E' },
  134: { id: 134, name: 'Pirates',   fullName: 'Pittsburgh Pirates',    abbr: 'PIT', color: '#FDB827' },
  135: { id: 135, name: 'Padres',    fullName: 'San Diego Padres',      abbr: 'SD',  color: '#2F241D', colorDark: '#FFC425' },
  136: { id: 136, name: 'Mariners',  fullName: 'Seattle Mariners',      abbr: 'SEA', color: '#0C2C56', colorDark: '#005C5C' },
  137: { id: 137, name: 'Giants',    fullName: 'San Francisco Giants',  abbr: 'SF',  color: '#FD5A1E' },
  138: { id: 138, name: 'Cardinals', fullName: 'St. Louis Cardinals',   abbr: 'STL', color: '#C41E3A' },
  139: { id: 139, name: 'Rays',      fullName: 'Tampa Bay Rays',        abbr: 'TB',  color: '#8FBCE6' },
  140: { id: 140, name: 'Rangers',   fullName: 'Texas Rangers',         abbr: 'TEX', color: '#C0111F' },
  141: { id: 141, name: 'Blue Jays', fullName: 'Toronto Blue Jays',     abbr: 'TOR', color: '#134A8E' },
  142: { id: 142, name: 'Twins',     fullName: 'Minnesota Twins',       abbr: 'MIN', color: '#D31145' },
  143: { id: 143, name: 'Phillies',  fullName: 'Philadelphia Phillies', abbr: 'PHI', color: '#E81828' },
  144: { id: 144, name: 'Braves',    fullName: 'Atlanta Braves',        abbr: 'ATL', color: '#CE1141' },
  145: { id: 145, name: 'White Sox', fullName: 'Chicago White Sox',     abbr: 'CWS', color: '#27251F', colorDark: '#C4CED4' },
  146: { id: 146, name: 'Marlins',   fullName: 'Miami Marlins',         abbr: 'MIA', color: '#00A3E0' },
  147: { id: 147, name: 'Yankees',   fullName: 'New York Yankees',      abbr: 'NYY', color: '#003087', colorDark: '#C4CED3' },
  158: { id: 158, name: 'Brewers',   fullName: 'Milwaukee Brewers',     abbr: 'MIL', color: '#FFC52F' },
};
