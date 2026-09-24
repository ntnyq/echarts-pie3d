<script lang="ts" setup>
import { usePiePlayground } from '../../composables/usePiePlayground'
import PieChart from './PieChart.vue'
import PieControls from './PieControls.vue'

const {
  settings,
  updateSettings,
  option,
  resetKey,
  updateData,
  clearData,
  reset,
} = usePiePlayground()
</script>

<template>
  <div
    class="flex flex-wrap items-center justify-between gap-3 border-y border-divider py-4"
  >
    <p class="text-sm text-control">
      Adjust the settings to explore your chart.
    </p>
    <div class="flex flex-wrap gap-2">
      <button
        class="playground-button"
        type="button"
        @click="updateData"
      >
        Update data
      </button>
      <button
        class="playground-button"
        type="button"
        @click="clearData"
      >
        Clear data
      </button>
      <button
        class="playground-button"
        type="button"
        @click="reset"
      >
        Reset
      </button>
    </div>
  </div>
  <div class="grid items-start gap-6 py-4 lg:grid-cols-[260px_minmax(0,1fr)]">
    <div class="min-w-0 lg:sticky lg:top-4 lg:col-start-2 lg:row-start-1">
      <PieChart
        :option="option"
        :reset-key="resetKey"
      />
    </div>
    <PieControls
      :settings="settings"
      @change="updateSettings"
    />
  </div>
  <footer
    class="flex flex-wrap justify-between gap-3 border-t border-divider pt-4.5 text-xs text-muted"
  >
    <code class="text-brand">type: 'pie3D'</code>
    <span
      >Click the legend to filter · Click a slice to select · Resizes
      automatically</span
    >
  </footer>
</template>
