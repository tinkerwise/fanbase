# Fanbase audit — 2026-10-24

Think → Make → Improve pass over the whole site on branch `audit/tmi`
(off `main` at `7a15cd6`). 14 commits, nothing merged or deployed.

**Before deploying, read [Deploy checklist](#deploy-checklist).** Two PHP
files and `.htaccess` changed and could not be executed locally (no PHP on
this machine; the origin server type is hidden behind Caddy/BitNinja).

---

## Security

Severity is for the code as it was on `main`. Status is for this branch.

### Critical

**C1. `rss-proxy.php?format=audio` was a same-origin XSS on www.briancsmith.org** — fixed `58d874d`
The audio branch echoed upstream bytes with the upstream `Content-Type` and
no `nosniff`. Any allowlisted host returning `text/html` — directly, via
user content on an allowlisted platform (`substack.com` was on the list), or
via an open redirect on any of 23 allowlisted domains, since redirects were
followed unchecked — executed script on `www.briancsmith.org`. That origin
is shared with Tailgate and Yard Report, so their localStorage was in scope too.
Nothing in the client used `format=audio`. Removed.

### High

**H1. SSRF through redirects in `rss-proxy.php`** — fixed `58d874d`
`follow_location: 1` with the allowlist checked only on the first URL. Now:
manual redirect handling (max 3 hops), every hop re-checked, `http(s)` only,
no userinfo, 5 MB cap, `LIBXML_NONET`.

**H2. DOM XSS: podcast enclosure** — fixed `8ad730e`
`sidebars.js` put the RSS enclosure `url`/`type` into
`<source src="${audioUrl}" type="${audioType}">` unescaped.

**H3. DOM XSS: YouTube video id** — fixed `8ad730e`
`extractVideoId` accepted `[^&]+`; the id was escaped into `data-video-id`,
read back *unescaped* via `dataset`, and interpolated into an `innerHTML`
`<iframe src>`. Now validated against `^[\w-]{11}$` at extraction and at the
sink, in one shared module (`videoTheater.js`, replacing copies in
`sidebars.js` and `postseason.js`).

**H4. Shared origin across three apps** — open
Fanbase, Tailgate and Yard Report all live on `www.briancsmith.org` under
different paths. Any XSS in one of them owns the others' localStorage
(`fb_*`, `tg_*`, `yr_*`) and can call the others' same-origin PHP endpoints.
Path-scoped cookies don't help against script. Fix: serve each app from its
own subdomain (`fanbase.briancsmith.org`). This is the single highest-value
structural change left.

### Medium

**M1. `javascript:` links from feeds** — fixed `8ad730e`, `e93a669`
Feed `link`s went into `href`, `window.open` and the reader `<base href>`
unchecked. New `safeUrl()` (http/https only) at every sink; the proxy also
drops non-http(s) `link`/`thumbnail`/`audioUrl`.

**M2. `esc()` didn't escape `'`** — fixed `8ad730e`
No exploitable single-quoted sink found, but any future `attr='${esc(x)}'`
would have been.

**M3. Open CORS proxy** — fixed `58d874d`
`Access-Control-Allow-Origin: *` let any site use the proxy (bandwidth, and
with C1/H1, an attack primitive). The site calls it same-origin; removed.

**M4. Dev proxy readable by any website while `npm run dev` runs** — fixed `58d874d`
The Vite middleware in `astro.config.mjs` had no allowlist and sent
`Access-Control-Allow-Origin: *`: any page open in the browser could read
arbitrary URLs (LAN included) through `localhost:4321`. Now http(s) only, no
CORS header.

**M5. No security headers at all** — fixed `d56eb8f` (partially)
Static files now get `nosniff`, `X-Frame-Options: SAMEORIGIN`,
`Referrer-Policy`, `Permissions-Policy` and a minimal CSP
(`frame-ancestors 'self'; object-src 'none'; form-action 'self'`).
**Open:** no `script-src`. Templates use inline handlers (`onerror=`,
a 600-character `onclick=` on the share button, etc.) and Layout uses
`define:vars` inline scripts, so a real script CSP needs those moved to
event delegation plus hashes for the two inline scripts. Do that and add
`script-src 'self' 'sha256-…'`. HSTS belongs at the Caddy layer for the
whole domain.

**M6. Proxy allowlist far wider than needed** — fixed `e93a669`
23 domains, including `substack.com` (anyone can publish). Cut to the 13
hosts the site actually fetches.

### Low

**L1. Cross-site feedback spam** — fixed `dab9f4f`
`feedback.php` parsed any body as JSON regardless of `Content-Type`, so a
cross-site `text/plain` form post (no preflight) could add entries. Now
requires `application/json`.

**L2. Reader view sanitizer is regex-based** — open, mitigated
`sanitizeHtml()` is trivially bypassable (unquoted `onerror=x`, `<svg>`,
entity-encoded `javascript:`). It's safe today only because `#readerFrame`
is `sandbox="allow-same-origin allow-popups allow-forms"` without
`allow-scripts`. Never add `allow-scripts`. Better: drop `allow-same-origin`
too (nothing needs it) or sanitize with DOMParser + an element/attribute
allowlist.

**L3. Predictable IP-hash salt in `feedback.php` / `feedback-admin.php`** — open
`hash('sha256', IP . __FILE__)`: the salt is the file path, so hashes are
brute-forceable over IPv4. They only name temp files for rate limiting, but
use a random secret stored in `feedback-data/`.

**L4. Third-party data flows** — open, informational
No personal data or preferences leave the site; feedback stays on the host.
Outbound: Google favicon service receives every article's hostname
(`google.com/s2/favicons`); YouTube embeds use `youtube.com` (cookies) —
switch to `youtube-nocookie.com`; podcast audio goes through Podtrac (a
listener-tracking redirect, from ESPN's feed); Open-Meteo gets ballpark
coordinates only.

**L5. No rate limiting on the proxy** — open, mitigated
The new 15-minute server cache bounds upstream amplification. A per-IP limit
like feedback.php's would bound bandwidth too.

### Checked and fine

- No secrets in the repo or its history. FTP credentials come from the
  Keychain or a gitignored `.env`; passwords reach `lftp`/`node` via env.
- `feedback-admin.php`: PBKDF2-SHA256 210k, `hash_equals`, 5 tries/15 min,
  `session_regenerate_id`, `HttpOnly` + `SameSite=Strict` + `Secure`, strict
  CSP, `X-Frame-Options: DENY`. `feedback-data/` returns 403 (verified live).
- `decodeHtmlEntities` uses a `<textarea>` (RCDATA) — no script execution.
  Walk-up page scraping uses `DOMParser`.
- URL params (`?team`, `?view`, `?player`, `?topic`) are mapped to known
  ids or used as lookup keys/`textContent`; none are reflected as HTML.

---

## Performance

Measured on live Home (Orioles, cold sessionStorage) before changes:
CLS **0.185**, 59 requests, 258 KB transferred, **19 proxy calls** (median
335 ms, slowest 952 ms), 11 Stats API calls.

| Issue | Status |
|---|---|
| **Proxy had no server-side cache**: every visitor triggered ~19 upstream fetches (up to 10 s each) before news rendered; Trades, Draft and Postseason each re-fetch every one of the team's feeds again | Fixed `58d874d`: temp-dir cache, 15 min (24 h for og:image), stale copy served when upstream fails |
| **`logo.png` 545×383 / 369 KB** shown 62 px tall on every page | Fixed `01229ba`: 176×123 / 50 KB (−86%). WebP would roughly halve it again; no encoder on this machine |
| **CLS 0.185**: footer pushed down as sections filled; header grew when JS injected the search button; logo had no intrinsic width | Fixed `01229ba`: CLS **0.057** on the dev build. Remaining 0.051 is the scores bar growing when scores arrive: reserve `--scores-h` |
| **HTML had no `Cache-Control`**: browsers cached heuristically, so a stale page could request bundles a deploy's `mirror --delete` had removed (and the catch-all answered with `index.html`) | Fixed `d56eb8f`: HTML `no-cache` |
| Hashed bundles had no cache header | Fixed `d56eb8f`: `max-age=31536000, immutable` via `assets/.htaccess` |
| 5-minute refresh ran in background tabs | Fixed `01229ba`: visible only, catches up on return |
| Around the Horn stored every article's full HTML in sessionStorage (never shown; quota risk, failures swallowed) | Fixed `f89e60a` |
| **19 proxy round trips per Home load** even when cached | Open. Add `feeds.php` that returns all of a team's sources merged and cached: one request instead of 14+ |
| Fonts are TTF (Playball 142 KB raw) | Open. Subset to Latin and ship WOFF2 |
| Player index for search (190 KB) re-downloads on every page | Open. Cache in sessionStorage keyed by day |
| `og:image` lookups: one proxy request per thumbnail-less story on Draft/Postseason/Trades | Mitigated by the 24 h server cache |
| `style.css` is one 148 KB file (28 KB Brotli) for every page | Acceptable. Split per page only if LCP becomes a problem |

---

## Code quality

| Issue | Status |
|---|---|
| Step 6 shipped four pages and the nav with **no CSS** (fixed earlier today, `7a15cd6`). The step 6 port renamed classes (`dc-`→`depth-chart-`, …) without porting rules, and nothing caught it | Smoke only greps for ids. Add a check that every class used in `src/pages` exists in `style.css` (the script used for this audit is ~30 lines) |
| `extractVideoId` / video theater duplicated in two files | Fixed `8ad730e` (`videoTheater.js`) |
| Around the Horn redefined `esc`, `faviconUrl`, `relativeDate` | Fixed `f961e91` |
| `config.js` kept its own copy of all 30 abbreviations | Fixed `2ca1e87` (derived from `teamConfig.js`) |
| **Wrong team data**: "Oakland Athletics"/OAK (now Athletics/ATH, Sacramento), Arizona ARI (now AZ) | Fixed `2ca1e87`. Old `?team=oak`/`ari` links still work |
| 45 unused CSS classes (53 rules), `global.css` (never linked), 6 unused exports plus a dead helper, 11 of 13 `mlbApi.js` wrappers unused, `.astro/` tracked | Fixed `2f5cc01` |
| **`config.js` vs `teamConfig.js` vs `teamPicker.js`**: `TEAM_SLUG`, `TEAM_PAGE`, `DIVISION_NAMES` are still parallel id-keyed maps beside `TEAM_CONFIG`; `teamPicker.js` has its own `logoUrl` instead of `teamLogoSrc` | Open. Fold `slug`/`page` into each `TEAM_CONFIG` entry, delete the maps |
| **Stats API URLs built inline in 8 files** (33 call sites); `mlbApi.js` was a half-finished abstraction claiming to centralize them | Open. Either finish it (one wrapper per endpoint, with the caching scores.js does ad hoc) or stop pretending; it's now honest about the state |
| `scores.js` 1,237 lines, `postseason.js` 982, `sidebars.js` 979: fetch, state and rendering interleaved | Open. Split render from data |
| Inline event-handler attributes in template strings | Open. Blocks a script CSP (M5); move to delegated listeners |
| "Orioles" naming means "your team" (`isOrioles`, `'orioles'` category/variant, `leadersScope = 'orioles'`, `orioles-row`) | Open. Rename; it's misleading now that 30 teams are supported |
| **Spotrac payroll link** slug comes from `TEAM_PAGE` (`redsox`) through a camel-case regex that can never match (all lowercase). Spotrac's URLs use full names (`boston-red-sox`) | Open, **unverified** (Spotrac blocks automated checks). Click it for two teams |
| `dist/` is committed: every commit carries hashed-bundle churn, and `deploy.sh` rebuilds anyway | Open. Untrack `dist/`, add to `.gitignore` |
| No tests beyond smoke greps | Open. `node:test` for `esc`, `safeUrl`, `extractVideoId`, `teamIdFromParam`, `resolveFeedSources` |
| JSON files: `draft-picks.json` 14 KB, `trades.json` 1.2 KB, `postseason.json` 0.4 KB | Not oversized. They are hand-maintained and season-bound (`lastUpdated` July/September); they need a refresh process |

---

## Features: merge, remove, fix

| Finding | Recommendation |
|---|---|
| **The Athletic feed never loaded** (domain not allowlisted; URL now 404s) | Fixed `e93a669` (new nytimes.com/athletic feed) |
| **MLB.com news never loaded**: mlb.com returns 403 to every request from the web host's IP (found with the proxy's new upstream diagnostics, `3124300`). Each team's MLB.com feed and the league MLB.com feed were blank | Fixed `f3dd07f`: MLB's content API (`dapi.cms.mlbinfra.com`, selections `t<teamId>-news-list` / `mlb-news-list`) sends CORS headers, so the browser reads it directly: per-team, current, with thumbnails. Duplicate stories across sources are dropped |
| **Walk-up songs can't scrape mlb.com** (same 403 on `/<team>/ballpark/music`) | Open. Falls back to `walkup-data.json`; refresh that file from a machine mlb.com doesn't block |
| **"Orioles Moments" playlist shown to every team's fans** | Fixed `2ca1e87` |
| **Around the Horn had no site header** | Fixed `86b238d` |
| **Home standings always opened on the AL East**, whatever your team | Fixed `d6a3852` |
| **Around the Horn links aren't shareable**: the bundle lives in the clicking tab's sessionStorage, so a shared or bookmarked link always shows "Story bundle unavailable" | Merge it into Home as a drawer, or rebuild the bundle from feeds by slug |
| **Settings only exist on Home** (the gear is in `index.astro`'s header) | Move Settings into `Layout.astro` |
| **Two searches**: Home's news filter box and the new site search | Add "Search news for …" to site search, handing off to Home's filter |
| **Player links are inconsistent**: Depth Chart → Baseball Savant, scores/popovers → mlb.com, Trades → a player card | Pick one destination, ideally a player page (see below) |
| **Seasonal pages always in nav** (Trades: deadline in Aug; Draft: July; Postseason: Oct) regardless of season or whether your team is alive | Order nav by season, add a "Live" pill, demote out-of-season pages |
| **Non-Orioles fans get thin news**: 6 of 14 sources are Orioles-only; other teams get their mlb.com and MLBTR feeds plus 7 national sources | Add SB Nation / local sources per team in `feeds.json` |
| **Onboarding says "Add to Home Screen" but there's no web app manifest**: no name, icons or `display: standalone` | Add `manifest.webmanifest` + 192/512 icons (quick win) |

---

## Fixed

All on `audit/tmi`, each passing `npm run build` + `npm run smoke`, pages
regression-checked in the browser (dev build: all 8 pages load with no
errors, nothing stuck loading).

| Commit | What |
|---|---|
| `58d874d` | Proxy: drop `format=audio` (C1), manual redirects with allowlist per hop (H1), http(s) only, 5 MB cap, nosniff, no CORS (M3), `LIBXML_NONET`, http(s)-only item URLs, server-side cache; dev proxy hardened (M4) |
| `8ad730e` | XSS: podcast enclosure (H2), video ids + shared `videoTheater.js` (H3), `safeUrl()` at link sinks (M1), `esc()` escapes `'` (M2) |
| `d56eb8f` | `.htaccess`: real 404 page, HTML `no-cache`, immutable hashed assets, security headers (M5); smoke checks 404/.htaccess |
| `01229ba` | Logo 369→50 KB, CLS fixes, visible-only polling |
| `2ca1e87` | Athletics/Arizona data + legacy aliases, single abbreviation table, Orioles-only playlist |
| `dab9f4f` | `feedback.php` JSON-only (L1) |
| `872e1ac` | Fix for a regression `01229ba` introduced (`const refresh` shadowed `refresh()` → TDZ error, Home didn't load). Caught in the browser before pushing |
| `2f5cc01` | Dead CSS/JS, `global.css`, `mlbApi.js` trim, untrack `.astro/` |
| `f961e91` | Around the Horn uses shared utils |
| `86b238d` | Around the Horn gets the site header |
| `e93a669` | The Athletic feed restored; allowlist 23→13 domains (M6) |
| `f89e60a` | Around the Horn stops storing full article HTML |
| `d6a3852` | Home standings open on your team's division (was always AL East) |

---

## Recommended features (ranked)

Impact × effort for a multi-team fan site on static hosting + PHP.

| # | Feature | Impact | Effort | Notes |
|---|---|---|---|---|
| 1 | **Web app manifest + icons** | High | XS | Onboarding already tells people to add it to their Home Screen. Standalone display, team-colored `theme_color` via the head script |
| 2 | **Aggregated `feeds.php`** | High | S | One cached request instead of one per source (14 for the Orioles); also lets Trades/Draft/Postseason reuse the same payload instead of refetching every feed |
| 3 | **Per-team news sources** | High | S | Data entry in `feeds.json` (SB Nation + one local outlet per team). Biggest quality gap for the 29 non-Orioles teams |
| 4 | **Standings page** | High | S | Home has per-division tabs only. Add a full page: AL/NL, wild card race, magic/elimination numbers, last-10, run differential; `fetchStandings` already exists |
| 5 | **Player page** | High | M | One destination for every player link (search, depth chart, box scores, trades): bio, season line, splits, game log, Savant/contract links. Reuse the Trades player card |
| 6 | **Schedule `.ics` export** | Medium | XS | Generate client-side from the schedule already loaded; "Add to calendar" per game or full season |
| 7 | **Share cards** | Medium | M | `?team=` links preview as generic Fanbase. Static per-team pages (`/fanbase/t/bal/`) with team OG image/meta that redirect to `?team=bal`; 30 OG images generated at build |
| 8 | **Game-day mode** | Medium | M | When your team plays today, pin the live game (score, base/out state, lineups) at the top of Home; the data is already fetched for score chips |
| 9 | **Watch links** | Low–Med | XS | Per-game TV/radio/MLB.tv from `broadcasts` hydration. A "watch party" without accounts or a backend isn't worth building |
| 10 | **Push notifications** (game start, final, trades for your team) | Medium | L | Service worker, VAPID keys, subscription storage and a cron job on the PHP host. Do after #1, and only for 2–3 high-signal events |

---

## Deploy checklist

`rss-proxy.php`, `feedback.php` and `.htaccess` changed and were reviewed but
not executed (no local PHP). After `npm run deploy`:

1. `curl -sI https://www.briancsmith.org/fanbase/` → 200 with
   `x-content-type-options: nosniff` and `cache-control: no-cache`. A 500
   means the host rejected a `.htaccess` directive: revert `public/.htaccess`
   and redeploy.
2. `curl -s -o /dev/null -w '%{http_code}' https://www.briancsmith.org/fanbase/nope` → `404`.
3. Home: news, Around the Horn cards and videos load. Run the same proxy
   URL twice; the second should be fast (cache hit).
4. `curl -s 'https://www.briancsmith.org/fanbase/rss-proxy.php?url=https://www.mlb.com/orioles/feeds/news/rss.xml&format=audio'`
   → `{"error":"Unknown format"}`.
5. Send a feedback entry from the footer, then check it at
   `feedback-admin.php`.
6. `curl -sI https://www.briancsmith.org/fanbase/assets/<any bundle>.js` →
   `cache-control: public, max-age=31536000, immutable`.
7. Walk-up songs and the Draft/Postseason news thumbnails still appear
   (they use `format=text` and `format=og`).
