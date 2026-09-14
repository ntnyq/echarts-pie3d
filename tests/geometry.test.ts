import { describe, expect, it } from 'vitest'
import { createSectorGeometry } from '../src/geometry'
import { FULL_CIRCLE } from '../src/layout'
import type { SectorLayout } from '../src/layout'

const base: SectorLayout = {
  innerRadius: 0,
  outerRadius: 100,
  depth: 24,
  startAngle: 0,
  endAngle: Math.PI / 2,
  middleAngle: Math.PI / 4,
}

describe('extruded sector mesh', () => {
  it.each([0, 40])(
    'has outward winding and no degenerate triangles with inner radius %s',
    innerRadius => {
      const mesh = createSectorGeometry({ ...base, innerRadius })
      expect(mesh.indices.length).toBeGreaterThan(0)
      for (let offset = 0; offset < mesh.indices.length; offset += 3) {
        const a = (mesh.indices[offset] ?? 0) * 3
        const b = (mesh.indices[offset + 1] ?? 0) * 3
        const c = (mesh.indices[offset + 2] ?? 0) * 3
        const ab = [0, 1, 2].map(
          axis =>
            (mesh.positions[b + axis] ?? 0) - (mesh.positions[a + axis] ?? 0),
        )
        const ac = [0, 1, 2].map(
          axis =>
            (mesh.positions[c + axis] ?? 0) - (mesh.positions[a + axis] ?? 0),
        )
        const cross = [
          ab[1]! * ac[2]! - ab[2]! * ac[1]!,
          ab[2]! * ac[0]! - ab[0]! * ac[2]!,
          ab[0]! * ac[1]! - ab[1]! * ac[0]!,
        ]
        expect(Math.hypot(...cross)).toBeGreaterThan(0)
        expect(
          cross.reduce(
            (sum, value, axis) => sum + value * (mesh.normals[a + axis] ?? 0),
            0,
          ),
        ).toBeGreaterThan(0)
      }
    },
  )

  it.each([0, 40])('forms a closed solid with inner radius %s', innerRadius => {
    const mesh = createSectorGeometry({
      ...base,
      innerRadius,
      endAngle: FULL_CIRCLE,
    })
    const edges = new Map<string, number>()
    const vertex = (index: number) =>
      mesh.positions
        .slice(index * 3, index * 3 + 3)
        .map(value => Math.round(value * 10_000))
        .join(',')
    for (let offset = 0; offset < mesh.indices.length; offset += 3) {
      const vertices = [0, 1, 2].map(axis =>
        vertex(mesh.indices[offset + axis] ?? 0),
      )
      for (let axis = 0; axis < 3; axis++) {
        const edge = [vertices[axis] ?? '', vertices[(axis + 1) % 3] ?? '']
          .toSorted()
          .join('|')
        edges.set(edge, (edges.get(edge) ?? 0) + 1)
      }
    }
    expect(new Set(edges.values())).toStrictEqual(new Set([2]))
  })

  it('uses the same solid for clockwise and counterclockwise intervals', () => {
    expect(createSectorGeometry(base)).toStrictEqual(
      createSectorGeometry({
        ...base,
        startAngle: base.endAngle,
        endAngle: base.startAngle,
      }),
    )
  })

  it('omits cut faces for a full circle, and inner wall for a solid pie', () => {
    const pie = createSectorGeometry({ ...base, endAngle: FULL_CIRCLE }, 12)
    const donut = createSectorGeometry(
      { ...base, innerRadius: 40, endAngle: FULL_CIRCLE },
      12,
    )
    expect(pie.indices.length / 3).toBe(12 * 4)
    expect(donut.indices.length / 3).toBe(12 * 8)
  })

  it('bounds subdivision to 16-bit indices and supports flat or empty geometry', () => {
    const mesh = createSectorGeometry(
      { ...base, innerRadius: 40, endAngle: FULL_CIRCLE },
      1e9,
    )
    expect(Math.max(...mesh.indices)).toBeLessThan(65_536)
    expect(createSectorGeometry({ ...base, endAngle: 0 }).indices).toHaveLength(
      0,
    )
    expect(
      createSectorGeometry({ ...base, innerRadius: 100 }).indices,
    ).toHaveLength(0)
    expect(
      new Set(createSectorGeometry({ ...base, depth: 0 }).normals),
    ).toStrictEqual(new Set([0, 1]))
  })
})
