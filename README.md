# Yard Report

A multi-team MLB fan dashboard built with [Astro](https://astro.build). Pick any of 30 teams from the header and every widget — news feed, scores, standings, roster, walkup songs — updates to match. Orioles-first editorial defaults, but fully functional for any franchise.

Live at **[briancsmith.org/fanbase](https://www.briancsmith.org/fanbase)**

## Features

### Team Picker
- Choose any of 30 MLB teams from the header; selection persists in `localStorage`
- CSS accent color shifts to the team's brand color site-wide
- All data sources (news, scores, roster, schedule, leaders, transactions, injury report) dynamically reflect the chosen team

### News Feed
- Aggregates team-specific and MLB-wide reporting from 13+ RSS sources
- Feed list adapts to active team: team-specific sources swap to the chosen team's MLB.com feed
- Grid, list, and compact article views
- Category, source, search, sort, and date-range filters
- Around the Horn featured story cards with a dedicated `/around-the-horn/` page
- Reader overlay for in-app reading without leaving the dashboard
- Read/unread tracking with swipe gestures on mobile
- Per-source on/off toggle in settings

### Scores
- Yesterday, today, and tomorrow score chips with preview, live, and final states
- Active team's games sorted to the front of the bar
- Score chip popovers with:
  - Live lineup with walk-up song links (fetched from `mlb.com/{team}/ballpark/music`)
  - Scout notes: pitch mix, live walk-up queue, matchup context, pitcher vs. team splits
  - Pitch arsenal with velocity breakdown
  - Box score tab with full pitching lines
  - Weather for preview games
- Rain delay and postponed states

### Schedule
- Full-season schedule page at `/schedule/`
- Month and week calendar views with game results, series grouping, homestand/road trip context, probable pitchers, broadcast info, and weather for upcoming games

### Sidebar Widgets
- **On Deck** — next game with weather forecast and 7-day schedule strip
- **Standings** — active team's division highlighted; tab through all six divisions
- **Yard Leaders** — team, AL, NL, MLB, and ROY leaderboards
- **40-Man Roster** — active team's full roster with positions and player profile links
- **Injury Report** — active team's IL and day-to-day list
- **Transactions** — active team's season transactions
- **Contracts** — links to FanGraphs and Spotrac payroll pages for the active team
- **Podcast** — latest Baseball Tonight with Buster Olney episode
- **Video** — MLB Fastcast, Top Plays, and team-specific game recaps and highlights

### Theming & Polish
- Dark, light, system, and City Connect themes
- City Connect theme auto-applied on Fridays (Orioles edition easter egg)
- PWA-ready with apple-touch-icon support
- Easter eggs (Konami code, type "magic" in search, triple-click the theme toggle)

## Stack

| Layer | Tech |
|---|---|
| Framework | [Astro](https://astro.build) 6 (static output) |
| Client JS | Vanilla ES modules, no runtime framework |
| Scores & roster | [MLB Stats API](https://statsapi.mlb.com/api/v1) |
| Weather | [Open-Meteo](https://open-meteo.com) |
| Feed aggregation | PHP RSS proxy (`public/rss-proxy.php`) |
| Hosting | cPanel shared host |
| CI/Deploy | GitHub Actions → FTP to `public_html/fanbase/` |

## Project Structure

```
src/
  pages/
    index.astro          # Main dashboard
    schedule/index.astro # Full-season schedule
    around-the-horn/     # Featured story page
  scripts/
    app.js               # Init, settings, event wiring
    config.js            # Team IDs, slugs, API constants, getActiveTeamId()
    teamConfig.js        # All 30 teams with display name and brand color
    teamPicker.js        # Header team-picker button and modal
    scores.js            # Score chips, popovers, box score, scout notes
    sidebars.js          # All sidebar widgets (standings, roster, leaders…)
    feeds.js             # Feed fetching, filtering, rendering, article reader
    walkup-songs.js      # Per-team walkup song cache (mlb.com/{team}/ballpark/music)
    weather.js           # Open-Meteo integration
    theme.js             # Theme application and persistence
    storage.js           # localStorage helpers (prefs, read articles, disabled sources)
    state.js             # Shared UI state
    utils.js             # DOM helpers, text cleaning, logo helpers
    easter-eggs.js       # Magic win animation, Konami code, City Connect banner
  layouts/
    Layout.astro         # HTML shell, CSS link, meta tags
public/
  style.css              # All styles (single flat file, ~3500 lines)
  feeds.json             # Feed source registry with teamId tags
  rss-proxy.php          # Server-side RSS fetcher / CORS proxy
dist/                    # Built output — committed for cPanel deploy
```

## Development

```bash
npm install
npm run dev      # http://localhost:4321/fanbase/
npm run build    # Output to dist/
```

The dev server does not run PHP, so RSS feeds show as "Loading…" locally. Score, standings, and roster data fetches directly from the MLB Stats API and works in dev mode.

## Deployment

Two paths are configured:

**cPanel** (`.cpanel.yml`) — on push to `main`, cPanel copies `dist/` to `public_html/fanbase/`:
```yaml
- /bin/cp -rp dist/. /home/briancsm/public_html/fanbase/
```

**GitHub Actions** (`.github/workflows/deploy.yml`) — FTP deploy via lftp on push to `main`.

Always rebuild and commit `dist/` before pushing (`npm run build && git add dist/`).

## feeds.json Schema

| Field | Type | Meaning |
|---|---|---|
| `id` | string | Unique source key |
| `name` | string | Display name |
| `url` | string | RSS feed URL |
| `category` | `orioles` \| `mlb` \| `milb` | Article category tag |
| `teamId` | number | `0` = show for all teams; `110` = Orioles fans only |
| `teamFeed` | boolean | If `true`, URL is replaced with the active team's MLB.com RSS when team ≠ Orioles |

## Notes

- Walk-up song data is fetched live from `mlb.com/{team}/ballpark/music` with a 6-hour TTL per team. The Orioles fallback map in `walkup-songs.js` covers the case where the live page cannot be fetched.
- The City Connect theme and magic-win animation are intentionally Orioles-only easter eggs regardless of the active team selection.
- `TEAM_PAGE` (FanGraphs/Spotrac slugs) and `TEAM_SLUG` (MLB.com URL slugs) differ for some franchises — both maps live in `config.js`.
