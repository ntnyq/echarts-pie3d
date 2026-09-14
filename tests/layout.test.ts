import { describe, expect, it } from 'vitest'
import {
  allocateAngles,
  createPieLayout,
  FULL_CIRCLE,
  getPercents,
  resolveCenter,
} from '../src/layout'

describe('pie layout', () => {
  it('resolves CSS pixel center and percentage radii using half the shorter edge', () => {
    expect(resolveCenter({ center: ['25%', 120] }, 800, 400)).toStrictEqual([
      200, 120,
    ])
    expect(
      createPieLayout([1], { radius: ['40%', '70%'], depth: 32 }, 800, 400)[0],
    ).toMatchObject({ innerRadius: 80, outerRadius: 140, depth: 32 })
  })

  it('starts at 12 o’clock and respects direction and padding', () => {
    const clockwise = createPieLayout([1, 3], {}, 400, 400)
    expect(clockwise[0]?.startAngle).toBeCloseTo(-Math.PI / 2)
    expect(clockwise[0]?.endAngle).toBeCloseTo(0)
    const reverse = createPieLayout(
      [1, 3],
      { clockwise: false, padAngle: 10 },
      400,
      400,
    )
    expect(reverse[0]?.startAngle).toBeCloseTo(-Math.PI / 2 - Math.PI / 36)
    expect(reverse[0]?.endAngle).toBeCloseTo(-Math.PI + Math.PI / 36)
  })

  it('iteratively redistributes minimum angles without overlapping the final sector', () => {
    const angles = allocateAngles([1, 2, 97], Math.PI / 6, true)
    expect(angles[0]).toBeCloseTo(Math.PI / 6)
    expect(angles[1]).toBeCloseTo(Math.PI / 6)
    expect(angles.reduce((sum, value) => sum + value, 0)).toBeCloseTo(
      FULL_CIRCLE,
    )
    for (const angle of allocateAngles([1, 2, 97], FULL_CIRCLE, true)) {
      expect(angle).toBeCloseTo(FULL_CIRCLE / 3)
    }
  })

  it('handles empty and zero-sum data without inventing percentages', () => {
    expect(createPieLayout([], {}, 400, 400)).toStrictEqual([])
    expect(allocateAngles([0, 0], 0, true)).toStrictEqual([Math.PI, Math.PI])
    expect(allocateAngles([0, 0], 0, false)).toStrictEqual([0, 0])
    expect(getPercents([0, 0], 2)).toStrictEqual([0, 0])
    expect(allocateAngles([0, 1], 0, true)).toStrictEqual([0, FULL_CIRCLE])
  })

  it('collapses a slice when padding consumes its entire angle', () => {
    const [layout] = createPieLayout([1, 359], { padAngle: 5 }, 400, 400)
    expect(layout?.startAngle).toBeCloseTo(layout?.endAngle ?? 0)
  })

  it('rounds percentages to 100 and tolerates very large finite values', () => {
    expect(getPercents([1, 1, 1], 2)).toStrictEqual([33.34, 33.33, 33.33])
    expect(getPercents([Number.MAX_VALUE, Number.MAX_VALUE], 2)).toStrictEqual([
      50, 50,
    ])
    expect(
      allocateAngles([Number.MAX_VALUE, Number.MAX_VALUE], 0, true),
    ).toStrictEqual([Math.PI, Math.PI])
  })
})
