// Team display color: readable on dark backgrounds; used as --orange CSS override.
export const TEAM_CONFIG = {
  108: { name: 'Angels',    fullName: 'Los Angeles Angels',       color: '#BA0021' },
  109: { name: 'D-backs',   fullName: 'Arizona Diamondbacks',     color: '#A71930' },
  110: { name: 'Orioles',   fullName: 'Baltimore Orioles',        color: '#DF4601' },
  111: { name: 'Red Sox',   fullName: 'Boston Red Sox',           color: '#BD3039' },
  112: { name: 'Cubs',      fullName: 'Chicago Cubs',             color: '#0E3386' },
  113: { name: 'Reds',      fullName: 'Cincinnati Reds',          color: '#C6011F' },
  114: { name: 'Guardians', fullName: 'Cleveland Guardians',      color: '#E31937' },
  115: { name: 'Rockies',   fullName: 'Colorado Rockies',         color: '#8B5EA5' },
  116: { name: 'Tigers',    fullName: 'Detroit Tigers',           color: '#FA4616' },
  117: { name: 'Astros',    fullName: 'Houston Astros',           color: '#EB6E1F' },
  118: { name: 'Royals',    fullName: 'Kansas City Royals',       color: '#004687' },
  119: { name: 'Dodgers',   fullName: 'Los Angeles Dodgers',      color: '#005A9C' },
  120: { name: 'Nationals', fullName: 'Washington Nationals',     color: '#AB0003' },
  121: { name: 'Mets',      fullName: 'New York Mets',            color: '#002D72' },
  133: { name: 'Athletics', fullName: 'Oakland Athletics',        color: '#EFB21E' },
  134: { name: 'Pirates',   fullName: 'Pittsburgh Pirates',       color: '#FDB827' },
  135: { name: 'Padres',    fullName: 'San Diego Padres',         color: '#2F241D' },
  136: { name: 'Mariners',  fullName: 'Seattle Mariners',         color: '#0C2C56' },
  137: { name: 'Giants',    fullName: 'San Francisco Giants',     color: '#FD5A1E' },
  138: { name: 'Cardinals', fullName: 'St. Louis Cardinals',      color: '#C41E3A' },
  139: { name: 'Rays',      fullName: 'Tampa Bay Rays',           color: '#8FBCE6' },
  140: { name: 'Rangers',   fullName: 'Texas Rangers',            color: '#C0111F' },
  141: { name: 'Blue Jays', fullName: 'Toronto Blue Jays',        color: '#134A8E' },
  142: { name: 'Twins',     fullName: 'Minnesota Twins',          color: '#D31145' },
  143: { name: 'Phillies',  fullName: 'Philadelphia Phillies',    color: '#E81828' },
  144: { name: 'Braves',    fullName: 'Atlanta Braves',           color: '#CE1141' },
  145: { name: 'White Sox', fullName: 'Chicago White Sox',        color: '#27251F' },
  146: { name: 'Marlins',   fullName: 'Miami Marlins',            color: '#00A3E0' },
  147: { name: 'Yankees',   fullName: 'New York Yankees',         color: '#003087' },
  158: { name: 'Brewers',   fullName: 'Milwaukee Brewers',        color: '#FFC52F' },
};

export function getTeamConfig(id) {
  return TEAM_CONFIG[id] ?? TEAM_CONFIG[110];
}
