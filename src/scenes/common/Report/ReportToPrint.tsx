import { Col, Row } from 'antd'
import React from 'react'
import { useLocation } from 'react-router-dom'
import FeeDashboardDeposit from '../Dashboard/components/FeeStatementReport/FeeDashboardDeposit'
import FeePackageSummary from '../Dashboard/components/FeeStatementReport/FeePackageSummary'
import WorkOrderEmployee from '../Dashboard/components/WorkOrderEmployee'
import WorkOrderProject from '../Dashboard/components/WorkOrderProject'
import WorkOrderRatingEmployee from '../Dashboard/components/WorkOrderRatingEmployee'
import WorkOrderStatus from '../Dashboard/components/WorkOrderStatus'
import WorkOrderType from '../Dashboard/components/WorkOrderType'

const ReportToPrint = () => {
  const location = useLocation()
  const [filter, setFilter] = React.useState<any>()
  const [displayReportList, setDisplayReportList] = React.useState({
    woProject: false,
    woType: false,
    woStatus: false,
    woEmployee: false,
    woRatingEmployee: false,
    feePackageSummary: false,
    feeDashboardDeposit: false
  })
  React.useEffect(() => {
    // if (location.search.includes('%')) return
    const data = JSON.parse(decodeURI(location.search).slice(1))
    if (data) {
      setFilter(data.filter)
      setDisplayReportList(data.displayReportList)
    }
  }, [location])
  return (
    <div>
      <Row>
        {displayReportList.woProject && (
          <Col sm={{ span: 24 }}>
            <WorkOrderProject filters={filter} />
          </Col>
        )}
      </Row>
      <Row gutter={[16, 16]} className="mt-3">
        {displayReportList.woType && (
          <Col sm={{ span: 12 }}>
            <WorkOrderType filters={filter} />
          </Col>
        )}
        {displayReportList.woStatus && (
          <Col sm={{ span: 12 }}>
            <WorkOrderStatus filters={filter} />
          </Col>
        )}
        {displayReportList.woEmployee && (
          <Col sm={{ span: 24 }}>
            <WorkOrderEmployee filters={filter} />
          </Col>
        )}
        {displayReportList.woRatingEmployee && (
          <Col sm={{ span: 24 }}>
            <WorkOrderRatingEmployee filters={filter} />
          </Col>
        )}
        {displayReportList.feePackageSummary && (
          <Col sm={{ span: 24 }}>
            <FeePackageSummary filters={filter} />
          </Col>
        )}
        {displayReportList.feeDashboardDeposit && (
          <Col sm={{ span: 24 }}>
            <FeeDashboardDeposit filters={filter} />
          </Col>
        )}
      </Row>
    </div>
  )
}

export default ReportToPrint
