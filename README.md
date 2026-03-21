# Spirits Night

A Spirit Island game night companion app. Two main uses:

1. **Match Generator** — randomly picks a Spirit and an Adversary (with difficulty level) for a game night session. A "Today" mode produces the same picks for everyone on a given calendar day, so all players see the same result.
2. **Reference** — browse all Spirits and Adversaries, view attribute charts, playstyle notes, and per-level gameplay rules with phase-by-phase breakdowns.

Live at [your-domain-here].

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Remix v1 (SSR, React) |
| UI | MUI v5 + Emotion |
| Charts | Recharts |
| Database | PostgreSQL via Supabase |
| ORM | Prisma 5 |
| Language | TypeScript |
| Hosting | Vercel |

---

## Local Development

### Prerequisites

- Node.js 20+
- A PostgreSQL database (local or via [Supabase](https://supabase.com))

### Setup

```sh
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.template .env
# Edit .env and fill in DATABASE_URL with your Postgres connection string
# Example: DATABASE_URL="postgresql://user:password@localhost:5432/spirits_night"

# 3. Run migrations
npx prisma migrate dev

# 4. Seed game data
npx prisma db seed

# 5. Start the dev server
npm run dev
```

The app will be running at http://localhost:3000.

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SPIRIT_FILE` | Path to the spirits YAML data file (default: `./data/spirits.yaml`) |
| `ADVERSARY_FILE` | Path to the adversaries YAML data file (default: `./data/adversaries.yaml`) |

---

## Game Data

All game content lives in YAML files — these are the source of truth:

```
data/
  spirits.yaml       # All spirits with attributes, complexity, playstyle
  adversaries.yaml   # All adversaries with levels and gameplay references
```

To add or update game content, edit the YAML files and re-run the seed:

```sh
npx prisma db seed
```

The seed scripts upsert records, so they are safe to re-run.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run typecheck` | TypeScript type check |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

---

## Project Structure

```
app/
  components/     # Presentational React components (one folder per component)
  constants/      # Game constants (level ranges, difficulty thresholds)
  models/         # Server-side data access via Prisma (*.server.ts)
  routes/         # Remix file-based routes
  styles/         # Global + per-route CSS; custom Spirit Island icon font
  types/          # Shared TypeScript interfaces (domain.ts)
  utils/          # Shared utilities (Prisma client, random seed, SI text renderer)
data/
  spirits.yaml
  adversaries.yaml
prisma/
  schema.prisma
  seed.ts
  seeds/          # spiritSeed.ts, adversarySeed.ts
public/
  images/         # Spirit splash art and adversary banners/avatars
```

---

## Routes

| Route | Description |
|---|---|
| `/adversary` | Adversary index — sorted list |
| `/adversary/:slug/:level` | Adversary detail with level slider and gameplay reference |
| `/adversary/random` | Redirects to a random adversary |
| `/adversary/today` | Redirects to today's seeded adversary (min level 3) |
| `/spirit` | Spirit index — sorted list |
| `/spirit/:slug` | Spirit detail with attribute chart and playstyle |
| `/spirit/random` | Redirects to a random spirit |
| `/spirit/today` | Redirects to today's seeded spirit |

Permalink URLs are stable — `/adversary/england/4` will always resolve to England at level 4.

---

## Spirit Island Text Markup

Spirit and adversary descriptions use a `[[Token]]` syntax (e.g., `[[Fear]]`, `[[Dahan]]`) that renders as icons via the `FreehandSpirit04.ttf` custom font. The `toSpiritIslandText()` utility in `app/utils/spiritIslandText.tsx` handles the conversion. Rendered icon spans include `role="img"` and `aria-label` for accessibility.
