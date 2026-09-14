import type { ComposeOption, use } from 'echarts/core'
import { expectTypeOf, it } from 'vitest'
import type { Pie3DChart, Pie3DSeriesOption } from '../src'

it('supports ComposeOption and the public installer', () => {
  const option = {
    series: [
      { type: 'pie3D', radius: ['35%', '70%'], depth: 24, data: [1, 2] },
    ],
  } satisfies ComposeOption<Pie3DSeriesOption>
  expectTypeOf(option.series[0]?.type).toEqualTypeOf<'pie3D' | undefined>()
  expectTypeOf<typeof Pie3DChart>().toExtend<Parameters<typeof use>[0]>()
})

it('does not promise unimplemented 2D options', () => {
  // @ts-expect-error Rose layouts are outside the first release.
  const rose: Pie3DSeriesOption = { type: 'pie3D', roseType: 'area' }
  const perspective: Pie3DSeriesOption = {
    // @ts-expect-error The initial renderer uses only orthographic projection.
    viewControl: { projection: 'perspective' },
  }
  expectTypeOf(rose).toEqualTypeOf<Pie3DSeriesOption>()
  expectTypeOf(perspective).toEqualTypeOf<Pie3DSeriesOption>()
})
