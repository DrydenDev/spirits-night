# Spirits Night

A static Spirit Island companion for choosing a spirit and adversary, then checking their abilities during game night. Browse the reference, generate a random pick, or use **Today** to get a repeatable pick for the current local calendar date.

## Stack

- Vue 3 and Vue Router with TypeScript
- Vite and Tailwind CSS
- Vitest and Vue Test Utils
- GitHub Pages hosting
- YAML content bundled at build time; no database, API, account, or runtime server

## Run locally

Use Node.js 20.19 or newer.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. No environment variables, migrations, or seed command are needed.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the local Vite server |
| `npm test` | Run the behavior tests |
| `npm run typecheck` | Check TypeScript and Vue templates |
| `npm run lint` | Check TypeScript and Vue source |
| `npm run format` | Format app source |
| `npm run build` | Build the static site into `dist/` |

The GitHub Pages workflow runs tests, typecheck, lint, and build before publishing `dist/`. The build includes `404.html` for direct visits to shared URLs and `CNAME` for the custom domain.

## Content and routes

`data/spirits.yaml` and `data/adversaries.yaml` are the source of truth. Edit those files and rebuild the site to change reference content. The app's data modules convert YAML into the typed models used by the UI.

| Route | Purpose |
|---|---|
| `/adversary` | Browse adversaries |
| `/adversary/:slug/:level?` | View adversary rules at a level |
| `/adversary/random` | Random adversary and level |
| `/adversary/today` | Daily adversary with a minimum level of 3 |
| `/spirit` | Browse spirits |
| `/spirit/:slug` | View a spirit's playstyle and attributes |
| `/spirit/random` | Random spirit |
| `/spirit/today` | Daily spirit |

The daily pick uses the existing `en-US` date string, `seedrandom`, YAML record order, and selection formulas. Changing any of those changes daily results. The existing permalink structure is kept so shared links continue to work.

Spirit Island descriptions use `[[Token]]` markup for symbols from `FreehandSpirit04.ttf`, plus `*bold*` and `_italic_` emphasis. `app/shared/SpiritText.vue` renders that markup with accessible icon labels.

## Project layout

```text
app/
  features/adversaries/  Adversary screens and rules
  features/spirits/     Spirit screens and chart
  shared/               Shared text renderer and not-found page
  data/                 YAML-to-model mapping
  models/               Lookups and existing random selection
  constants/            Game-level limits and thresholds
  styles/               Global styles and icon font
  router.ts             Browser routes and permalink redirects
data/                   Canonical game content
public/                 Art, favicon, 404 fallback, and CNAME
```

The [roadmap](MIGRATION_PLAN.md) outlines possible game-night features, including a browser-only play log and difficulty calibration. Those features are proposals and are not part of the current app.
