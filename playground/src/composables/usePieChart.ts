import { Pie3DChart } from 'echarts-pie3d'
import { LegendComponent, TooltipComponent } from 'echarts/components'
import { init, use } from 'echarts/core'
import type { EChartsType } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { onBeforeUnmount, onMounted, watch } from 'vue'
import type { ShallowRef } from 'vue'
import type { PieChartOption } from '../types/playground'

use([CanvasRenderer, LegendComponent, TooltipComponent, Pie3DChart])

/**
 * Keeps the ECharts instance outside Vue reactivity and releases it with its owner.
 * @param container - Mounted chart element owned by the component.
 * @param getOption - Reactive chart option source.
 * @param getResetKey - Version incremented to clear ECharts-owned interaction state.
 */
export function usePieChart(
  container: Readonly<ShallowRef<HTMLDivElement | null>>,
  getOption: () => PieChartOption,
  getResetKey: () => number,
) {
  let chart: EChartsType | null = null
  let observer: ResizeObserver | null = null

  onMounted(() => {
    if (!container.value) {
      return
    }
    chart = init(container.value)
    chart.setOption(getOption())
    observer = new ResizeObserver(() => chart?.resize())
    observer.observe(container.value)
  })

  watch(
    [getOption, getResetKey],
    ([option, resetKey], [, previousResetKey]) => {
      chart?.setOption(option, {
        notMerge: resetKey !== previousResetKey,
      })
    },
  )

  onBeforeUnmount(() => {
    observer?.disconnect()
    chart?.dispose()
    chart = null
  })
}
