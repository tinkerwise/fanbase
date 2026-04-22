import { ORIOLES_ID, MLB_API_BASE, SEASON } from './config.js';

async function loadStandings() {
  const container = document.getElementById('standings-list');
  if (!container) return;

  try {
    const url =
      `${MLB_API_BASE}/standings?leagueId=103,104&season=${SEASON}` +
      `&standingsTypes=regularSeason&hydrate=team`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();

    const records = data.records || [];
    const divisionRecord = records.find(r =>
      r.teamRecords?.some(tr => tr.team?.id === ORIOLES_ID)
    );

    if (!divisionRecord) {
      container.innerHTML = '<p class="loading">Standings unavailable.</p>';
      return;
    }

    container.innerHTML = divisionRecord.teamRecords
      .slice()
      .sort((a, b) => Number(a.divisionRank) - Number(b.divisionRank))
      .map(tr => {
        const isOurs = tr.team?.id === ORIOLES_ID;
        const cls = isOurs ? ' highlight' : '';
        return `
          <div class="standing-row${cls}">
            <span class="standing-rank">${tr.divisionRank}</span>
            <span class="standing-team">${tr.team?.abbreviation || '?'}</span>
            <span class="standing-record">${tr.wins}-${tr.losses}</span>
            <span class="standing-pct">${tr.winningPercentage || '.000'}</span>
          </div>`;
      }).join('');
  } catch {
    container.innerHTML = '<p class="error">Could not load standings.</p>';
  }
}

loadStandings();
