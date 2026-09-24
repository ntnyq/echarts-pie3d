import type { Pie3DSeriesOption } from 'echarts-pie3d'
import type {
  LegendComponentOption,
  TooltipComponentOption,
} from 'echarts/components'
import type { ComposeOption } from 'echarts/core'

export type PieShape = 'pie' | 'donut'

export interface PlaygroundSettings {
  shape: PieShape
  innerRadius: number
  outerRadius: number
  depth: number
  startAngle: number
  padAngle: number
  isClockwise: boolean
  segments: number
  alpha: number
  beta: number
  shading: 'lambert' | 'color'
  opacity: number
  mainIntensity: number
  ambientIntensity: number
  lightAlpha: number
  lightBeta: number
  hasLabels: boolean
  labelPosition: 'outside' | 'inside' | 'center'
  labelFontSize: number
  hasLabelLines: boolean
  labelLineLength: number
  labelLineLength2: number
  shouldAvoidLabelOverlap: boolean
  percentPrecision: number
  hasLegend: boolean
  hasTooltip: boolean
  hasEmphasis: boolean
  selectionMode: 'none' | 'single' | 'multiple'
  selectedOffset: number
}

export type PieChartOption = ComposeOption<
  Pie3DSeriesOption | LegendComponentOption | TooltipComponentOption
>
