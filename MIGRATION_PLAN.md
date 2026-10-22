# Spirits Night: migration notes and game night roadmap

## Vue migration

The app now uses Vue 3, Vue Router, TypeScript, Vite, Tailwind CSS, and Vitest. YAML is bundled at build time. The production output is static files in `dist/`, published by GitHub Pages. There is no runtime database, API, account, or server process.

The existing spirit and adversary URLs, artwork, reference rules, and daily selection formulas are preserved. Regression tests pin known daily results so changes to the date format, YAML order, or random draws are visible. The custom domain and GitHub Pages deep-link fallback remain in `public/`.

The old React, React Router, Recharts, and ColorThief packages were removed. Five accessible attribute bars replace the charting library. Unexpected Vue errors and failed clipboard actions are logged as structured console events. Sentry is intentionally excluded at the user's request.

## Product roadmap

### First: make game night easier

- **One match button:** Show one spirit per player and an adversary/level together. Allow rerolling one pick without losing the rest. Keep the current individual random and today links.
- **Quick difficulty controls:** Choose a target difficulty or range, and optionally exclude spirits or expansions unavailable that night. Use adversary difficulty ratings rather than treating level numbers as equivalent across adversaries.
- **Share a lineup:** Encode the chosen lineup in a URL so everyone can open it without an account or saved server state.

### Shipped: a local play log

- Store date, adversary, level, spirit lineup, player count, win/loss, and an “easy / right / hard” rating in the browser.
- Show recent plays and support editing and deletion.
- Export and import JSON. Browser storage can be cleared and does not sync across devices.
- Surface storage failures and invalid imports clearly; do not silently replace or discard an existing log.

### Shipped: first-pass difficulty calibration

- Summarize wins and felt difficulty by adversary difficulty rating, with sample counts next to every statistic.
- Suggest one difficulty point above the recent median after three easy wins, one below after three hard losses, and otherwise hold. Show which games informed the suggestion; wait for three games before suggesting a target.
- The group still chooses its target manually. Revisit the heuristic after real play data shows whether it helps.

### Later

- Add spirit aspects and multiple-spirit generation when the YAML contains reliable aspect data.
- Add filters for complexity, attributes, and expansion; add quick search for reference use during a game.
