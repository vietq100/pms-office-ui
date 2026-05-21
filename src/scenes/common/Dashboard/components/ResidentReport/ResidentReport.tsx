import { L } from '@lib/abpUtility'
import { createGenderColumnChart } from '@lib/helperChart'
import residentService from '@services/member/resident/residentService'
import { Card } from 'antd'
import React from 'react'

type Props = { filters: any }

const ResidentReport = (props: Props) => {
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
    const data = await residentService.reportResident(props.filters || {})
    const parseData = data[0] ? data[0].residentGenderAge : []
    setLoading(false)
    chart = createGenderColumnChart('chartResidentReport')
    chart.data = parseData.map((item) => ({
      ...item,
      female: -item.female
    }))
  }
  return (
    <Card className={'dashboardBox'} title={L('REPORT_RESIDENT')} loading={loading} bordered={false}>
      <div id="chartResidentReport" style={{ width: '100%', height: 400 }}></div>
    </Card>
  )
}

export default ResidentReport
