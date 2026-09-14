declare module 'echarts/lib/visual/LegendVisualProvider.js' {
  import type { List, SeriesModel } from 'echarts/core'
  const LegendVisualProvider: new (
    getData: () => List,
    getRawData: () => List,
  ) => SeriesModel['legendVisualProvider']
  export default LegendVisualProvider
}

declare module 'echarts-gl/lib/echarts-gl.js'

declare module 'echarts-gl/lib/util/graphicGL.js' {
  import type { GraphicGL } from './gl-types'
  const graphicGL: GraphicGL
  export default graphicGL
}

declare module 'echarts-gl/lib/core/ViewGL.js' {
  import type { GLView } from './gl-types'
  const ViewGL: new (projection: string) => GLView
  export default ViewGL
}
