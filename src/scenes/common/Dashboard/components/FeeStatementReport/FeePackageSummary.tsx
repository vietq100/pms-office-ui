import { L } from '@lib/abpUtility'
import { createClusteredColumnChart } from '@lib/helperChart'
import feeService from '@services/fee/feeService'
import { Card } from 'antd'
import React from 'react'

type Props = { filters: any }

const FeePackageSummary = (props: Props) => {
  let chart: any
  const [loading, setLoading] = React.useState(false)
  React.useEffect(() => {
    refreshChart()
    return () => {
      if (chart) {
        chart.dispose()
      }
    }
  }, [props.filters])

  const refreshChart = async () => {
    if (loading) {
      return
    }

    setLoading(true)
    const data = await feeService.reportPackageSummary(props.filters || {})
    const parseData = data.map((item) => ({
      ...item,
      status: item.statusId === 1 ? L('FEE_UNPAID') : L('FEE_PAID')
    }))
    setLoading(false)
    chart = createClusteredColumnChart('chartFeePackageSummary')
    chart.data = parseData
  }
  return (
    <Card className={'dashboardBox'} title={L('REPORT_FEE_PACKAGE_SUMMARY')} loading={loading} bordered={false}>
      <div id="chartFeePackageSummary" style={{ width: '100%', height: 600 }}></div>
    </Card>
  )
}

export default FeePackageSummary
