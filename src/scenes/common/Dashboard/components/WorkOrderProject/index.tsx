import workOrderService from '@services/communication/workOrderService'
import {
  createBarHorizontalChart,
  createBarHorizontalChartSeries,
  prepareChartHorizontalDataColumnStack
} from '@lib/helperChart'
import { L } from '@lib/abpUtility'
import { useState } from 'react'
import { useEffect } from 'react'
import { Card } from 'antd'

export default function WorkOrderProject({ filters }) {
  let chart: any
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    refreshChart()
    return () => {
      if (chart) {
        chart.dispose()
      }
    }
  }, [filters])

  const refreshChart = async () => {
    if (loading) {
      return
    }

    setLoading(true)
    const data = await workOrderService.reportByProject(filters || {})
    setLoading(false)
    const numberSeries = data && data.length ? data[0].status?.length : 0

    chart = createBarHorizontalChart('chartWorkOrderProject', 'category', L('PROJECT'), true, 30)
    chart.data = prepareChartHorizontalDataColumnStack(data)
    numberSeries && createBarHorizontalChartSeries(chart, data[0], 'category')
  }

  return (
    <Card className={'dashboardBox'} title={L('REPORT_WORK_ORDER_BY_PROJECT')} loading={loading} bordered={false}>
      <div id="chartWorkOrderProject"></div>
    </Card>
  )
}
