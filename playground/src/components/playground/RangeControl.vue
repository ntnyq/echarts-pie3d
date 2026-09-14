<script lang="ts" setup>
interface Props {
  /**
   * 配置项的可访问名称。
   */
  label: string
  /**
   * 可选范围的下限。
   */
  min: number
  /**
   * 可选范围的上限。
   */
  max: number
}

defineProps<Props>()
const model = defineModel<number>({ required: true })
</script>

<template>
  <label class="flex items-center gap-2 text-xs text-control">
    {{ label }}
    <input
      v-model.number="model"
      class="playground-focus w-21 accent-chart"
      type="range"
      :min="min"
      :max="max"
    />
  </label>
</template>
