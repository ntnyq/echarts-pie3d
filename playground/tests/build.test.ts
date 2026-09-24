import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import { expect, it } from 'vitest'

it('preserves the ECharts GL layer registration in production', async () => {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    build: {
      write: false,
      lib: {
        entry: fileURLToPath(new URL('../../src/index.ts', import.meta.url)),
        formats: ['es'],
      },
    },
  })
  if ('on' in result) {
    throw new Error('Expected a production build, not a watcher')
  }
  const outputs = Array.isArray(result) ? result : [result]
  const registration = outputs
    .flatMap(output => output.output)
    .filter(output => output.type === 'chunk')
    .flatMap(chunk => Object.entries(chunk.modules))
    .find(([id]) => id.endsWith('/echarts-gl/lib/echarts-gl.js'))

  // Labels still render if tree-shaking removes the WebGL lifecycle hooks.
  expect(registration?.[1].renderedLength).toBeGreaterThan(0)
})
