import { computed, shallowRef } from 'vue'
import type { PieChartOption, PlaygroundSettings } from '../types/playground'

const defaultSettings: PlaygroundSettings = {
  shape: 'donut',
  innerRadius: 34,
  outerRadius: 65,
  depth: 32,
  startAngle: 90,
  padAngle: 2,
  isClockwise: true,
  segments: 128,
  alpha: 35,
  beta: 0,
  shading: 'lambert',
  opacity: 1,
  mainIntensity: 0.8,
  ambientIntensity: 0.45,
  lightAlpha: 55,
  lightBeta: -30,
  hasLabels: true,
  labelPosition: 'outside',
  labelFontSize: 14,
  hasLabelLines: true,
  labelLineLength: 16,
  labelLineLength2: 14,
  shouldAvoidLabelOverlap: true,
  percentPrecision: 2,
  hasLegend: true,
  hasTooltip: true,
  hasEmphasis: true,
  selectionMode: 'single',
  selectedOffset: 14,
}

const initialData = [
  { id: 'search', name: 'Search', value: 420 },
  { id: 'direct', name: 'Direct', value: 280 },
  { id: 'social', name: 'Social', value: 180 },
  { id: 'other', name: 'Other', value: 120 },
]

/**
 * Owns playground controls and derives the chart option from their current values.
 * @returns Reactive controls, derived options, and data/reset actions.
 */
export function usePiePlayground() {
  const settings = shallowRef<PlaygroundSettings>({ ...defaultSettings })
  const data = shallowRef(initialData)
  const resetKey = shallowRef(0)
  let revision = 0

  const option = computed<PieChartOption>(() => {
    const config = settings.value
    return {
      color: ['#38786a', '#cf8852', '#8297ba', '#b8ae8e'],
      tooltip: {
        show: config.hasTooltip,
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        show: config.hasLegend,
        bottom: 20,
        itemGap: 20,
        textStyle: { color: '#53534f' },
      },
      series: [
        {
          id: 'sources',
          type: 'pie3D',
          name: 'Traffic sources',
          radius: [
            config.shape === 'donut' ? `${config.innerRadius}%` : 0,
            `${config.outerRadius}%`,
          ],
          center: ['50%', '46%'],
          depth: config.depth,
          startAngle: config.startAngle,
          padAngle: config.padAngle,
          clockwise: config.isClockwise,
          segments: config.segments,
          viewControl: { alpha: config.alpha, beta: config.beta },
          shading: config.shading,
          light: {
            main: {
              intensity: config.mainIntensity,
              alpha: config.lightAlpha,
              beta: config.lightBeta,
            },
            ambient: { intensity: config.ambientIntensity },
          },
          itemStyle: { opacity: config.opacity },
          selectedMode:
            config.selectionMode === 'none' ? false : config.selectionMode,
          selectedOffset: config.selectedOffset,
          emphasis: { disabled: !config.hasEmphasis },
          avoidLabelOverlap: config.shouldAvoidLabelOverlap,
          percentPrecision: config.percentPrecision,
          label: {
            show: config.hasLabels,
            position: config.labelPosition,
            formatter: '{b}  {d}%',
            fontSize: config.labelFontSize,
          },
          labelLine: {
            show: config.hasLabelLines,
            length: config.labelLineLength,
            length2: config.labelLineLength2,
          },
          data: data.value,
        },
      ],
    }
  })

  function updateSettings(patch: Partial<PlaygroundSettings>) {
    const next = { ...settings.value, ...patch }
    // Keep a visible ring when reducing its outer radius.
    next.innerRadius = Math.min(next.innerRadius, next.outerRadius - 1)
    settings.value = next
  }

  function updateData() {
    revision++
    data.value = initialData.map((item, index) => ({
      ...item,
      value: 100 + ((revision * 137 + index * 83) % 500),
    }))
  }

  function clearData() {
    data.value = []
  }

  function reset() {
    settings.value = { ...defaultSettings }
    data.value = initialData
    revision = 0
    // Reset ECharts-owned legend and selection state, even when controls are unchanged.
    resetKey.value++
  }

  return {
    settings,
    updateSettings,
    option,
    resetKey,
    updateData,
    clearData,
    reset,
  }
}
