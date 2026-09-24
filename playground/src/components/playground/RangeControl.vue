<script lang="ts" setup>
import { useId } from 'vue'

interface Props {
  /**
   * Accessible name of the setting.
   */
  label: string
  /**
   * Lowest allowed value.
   */
  min: number
  /**
   * Highest allowed value.
   */
  max: number
  /**
   * Increment between selectable values.
   */
  step?: number
  /**
   * Unit displayed beside the current value.
   */
  unit?: string
  /**
   * Whether the setting is unavailable with the current configuration.
   */
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  step: 1,
  unit: '',
  disabled: false,
})
const model = defineModel<number>({ required: true })

const inputId = useId()

function updateValue(event: Event) {
  if (event.target instanceof HTMLInputElement) {
    model.value = event.target.valueAsNumber
  }
}
</script>

<template>
  <div
    class="grid gap-2 text-xs text-control"
    :class="{ 'opacity-45': disabled }"
  >
    <div class="flex items-center justify-between gap-2">
      <label :for="inputId">{{ label }}</label>
      <output
        :for="inputId"
        class="tabular-nums"
        >{{ model }}{{ unit }}</output
      >
    </div>
    <input
      :id="inputId"
      class="playground-focus w-full accent-chart disabled:cursor-not-allowed"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :value="model"
      @input="updateValue"
    />
  </div>
</template>
