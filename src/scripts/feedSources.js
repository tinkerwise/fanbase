// ── Feed sources for the active team ──────────────────────────────
// public/feeds.json lists its team feeds (`teamFeed: true`) with Orioles
// URLs; this points them at the active team. Shared by the home feed and
// the pages that scan feeds for their own topics (trades, draft,
// postseason), so they all read the same sources.
import { TEAM_SLUG, TEAM_ABBREV, ORIOLES_ID, getActiveTeamId } from './config.js';
import { TEAM_CONFIG } from './teamConfig.js';

export function resolveFeedSources(feeds, teamId = getActiveTeamId()) {
  const teamSlug = TEAM_SLUG[teamId] ?? TEAM_SLUG[ORIOLES_ID];
  const teamName = TEAM_ABBREV[teamId] ? `${TEAM_ABBREV[teamId]} News` : 'Team News';

  return feeds
    .filter(f => f.teamId === 0 || f.teamFeed || f.teamId === teamId)
    .map(f => {
      if (f.teamFeed && teamId !== ORIOLES_ID) {
        if (f.teamFeedType === 'mlbtr') {
          const fullName = TEAM_CONFIG[teamId]?.fullName ?? '';
          const mlbtrSlug = fullName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          return {
            ...f,
            url: mlbtrSlug ? `https://www.mlbtraderumors.com/${mlbtrSlug}/feed` : f.url,
            name: `${TEAM_ABBREV[teamId] ?? 'Team'} – MLB Trade Rumors`,
          };
        }
        // default: mlbcom team news feed
        return {
          ...f,
          url: `https://www.mlb.com/${teamSlug}/feeds/news/rss.xml`,
          name: teamName,
        };
      }
      return f;
    });
}

export async function loadFeedSources() {
  const feeds = await fetch(`${import.meta.env.BASE_URL}feeds.json`).then(r => r.json());
  return resolveFeedSources(feeds);
}
