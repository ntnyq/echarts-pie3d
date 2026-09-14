import { finiteNumber, FULL_CIRCLE } from './layout'
import type { SectorLayout } from './layout'

type Vector3 = [number, number, number]

export interface SectorBuffers {
  positions: Float32Array
  normals: Float32Array
  indices: Uint16Array
}

function point(radius: number, angle: number, height: number): Vector3 {
  return [radius * Math.cos(angle), height, radius * Math.sin(angle)]
}

/**
 * Closed Y-up extrusion with separate vertices at every hard surface boundary.
 * @param layout Radii, depth and angular boundaries in layout units.
 * @param segments Subdivisions per full circle.
 * @returns Indexed triangles with outward normals.
 */
export function createSectorGeometry(
  layout: SectorLayout,
  segments = 128,
): SectorBuffers {
  const positions: number[] = []
  const normals: number[] = []
  const indices: number[] = []
  const start = Math.min(layout.startAngle, layout.endAngle)
  const end = Math.max(layout.startAngle, layout.endAngle)
  const span = Math.min(FULL_CIRCLE, end - start)
  const { innerRadius: inner, outerRadius: outer, depth } = layout

  function triangle(a: Vector3, b: Vector3, c: Vector3, normal: Vector3) {
    const ab = b.map((value, index) => value - (a[index] ?? 0))
    const ac = c.map((value, index) => value - (a[index] ?? 0))
    const cross: Vector3 = [
      (ab[1] ?? 0) * (ac[2] ?? 0) - (ab[2] ?? 0) * (ac[1] ?? 0),
      (ab[2] ?? 0) * (ac[0] ?? 0) - (ab[0] ?? 0) * (ac[2] ?? 0),
      (ab[0] ?? 0) * (ac[1] ?? 0) - (ab[1] ?? 0) * (ac[0] ?? 0),
    ]
    if (Math.hypot(...cross) < 1e-10) {
      return
    }
    const offset = positions.length / 3
    const isReversed =
      cross.reduce(
        (sum, value, index) => sum + value * (normal[index] ?? 0),
        0,
      ) < 0
    positions.push(...a, ...(isReversed ? c : b), ...(isReversed ? b : c))
    normals.push(...normal, ...normal, ...normal)
    indices.push(offset, offset + 1, offset + 2)
  }

  function quad(
    a: Vector3,
    b: Vector3,
    c: Vector3,
    d: Vector3,
    normal: Vector3,
  ) {
    triangle(a, b, c, normal)
    triangle(a, c, d, normal)
  }

  if (span > 1e-10 && outer > inner && inner >= 0 && depth >= 0) {
    const count = Math.max(
      1,
      Math.ceil(
        (span / FULL_CIRCLE) *
          Math.min(512, Math.max(12, finiteNumber(segments, 128))),
      ),
    )
    for (let index = 0; index < count; index++) {
      const a = start + (span * index) / count
      const b = start + (span * (index + 1)) / count
      const middle = (a + b) / 2
      quad(
        point(inner, a, depth),
        point(outer, a, depth),
        point(outer, b, depth),
        point(inner, b, depth),
        [0, 1, 0],
      )
      if (depth > 0) {
        quad(
          point(inner, a, 0),
          point(outer, a, 0),
          point(outer, b, 0),
          point(inner, b, 0),
          [0, -1, 0],
        )
        quad(
          point(outer, a, 0),
          point(outer, b, 0),
          point(outer, b, depth),
          point(outer, a, depth),
          [Math.cos(middle), 0, Math.sin(middle)],
        )
        if (inner > 0) {
          quad(
            point(inner, a, 0),
            point(inner, b, 0),
            point(inner, b, depth),
            point(inner, a, depth),
            [-Math.cos(middle), 0, -Math.sin(middle)],
          )
        }
      }
    }
    if (depth > 0 && span < FULL_CIRCLE - 1e-8) {
      quad(
        point(inner, start, 0),
        point(outer, start, 0),
        point(outer, start, depth),
        point(inner, start, depth),
        [Math.sin(start), 0, -Math.cos(start)],
      )
      quad(
        point(inner, end, 0),
        point(outer, end, 0),
        point(outer, end, depth),
        point(inner, end, depth),
        [-Math.sin(end), 0, Math.cos(end)],
      )
    }
  }
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices),
  }
}
