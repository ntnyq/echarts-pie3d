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
      Labels
    </summary>
    <div class="grid gap-4 pt-4">
      <ToggleControl
        :model-value="settings.hasLabels"
        label="Show labels"
        @update:model-value="emit('change', { hasLabels: $event })"
      />
      <SelectControl
        :model-value="settings.labelPosition"
        label="Label position"
        :options="[
          { value: 'outside', label: 'Outside' },
          { value: 'inside', label: 'Inside' },
          { value: 'center', label: 'Center' },
        ]"
        :disabled="!settings.hasLabels"
        @update:model-value="emit('change', { labelPosition: $event })"
      />
      <RangeControl
        :model-value="settings.labelFontSize"
        label="Font size"
        :min="10"
        :max="24"
        unit=" px"
        :disabled="!settings.hasLabels"
        @update:model-value="emit('change', { labelFontSize: $event })"
      />
      <ToggleControl
        :model-value="settings.shouldAvoidLabelOverlap"
        label="Avoid label overlap"
        :disabled="!settings.hasLabels"
        @update:model-value="
          emit('change', { shouldAvoidLabelOverlap: $event })
        "
      />
      <ToggleControl
        :model-value="settings.hasLabelLines"
        label="Show label lines"
        :disabled="!settings.hasLabels || settings.labelPosition !== 'outside'"
        @update:model-value="emit('change', { hasLabelLines: $event })"
      />
      <RangeControl
        :model-value="settings.labelLineLength"
        label="Line length"
        :min="0"
        :max="50"
        unit=" px"
        :disabled="
          !settings.hasLabels ||
          !settings.hasLabelLines ||
          settings.labelPosition !== 'outside'
        "
        @update:model-value="emit('change', { labelLineLength: $event })"
      />
      <RangeControl
        :model-value="settings.labelLineLength2"
        label="Horizontal line length"
        :min="0"
        :max="50"
        unit=" px"
        :disabled="
          !settings.hasLabels ||
          !settings.hasLabelLines ||
          settings.labelPosition !== 'outside'
        "
        @update:model-value="emit('change', { labelLineLength2: $event })"
      />
      <RangeControl
        :model-value="settings.percentPrecision"
        label="Percentage precision"
        :min="0"
        :max="4"
        @update:model-value="emit('change', { percentPrecision: $event })"
      />
    </div>
  </details>
</template>
