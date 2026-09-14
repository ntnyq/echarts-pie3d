<script lang="ts" setup>
import type { PieShape } from '../../types/playground'
import RangeControl from './RangeControl.vue'

const emit = defineEmits<{
  updateData: []
  clearData: []
  reset: []
}>()

const shape = defineModel<PieShape>('shape', { required: true })
const depth = defineModel<number>('depth', { required: true })
const alpha = defineModel<number>('alpha', { required: true })
const beta = defineModel<number>('beta', { required: true })
</script>

<template>
  <section
    class="flex flex-wrap items-center gap-3 border-y border-divider py-4"
    aria-label="图表配置"
  >
    <button
      class="playground-button"
      type="button"
      :aria-pressed="shape === 'pie'"
      @click="shape = 'pie'"
    >
      饼图
    </button>
    <button
      class="playground-button"
      type="button"
      :aria-pressed="shape === 'donut'"
      @click="shape = 'donut'"
    >
      圆环
    </button>
    <RangeControl
      v-model="depth"
      label="厚度"
      :min="0"
      :max="80"
    />
    <RangeControl
      v-model="alpha"
      label="俯视角"
      :min="10"
      :max="89"
    />
    <RangeControl
      v-model="beta"
      label="旋转角"
      :min="-180"
      :max="180"
    />
    <button
      class="playground-button"
      type="button"
      @click="emit('updateData')"
    >
      更新数据
    </button>
    <button
      class="playground-button"
      type="button"
      @click="emit('clearData')"
    >
      清空数据
    </button>
    <button
      class="playground-button"
      type="button"
      @click="emit('reset')"
    >
      重置
    </button>
  </section>
</template>
