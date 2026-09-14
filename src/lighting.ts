import { graphicGL } from './gl'
import type { GLNode } from './gl-types'
import { finiteNumber } from './layout'
import type { Pie3DSeriesModel } from './series'

export function updateLight(group: GLNode, model: Pie3DSeriesModel) {
  const { light } = model.option
  group.add(
    new graphicGL.AmbientLight({
      intensity: Math.max(0, finiteNumber(light?.ambient?.intensity, 0.45)),
    }),
  )
  const main = new graphicGL.DirectionalLight({
    intensity: Math.max(0, finiteNumber(light?.main?.intensity, 0.8)),
  })
  const alpha = (finiteNumber(light?.main?.alpha, 55) * Math.PI) / 180
  const beta = (finiteNumber(light?.main?.beta, -30) * Math.PI) / 180
  main.position.set(
    Math.cos(alpha) * Math.sin(beta),
    Math.sin(alpha),
    Math.cos(alpha) * Math.cos(beta),
  )
  main.lookAt(new graphicGL.Vector3())
  group.add(main)
}
