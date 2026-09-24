<script lang="ts" setup>
import type { PlaygroundSettings } from '../../types/playground'
import RangeControl from './RangeControl.vue'
import SelectControl from './SelectControl.vue'

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
      View & lighting
    </summary>
    <div class="grid gap-4 pt-4">
      <RangeControl
        :model-value="settings.alpha"
        label="View elevation"
        :min="10"
        :max="89"
        unit="°"
        @update:model-value="emit('change', { alpha: $event })"
      />
      <RangeControl
        :model-value="settings.beta"
        label="View rotation"
        :min="-180"
        :max="180"
        unit="°"
        @update:model-value="emit('change', { beta: $event })"
      />
      <SelectControl
        :model-value="settings.shading"
        label="Shading"
        :options="[
          { value: 'lambert', label: 'Lambert' },
          { value: 'color', label: 'Flat color' },
        ]"
        @update:model-value="emit('change', { shading: $event })"
      />
      <RangeControl
        :model-value="settings.opacity"
        label="Opacity"
        :min="0.1"
        :max="1"
        :step="0.05"
        @update:model-value="emit('change', { opacity: $event })"
      />
      <RangeControl
        :model-value="settings.mainIntensity"
        label="Main light intensity"
        :min="0"
        :max="2"
        :step="0.05"
        :disabled="settings.shading === 'color'"
        @update:model-value="emit('change', { mainIntensity: $event })"
      />
      <RangeControl
        :model-value="settings.ambientIntensity"
        label="Ambient light intensity"
        :min="0"
        :max="2"
        :step="0.05"
        :disabled="settings.shading === 'color'"
        @update:model-value="emit('change', { ambientIntensity: $event })"
      />
      <RangeControl
        :model-value="settings.lightAlpha"
        label="Light elevation"
        :min="0"
        :max="90"
        unit="°"
        :disabled="settings.shading === 'color'"
        @update:model-value="emit('change', { lightAlpha: $event })"
      />
      <RangeControl
        :model-value="settings.lightBeta"
        label="Light rotation"
        :min="-180"
        :max="180"
        unit="°"
        :disabled="settings.shading === 'color'"
        @update:model-value="emit('change', { lightBeta: $event })"
      />
    </div>
  </details>
</template>
