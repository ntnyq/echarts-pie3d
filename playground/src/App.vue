<script lang="ts" setup>
import PiePlayground from './components/playground/PiePlayground.vue'
import PlaygroundHeader from './components/PlaygroundHeader.vue'
</script>

<template>
  <div class="min-h-screen bg-page font-sans text-ink [font-synthesis:none]">
    <main class="mx-auto max-w-290 px-4 py-7 sm:px-8 sm:pt-12 sm:pb-6">
      <PlaygroundHeader />
      <PiePlayground />
    </main>
  </div>
</template>
