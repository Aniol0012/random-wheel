# Random Wheel

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.17.1-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Auto Format](https://img.shields.io/github/actions/workflow/status/Aniol0012/random-wheel/auto-format-lint.yml?branch=master&label=Auto%20format)](https://github.com/Aniol0012/random-wheel/actions/workflows/auto-format-lint.yml)
[![Deploy Pages](https://img.shields.io/github/actions/workflow/status/Aniol0012/random-wheel/deploy-pages.yml?branch=master&label=Deploy%20pages)](https://github.com/Aniol0012/random-wheel/actions/workflows/deploy-pages.yml)

Simple wheel picker built with Angular. Add options, spin, and get a random winner.

- Repository: [github.com/Aniol0012/random-wheel](https://github.com/Aniol0012/random-wheel)
- Local app: [http://localhost:4200/](http://localhost:4200/)
- GitHub Pages: [aniol0012.github.io/random-wheel](https://aniol0012.github.io/random-wheel/)

## Features

- Add, edit, recolor, shuffle, and remove options
- Configurable spin duration
- Optional "Remove winner" mode
- Optional confetti
- Fullscreen mode
- UI in Catalan, Spanish, and English

<img width="1877" height="1236" alt="image" src="https://github.com/user-attachments/assets/23d2cd35-51af-412f-ab2e-479532458b6c" />


## Quick Start

```bash
pnpm install
pnpm start
```

Open [http://localhost:4200/](http://localhost:4200/) in your browser.

## Scripts

```bash
pnpm start
pnpm build
pnpm test
pnpm lint
pnpm lint-fix
pnpm format
```

- `pnpm lint`: checks formatting with Prettier
- `pnpm lint-fix`: applies Prettier fixes

## CI And Deploy

- Auto format workflow: [`.github/workflows/auto-format-lint.yml`](.github/workflows/auto-format-lint.yml)
- GitHub Pages deploy workflow: [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)

The Pages build publishes `dist/random-wheel/browser`.
