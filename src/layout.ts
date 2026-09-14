import type { Pie3DSeriesOption } from './types'

export const FULL_CIRCLE = Math.PI * 2

export interface SectorLayout {
  startAngle: number
  endAngle: number
  middleAngle: number
  innerRadius: number
  outerRadius: number
  depth: number
}

export function finiteNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function parseLength(value: number | string, total: number): number {
  const parsed =
    typeof value === 'string'
      ? Number(value.endsWith('%') ? value.slice(0, -1) : value) *
        (value.endsWith('%') ? total / 100 : 1)
      : value
  return finiteNumber(parsed, 0)
}

export function resolveCenter(
  option: Pie3DSeriesOption,
  width: number,
  height: number,
): [number, number] {
  const center = option.center ?? ['50%', '50%']
  return [parseLength(center[0], width), parseLength(center[1], height)]
}

function getMaximum(values: number[]): number {
  let maximum = 0
  for (const value of values) {
    maximum = Math.max(maximum, value)
  }
  return maximum
}

/**
 * Allocate minimum angles iteratively so clamping never exceeds one full turn.
 * @param values Nonnegative finite values after data filtering.
 * @param minAngle Minimum radians per slice.
 * @param stillShowZeroSum Whether zero-sum data divides the circle equally.
 * @returns Angular spans in radians.
 */
export function allocateAngles(
  values: number[],
  minAngle: number,
  stillShowZeroSum: boolean,
): number[] {
  if (values.length === 0) {
    return []
  }
  const maximum = getMaximum(values)
  if (!maximum && !stillShowZeroSum) {
    return values.map(() => 0)
  }
  const weights = values.map(value => (maximum ? value / maximum : 1))
  const minimum = Math.min(Math.max(minAngle, 0), FULL_CIRCLE / values.length)
  const angles = values.map(() => 0)
  let remaining = FULL_CIRCLE
  let pending = weights.map((_, index) => index)
  while (pending.length > 0) {
    const budget = remaining
    const count = pending.length
    const sum = pending.reduce(
      (total, index) => total + (weights[index] ?? 0),
      0,
    )
    const small = pending.filter(
      index =>
        (sum ? ((weights[index] ?? 0) / sum) * budget : budget / count) <
        minimum,
    )
    if (small.length === 0) {
      for (const index of pending) {
        angles[index] = sum
          ? ((weights[index] ?? 0) / sum) * budget
          : budget / count
      }
      break
    }
    const clamped = new Set(small)
    for (const index of small) {
      angles[index] = minimum
      remaining -= minimum
    }
    pending = pending.filter(index => !clamped.has(index))
  }
  return angles
}

export function createPieLayout(
  values: number[],
  option: Pie3DSeriesOption,
  width: number,
  height: number,
): SectorLayout[] {
  const size = Math.max(0, Math.min(width, height)) / 2
  const radius = option.radius ?? [0, '70%']
  const radii = Array.isArray(radius) ? radius : [0, radius]
  const innerRadius = Math.max(0, parseLength(radii[0] ?? 0, size))
  const outerRadius = Math.max(innerRadius, parseLength(radii[1] ?? 0, size))
  const depth = Math.max(0, finiteNumber(option.depth, 24))
  const direction = option.clockwise === false ? -1 : 1
  const minAngle = (finiteNumber(option.minAngle, 0) * Math.PI) / 180
  const padAngle =
    (Math.max(0, finiteNumber(option.padAngle, 0)) * Math.PI) / 180
  const angles = allocateAngles(
    values,
    minAngle,
    option.stillShowZeroSum !== false,
  )
  let cursor = (-finiteNumber(option.startAngle, 90) * Math.PI) / 180
  return angles.map(angle => {
    const gap = Math.min(angle, padAngle)
    const layout = {
      startAngle: cursor + (direction * gap) / 2,
      endAngle: cursor + direction * (angle - gap / 2),
      middleAngle: cursor + (direction * angle) / 2,
      innerRadius,
      outerRadius,
      depth,
    }
    cursor += direction * angle
    return layout
  })
}

/**
 * Largest-remainder rounding keeps displayed percentages at exactly 100%.
 * @param values Nonnegative finite values after data filtering.
 * @param precision Decimal places, clamped to 0–6.
 * @returns Rounded percentages; zeros for an empty total.
 */
export function getPercents(values: number[], precision: number): number[] {
  const maximum = getMaximum(values)
  if (!maximum) {
    return values.map(() => 0)
  }
  const weights = values.map(value => value / maximum)
  const sum = weights.reduce((total, value) => total + value, 0)
  const scale =
    10 ** Math.min(6, Math.max(0, Math.floor(finiteNumber(precision, 2))))
  const exact = weights.map(value => (value / sum) * 100 * scale)
  const seats = exact.map(value => Math.floor(value))
  const order = exact
    .map((value, index) => ({ index, remainder: value - (seats[index] ?? 0) }))
    .toSorted((a, b) => b.remainder - a.remainder || a.index - b.index)
  const left = Math.round(
    100 * scale - seats.reduce((total, value) => total + value, 0),
  )
  for (const { index } of order.slice(0, left)) {
    seats[index] = (seats[index] ?? 0) + 1
  }
  return seats.map(value => value / scale)
}
