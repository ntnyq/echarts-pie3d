import { ChartView, color } from 'echarts/core'
import { createSectorGeometry } from './geometry'
import { graphicGL, ViewGL } from './gl'
import type { GLMesh } from './gl-types'
import { renderPieLabels } from './labels'
import { finiteNumber, resolveCenter } from './layout'
import type { SectorLayout } from './layout'
import { updateLight } from './lighting'
import type { Pie3DSeriesModel } from './series'
import type { Pie3DDataItemOption, Pie3DItemStyle } from './types'

type GlobalModel = Parameters<ChartView['render']>[1]
type ExtensionAPI = Parameters<ChartView['render']>[2]
type Payload = Parameters<ChartView['highlight']>[3]

export class Pie3DView extends ChartView {
  public static type = 'pie3D'
  public override type = Pie3DView.type
  public __ecgl__ = true
  public override ignoreLabelLineUpdate = true
  public groupGL = new graphicGL.Node()
  public viewGL = new ViewGL('orthographic')
  private meshes = new Map<number, GLMesh>()
  private highlighted = new Set<number>()
  private model: Pie3DSeriesModel | undefined
  private api: ExtensionAPI | undefined
  private eventProxy: { selected?: boolean } | undefined

  public override init() {
    this.viewGL.add(this.groupGL)
  }

  public override render(
    model: Pie3DSeriesModel,
    _ecModel: GlobalModel,
    api: ExtensionAPI,
  ) {
    this.model = model
    this.api = api
    this.groupGL.removeAll()
    this.meshes.clear()
    this.highlighted.clear()
    this.updateCamera(model, api)
    updateLight(this.groupGL, model)
    const data = model.getData()
    data.each(index => {
      const layout: SectorLayout = data.getItemLayout(index)
      const buffers = createSectorGeometry(layout, model.option.segments)
      if (buffers.indices.length === 0) {
        return
      }
      const geometry = new graphicGL.Geometry()
      geometry.attributes.position.value = buffers.positions
      geometry.attributes.normal.value = buffers.normals
      geometry.indices = buffers.indices
      geometry.updateBoundingBox()
      geometry.dirty()
      const mesh = new graphicGL.Mesh({
        geometry,
        material: graphicGL.createMaterial(
          `ecgl.${model.option.shading === 'color' ? 'color' : 'lambert'}`,
        ),
        culling: true,
      })
      mesh.dataIndex = index
      mesh.seriesIndex = model.seriesIndex
      mesh.on('mouseover', () => {
        this.highlighted.add(index)
        this.updateState()
      })
      mesh.on('mouseout', () => {
        this.highlighted.delete(index)
        this.updateState()
      })
      // LayerGL dispatches its shared ZRender proxy after this mesh callback.
      // Seed selection from this item so native repeated clicks also unselect.
      mesh.on('click', () => {
        if (this.eventProxy) {
          this.eventProxy.selected = model.isSelected(index)
        }
      })
      this.meshes.set(index, mesh)
      this.groupGL.add(mesh)
    })
    this.updateState()
  }

  public afterRender(
    _model: Pie3DSeriesModel,
    _ecModel: GlobalModel,
    _api: ExtensionAPI,
    layer: { _zrEventProxy: { selected?: boolean } },
  ) {
    // ECharts GL exposes selection through this shared proxy.
    // eslint-disable-next-line no-underscore-dangle
    this.eventProxy = layer._zrEventProxy
  }

  private updateCamera(model: Pie3DSeriesModel, api: ExtensionAPI) {
    const width = Math.max(1, api.getWidth())
    const height = Math.max(1, api.getHeight())
    const [cx, cy] = resolveCenter(model.option, width, height)
    const [alpha, beta] = this.getViewAngles()
    const depth = Math.max(0, finiteNumber(model.option.depth, 24))
    const layouts: SectorLayout[] = model
      .getData()
      .mapArray(index => model.getData().getItemLayout(index))
    let extent = Math.max(width, height)
    for (const layout of layouts) {
      extent = Math.max(extent, layout.outerRadius)
    }
    const distance = Math.max(extent, depth) * 4 + 100
    const { camera } = this.viewGL
    this.viewGL.setViewport(0, 0, width, height, api.getDevicePixelRatio())
    camera.left = -cx
    camera.right = width - cx
    camera.top = cy
    camera.bottom = cy - height
    camera.near = 0.1
    camera.far = distance * 3
    camera.position.set(
      distance * Math.cos(alpha) * Math.sin(beta),
      distance * Math.sin(alpha) + depth / 2,
      distance * Math.cos(alpha) * Math.cos(beta),
    )
    camera.lookAt(new graphicGL.Vector3(0, depth / 2, 0))
    camera.update()
  }

  private getViewAngles(): [number, number] {
    const control = this.model?.option.viewControl
    return [
      (Math.min(89.9, Math.max(1, finiteNumber(control?.alpha, 35))) *
        Math.PI) /
        180,
      (finiteNumber(control?.beta, 0) * Math.PI) / 180,
    ]
  }

  private project(x: number, y: number, z: number): number[] {
    if (!this.model || !this.api) {
      return [0, 0]
    }
    const [cx, cy] = resolveCenter(
      this.model.option,
      this.api.getWidth(),
      this.api.getHeight(),
    )
    const [alpha, beta] = this.getViewAngles()
    const depth = Math.max(0, finiteNumber(this.model.option.depth, 24))
    return [
      cx + x * Math.cos(beta) - z * Math.sin(beta),
      cy +
        Math.sin(alpha) * (x * Math.sin(beta) + z * Math.cos(beta)) -
        (y - depth / 2) * Math.cos(alpha),
    ]
  }

  private updateState() {
    if (!this.model || !this.api) {
      return
    }
    const { model } = this
    const data = model.getData()
    for (const [index, mesh] of this.meshes) {
      const layout: SectorLayout = data.getItemLayout(index)
      const offset = model.isSelected(index)
        ? Math.max(0, finiteNumber(model.option.selectedOffset, 10))
        : 0
      mesh.position.set(
        Math.cos(layout.middleAngle) * offset,
        0,
        Math.sin(layout.middleAngle) * offset,
      )
      const item = data.getItemModel<Pie3DDataItemOption>(index)
      const visual: { fill?: unknown; opacity?: number } = data.getItemVisual(
        index,
        'style',
      )
      let fill = typeof visual.fill === 'string' ? visual.fill : '#5470c6'
      let opacity = finiteNumber(visual.opacity, 1)
      let state: 'select' | 'emphasis' | undefined = model.isSelected(index)
        ? 'select'
        : undefined
      if (
        this.highlighted.has(index) &&
        !(item.option.emphasis?.disabled ?? model.option.emphasis?.disabled)
      ) {
        state = 'emphasis'
      }
      if (state) {
        const style: Pie3DItemStyle = item.option[state]?.itemStyle ?? {}
        const inherited = model.option[state]?.itemStyle
        fill =
          style.color ??
          inherited?.color ??
          (state === 'emphasis' ? color.lift(fill, -0.2) : fill)
        opacity = finiteNumber(style.opacity ?? inherited?.opacity, opacity)
      }
      const rgba = color.parse(fill) ?? [84, 112, 198, 1]
      const alpha = Math.min(1, Math.max(0, (rgba[3] ?? 1) * opacity))
      mesh.material.set('color', [
        (rgba[0] ?? 0) / 255,
        (rgba[1] ?? 0) / 255,
        (rgba[2] ?? 0) / 255,
        alpha,
      ])
      mesh.material.transparent = alpha < 1
      mesh.material.depthMask = alpha === 1
    }
    renderPieLabels(
      this.group,
      model,
      this.api,
      this.meshes.keys(),
      (x, y, z) => this.project(x, y, z),
    )
    this.api.getZr().refresh()
  }

  public override highlight(
    _model: Pie3DSeriesModel,
    _ecModel: GlobalModel,
    _api: ExtensionAPI,
    payload: Payload,
  ) {
    this.toggleHighlight(payload, true)
  }

  public override downplay(
    _model: Pie3DSeriesModel,
    _ecModel: GlobalModel,
    _api: ExtensionAPI,
    payload: Payload,
  ) {
    this.toggleHighlight(payload, false)
  }

  private toggleHighlight(payload: Payload, isHighlighted: boolean) {
    const data = this.model?.getData()
    if (!data) {
      return
    }
    const rawIndices: unknown = payload['dataIndex']
    const names: unknown = payload['name']
    for (const index of this.meshes.keys()) {
      let matches = true
      if (typeof rawIndices === 'number' || Array.isArray(rawIndices)) {
        matches = (
          Array.isArray(rawIndices) ? rawIndices : [rawIndices]
        ).includes(data.getRawIndex(index))
      } else if (
        typeof payload['dataIndexInside'] === 'number' ||
        Array.isArray(payload['dataIndexInside'])
      ) {
        const inside: unknown = payload['dataIndexInside']
        matches = (Array.isArray(inside) ? inside : [inside]).includes(index)
      } else if (typeof names === 'string' || Array.isArray(names)) {
        matches = (Array.isArray(names) ? names : [names]).includes(
          data.getName(index),
        )
      }
      if (matches) {
        if (isHighlighted) {
          this.highlighted.add(index)
        } else {
          this.highlighted.delete(index)
        }
      }
    }
    this.updateState()
  }

  public select() {
    this.updateState()
  }
  public unselect() {
    this.updateState()
  }
  public toggleSelect() {
    this.updateState()
  }

  public override remove() {
    this.groupGL.removeAll()
    this.group.removeAll()
    this.meshes.clear()
    this.highlighted.clear()
    this.model = undefined
    this.api = undefined
    this.eventProxy = undefined
  }

  public override dispose() {
    this.remove()
  }
}
