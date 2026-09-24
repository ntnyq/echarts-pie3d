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
  <details
    class="border-b border-divider py-4"
    open
  >
    <summary class="playground-focus cursor-pointer text-sm font-semibold">
      Geometry
    </summary>
    <div class="grid gap-4 pt-4">
      <SelectControl
        :model-value="settings.shape"
        label="Shape"
        :options="[
          { value: 'pie', label: 'Pie' },
          { value: 'donut', label: 'Donut' },
        ]"
        @update:model-value="emit('change', { shape: $event })"
      />
      <RangeControl
        :model-value="settings.innerRadius"
        label="Inner radius"
        :min="0"
        :max="settings.outerRadius - 1"
        unit="%"
        :disabled="settings.shape === 'pie'"
        @update:model-value="emit('change', { innerRadius: $event })"
      />
      <RangeControl
        :model-value="settings.outerRadius"
        label="Outer radius"
        :min="20"
        :max="90"
        unit="%"
        @update:model-value="emit('change', { outerRadius: $event })"
      />
      <RangeControl
        :model-value="settings.depth"
        label="Depth"
        :min="0"
        :max="80"
        unit=" px"
        @update:model-value="emit('change', { depth: $event })"
      />
      <RangeControl
        :model-value="settings.startAngle"
        label="Start angle"
        :min="0"
        :max="360"
        unit="°"
        @update:model-value="emit('change', { startAngle: $event })"
      />
      <RangeControl
        :model-value="settings.padAngle"
        label="Slice gap"
        :min="0"
        :max="20"
        unit="°"
        :step="0.5"
        @update:model-value="emit('change', { padAngle: $event })"
      />
      <RangeControl
        :model-value="settings.segments"
        label="Segments"
        :min="12"
        :max="512"
        @update:model-value="emit('change', { segments: $event })"
      />
      <ToggleControl
        :model-value="settings.isClockwise"
        label="Clockwise"
        @update:model-value="emit('change', { isClockwise: $event })"
      />
    </div>
  </details>
</template>
