// ── Orioles player walkup songs ───────────────────────────────────
// Keyed by MLB Stats API player ID → Spotify track URL.
// To update: find the player's ID via the MLB Stats API roster endpoint,
// then add their current Spotify track URL below.
//
// MLB player IDs can be found at:
//   https://statsapi.mlb.com/api/v1/teams/110/roster?rosterType=active
// Spotify track URLs come from: https://open.spotify.com/track/{trackId}

export const WALKUP_SONGS = {
  // Gunnar Henderson — "The Sweet Escape" by Gwen Stefani ft. Akon
  683002: 'https://open.spotify.com/track/66ZcOcouenzZEnzTJvoFmH',

  // Adley Rutschman — "Alive (nightmare)" by Kid Cudi & Ratatat
  668939: 'https://open.spotify.com/track/5ig5qGllxwN8SgKWY9PKz2',

  // Jackson Holliday — "luther" by Kendrick Lamar & SZA
  683734: 'https://open.spotify.com/track/2CGNAOSuO1MEFCbBRgUzjd',

  // Ryan Mountcastle — "Dear Maria, Count Me In" by All Time Low
  669357: 'https://open.spotify.com/track/0JJP0IS4w0fJx01EcrfkDe',

  // Cedric Mullins — "Father Stretch My Hands Pt. 1" by Kanye West ft. Kid Cudi
  669134: 'https://open.spotify.com/track/73HXQvsyv3q5ZjX1wUmUaE',
};
