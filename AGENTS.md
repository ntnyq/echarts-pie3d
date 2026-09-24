# Repository Guidelines

## Project Structure & Module Organization

- `src/` contains the `echarts-pie3d` TypeScript library. `index.ts` exposes the public API; `install.ts` registers the chart; layout, geometry, series, labels, lighting, and view logic live in separate modules. Keep ECharts GL internals behind `gl.ts` and its adapter types.
- `tests/` contains runtime tests (`*.test.ts`) and public API type checks (`*.test-d.ts`).
- `playground/` is a Vue 3, Vite, and UnoCSS workspace app. Components, composables, and shared types live under `playground/src/`.
- `dist/` is generated package output. CI and release workflows live in `.github/workflows/`.

## Build, Test, and Development Commands

Use Node.js LTS and the pnpm version pinned in `package.json`.

- `pnpm install`: install workspace dependencies.
- `pnpm dev`: rebuild the library on changes with tsdown.
- `pnpm build`: generate the library bundle and declarations in `dist/`.
- `pnpm play`: start the playground; it resolves the library directly from source.
- `pnpm play:build`: typecheck and build the playground.
- `pnpm test`: run Vitest once; watch mode is disabled in configuration.
- `pnpm typecheck`: check both the library and playground.
- `pnpm lint`: run Oxlint.
- `pnpm format` / `pnpm format:check`: apply or verify Oxfmt formatting.

## Coding Style & Naming Conventions

Use strict TypeScript and ES modules. Follow two-space indentation, LF line endings, single quotes, no semicolons, and trailing commas. Oxfmt controls import ordering and an 80-column print width.

Use camelCase for functions and variables, PascalCase for types and Vue components, and `useXxx.ts` for playground composables. Follow existing lowercase or kebab-case library filenames. Husky runs nano-staged to lint and format staged files.

## Testing Guidelines

Add regression tests for changed behavior, particularly angular allocation, percentage rounding, mesh closure/winding, and ECharts legend/selection integration. Run individual suites with `pnpm test tests/layout.test.ts`. Run `pnpm typecheck` for public option type checks. No coverage threshold is configured. Verify rendering and mouse interactions manually in the playground.

## Commit & Pull Request Guidelines

History currently contains only `chore: init commit`; follow its `type: description` pattern with concise, imperative descriptions. Before submitting, run formatting, lint, typecheck, tests, and build. Describe the behavior change, link relevant issues, and include playground screenshots for visual changes.

## Compatibility Boundaries

Target ECharts 5.6.x and ECharts GL 2.0.9 with Canvas/WebGL. Preserve the pinned GL compatibility boundary. ECharts 6, SVG rendering, and server rendering are unsupported; document public option changes in `README.md`.
