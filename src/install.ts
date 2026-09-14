import type { use } from 'echarts/core'
import { createPieLayout, getPercents } from './layout'
import { Pie3DSeriesModel } from './series'
import { Pie3DView } from './view'

type Extension = Exclude<Parameters<typeof use>[0], unknown[]>

/**
 * Register with echarts.use(Pie3DChart) before calling setOption.
 */
export const Pie3DChart: Extension = {
  install(registers) {
    registers.registerSeriesModel(Pie3DSeriesModel)
    registers.registerChartView(Pie3DView)
    registers.registerProcessor(registers.PRIORITY.PROCESSOR.FILTER, {
      seriesType: 'pie3D',
      reset(series, ecModel) {
        if (!(series instanceof Pie3DSeriesModel)) {
          return
        }
        const legends = ecModel.findComponents({ mainType: 'legend' })
        const data = series.getData()
        data.filterSelf(index => {
          const value = data.get('value', index)
          return (
            typeof value === 'number' &&
            Number.isFinite(value) &&
            value >= 0 &&
            legends.every(legend => {
              if (
                !('isSelected' in legend) ||
                typeof legend.isSelected !== 'function'
              ) {
                return true
              }
              return legend.isSelected(data.getName(index))
            })
          )
        })
      },
    })
    registers.registerLayout((ecModel, api) => {
      ecModel.eachSeriesByType('pie3D', series => {
        if (!(series instanceof Pie3DSeriesModel)) {
          return
        }
        const data = series.getData()
        const values = data.mapArray('value', Number)
        const layouts = createPieLayout(
          values,
          series.option,
          api.getWidth(),
          api.getHeight(),
        )
        for (const [index, layout] of layouts.entries()) {
          data.setItemLayout(index, layout)
        }
        data.setLayout(
          'percents',
          getPercents(values, series.option.percentPrecision ?? 2),
        )
      })
    })
  },
}
