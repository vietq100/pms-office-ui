import workOrderService from '@services/communication/workOrderService'
import { createColumnChart, prepareChartColumnStack, prepareChartColumnStackSeries } from '@lib/helperChart'
import { L } from '@lib/abpUtility'
import { useState } from 'react'
import { useEffect } from 'react'
import { Card } from 'antd'

export default function WorkOrderType({ filters }) {
  let chart: any
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    refreshChart(filters)

    return () => {
      if (chart) {
        chart.dispose()
      }
    }
  }, [filters])

  const refreshChart = async (filters?) => {
    if (loading) {
      return
    }

    setLoading(true)
    const data = (await workOrderService.reportByType(filters || {})) as any
    setLoading(false)

    chart = createColumnChart('chartWorkOrderType', 'category', L('WORK_ORDER_TYPE'))
    chart.data = prepareChartColumnStack(data)
    data && data.length && prepareChartColumnStackSeries(chart, data[0], 'category', true)
  }

  return (
    <Card loading={loading} bordered={false}>
      <div id="chartWorkOrderType" style={{ width: '100%', height: '450px' }}></div>
    </Card>
  )
}
