# AGENTS.md — Spirits Night

A Spirit Island game night companion app. It serves two main purposes:

1. **Match Generator** — Randomly picks a Spirit and an Adversary (with difficulty level) for a game night session, with a "Today" mode that produces the same picks for everyone on a given calendar day.
2. **Reference** — Browse all Spirits and Adversaries, view stats, playstyle notes, and per-level gameplay rules.
3. **Game Nights** — Record plays in browser storage and review difficulty by adversary rating.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Vue 3 + Vue Router, built with Vite |
| UI | Tailwind CSS 4 and the custom Spirit Island icon font |
| Charts | Accessible HTML/CSS attribute bars |
| Data | YAML bundled into the static site at build time |
| Language | TypeScript and Vue single-file components |
| Hosting | GitHub Pages with a custom domain |

---

## Project Structure

```
app/
  features/       # Vue screens and domain-specific logic
  shared/         # Shared Vue components and text parser
  models/         # Data lookups and random selection
  data/           # YAML-to-domain mapping
  router.ts       # Client-side routes and daily/random redirects
  styles/         # Global CSS and custom Spirit Island icon font
  utils/          # Shared utilities, including the date seed
data/
  spirits.yaml    # Source-of-truth Spirit data
  adversaries.yaml # Source-of-truth Adversary data
public/
  images/         # Spirit splash art and adversary banners/avatars
```

---

## Domain Model

### Spirits
Each spirit has:
- `name`, `slug`, `expansion`, `complexity` (Low/Moderate/High/Very High), `complexityValue`
- Attribute scores (integers): `offense`, `control`, `fear`, `defense`, `utility`
- `playstyle` — a freeform description using Spirit Island text markup (see below)
- `incarna` — boolean flag for Incarna mechanic spirits

### Adversaries
Each adversary has:
- `name`, `slug`, `expansion`, `difficulty`
- `lossCondition` — optional JSON `{ title, description }` for special loss rules
- `escalationAbility` — JSON `{ title, description }` for the escalation mechanic
- `levels` — 0–6, each with `title`, `difficulty`, `fearCards`, `description`
- `references` — per-phase gameplay rules (`type`, `phase`, `level`, `maxLevel`, `description`)

### Plays
`app/features/plays/` owns the browser-only log. Versioned records in `localStorage` include date, adversary and level, spirit lineup, player count, result, and felt difficulty. JSON import validates every record before merging by ID; no server stores plays. Calibration groups games by the adversary level's difficulty rating and uses the three most recent games for a suggestion.

### Spirit Island Text Markup
Descriptions use a custom `[[Token]]` syntax (e.g., `[[Fear]]`, `[[Dahan]]`, `[[Blight]]`) that maps to characters in the `FreehandSpirit04.ttf` custom font. `app/shared/SpiritText.vue` handles rendering these as accessible icon spans. It also supports `*bold*` and `_italic_`.

---

## Key Features & Routes

| Route | Purpose |
|---|---|
| `/adversary` | Adversary index — sorted list |
| `/adversary/:slug/:level?` | Adversary detail with level slider and gameplay reference |
| `/adversary/random` | Redirects to a random adversary at a random level |
| `/adversary/today` | Redirects to today's seeded adversary (min level 3) |
| `/spirit` | Spirit index — sorted list |
| `/spirit/:slug` | Spirit detail with attribute bars and playstyle card |
| `/spirit/random` | Redirects to a random spirit |
| `/spirit/today` | Redirects to today's seeded spirit |
| `/plays` | Browser-only play log and difficulty summary |

Permalink URLs are stable — `/adversary/england/4` will always show England at level 4.

---

## Seeded Randomness

The "Today" feature uses `getTodaySeed()` (today's local date as an `en-US` string) with `seedrandom` to deterministically pick a Spirit and Adversary. **Do not change the seed format, selection formulas, or record order in the YAML files without understanding the downstream impact on daily picks.**

---

## Data Source of Truth

`data/spirits.yaml` and `data/adversaries.yaml` are the canonical source of game content. Changes to game data should be made there first, then rebuild:

```sh
npm run build
```

The data modules import YAML directly; there is no runtime database or seed script.

---

## Development Setup

```sh
npm ci
npm run dev
```

---

## Conventions

- **Feature folders**: group screens and related logic under `app/features/adversaries/`, `app/features/spirits/`, or `app/features/plays/`.
- **Path alias**: `~/` maps to `app/` in Vite, Vitest, and TypeScript.
- **Styling**: Tailwind utilities and shared rules in `app/styles/global.css`.
- **Hosting**: Vite emits `dist/`; GitHub Pages uses `public/404.html` for direct visits to permalinks.

---

## Agent Rules

- **Always write tests** for any logic added or changed. Favor model, utility, and user-visible component behavior.
- **Do not change URL structures** for existing spirit/adversary slugs — these are used as permalinks that users share.
- **Do not alter the seeded randomness logic** without explicit approval — it affects the "Today" feature that multiple users rely on.
- **TypeScript is the target** — new logic files should be `.ts`, and Vue components should be `.vue` with `<script setup lang="ts">`. Do not add `.jsx` files.
- **YAML data files are the source of truth** — edit game content in YAML, never in generated bundles.
- **Ask before adding dependencies** — the bundle is already heavy (MUI + Emotion + Recharts). Justify any addition.
- **No magic numbers** — adversary levels (0–6), attribute score ranges, and difficulty values should be named constants, not inline literals.
