# TODO

## Done

- Migrated the static site from React Router to Vue 3, Vue Router, TypeScript, and Vite.
- Kept the existing YAML content, permalinks, daily picks, artwork, and GitHub Pages deployment.
- Replaced the chart library with accessible attribute bars and removed React-only packages.
- Added Vue component, route, daily-pick, reference, and text-rendering tests.
- Updated CI to require tests, typecheck, lint, and build before publishing.
- Added browser-only play tracking, JSON backup/import, and a three-game difficulty suggestion.

## Next product work

See [MIGRATION_PLAN.md](MIGRATION_PLAN.md) for the remaining proposals. A combined match generator could make choosing a lineup faster.

## Content work

- Add aspect data to `data/spirits.yaml` before offering random aspects.
- Fill missing spirit playstyle descriptions in YAML.
- Consider tags and filters once the data is consistent.
