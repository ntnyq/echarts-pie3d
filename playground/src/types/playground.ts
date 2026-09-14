import type { Pie3DSeriesOption } from 'echarts-pie3d'
import type {
  LegendComponentOption,
  TooltipComponentOption,
} from 'echarts/components'
import type { ComposeOption } from 'echarts/core'

export type PieShape = 'pie' | 'donut'

export type PieChartOption = ComposeOption<
  Pie3DSeriesOption | LegendComponentOption | TooltipComponentOption
>
