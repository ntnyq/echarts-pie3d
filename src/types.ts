import type { PieSeriesOption } from 'echarts/charts'

export interface Pie3DItemStyle {
  color?: string
  opacity?: number
}

export interface Pie3DLabelParams {
  componentType: string
  seriesType: string
  seriesIndex: number
  seriesName: string
  name: string
  dataIndex: number
  value: number
  percent: number
}

export interface Pie3DLabelOption {
  show?: boolean
  position?: 'outside' | 'outer' | 'inside' | 'inner' | 'center'
  formatter?: string | ((params: Pie3DLabelParams) => string)
  color?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: number | 'normal' | 'bold'
}

export interface Pie3DLabelLineOption {
  show?: boolean
  length?: number
  length2?: number
  lineStyle?: { color?: string; width?: number; opacity?: number }
}

export interface Pie3DDataItemOption {
  id?: string
  name?: string
  value: number | null | '-'
  selected?: boolean
  itemStyle?: Pie3DItemStyle
  label?: Pie3DLabelOption
  labelLine?: Pie3DLabelLineOption
  emphasis?: { disabled?: boolean; itemStyle?: Pie3DItemStyle }
  select?: { disabled?: boolean; itemStyle?: Pie3DItemStyle }
}

/**
 * A deliberately limited pie-compatible option for an extruded WebGL series.
 */
export interface Pie3DSeriesOption extends Pick<
  PieSeriesOption,
  | 'id'
  | 'name'
  | 'mainType'
  | 'zlevel'
  | 'silent'
  | 'tooltip'
  | 'selectedMode'
  | 'selectedMap'
  | 'legendHoverLink'
  | 'color'
> {
  type?: 'pie3D'
  center?: [number | string, number | string]
  radius?: number | string | [number | string, number | string]
  startAngle?: number
  clockwise?: boolean
  minAngle?: number
  padAngle?: number
  stillShowZeroSum?: boolean
  percentPrecision?: number
  selectedOffset?: number
  avoidLabelOverlap?: boolean
  /**
   * Extrusion thickness, in the same CSS-pixel layout units as numeric radius.
   */
  depth?: number
  shading?: 'lambert' | 'color'
  animation?: false
  /**
   * Segments per full circle, clamped to 12–512.
   */
  segments?: number
  viewControl?: {
    projection?: 'orthographic'
    /**
     * Elevation in degrees, clamped to 1–89.9; 90 gives a nearly top-down view.
     */
    alpha?: number
    beta?: number
  }
  light?: {
    main?: { intensity?: number; alpha?: number; beta?: number }
    ambient?: { intensity?: number }
  }
  itemStyle?: Pie3DItemStyle
  label?: Pie3DLabelOption
  labelLine?: Pie3DLabelLineOption
  emphasis?: { disabled?: boolean; itemStyle?: Pie3DItemStyle }
  select?: { disabled?: boolean; itemStyle?: Pie3DItemStyle }
  data?: (number | null | '-' | Pie3DDataItemOption)[]
}
