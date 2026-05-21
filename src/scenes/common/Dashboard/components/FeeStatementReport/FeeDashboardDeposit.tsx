import { L } from '@lib/abpUtility'
import { createVaribleRadiusPieChart } from '@lib/helperChart'
import feeGroupService from '@services/fee/feeGroupService'
import { Card, Col, Row } from 'antd'
import React from 'react'

type Props = {
  filters: any
}

const FeeDashboardDeposit = (props: Props) => {
  let chartDeposit: any
  let chartAmenity: any
  let chartextraAmenity: any
  const [loading, setLoading] = React.useState(false)
  React.useEffect(() => {
    refreshChart()
    return () => {
      if (chartDeposit) {
        chartDeposit.dispose()
        chartAmenity.dispose()
        chartextraAmenity.dispose()
      }
    }
  }, [props.filters])

  const refreshChart = async () => {
    if (loading) {
      return
    }

    setLoading(true)
    const data = await feeGroupService.summaryReservationByFeeTypes({
      ...props.filters,
      groupName: 'FeeReservation'
    })
    const depositData = data.find((item) => item.code === 'DEP')
    const parseDepositData = [
      { value: depositData?.refund, name: 'Refund' },
      { value: depositData?.paid, name: 'Paid' },
      { value: depositData?.unPaid, name: 'UnPaid' }
    ]
    const amenityData = data.find((item) => item.code === 'AUF')
    const parseAmenityData = [
      { value: amenityData?.refund, name: 'Refund' },
      { value: amenityData?.paid, name: 'Paid' },
      { value: amenityData?.unPaid, name: 'UnPaid' }
    ]
    const extraAmenityData = data.find((item) => item.code === 'EAU')
    const parseExtraAmenity = [
      { value: extraAmenityData?.refund, name: 'Refund' },
      { value: extraAmenityData?.paid, name: 'Paid' },
      { value: extraAmenityData?.unPaid, name: 'UnPaid' }
    ]
    setLoading(false)
    chartDeposit = createVaribleRadiusPieChart('chartDeposit', depositData?.color, depositData?.name)
    chartAmenity = createVaribleRadiusPieChart('chartAmenity', amenityData?.color, amenityData?.name)
    chartextraAmenity = createVaribleRadiusPieChart(
      'chartextraAmenity',
      extraAmenityData?.color,
      extraAmenityData?.name
    )
    chartDeposit.data = parseDepositData
    chartAmenity.data = parseAmenityData
    chartextraAmenity.data = parseExtraAmenity
  }
  return (
    <Card className={'dashboardBox'} title={L('REPORT_FEE_DEPOSIT')} loading={loading} bordered={false}>
      <Row>
        <Col sm={{ span: 8 }}>
          <div id="chartDeposit" style={{ width: '100%', height: 400 }}></div>
        </Col>
        <Col sm={{ span: 8 }}>
          <div id="chartAmenity" style={{ width: '100%', height: 400 }}></div>
        </Col>
        <Col sm={{ span: 8 }}>
          <div id="chartextraAmenity" style={{ width: '100%', height: 400 }}></div>
        </Col>
      </Row>
    </Card>
  )
}

export default FeeDashboardDeposit
