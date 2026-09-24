<script lang="ts" setup>
import type { PlaygroundSettings } from '../../types/playground'
import AppearanceControls from './AppearanceControls.vue'
import GeometryControls from './GeometryControls.vue'
import InteractionControls from './InteractionControls.vue'
import LabelControls from './LabelControls.vue'

defineProps<{
  settings: Readonly<PlaygroundSettings>
}>()
const emit = defineEmits<{
  change: [patch: Partial<PlaygroundSettings>]
}>()
</script>

<template>
  <aside
    class="min-w-0 border-t border-divider lg:border-t-0 lg:border-r lg:pr-6"
    aria-label="Chart settings"
  >
    <GeometryControls
      :settings="settings"
      @change="emit('change', $event)"
    />
    <AppearanceControls
      :settings="settings"
      @change="emit('change', $event)"
    />
    <LabelControls
      :settings="settings"
      @change="emit('change', $event)"
    />
    <InteractionControls
      :settings="settings"
      @change="emit('change', $event)"
    />
  </aside>
</template>
