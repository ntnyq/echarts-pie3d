import { computed, shallowRef } from 'vue'
import type { PieChartOption, PieShape } from '../types/playground'

const initialData = [
  {
    id: 'search',
    name: '搜索',
    value: 420,
  },
  {
    id: 'direct',
    name: '直接访问',
    value: 280,
  },
  {
    id: 'social',
    name: '社交媒体',
    value: 180,
  },
  {
    id: 'other',
    name: '其他',
    value: 120,
  },
]

/**
 * Owns playground controls and derives the chart option from their current values.
 * @returns Reactive controls, derived options, and data/reset actions.
 */
export function usePiePlayground() {
  const shape = shallowRef<PieShape>('donut')
  const depth = shallowRef(32)
  const alpha = shallowRef(35)
  const beta = shallowRef(0)
  const data = shallowRef(initialData)
  const resetKey = shallowRef(0)

  let revision = 0

  const option = computed<PieChartOption>(() => ({
    color: ['#38786a', '#cf8852', '#8297ba', '#b8ae8e'],
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 20, itemGap: 28, textStyle: { color: '#53534f' } },
    series: [
      {
        id: 'sources',
        type: 'pie3D',
        name: '访问来源',
        radius: [shape.value === 'donut' ? '34%' : 0, '65%'],
        center: ['50%', '46%'],
        depth: depth.value,
        viewControl: { alpha: alpha.value, beta: beta.value },
        selectedMode: 'single',
        selectedOffset: 14,
        padAngle: 2,
        label: { formatter: '{b}  {d}%', fontSize: 14 },
        data: data.value,
      },
    ],
  }))

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
    shape.value = 'donut'
    depth.value = 32
    alpha.value = 35
    beta.value = 0
    data.value = initialData
    // Reset ECharts-owned legend and selection state, even when controls are unchanged.
    resetKey.value++
  }

  return {
    shape,
    depth,
    alpha,
    beta,
    option,
    resetKey,
    updateData,
    clearData,
    reset,
  }
}
