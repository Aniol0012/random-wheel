# random-wheel

Small Angular app to run a random picker wheel.

You add options, spin the wheel, and get a winner. It is built for quick use during standups, games, classroom picks, or any "pick one item" moment.

## what it does

- Add, edit, recolor, shuffle, and remove options.
- Spin the wheel with configurable duration.
- Optional "remove winner" mode to avoid repeats.
- Optional confetti when a winner is selected.
- Fullscreen mode for presentations.
- UI in Catalan, Spanish, and English.
- Saves state in local storage and auto-clears options after inactivity.

## tech stack

- Angular 21
- TypeScript
- pnpm

## quick start

```bash
pnpm install
pnpm start
```

Then open `http://localhost:4200/`.

## available scripts

```bash
pnpm start
pnpm build
pnpm watch
pnpm test
pnpm lint
pnpm lint-fix
pnpm format
```

Notes:
- `lint-fix` runs `ng lint --fix`.
- `format` runs Prettier on `ts/html/css/scss/json/md` files.

## i18n

Translations live in:

- `src/app/i18n/locales/ca.json`
- `src/app/i18n/locales/es.json`
- `src/app/i18n/locales/en.json`

The app switches language from the header buttons and resolves labels via `src/app/i18n/app-texts.ts`.

## state and behavior

- App state is stored in browser local storage (`random-wheel-state-v2`).
- If there is no activity for 20 minutes, stored options are cleared.
- If the user has reduced motion enabled, spin animation duration is shortened.

Core logic is in `src/app/app.ts`.

## deploy to github pages

This repo includes a GitHub Actions deploy workflow:

- `.github/workflows/deploy-pages.yml`

It builds and publishes `dist/random-wheel/browser`.

Current build command in CI:

```bash
pnpm ng build --configuration production --base-href /random-wheel/
```

If you rename the repository, update the `--base-href` value in that workflow.

## auto format and lint in ci

This repo also includes:

- `.github/workflows/auto-format-lint.yml`

On push, it runs formatting and lint autofix, then commits fixes back when needed.

## project structure

- `src/app/app.ts`: state, spinning logic, persistence, language handling.
- `src/app/components/wheel-stage`: wheel rendering and spin interaction.
- `src/app/components/options-editor`: option list editor.
- `.github/workflows`: CI formatting/lint and GitHub Pages deploy.

## development notes

- Package manager is pinned in `package.json` (`pnpm@10.17.1`).
- This project includes SSR entry files (`src/main.server.ts`, `src/server.ts`).
- Production browser output is generated under `dist/random-wheel/browser`.
