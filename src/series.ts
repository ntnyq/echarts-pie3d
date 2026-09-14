import { List, SeriesModel } from 'echarts/core'
import LegendVisualProvider from 'echarts/lib/visual/LegendVisualProvider.js'
import { finiteNumber, getPercents } from './layout'
import type { Pie3DSeriesOption } from './types'

export class Pie3DSeriesModel extends SeriesModel<Pie3DSeriesOption> {
  public static type = 'series.pie3D'
  public override type = Pie3DSeriesModel.type
  public override preventAutoZ = true

  public static defaultOption = {
    zlevel: -10,
    colorBy: 'data',
    legendHoverLink: true,
    center: ['50%', '50%'],
    radius: [0, '70%'],
    depth: 24,
    startAngle: 90,
    clockwise: true,
    minAngle: 0,
    padAngle: 0,
    stillShowZeroSum: true,
    percentPrecision: 2,
    selectedOffset: 10,
    selectedMode: false,
    animation: false,
    shading: 'lambert',
    segments: 128,
    avoidLabelOverlap: true,
    viewControl: {
      projection: 'orthographic',
      alpha: 35,
      beta: 0,
    },
    light: {
      main: {
        intensity: 0.8,
        alpha: 55,
        beta: -30,
      },
      ambient: { intensity: 0.45 },
    },
    itemStyle: { opacity: 1 },
    label: {
      show: true,
      position: 'outside',
      fontSize: 12,
    },
    labelLine: {
      show: true,
      length: 16,
      length2: 14,
      lineStyle: { width: 1 },
    },
    emphasis: {
      disabled: false,
    },
  }

  public override getInitialData(option: Pie3DSeriesOption): List {
    const data = new List(['value'], this)
    data.initData(option.data ?? [])
    this.legendVisualProvider = new LegendVisualProvider(
      () => this.getData(),
      () => this.getRawData(),
    )
    return data
  }

  public override getDataParams(
    dataIndex: number,
  ): ReturnType<SeriesModel['getDataParams']> {
    const params = super.getDataParams(dataIndex)
    const data = this.getData()
    const percents: number[] =
      data.getLayout('percents') ??
      getPercents(
        data.mapArray('value', value => Math.max(0, finiteNumber(value, 0))),
        this.option.percentPrecision ?? 2,
      )
    params.percent = percents[dataIndex] ?? 0
    params.$vars.push('percent')
    return params
  }

  public override getTooltipPosition(dataIndex: number): number[] {
    return this.getData().getItemLayout(dataIndex)?.tooltipPosition ?? [0, 0]
  }
}
