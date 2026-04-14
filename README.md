# Yard Report

A personal Orioles-first baseball dashboard built with [Astro](https://astro.build). Combines a filtered news feed, live score bugs, and compact Orioles-focused widgets in a single-page experience.

## Features

**News feed**
- Aggregates Orioles, MLB, and MiLB reporting from 13 RSS sources
- Grid, list, and compact article views with category, source, search, sort, and date-range filtering
- Around the Horn featured story cards with a dedicated story page
- Reader overlay for opening articles without leaving the dashboard
- Read/unread tracking with swipe gestures on mobile

**Scores**
- Yesterday, today, and tomorrow score bugs with preview, live, and final states
- Popovers with lineup, pitching, scout notes, pitch arsenal, and box score context
- Rain delay and postponed states

**Schedule**
- Full-season Orioles schedule page at `/schedule/`
- Month and week calendar views with game results, series grouping, homestand/road trip context, probable pitchers, broadcast info, and weather for upcoming games

**Sidebar widgets**
- On Deck: next Orioles game with weather forecast and schedule strip
- Standings, Yard Leaders, Roster, Injury Report, Transactions, Contracts
- Podcast: latest Baseball Tonight with Buster Olney episode
- Video: MLB Fastcast, Top Plays, Orioles Game Recaps, Orioles Moments

**Other**
- Dark, light, system, and City Connect themes (auto-applied on Fridays)
- PWA-ready with apple-touch-icon support
- Easter eggs

## Stack

- [Astro](https://astro.build) — static site framework
- Vanilla JS — client-side rendering, state, and data fetching
- [MLB Stats API](https://statsapi.mlb.com/api/v1) — scores, schedule, roster, leaders, pitching data
- [Open-Meteo](https://open-meteo.com) — weather forecasts
- PHP RSS proxy — feed aggregation for production

## Notes

This is a personal project maintained with an Orioles-first editorial bias. Maintainer workflow, deployment, source inventory, and development guidance are in `brief.txt`.
