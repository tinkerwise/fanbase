#!/usr/bin/env node
// Refreshes the API-derived fields in src/data/teams/*.json from the MLB Stats API:
// ballpark, eraRecord (last 8 seasons) and recentDraftClasses (last 5 drafts).
// Personnel (owner, brass) stays hand-curated in those files; update it and `asOf` by hand.
// Usage: npm run refresh-data [-- 2026]   (the argument is the latest completed season)
import { readFileSync, writeFileSync } from 'node:fs';

const MLB = 'https://statsapi.mlb.com/api/v1';
const SEASON = Number(process.argv[2]) || new Date().getFullYear();
const SEASONS_SHOWN = 8;
const DRAFTS_SHOWN = 5;
const PICKS_PER_DRAFT = 2;

const get = async url => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
};
const range = (from, n) => Array.from({ length: n }, (_, i) => from + i);
const ordinal = n => `${n}${['th', 'st', 'nd', 'rd'][n % 10 > 3 || (n % 100 >= 11 && n % 100 <= 13) ? 0 : n % 10]}`;

const { TEAM_CONFIG } = await import(new URL('../src/scripts/teamConfig.js', import.meta.url));

// Season → teamId → { w, l, pct, rank }
const standings = {};
for (const year of range(SEASON - SEASONS_SHOWN + 1, SEASONS_SHOWN)) {
  const data = await get(`${MLB}/standings?leagueId=103,104&season=${year}&standingsTypes=regularSeason`);
  standings[year] = {};
  for (const div of data.records) {
    for (const t of div.teamRecords) {
      standings[year][t.team.id] = { w: t.wins, l: t.losses, pct: t.winningPercentage, rank: Number(t.divisionRank) };
    }
  }
}

// Season → teamId → how that team's postseason ended
const postseason = {};
for (const year of Object.keys(standings)) {
  const data = await get(`${MLB}/schedule/postseason/series?season=${year}&sportId=1`);
  postseason[year] = {};
  for (const { games = [] } of data.series ?? []) {
    const finals = games.filter(g => g.status?.abstractGameState === 'Final' && g.status?.detailedState !== 'Postponed');
    const last = finals[finals.length - 1];
    if (!last) continue;
    const series = last.seriesDescription;
    for (const side of ['home', 'away']) {
      const won = !!last.teams[side].isWinner;
      const id = last.teams[side].team.id;
      if (series === 'World Series') postseason[year][id] = won ? 'Won World Series' : 'Lost World Series';
      else if (!won) postseason[year][id] = `Lost ${series}`;
    }
  }
}

const shortStatus = async personId => {
  const { people: [p] = [] } = await get(`${MLB}/people/${personId}?hydrate=currentTeam`);
  if (!p) return '';
  const team = p.currentTeam?.name;
  if (p.mlbDebutDate) return `MLB debut ${p.mlbDebutDate.slice(0, 4)}${team ? ` · ${team}` : ''}`;
  return team ? `Minors · ${team}` : 'Unsigned or inactive';
};

for (const team of Object.values(TEAM_CONFIG)) {
  const file = new URL(`../src/data/teams/${team.slug}.json`, import.meta.url);
  const json = JSON.parse(readFileSync(file, 'utf-8'));

  const { teams: [info] } = await get(`${MLB}/teams/${team.id}?season=${SEASON}`);
  json.ballpark = info.venue.name;

  json.eraRecord = Object.keys(standings).map(Number).sort().map(year => {
    const s = standings[year][team.id];
    return {
      year, w: s.w, l: s.l, pct: s.pct,
      finish: `${ordinal(s.rank)} ${team.div}`,
      note: postseason[year][team.id] ?? 'Missed postseason',
    };
  });

  json.recentDraftClasses = [];
  for (const year of range(SEASON - DRAFTS_SHOWN + 1, DRAFTS_SHOWN)) {
    const data = await get(`${MLB}/draft/${year}?teamId=${team.id}`);
    const picks = (data.drafts?.rounds ?? []).flatMap(r => r.picks ?? [])
      .filter(p => p.person)
      .sort((a, b) => a.pickNumber - b.pickNumber)
      .slice(0, PICKS_PER_DRAFT);
    json.recentDraftClasses.push({
      year,
      picks: await Promise.all(picks.map(async p => ({
        round: p.pickRound,
        overall: p.pickNumber,
        name: p.person.fullName,
        pos: p.person.primaryPosition?.abbreviation ?? '—',
        status: await shortStatus(p.person.id),
      }))),
    });
  }

  writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`);
  console.log(`${team.slug}: refreshed`);
}
