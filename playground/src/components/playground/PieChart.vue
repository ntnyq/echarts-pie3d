<script lang="ts" setup>
import { useTemplateRef } from 'vue'
import { usePieChart } from '../../composables/usePieChart'
import type { PieChartOption } from '../../types/playground'

const props = defineProps<{
  option: PieChartOption
  resetKey: number
}>()

const chartContainer = useTemplateRef<HTMLDivElement>('chartContainer')
usePieChart(
  chartContainer,
  () => props.option,
  () => props.resetKey,
)
</script>

<template>
  <div
    ref="chartContainer"
    class="h-105 min-h-90 w-full sm:h-[min(58vw,540px)]"
    role="img"
    aria-label="访问来源三维饼图，搜索、直接访问、社交媒体和其他来源"
  />
</template>
