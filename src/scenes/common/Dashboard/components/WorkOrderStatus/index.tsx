import workOrderService from '@services/communication/workOrderService'
import { createColumnChart, prepareChartColumnSeries } from '@lib/helperChart'
import { L } from '@lib/abpUtility'
import { useState } from 'react'
import { useEffect } from 'react'
import { Card } from 'antd'

export default function WorkOrderStatus({ filters }) {
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
    const data = (await workOrderService.reportByStatus(filters || {})) as any
    setLoading(false)

    chart = createColumnChart('chartWorkOrderStatus', 'category', L('STATUS'), false)
    chart.data = data
    prepareChartColumnSeries(chart, L('COUNT'), 'category', 'value')
  }

  return (
    <Card loading={loading} bordered={false}>
      <div id="chartWorkOrderStatus" style={{ width: '100%', height: '450px' }}></div>
    </Card>
  )
}
