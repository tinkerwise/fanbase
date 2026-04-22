import { getActiveTeamId, MLB_API_BASE, SEASON } from './config.js';

async function loadScores() {
  const container = document.getElementById('scores-list');
  if (!container) return;

  const teamId = getActiveTeamId();

  try {
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    const startDate = new Date(today - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const url =
      `${MLB_API_BASE}/schedule?teamId=${teamId}&sportId=1` +
      `&startDate=${startDate}&endDate=${endDate}&hydrate=linescore,decisions`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();

    const games = (data.dates || []).flatMap(d => d.games || []).reverse();
    const finished = games.filter(g => {
      const state = g.status?.detailedState || '';
      return state === 'Final' || state === 'Game Over';
    });

    if (finished.length === 0) {
      container.innerHTML = '<p class="loading">No recent completed games.</p>';
      return;
    }

    container.innerHTML = finished.slice(0, 6).map(game => {
      const home = game.teams?.home;
      const away = game.teams?.away;
      const homeScore = home?.score ?? '–';
      const awayScore = away?.score ?? '–';
      const homeAbbrev = home?.team?.abbreviation || '?';
      const awayAbbrev = away?.team?.abbreviation || '?';
      const homeWin = home?.isWinner ? ' winner' : '';
      const awayWin = away?.isWinner ? ' winner' : '';
      return `
        <div class="score-row">
          <span class="team-abbrev${awayWin}">${awayAbbrev}</span>
          <span class="score${awayWin}">${awayScore}</span>
          <span class="vs">@</span>
          <span class="team-abbrev${homeWin}">${homeAbbrev}</span>
          <span class="score${homeWin}">${homeScore}</span>
        </div>`;
    }).join('');
  } catch {
    container.innerHTML = '<p class="error">Could not load scores.</p>';
  }
}

loadScores();
