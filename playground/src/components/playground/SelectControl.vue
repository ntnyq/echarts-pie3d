<script lang="ts" setup generic="T extends string">
defineProps<{
  /**
   * Accessible name of the setting.
   */
  label: string
  /**
   * Available values and their display names.
   */
  options: { value: T; label: string }[]
  /**
   * Whether this setting is unavailable.
   */
  disabled?: boolean
}>()
const model = defineModel<T>({ required: true })
</script>

<template>
  <label
    class="grid gap-2 text-xs text-control"
    :class="{ 'opacity-45': disabled }"
  >
    {{ label }}
    <select
      v-model="model"
      class="playground-focus w-full rounded-md border border-button bg-page px-2 py-2 text-ink disabled:cursor-not-allowed"
      :disabled="disabled"
    >
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </label>
</template>
