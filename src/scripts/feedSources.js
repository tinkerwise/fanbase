// ── Feed sources for the active team ──────────────────────────────
// public/feeds.json lists its team feeds (`teamFeed: true`) with Orioles
// URLs; this points them at the active team. Shared by the home feed and
// the pages that scan feeds for their own topics (trades, draft,
// postseason), so they all read the same sources.
//
// MLB.com blocks the web host's IP (every request from rss-proxy.php gets
// a 403), so its sources don't use RSS: `cms` names a selection in MLB's
// content API ('t110-news-list' is a team's news, 'mlb-news-list' the
// league's), which sends CORS headers and is read straight from the browser.
import { PROXY, TEAM_PAGE, TEAM_ABBREV, ORIOLES_ID, getActiveTeamId } from './config.js';
import { TEAM_CONFIG } from './teamConfig.js';

export function resolveFeedSources(feeds, teamId = getActiveTeamId()) {
  const teamPage = TEAM_PAGE[teamId] ?? TEAM_PAGE[ORIOLES_ID];
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
        // default: the team's MLB.com news
        return {
          ...f,
          url: `https://www.mlb.com/${teamPage}/news`,
          cms: `t${teamId}-news-list`,
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

const MLB_CMS = 'https://dapi.cms.mlbinfra.com/v2/content/en-us/selections';

async function fetchMlbCms(selection) {
  const data = await fetch(`${MLB_CMS}/${encodeURIComponent(selection)}`).then(r => r.json());
  return {
    items: (data.items ?? [])
      .filter(item => item.type === 'story' && item.slug)
      .sort((a, b) => (b.contentDate ?? '').localeCompare(a.contentDate ?? ''))
      .slice(0, 20)
      .map(item => ({
        title: item.headline || item.title || '',
        link: `https://www.mlb.com/news/${encodeURIComponent(item.slug)}`,
        pubDate: item.contentDate ?? '',
        description: item.summary ?? '',
        content: '',
        thumbnail: item.thumbnail?.templateUrl?.replace('{formatInstructions}', 't_16x9/t_w640')
          ?? item.thumbnail?.thumbnailUrl ?? null,
      })),
  };
}

/** A source's items, in rss-proxy.php's shape: { items: [{ title, link, pubDate, description, content, thumbnail }] } */
export function fetchFeedItems(source) {
  if (source.cms) return fetchMlbCms(source.cms);
  return fetch(`${PROXY}?url=${encodeURIComponent(source.url)}`).then(r => r.json());
}
