<script lang="ts" setup>
import type { PlaygroundSettings } from '../../types/playground'
import RangeControl from './RangeControl.vue'
import SelectControl from './SelectControl.vue'
import ToggleControl from './ToggleControl.vue'

defineProps<{
  settings: Readonly<PlaygroundSettings>
}>()
const emit = defineEmits<{
  change: [patch: Partial<PlaygroundSettings>]
}>()
</script>

<template>
  <details class="border-b border-divider py-4">
    <summary class="playground-focus cursor-pointer text-sm font-semibold">
      Interaction
    </summary>
    <div class="grid gap-4 pt-4">
      <ToggleControl
        :model-value="settings.hasLegend"
        label="Show legend"
        @update:model-value="emit('change', { hasLegend: $event })"
      />
      <ToggleControl
        :model-value="settings.hasTooltip"
        label="Show tooltips"
        @update:model-value="emit('change', { hasTooltip: $event })"
      />
      <ToggleControl
        :model-value="settings.hasEmphasis"
        label="Highlight on hover"
        @update:model-value="emit('change', { hasEmphasis: $event })"
      />
      <SelectControl
        :model-value="settings.selectionMode"
        label="Selection mode"
        :options="[
          { value: 'none', label: 'Disabled' },
          { value: 'single', label: 'Single' },
          { value: 'multiple', label: 'Multiple' },
        ]"
        @update:model-value="emit('change', { selectionMode: $event })"
      />
      <RangeControl
        :model-value="settings.selectedOffset"
        label="Selected slice offset"
        :min="0"
        :max="40"
        unit=" px"
        :disabled="settings.selectionMode === 'none'"
        @update:model-value="emit('change', { selectedOffset: $event })"
      />
    </div>
  </details>
</template>
