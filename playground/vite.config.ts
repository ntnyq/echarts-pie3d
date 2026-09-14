import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), UnoCSS()],
  resolve: {
    alias: {
      'echarts-pie3d': fileURLToPath(
        new URL('../src/index.ts', import.meta.url),
      ),
    },
    dedupe: ['echarts', 'vue'],
  },
})
