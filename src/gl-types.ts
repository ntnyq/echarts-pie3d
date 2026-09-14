/**
 * Minimal contracts for the untyped ECharts GL 2.0.9 adapter boundary.
 */
export interface GLVector {
  set: (x: number, y: number, z: number) => void
}

export interface GLNode {
  position: GLVector
  add: (node: GLNode) => void
  removeAll: () => void
  lookAt: (target: GLVector) => void
}

export interface GLGeometry {
  attributes: {
    position: { value: Float32Array }
    normal: { value: Float32Array }
  }
  indices: Uint16Array
  updateBoundingBox: () => void
  dirty: () => void
}

export interface GLMaterial {
  transparent: boolean
  depthMask: boolean
  set: (name: string, value: number[]) => void
}

export interface GLMesh extends GLNode {
  geometry: GLGeometry
  material: GLMaterial
  dataIndex: number
  seriesIndex: number
  on: (event: string, callback: () => void) => void
}

export interface GLCamera extends GLNode {
  left: number
  right: number
  top: number
  bottom: number
  near: number
  far: number
  update: () => void
}

export interface GLView {
  camera: GLCamera
  add: (node: GLNode) => void
  setViewport: (
    x: number,
    y: number,
    width: number,
    height: number,
    dpr: number,
  ) => void
}

export interface GraphicGL {
  Node: new () => GLNode
  Vector3: new (x?: number, y?: number, z?: number) => GLVector
  Geometry: new () => GLGeometry
  Mesh: new (options: {
    geometry: GLGeometry
    material: GLMaterial
    culling: boolean
  }) => GLMesh
  AmbientLight: new (options: { intensity: number }) => GLNode
  DirectionalLight: new (options: { intensity: number }) => GLNode
  createMaterial: (name: string) => GLMaterial
}
