# TODO — Modernization

Tracked tech debt and modernization items for the Spirits Night project.

---

## ✅ Done

- **Vitest test suite** — 41 tests across models, utilities, and seed helpers
- **TypeScript migration** — all `.jsx`/`.js` → `.tsx`/`.ts`; `jsconfig.json` removed
- **Prettier** — `.prettierrc` configured; `eslint-config-prettier` wired into ESLint
- **`lint` and `format` scripts** — added to `package.json`
- **`engines`** — updated to `>=20.0.0`
- **Magic number constants** — `app/constants/game.ts` with all game-level values
- **Domain types** — `app/types/domain.ts` with `Spirit`, `Adversary`, and related interfaces
- **React Router v7 upgrade** — replaced Remix v1; Vite build, updated all imports, `json()` → plain objects, `LiveReload` removed, CSS imports use `?url`
- **ESLint v9 flat config** — replaced `@remix-run/eslint-config` with `@eslint/js` + `typescript-eslint` + React plugins
- **`ts-node` → `tsx`** — faster Prisma seed runner
- **`isbot` v5** — updated from v3; switched to named export
- **ColorThief** — replaced fragile HTTP round-trip with direct filesystem read
- **Accessibility** — `role="img"` and `aria-label` on all Spirit Island icon spans
- **README** — rewritten with actual setup and project documentation
- **`.devcontainer`** — Node 20 + Postgres 16; seeds DB automatically on create

---

## 🟡 Medium Priority

### Fix `ColorThief` server-side image loading
- In `spirit.$slug.tsx`, `ColorThief` fetches the spirit splash image by constructing an `http://hostname:port/...` URL from the incoming request, then making an HTTP request back to itself. This is fragile (breaks when port is absent, breaks behind proxies, adds a round-trip).
- Replace with a direct filesystem read using `fs.readFileSync` against the `public/images/spirits/` path, or use a simpler color extraction approach that doesn't require a network call.

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
