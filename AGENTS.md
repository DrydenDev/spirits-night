# AGENTS.md — Spirits Night

A Spirit Island game night companion app. It serves two main purposes:

1. **Match Generator** — Randomly picks a Spirit and an Adversary (with difficulty level) for a game night session, with a "Today" mode that produces the same picks for everyone on a given calendar day.
2. **Reference** — Browse all Spirits and Adversaries, view stats, playstyle notes, and per-level gameplay rules.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Remix v1 (React, SSR) — **needs upgrading to Remix v2 / React Router v7** |
| UI | MUI v5 (Material UI) + Emotion |
| Charts | Recharts |
| Database | PostgreSQL via Supabase |
| ORM | Prisma 5 |
| Language | TypeScript (partially — see TODO.md) |
| Hosting | Vercel (`@vercel/analytics` is wired in) |

---

## Project Structure

```
app/
  components/     # Presentational React components (one folder per component)
  models/         # Server-side data access via Prisma (*.server.js/ts)
  routes/         # Remix file-based routes
  styles/         # Global + per-route CSS; custom Spirit Island icon font
  utils/          # Shared utilities (prisma client, random seed, SI text renderer)
data/
  spirits.yaml    # Source-of-truth Spirit data
  adversaries.yaml # Source-of-truth Adversary data
prisma/
  schema.prisma   # DB schema
  seed.ts         # Entry point; delegates to seeds/
  seeds/          # spiritSeed.ts, adversarySeed.ts — read YAML, upsert to DB
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

### Spirit Island Text Markup
Descriptions use a custom `[[Token]]` syntax (e.g., `[[Fear]]`, `[[Dahan]]`, `[[Blight]]`) that maps to characters in the `FreehandSpirit04.ttf` custom font. The `toSpiritIslandText()` utility in `app/utils/spiritIslandText.jsx` handles rendering these as `<span class="spirit-island-text">`. Also supports `*bold*` and `_italic_`.

---

## Key Features & Routes

| Route | Purpose |
|---|---|
| `/adversary` | Adversary index — sorted list |
| `/adversary/[slug]/[level]` | Adversary detail with level slider and gameplay reference |
| `/adversary/random` | Redirects to a random adversary at a random level |
| `/adversary/today` | Redirects to today's seeded adversary (min level 3) |
| `/spirit` | Spirit index — sorted list |
| `/spirit/[slug]` | Spirit detail with attribute chart and playstyle card |
| `/spirit/random` | Redirects to a random spirit |
| `/spirit/today` | Redirects to today's seeded spirit |

Permalink URLs are stable — `/adversary/england/4` will always show England at level 4.

---

## Seeded Randomness

The "Today" feature uses `getTodaySeed()` (returns today's date as a locale string) combined with the `seedrandom` library to deterministically pick the same Spirit/Adversary for everyone on the same calendar day. **Do not change the seed format or the order of `prisma.adversary.findMany()` / `prisma.spirit.findMany()` calls without understanding the downstream impact on daily picks.**

---

## Data Source of Truth

`data/spirits.yaml` and `data/adversaries.yaml` are the canonical source of game content. Changes to game data should be made there first, then re-run the seed:

```sh
npx prisma db seed
```

The seed scripts parse YAML and upsert records — they are safe to re-run.

---

## Development Setup

```sh
npm install          # also runs prisma generate via postinstall
cp .env.template .env  # fill in DATABASE_URL
npx prisma migrate dev
npx prisma db seed
npm run dev
```

---

## Conventions

- **Component folders**: each component lives in its own folder with an `index.jsx` re-export and a same-named implementation file (e.g., `AdversaryCard/index.jsx` + `AdversaryCard/AdversaryCard.jsx`).
- **Server models**: data-access files are suffixed `.server.js` (or `.server.ts`) so Remix excludes them from the client bundle.
- **Path alias**: `~/` maps to `app/` (configured in both `tsconfig.json` and `jsconfig.json`).
- **Styling**: global styles in `app/styles/global.css`; route-specific styles exported via Remix `links()`.

---

## Agent Rules

- **Always write tests** for any logic added or changed. There are currently none — every new piece of work should add coverage. Start with model functions and utilities.
- **Do not change URL structures** for existing spirit/adversary slugs — these are used as permalinks that users share.
- **Do not alter the seeded randomness logic** without explicit approval — it affects the "Today" feature that multiple users rely on.
- **TypeScript is the target** — new files should be `.ts`/`.tsx`. Do not add new `.jsx` files.
- **YAML data files are the source of truth** — never edit game content directly in the database or seed scripts; edit the YAML.
- **Ask before adding dependencies** — the bundle is already heavy (MUI + Emotion + Recharts). Justify any addition.
- **No magic numbers** — adversary levels (0–6), attribute score ranges, and difficulty values should be named constants, not inline literals.
