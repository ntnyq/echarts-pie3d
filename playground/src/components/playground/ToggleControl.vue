<script lang="ts" setup>
defineProps<{
  label: string
  disabled?: boolean
}>()
const model = defineModel<boolean>({ required: true })
</script>

<template>
  <label
    class="flex items-center gap-2 text-xs text-control"
    :class="{ 'opacity-45': disabled }"
  >
    <input
      v-model="model"
      type="checkbox"
      class="playground-focus size-4 accent-chart disabled:cursor-not-allowed"
      :disabled="disabled"
    />
    {{ label }}
  </label>
</template>
