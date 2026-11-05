// ── Team data ─────────────────────────────────────────────────────
// MLB team id → id, nickname, full name, abbreviation, city, division,
// brand color, and slug for /team/[slug]/ pages.
export const TEAM_CONFIG = {
  108: { id: 108, name: 'Angels',    fullName: 'Los Angeles Angels',    abbr: 'LAA', city: 'Los Angeles',   div: 'AL West',    color: '#BA0021', slug: 'angels'    },
  109: { id: 109, name: 'D-backs',   fullName: 'Arizona Diamondbacks',  abbr: 'AZ',  city: 'Arizona',       div: 'NL West',    color: '#A71930', slug: 'd-backs'   },
  110: { id: 110, name: 'Orioles',   fullName: 'Baltimore Orioles',     abbr: 'BAL', city: 'Baltimore',     div: 'AL East',    color: '#DF4601', slug: 'orioles'   },
  111: { id: 111, name: 'Red Sox',   fullName: 'Boston Red Sox',        abbr: 'BOS', city: 'Boston',        div: 'AL East',    color: '#BD3039', slug: 'red-sox'   },
  112: { id: 112, name: 'Cubs',      fullName: 'Chicago Cubs',          abbr: 'CHC', city: 'Chicago',       div: 'NL Central', color: '#0E3386', colorDark: '#CC3433', slug: 'cubs' },
  113: { id: 113, name: 'Reds',      fullName: 'Cincinnati Reds',       abbr: 'CIN', city: 'Cincinnati',    div: 'NL Central', color: '#C6011F', slug: 'reds'      },
  114: { id: 114, name: 'Guardians', fullName: 'Cleveland Guardians',   abbr: 'CLE', city: 'Cleveland',     div: 'AL Central', color: '#E31937', slug: 'guardians' },
  115: { id: 115, name: 'Rockies',   fullName: 'Colorado Rockies',      abbr: 'COL', city: 'Colorado',      div: 'NL West',    color: '#8B5EA5', slug: 'rockies'   },
  116: { id: 116, name: 'Tigers',    fullName: 'Detroit Tigers',        abbr: 'DET', city: 'Detroit',       div: 'AL Central', color: '#FA4616', slug: 'tigers'    },
  117: { id: 117, name: 'Astros',    fullName: 'Houston Astros',        abbr: 'HOU', city: 'Houston',       div: 'AL West',    color: '#EB6E1F', slug: 'astros'    },
  118: { id: 118, name: 'Royals',    fullName: 'Kansas City Royals',    abbr: 'KC',  city: 'Kansas City',   div: 'AL Central', color: '#004687', colorDark: '#BD9B60', slug: 'royals' },
  119: { id: 119, name: 'Dodgers',   fullName: 'Los Angeles Dodgers',   abbr: 'LAD', city: 'Los Angeles',   div: 'NL West',    color: '#005A9C', slug: 'dodgers'   },
  120: { id: 120, name: 'Nationals', fullName: 'Washington Nationals',  abbr: 'WSH', city: 'Washington',    div: 'NL East',    color: '#AB0003', slug: 'nationals' },
  121: { id: 121, name: 'Mets',      fullName: 'New York Mets',         abbr: 'NYM', city: 'New York',      div: 'NL East',    color: '#002D72', colorDark: '#FF5910', slug: 'mets' },
  133: { id: 133, name: 'Athletics', fullName: 'Athletics',             abbr: 'ATH', city: 'Sacramento',    div: 'AL West',    color: '#EFB21E', slug: 'athletics' },
  134: { id: 134, name: 'Pirates',   fullName: 'Pittsburgh Pirates',    abbr: 'PIT', city: 'Pittsburgh',    div: 'NL Central', color: '#FDB827', slug: 'pirates'   },
  135: { id: 135, name: 'Padres',    fullName: 'San Diego Padres',      abbr: 'SD',  city: 'San Diego',     div: 'NL West',    color: '#2F241D', colorDark: '#FFC425', slug: 'padres' },
  136: { id: 136, name: 'Mariners',  fullName: 'Seattle Mariners',      abbr: 'SEA', city: 'Seattle',       div: 'AL West',    color: '#0C2C56', colorDark: '#005C5C', slug: 'mariners' },
  137: { id: 137, name: 'Giants',    fullName: 'San Francisco Giants',  abbr: 'SF',  city: 'San Francisco', div: 'NL West',    color: '#FD5A1E', slug: 'giants'    },
  138: { id: 138, name: 'Cardinals', fullName: 'St. Louis Cardinals',   abbr: 'STL', city: 'St. Louis',     div: 'NL Central', color: '#C41E3A', slug: 'cardinals' },
  139: { id: 139, name: 'Rays',      fullName: 'Tampa Bay Rays',        abbr: 'TB',  city: 'Tampa Bay',     div: 'AL East',    color: '#8FBCE6', slug: 'rays'      },
  140: { id: 140, name: 'Rangers',   fullName: 'Texas Rangers',         abbr: 'TEX', city: 'Texas',         div: 'AL West',    color: '#C0111F', slug: 'rangers'   },
  141: { id: 141, name: 'Blue Jays', fullName: 'Toronto Blue Jays',     abbr: 'TOR', city: 'Toronto',       div: 'AL East',    color: '#134A8E', slug: 'blue-jays' },
  142: { id: 142, name: 'Twins',     fullName: 'Minnesota Twins',       abbr: 'MIN', city: 'Minnesota',     div: 'AL Central', color: '#D31145', slug: 'twins'     },
  143: { id: 143, name: 'Phillies',  fullName: 'Philadelphia Phillies', abbr: 'PHI', city: 'Philadelphia',  div: 'NL East',    color: '#E81828', slug: 'phillies'  },
  144: { id: 144, name: 'Braves',    fullName: 'Atlanta Braves',        abbr: 'ATL', city: 'Atlanta',       div: 'NL East',    color: '#CE1141', slug: 'braves'    },
  145: { id: 145, name: 'White Sox', fullName: 'Chicago White Sox',     abbr: 'CWS', city: 'Chicago',       div: 'AL Central', color: '#27251F', colorDark: '#C4CED4', slug: 'white-sox' },
  146: { id: 146, name: 'Marlins',   fullName: 'Miami Marlins',         abbr: 'MIA', city: 'Miami',         div: 'NL East',    color: '#00A3E0', slug: 'marlins'   },
  147: { id: 147, name: 'Yankees',   fullName: 'New York Yankees',      abbr: 'NYY', city: 'New York',      div: 'AL East',    color: '#003087', colorDark: '#C4CED3', slug: 'yankees' },
  158: { id: 158, name: 'Brewers',   fullName: 'Milwaukee Brewers',     abbr: 'MIL', city: 'Milwaukee',     div: 'NL Central', color: '#FFC52F', slug: 'brewers'   },
};

// slug → mlb team id (for [slug].astro to look up teams)
export const SLUG_TO_ID = Object.fromEntries(
  Object.values(TEAM_CONFIG).map(t => [t.slug, t.id])
);

// Division order for display
export const DIVISIONS = ['AL East', 'AL Central', 'AL West', 'NL East', 'NL Central', 'NL West'];

export const LEGACY_ABBR = { ARI: 109, OAK: 133 };
