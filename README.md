# echarts-pie3d

[![CI](https://github.com/ntnyq/echarts-pie3d/workflows/CI/badge.svg)](https://github.com/ntnyq/echarts-pie3d/actions)
[![NPM VERSION](https://img.shields.io/npm/v/echarts-pie3d.svg)](https://www.npmjs.com/package/echarts-pie3d)
[![NPM DOWNLOADS](https://img.shields.io/npm/dy/echarts-pie3d.svg)](https://www.npmjs.com/package/echarts-pie3d)
[![LICENSE](https://img.shields.io/github/license/ntnyq/echarts-pie3d.svg)](https://github.com/ntnyq/echarts-pie3d/blob/main/LICENSE)

An experimental **`pie3D` series for ECharts GL**. One series contains all slices; `radius` selects a solid pie or a donut. Each slice is a closed WebGL mesh with a top, bottom, outer wall, optional inner wall, and end caps.

## Usage

The compatibility baseline is **ECharts 5.6.x + ECharts GL 2.0.9**, using a modern browser and the Canvas renderer. ECharts GL's internal scene APIs are isolated behind an adapter and its version is pinned. ECharts 6, SVG rendering and server rendering are not supported by this release. In an SSR app, import the plugin on the client.

Build with `pnpm build` and link this package into your application. Install `echarts@~5.6.0` and `echarts-gl@2.0.9` as peer dependencies.

```ts
import { init, use } from 'echarts/core'
import { LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { Pie3DChart } from 'echarts-pie3d'
import type { ComposeOption } from 'echarts/core'
import type {
  LegendComponentOption,
  TooltipComponentOption,
} from 'echarts/components'
import type { Pie3DSeriesOption } from 'echarts-pie3d'

use([CanvasRenderer, LegendComponent, TooltipComponent, Pie3DChart])

const option: ComposeOption<
  Pie3DSeriesOption | LegendComponentOption | TooltipComponentOption
> = {
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: {},
  series: [
    {
      type: 'pie3D',
      name: '访问来源',
      center: ['50%', '50%'],
      radius: ['35%', '70%'], // [0, '70%'] for a solid pie
      depth: 24,
      selectedMode: 'single',
      selectedOffset: 10,
      label: { formatter: '{b}: {d}%' },
      viewControl: { projection: 'orthographic', alpha: 35, beta: 0 },
      data: [
        { id: 'search', name: '搜索', value: 420 },
        { id: 'direct', name: '直接访问', value: 280 },
        { id: 'other', name: '其他', value: 160 },
      ],
    },
  ],
}

const container = document.getElementById('chart')
if (container) {
  const chart = init(container)
  chart.setOption(option)
  // Call chart.resize() when the container changes, and chart.dispose() on unmount.
}
```

Give the container an explicit width and height. The plugin loads the ECharts GL layer integration itself; an additional `import 'echarts-gl'` is unnecessary. Use the same `echarts/core` instance throughout your bundle. The exported option works with `ComposeOption`; the plugin does not augment ECharts' built-in `EChartsOption` union.

## Supported options

| Option                           | Default                                              | Behavior                                                                                                                              |
| -------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `data`                           | `[]`                                                 | Numbers or `{ id?, name?, value, … }` items. Negative values, `null`, `'-'`, NaN and infinity are filtered.                           |
| `center`                         | `['50%', '50%']`                                     | Percentages of container width/height, or CSS pixels.                                                                                 |
| `radius`                         | `[0, '70%']`                                         | A single outer radius or `[inner, outer]`. Percentages use half the shorter container edge.                                           |
| `depth`                          | `24`                                                 | Uniform extrusion thickness in CSS-pixel layout units. Negative depth is clamped to zero.                                             |
| `startAngle`, `clockwise`        | `90`, `true`                                         | Start at twelve o'clock; angles follow the 2D pie convention.                                                                         |
| `minAngle`, `padAngle`           | `0`, `0`                                             | Degrees. Minimum angles are redistributed within one turn; padding reduces each visible slice without changing percentages.           |
| `stillShowZeroSum`               | `true`                                               | Divide a zero-sum dataset equally, while reporting `0%`; `false` renders no slices.                                                   |
| `percentPrecision`               | `2`                                                  | Decimal places, clamped to 0–6. Nonzero totals round to exactly 100%.                                                                 |
| `selectedMode`, `selectedOffset` | `false`, `10`                                        | Native ECharts selection with a radial offset. Supports initial item `selected` and `select.disabled`.                                |
| `itemStyle`                      | `{ opacity: 1 }`                                     | Solid CSS `color` and `opacity`, at series or item level. The ECharts palette is used by default.                                     |
| `shading`                        | `'lambert'`                                          | Lambert lighting or unlit `'color'`.                                                                                                  |
| `segments`                       | `128`                                                | Arc subdivisions per full circle, clamped to 12–512.                                                                                  |
| `viewControl`                    | `{ projection: 'orthographic', alpha: 35, beta: 0 }` | Fixed camera elevation and rotation, in degrees; elevation is clamped to 1–89.9. Update with `setOption`.                             |
| `light`                          | See types                                            | `main.intensity/alpha/beta`, `ambient.intensity`.                                                                                     |
| `label`                          | `{ show: true, position: 'outside' }`                | `outside/outer`, `inside/inner`, `center`; string `{a}/{b}/{c}/{d}` or synchronous function formatter; color and basic font settings. |
| `labelLine`                      | `{ show: true, length: 16, length2: 14 }`            | Outside labels only; line color, width and opacity.                                                                                   |
| `avoidLabelOverlap`              | `true`                                               | Vertical separation and hiding when space runs out. Outside text truncates to available width.                                        |
| `emphasis`, `select`             | —                                                    | Solid color/opacity overrides; `emphasis.disabled`. Hover darkens the normal color by default.                                        |
| `silent`                         | `false`                                              | Disables mesh picking.                                                                                                                |
| `zlevel`                         | `-10`                                                | Reserve this level for WebGL. Labels use `zlevel + 1`; keep both distinct from other GL and Canvas layers.                            |

Keep stable item IDs and unique names when updating data; legend and ECharts selection are name-based. Legend filtering recomputes angles and percentages over the visible data. Events retain the original `dataIndex`, including after filtering. `setOption`, `resize`, series replacement and disposal rebuild or release scene content through ECharts GL's lifecycle.

```ts
chart.dispatchAction({ type: 'select', seriesIndex: 0, dataIndex: 1 })
chart.dispatchAction({ type: 'unselect', seriesIndex: 0, dataIndex: 1 })
chart.dispatchAction({ type: 'toggleSelect', seriesIndex: 0, dataIndex: 1 })
chart.dispatchAction({ type: 'highlight', seriesIndex: 0, name: '搜索' })
chart.dispatchAction({ type: 'downplay', seriesIndex: 0, name: '搜索' })
```

## Scope of the first release

The public types describe a subset of 2D pie options. This version does not implement `roseType`, rounded corners, borders, gradients/textures, dataset/encode, partial circles (`endAngle`), perspective projection, mouse camera controls, animations, rich-text/state labels, emphasis scaling or blur/focus behavior. Labels are a 2D overlay and do not perform depth occlusion. Transparent surfaces have the usual overlapping-mesh sorting limitations; opaque colors are the default.

## Development

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Tests verify angular allocation, percentage rounding, closed geometry and outward triangle winding, plus the actual ECharts data/legend/selection pipeline with a headless view. The playground verifies the GL renderer and native mouse interaction separately.

The implementation follows the extension contracts in the [ECharts pie registration](https://github.com/apache/echarts/blob/5.6.0/src/chart/pie/install.ts) and [ECharts GL layer integration](https://github.com/ecomfe/echarts-gl/blob/2.0.9/src/echarts-gl.js).

## License

[MIT](./LICENSE) License © 2026-PRESENT [ntnyq](https://github.com/ntnyq)
