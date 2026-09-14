import { LegendComponent, TooltipComponent } from 'echarts/components'
import { init, use } from 'echarts/core'
import type { ECharts } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Pie3DChart } from '../src'
import { Pie3DSeriesModel } from '../src/series'

// Run the real ECharts data pipeline in SVG SSR; WebGL is verified in the demo.
// The headless view intentionally implements only ECharts' rendering contract.
// eslint-disable-next-line vitest/prefer-import-in-mock
vi.mock('../src/view', async () => {
  const { ChartView } = await import('echarts/core')
  class Pie3DView extends ChartView {
    public static type = 'pie3D'
    public override render() {
      this.group.removeAll()
    }
  }
  return { Pie3DView }
})

use([LegendComponent, TooltipComponent, SVGRenderer, Pie3DChart])
const charts: ECharts[] = []
afterEach(() => {
  for (const chart of charts.splice(0)) {
    chart.dispose()
  }
})

function createChart() {
  const chart = init(null, undefined, {
    renderer: 'svg',
    ssr: true,
    width: 600,
    height: 400,
  })
  charts.push(chart)
  return chart
}

function getSeries(chart: ECharts): Pie3DSeriesModel {
  // getModel is available at runtime but intentionally absent from ECharts' public type.
  const series = (
    chart as unknown as {
      getModel: () => { getSeriesByIndex: (index: number) => unknown }
    }
  )
    .getModel()
    .getSeriesByIndex(0)
  if (!(series instanceof Pie3DSeriesModel)) {
    throw new Error('pie3D was not registered')
  }
  return series
}

describe('registered series data pipeline', () => {
  it('exposes legend items, raw data indices and rounded percentage parameters', () => {
    const chart = createChart()
    chart.setOption({
      legend: {},
      series: [
        {
          type: 'pie3D',
          data: [
            { name: 'A', value: 1 },
            { name: 'B', value: 2 },
          ],
        },
      ],
    })
    const model = getSeries(chart)
    expect(model.legendVisualProvider.getAllNames()).toStrictEqual(['A', 'B'])
    expect(model.getDataParams(0)).toMatchObject({
      seriesType: 'pie3D',
      dataIndex: 0,
      name: 'A',
      value: 1,
      percent: 33.33,
    })
    expect(model.getDataParams(0).$vars).toContain('percent')
  })

  it('filters invalid values and recomputes angles and percents after legend changes', () => {
    const chart = createChart()
    chart.setOption({
      legend: {},
      series: [
        {
          type: 'pie3D',
          data: [
            { name: 'bad', value: -1 },
            { name: 'A', value: 1 },
            { name: 'B', value: 3 },
            null,
            '-',
            Number.NaN,
            Infinity,
          ],
        },
      ],
    })
    expect(getSeries(chart).getData().count()).toBe(2)
    chart.dispatchAction({ type: 'legendUnSelect', name: 'A' })
    const model = getSeries(chart)
    expect(model.getData().count()).toBe(1)
    expect(model.getDataParams(0)).toMatchObject({
      name: 'B',
      dataIndex: 2,
      percent: 100,
    })
    const layout = model.getData().getItemLayout(0)
    expect(layout.endAngle - layout.startAngle).toBeCloseTo(Math.PI * 2)
    chart.dispatchAction({ type: 'legendSelect', name: 'A' })
    expect(getSeries(chart).getDataParams(0).percent).toBe(25)
  })

  it('supports native single selection and respects disabled items', () => {
    const chart = createChart()
    chart.setOption({
      series: [
        {
          type: 'pie3D',
          selectedMode: 'single',
          data: [
            { name: 'A', value: 1 },
            { name: 'B', value: 2 },
            { name: 'C', value: 3, select: { disabled: true } },
          ],
        },
      ],
    })
    chart.dispatchAction({ type: 'select', seriesIndex: 0, dataIndex: 0 })
    expect(getSeries(chart).isSelected(0)).toBe(true)
    chart.dispatchAction({ type: 'select', seriesIndex: 0, dataIndex: 1 })
    expect(Boolean(getSeries(chart).isSelected(0))).toBe(false)
    expect(getSeries(chart).isSelected(1)).toBe(true)
    chart.dispatchAction({ type: 'toggleSelect', seriesIndex: 0, dataIndex: 1 })
    expect(Boolean(getSeries(chart).isSelected(1))).toBe(false)
    chart.dispatchAction({ type: 'select', seriesIndex: 0, dataIndex: 2 })
    expect(Boolean(getSeries(chart).isSelected(2))).toBe(false)
  })

  it('rebuilds layouts on resize, data replacement and clearing', () => {
    const chart = createChart()
    chart.setOption({ series: [{ id: 'pie', type: 'pie3D', data: [1, 1, 1] }] })
    expect(getSeries(chart).getDataParams(0).percent).toBe(33.34)
    chart.resize({ width: 200, height: 200 })
    expect(getSeries(chart).getData().getItemLayout(0).outerRadius).toBe(70)
    chart.setOption({ series: [{ id: 'pie', data: [1, 3] }] })
    expect(getSeries(chart).getDataParams(0).percent).toBe(25)
    chart.setOption({ series: [{ id: 'pie', data: [] }] })
    expect(getSeries(chart).getData().count()).toBe(0)
  })
})
