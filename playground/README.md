# Playground

Vue 3 + TypeScript + Vite + UnoCSS application for trying the local `echarts-pie3d` workspace package.

Run from the repository root:

```sh
pnpm install
pnpm play
pnpm play:build
pnpm --dir playground preview
```

`pnpm typecheck` checks both the library and the application. To check only the application, run `pnpm --dir playground typecheck`.

The playground uses TypeScript 6 because `vue-tsc` currently depends on the JavaScript compiler API unavailable in TypeScript 7. The library keeps its own TypeScript version.

## Structure

- `src/App.vue`: application layout and feature composition.
- `src/components/PlaygroundHeader.vue`: page heading.
- `src/components/playground/`: chart, controls, range input, and feature container.
- `src/composables/usePiePlayground.ts`: control state, demo data, and derived chart options.
- `src/composables/usePieChart.ts`: ECharts initialization, option updates, resizing, and disposal.
- `src/types/playground.ts`: shared chart option and control types.
- `uno.config.ts`: theme colors, font, and shared control shortcuts; component styling uses utilities.

Controls use typed models and intent events. ECharts retains legend and selection state during ordinary option updates; resetting explicitly replaces the option. Chart instances stay outside Vue reactivity and are disposed when their component unmounts.

Vite and TypeScript resolve `echarts-pie3d` to the library source for development without a prior build. The package still declares the library and its ECharts peers explicitly. In development, `window.pie3DChart` exposes the active instance for inspecting native events and `dispatchAction`; it is removed on component unmount.
