<script lang="ts" setup>
import { usePiePlayground } from '../../composables/usePiePlayground'
import PieChart from './PieChart.vue'
import PieControls from './PieControls.vue'

const {
  shape,
  depth,
  alpha,
  beta,
  option,
  resetKey,
  updateData,
  clearData,
  reset,
} = usePiePlayground()
</script>

<template>
  <PieControls
    v-model:shape="shape"
    v-model:depth="depth"
    v-model:alpha="alpha"
    v-model:beta="beta"
    @update-data="updateData"
    @clear-data="clearData"
    @reset="reset"
  />
  <PieChart
    :option="option"
    :reset-key="resetKey"
  />
  <footer
    class="flex flex-wrap justify-between gap-3 border-t border-divider pt-4.5 text-xs text-muted"
  >
    <code class="text-brand">type: 'pie3D'</code>
    <span>点击图例过滤 · 点击扇区选中 / 取消 · 调整窗口自动重排</span>
  </footer>
</template>
