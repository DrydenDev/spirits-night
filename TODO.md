# TODO — Modernization

Tracked tech debt and modernization items for the Spirits Night project.

---

## 🔴 High Priority

### Upgrade Remix v1 → React Router v7 (Remix v2 successor)
- Remix v1 is end-of-life. The `remix.config.js` already opts into all v2 future flags, which means the app is in a halfway state.
- React Router v7 is the official successor to Remix. Migration guide: https://reactrouter.com/upgrading/remix
- Remove `remix.config.js` in favor of `vite.config.ts` (RRv7 uses Vite natively).
- Remove `@remix-run/css-bundle` (deprecated in Remix v2+; use Vite CSS handling instead).
- Remove `@remix-run/serve` and `@remix-run/dev`; replace with `@react-router/dev` and `@react-router/serve`.
- Update all `@remix-run/*` imports to `react-router` / `@react-router/*`.

### Migrate all `.jsx` files to `.tsx`
- `app/components/**/*.jsx` → `.tsx`
- `app/routes/**/*.jsx` → `.tsx`
- `app/root.jsx` → `app/root.tsx`
- `app/entry.client.jsx` / `app/entry.server.jsx` → `.tsx`
- `app/utils/spiritIslandText.jsx` → `.tsx`
- `app/models/Adversary.server.js` / `Spirit.server.js` → `.ts`
- Remove `jsconfig.json` — it is redundant once all files are `.ts`/`.tsx` and `tsconfig.json` covers path aliases.

### Add a test suite (Vitest)
- Zero tests currently exist. This is the biggest gap.
- Add `vitest` and configure it for the project.
- Priority test targets:
  - `app/utils/random.ts` — `getTodaySeed()`
  - `app/utils/spiritIslandText.tsx` — `toSpiritIslandText()` with various token inputs
  - `app/models/Spirit.server.ts` — mock Prisma client and verify query logic
  - `app/models/Adversary.server.ts` — same; especially `getRandomAdversary` seeding behavior
  - `prisma/seeds/utils.ts` — seed utility functions
- Add `test` and `test:watch` scripts to `package.json`.
- Add test run to CI.

---

## 🟡 Medium Priority

### Add Prettier
- No Prettier config exists. Add `prettier` and `eslint-config-prettier`.
- Add `.prettierrc` (or inline config in `package.json`).
- Add `format` script: `prettier --write "app/**/*.{ts,tsx,css}"`.
- Add `lint` script: `eslint app --ext .ts,.tsx`.
- Both should run in CI.

### Migrate ESLint to flat config (ESLint v9)
- `.eslintrc.js` uses the legacy config format. ESLint v9 defaults to flat config (`eslint.config.js`).
- `@remix-run/eslint-config` will need to be replaced with appropriate RRv7 / React rules once the framework upgrade is done.

### Fix `ColorThief` server-side image loading
- In `spirit.$slug.jsx`, `ColorThief` fetches the spirit splash image by constructing an `http://hostname:port/...` URL from the incoming request, then making an HTTP request back to itself. This is fragile (breaks when port is absent, breaks behind proxies, adds a round-trip).
- Replace with a direct filesystem read using `fs.readFileSync` against the `public/images/spirits/` path, or use a simpler color extraction approach that doesn't require a network call.

### Update `engines` in `package.json`
- Current: `"node": ">=14.0.0"` — Node 14 has been EOL since April 2023.
- Update to: `"node": ">=20.0.0"` (current LTS).

### Replace `ts-node` with `tsx` for Prisma seed
- `ts-node` is slow to start and requires extra config for ESM. `tsx` is a drop-in replacement that's significantly faster.
- `"seed": "tsx prisma/seed.ts"` in `package.json`.
- Move `ts-node` from `devDependencies` to removed; add `tsx`.

### Update `isbot`
- `isbot@3.6.8` is significantly outdated (v5 is current). Update to latest.

---

## 🟢 Lower Priority / Enhancements

### Update `README.md`
- The current README is the default Remix template README. Replace with actual project documentation: what the app is, how to set it up, how to seed data, how to deploy.

### Add `.devcontainer`
- Already on the feature list. A dev container should: install Node 20, run `npm install`, generate Prisma client, run migrations, and seed the DB.
- Include a `docker-compose.yml` with a Postgres container so the app is fully self-contained locally without needing Supabase.

### Extract magic numbers to named constants
- Adversary level range (0–6) appears inline in multiple places.
- Minimum "Today" adversary level (3) is hardcoded in the loader.
- Create a `app/constants/game.ts` file for these.

### Add `lint` and `format` to `package.json` scripts
_(Covered by Prettier task above, listed separately for tracking)_
- `"lint": "eslint app --ext .ts,.tsx"`
- `"format": "prettier --write 'app/**/*.{ts,tsx,css}'"`

### Spirit Island text: fix React key warnings
- `toSpiritIslandText()` produces arrays of React elements without stable keys, causing console warnings. Refactor to assign keys based on position + token type.

### Accessibility pass on Spirit Island icon spans
- Icon characters rendered via the custom font have no accessible text. Add `aria-label` and `aria-hidden` appropriately (already noted in `feature-list.md`).

### Update MUI to v6
- MUI v6 was released. Not urgent, but worth tracking. Check for breaking changes before upgrading.

---

## From `feature-list.md` (product backlog, not tech debt)

- [ ] Load and display aspect data per spirit
- [ ] Add random aspect to match generation
- [ ] Support generating multiple spirits at once
- [ ] Add playstyle description to each spirit (field exists in DB, data missing for most)
- [ ] Add tags/elements per spirit; filter by tag
- [ ] Tool to find spirits with common playstyle attributes
- [ ] Quick search with slash command
- [ ] Link to Spirit Island wiki from each spirit/adversary page
- [ ] Water wave + island animation (404 page first)
- [ ] Fix long spirit names (e.g., "Thunderspeaker") on mobile
