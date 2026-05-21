import DashboardStore from '@stores/dashboardStore'
import Stores from '@stores/storeIdentifier'
import { inject, observer } from 'mobx-react'
import React from 'react'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import ProjectDashboard from './components/ProjectDashboard'
import ResidentDashboard from './components/ResidentDashboard'
import ResidentTypeDashboard from './components/ResidentTypeDashboard'
import StaffDashboard from './components/StaffDashboard'
import JobRequestDashboard from './components/JobRequestDashboard'
import JobRequestStatusDashboard from './components/JobRequestStatusDashboard'
import JobRequestByStaffDashboard from './components/JobRequestByStaffDashboard'
// import JobRequestByRatingDashboard from './components/JobRequestByRatingDashboard'
import FeedbackTypeDashboard from './components/FeedbackTypeDashboard'
import FeedbackStatusDashboard from './components/FeedbackStatusDashboard'
import FeedbackStaffDashboard from './components/FeedbackStaffDashboard'
// import FeedbackRatingDashboard from './components/FeedbackRatingDashboard'
import BookingDashboard from './components/BookingDashboard'
import FeeDashboard from './components/FeeDashboard'
import AppConsts, { appPermissions } from '@lib/appconst'
import { isGranted } from '@lib/abpUtility'
import { Card } from 'antd'
const { authorization } = AppConsts
// import { getEscalationModuleByModuleId, moduleIds } from '@lib/appconst'
// import WorkflowFirstResponse from './components/WorkflowFirstResponse'
// import WorkflowOnViolating from './components/WorkflowOnViolating'
type Props = {
  dashboardStore: DashboardStore
}
// const workOrder = getEscalationModuleByModuleId(moduleIds.workOrder)
// const feedback = getEscalationModuleByModuleId(moduleIds.feedback)
export const globalPlugins: any = (additionPlugin?) => ({
  ...additionPlugin,
  datalabels: {
    color: 'white',
    display: function (context) {
      return (context.dataset.data[context.dataIndex] || 0) > 1
    },
    font: {
      weight: 'bold',
      size: 8
    },
    formatter: Math.round
  }
})
const DashBoardWithChartJS = inject(Stores.DashboardStore)(
  observer((props: Props) => {
    const [filter, setFilter] = React.useState<any>({
      projectId: undefined
    })

    React.useEffect(() => {
      props.dashboardStore.getMyProject()
      const projectId = localStorage.getItem(authorization.projectId)
      if (projectId) {
        setFilter({ projectId })
      }
    }, [])

    return (
      <div className="dashboard-style">
        <Row gutter={[8, 8]}>
          <Col sm={{ span: 24, offset: 0 }}>
            <Card>
              <ProjectDashboard filter={filter} dashboardStore={props.dashboardStore} />
            </Card>
          </Col>

          <Col sm={{ span: 12, offset: 0 }}>
            <Card>
              <ResidentDashboard filter={filter} dashboardStore={props.dashboardStore} />
            </Card>
          </Col>
          <Col sm={{ span: 12, offset: 0 }}>
            <Card>
              <ResidentTypeDashboard filter={filter} dashboardStore={props.dashboardStore} />
            </Card>
          </Col>

          <Col sm={{ span: 24, offset: 0 }}>
            <Card>
              <StaffDashboard filter={filter} dashboardStore={props.dashboardStore} />
            </Card>
          </Col>

          <Col sm={{ span: 12, offset: 0 }}>
            <Card>
              <JobRequestDashboard filter={filter} dashboardStore={props.dashboardStore} />
            </Card>
          </Col>
          <Col sm={{ span: 12, offset: 0 }}>
            <Card>
              <JobRequestStatusDashboard filter={filter} dashboardStore={props.dashboardStore} />
            </Card>
          </Col>
          {/* <Col sm={{ span: 24, offset: 0 }}>
            <Card>
              <WorkflowFirstResponse escalationModule={workOrder} title="JOB_REQUEST_REPORT_FIRST_RESPONESE" />
            </Card>
          </Col> */}
          {/* <Col sm={{ span: 24, offset: 0 }}>
            <Card>
              <WorkflowOnViolating escalationModule={workOrder} title="JOB_REQUEST_ON_VIOLATING" />
            </Card>
          </Col> */}

          <Col sm={{ span: 24, offset: 0 }}>
            <Card>
              <JobRequestByStaffDashboard filter={filter} dashboardStore={props.dashboardStore} />
            </Card>
          </Col>

          {/* <Col sm={{ span: 24, offset: 0 }}>
            <Card>
              <JobRequestByRatingDashboard filter={filter} dashboardStore={props.dashboardStore} />
            </Card>
          </Col> */}

          <Col sm={{ span: 12, offset: 0 }}>
            <Card>
              <FeedbackTypeDashboard filter={filter} dashboardStore={props.dashboardStore} />
            </Card>
          </Col>
          <Col sm={{ span: 12, offset: 0 }}>
            <Card>
              <FeedbackStatusDashboard filter={filter} dashboardStore={props.dashboardStore} />
            </Card>
          </Col>
          {/* <Col sm={{ span: 24, offset: 0 }}>
            <Card>
              <WorkflowFirstResponse escalationModule={feedback} title="FEED_BACK_REPORT_FIRST_RESPONESE" />
            </Card>
          </Col>
          <Col sm={{ span: 24, offset: 0 }}>
            <Card>
              <WorkflowOnViolating escalationModule={feedback} title="FEED_BACK_ON_VIOLATING" />
            </Card>
          </Col> */}
          <Col sm={{ span: 24, offset: 0 }}>
            <Card>
              <FeedbackStaffDashboard filter={filter} dashboardStore={props.dashboardStore} />
            </Card>
          </Col>
          {/* <Col sm={{ span: 24, offset: 0 }}>
            <Card>
              <FeedbackRatingDashboard filter={filter} dashboardStore={props.dashboardStore} />
            </Card>
          </Col> */}
          <Col sm={{ span: 24, offset: 0 }}>
            <Card>
              <BookingDashboard filter={filter} dashboardStore={props.dashboardStore} />
            </Card>
          </Col>
          {isGranted(appPermissions.feePackage.read) && (
            <Col sm={{ span: 24, offset: 0 }}>
              <Card>
                <FeeDashboard filter={filter} dashboardStore={props.dashboardStore} />
              </Card>
            </Col>
          )}
        </Row>

        <div style={{ height: 100 }} />
        <style scoped>{`
        td.ant-table-cell {
          padding: 4px 16px !important;
          font-size: 12px !important
        }
        th.ant-table-cell {
          padding: 4px 16px !important;
          font-size: 12px !important
        }
        tr.bg-total {
          margin-top: 2px !important;
          background-color: whitesmoke !important;
          border-top: 4px dotted blue !important;
        }
        `}</style>
      </div>
    )
  })
)

export default DashBoardWithChartJS
