import { graphic } from 'echarts/core'
import type { ChartView } from 'echarts/core'
import { finiteNumber } from './layout'
import type { SectorLayout } from './layout'
import type { Pie3DSeriesModel } from './series'
import type {
  Pie3DDataItemOption,
  Pie3DLabelOption,
  Pie3DLabelLineOption,
} from './types'

interface LabelEntry {
  text: InstanceType<typeof graphic.Text>
  anchor: number[]
  elbow: number[]
  x: number
  y: number
  side: number
  height: number
  line: Pie3DLabelLineOption
  color: string
}

export function renderPieLabels(
  group: ChartView['group'],
  model: Pie3DSeriesModel,
  api: Parameters<ChartView['render']>[2],
  indices: IterableIterator<number>,
  project: (x: number, y: number, z: number) => number[],
) {
  group.removeAll()
  const data = model.getData()
  const labels: LabelEntry[] = []
  for (const index of indices) {
    const layout: SectorLayout = data.getItemLayout(index)
    const item = data.getItemModel<Pie3DDataItemOption>(index)
    const label: Pie3DLabelOption = {
      ...model.option.label,
      ...item.getModel('label').option,
    }
    const line: Pie3DLabelLineOption = {
      ...model.option.labelLine,
      ...item.getModel('labelLine').option,
      lineStyle: {
        ...model.option.labelLine?.lineStyle,
        ...item.option.labelLine?.lineStyle,
      },
    }
    const offset = model.isSelected(index)
      ? Math.max(0, finiteNumber(model.option.selectedOffset, 10))
      : 0
    const middleRadius = (layout.innerRadius + layout.outerRadius) / 2
    const projectRadius = (radius: number) =>
      project(
        Math.cos(layout.middleAngle) * (radius + offset),
        layout.depth,
        Math.sin(layout.middleAngle) * (radius + offset),
      )
    data.setItemLayout(index, {
      ...layout,
      tooltipPosition: projectRadius(middleRadius),
    })
    if (label.show === false) {
      // eslint-disable-next-line no-continue -- Hidden labels retain their tooltip anchor.
      continue
    }
    const params = model.getDataParams(index)
    const content =
      typeof label.formatter === 'function'
        ? label.formatter({
            ...params,
            seriesType: 'pie3D',
            seriesIndex: model.seriesIndex,
            seriesName: model.name,
            value: finiteNumber(params.value, 0),
            percent: finiteNumber(params.percent, 0),
          })
        : (label.formatter ?? '{b}').replaceAll(
            /\{(?<key>[abcd])\}/gu,
            (_match, key: string) =>
              String(
                (
                  {
                    a: model.name,
                    b: params.name,
                    c: params.value,
                    d: params.percent,
                  } as Record<string, unknown>
                )[key] ?? '',
              ),
          )
    const visual: { fill?: unknown } = data.getItemVisual(index, 'style')
    const fill = typeof visual.fill === 'string' ? visual.fill : '#5470c6'
    const isOutside =
      !label.position || ['outside', 'outer'].includes(label.position)
    const anchor =
      label.position === 'center'
        ? project(0, layout.depth, 0)
        : projectRadius(isOutside ? layout.outerRadius : middleRadius)
    const elbow = projectRadius(
      layout.outerRadius + Math.max(0, finiteNumber(line.length, 16)),
    )
    const center = project(0, layout.depth, 0)
    const side = (anchor[0] ?? 0) >= (center[0] ?? 0) ? 1 : -1
    const x = isOutside
      ? (center[0] ?? 0) +
        side *
          (layout.outerRadius +
            offset +
            Math.max(0, finiteNumber(line.length, 16)) +
            Math.max(0, finiteNumber(line.length2, 14)))
      : (anchor[0] ?? 0)
    const y = isOutside ? (elbow[1] ?? 0) : (anchor[1] ?? 0)
    const outsideAlign = side > 0 ? 'left' : 'right'
    const availableWidth = Math.max(
      0,
      side > 0 ? api.getWidth() - x - 12 : x - 12,
    )
    if (isOutside && availableWidth < (label.fontSize ?? 12) * 3) {
      // eslint-disable-next-line no-continue -- Hide labels with no room for readable text.
      continue
    }
    const text = new graphic.Text({
      silent: true,
      zlevel: finiteNumber(model.option.zlevel, -10) + 1,
      z: 10,
      style: {
        text: content,
        ...(isOutside
          ? { width: availableWidth, overflow: 'truncate' as const }
          : {}),
        x: x + (isOutside ? side * 4 : 0),
        y,
        fill: label.color ?? (isOutside ? fill : '#fff'),
        fontSize: label.fontSize ?? 12,
        fontFamily: label.fontFamily ?? 'sans-serif',
        fontWeight: label.fontWeight ?? 'normal',
        align: isOutside ? outsideAlign : 'center',
        verticalAlign: 'middle',
      },
    })
    if (isOutside) {
      labels.push({
        text,
        anchor,
        elbow,
        x,
        y,
        side,
        height: text.getBoundingRect().height + 4,
        line,
        color: fill,
      })
    } else {
      group.add(text)
    }
  }
  for (const side of [-1, 1]) {
    const entries = labels
      .filter(label => label.side === side)
      .toSorted((a, b) => a.y - b.y)
    const height = api.getHeight()
    let bottom = 4
    for (const entry of entries) {
      if (model.option.avoidLabelOverlap !== false) {
        entry.y = Math.max(
          bottom + entry.height / 2,
          Math.min(height - entry.height / 2 - 4, entry.y),
        )
        bottom = entry.y + entry.height / 2
        if (bottom > height - 4) {
          // eslint-disable-next-line no-continue -- Hidden labels retain their tooltip anchor.
          continue
        }
      }
      entry.text.setStyle({ y: entry.y })
      group.add(entry.text)
      if (entry.line.show !== false) {
        group.add(
          new graphic.Polyline({
            silent: true,
            zlevel: finiteNumber(model.option.zlevel, -10) + 1,
            z: 9,
            shape: {
              points: [
                entry.anchor,
                [entry.elbow[0] ?? 0, entry.y],
                [entry.x, entry.y],
              ],
            },
            style: {
              stroke: entry.line.lineStyle?.color ?? entry.color,
              lineWidth: entry.line.lineStyle?.width ?? 1,
              opacity: entry.line.lineStyle?.opacity ?? 1,
              fill: 'none',
            },
          }),
        )
      }
    }
  }
}
