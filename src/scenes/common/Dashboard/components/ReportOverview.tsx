// import OverViewBar from '@components/DataTable/OverViewBar'
import OverViewAnnouncement from '@components/DataTable/OverViewAnnouncement'
import OverViewCard from '@components/DataTable/OverViewCard'
import { L } from '@lib/abpUtility'
import Summary from '@scenes/feeStatement/summary'
import AnnouncementStore from '@stores/announcement/announcementStore'
import ReservationStore from '@stores/booking/reservationStore'
import FeedbackStore from '@stores/communication/feedbackStore'
import WorkOrderStore from '@stores/communication/workOrderStore'
import ResidentStore from '@stores/member/resident/residentStore'
import StaffStore from '@stores/member/staff/staffStore'
import ContractStore from '@stores/project/contractStore'
import UnitStore from '@stores/project/unitStore'
import Stores from '@stores/storeIdentifier'
import { Col, Divider, Row, Spin } from 'antd'
import { inject, observer } from 'mobx-react'
import React from 'react'
import WorkOrderEmployee from './WorkOrderEmployee'
import WorkOrderStatus from './WorkOrderStatus'
import WorkOrderType from './WorkOrderType'
import FeeStore from '@stores/fee/feeStore'

type Props = {
  staffStore?: StaffStore
  residentStore?: ResidentStore
  contractStore?: ContractStore
  unitStore?: UnitStore
  announcementStore?: AnnouncementStore
  feedbackStore?: FeedbackStore
  workOrderStore?: WorkOrderStore
  reservationStore?: ReservationStore
  feeStore?: FeeStore
  filters: any
}

const ReportOverview = inject(
  Stores.StaffStore,
  Stores.ResidentStore,
  Stores.ContractStore,
  Stores.UnitStore,
  Stores.AnnouncementStore,
  Stores.FeedbackStore,
  Stores.WorkOrderStore,
  Stores.ReservationStore,
  Stores.FeeStore
)(
  observer((props: Props) => {
    const [loading, setLoading] = React.useState(false)
    const getAll = async () => {
      setLoading(true)
      await Promise.all([
        props.staffStore?.getOverview(props.filters),
        props.residentStore?.getOverview(props.filters),
        props.contractStore?.getOverview(props.filters),
        props.unitStore?.getOverview(props.filters),
        props.announcementStore?.getOverview(props.filters),
        props.feedbackStore?.getOverview(props.filters),
        props.workOrderStore?.getOverview(props.filters),
        props.reservationStore?.getOverview(props.filters)
      ])
      setLoading(false)
    }
    React.useEffect(() => {
      getAll()
    }, [props.filters])
    return (
      <Spin spinning={loading}>
        <Row gutter={[16, 5]}>
          <Col sm={{ span: 24, offset: 0 }}>
            <Summary
              isFeeGroup={true}
              filterObject={{ ...props.filters, groupName: 'FeeReservation' }}
              feeGroup={'FeeReservation'}
            />
          </Col>
          <Col sm={{ span: 24, offset: 0 }}>
            <Summary
              isFeeGroup={true}
              filterObject={props.filters}
              package={props.feeStore?.selectedPackage}
              feeGroup={'FeeStatement'}
            />
          </Col>
          <Col sm={{ span: 24, offset: 0 }}>
            <div className="fs-5 mt-3 mb-3">{L('ANNOUNCEMENT_OVERVIEW')}</div>
            <OverViewAnnouncement
              data={props.announcementStore?.announcementOverview || []}
              handleClickItem={() => {
                throw new Error('Not implement')
              }}
            />
          </Col>
          <Divider />

          <Col sm={{ span: 12, offset: 0 }}>
            <OverViewCard
              data={props.staffStore?.staffOverview || []}
              handleClickItem={() => {
                throw new Error('Not implement')
              }}
              cardTitle={L('STAFF_OVERVIEW')}
            />
          </Col>
          <Col sm={{ span: 12, offset: 0 }}>
            <OverViewCard
              data={props.residentStore?.residentOverview || []}
              handleClickItem={() => {
                throw new Error('Not implement')
              }}
              cardTitle={L('TENANT_OVERVIEW')}
            />
          </Col>
          <Divider />

          <Col sm={{ span: 12, offset: 0 }}>
            <OverViewCard
              data={props.contractStore?.contractOverview || []}
              handleClickItem={() => {
                throw new Error('Not implement')
              }}
              cardTitle={L('CONTRACT_OVERVIEW')}
            />
          </Col>
          <Col sm={{ span: 12, offset: 0 }}>
            <OverViewCard
              data={props.unitStore?.unitOverview || []}
              handleClickItem={() => {
                throw new Error('Not implement')
              }}
              cardTitle={L('UNIT_OVERVIEW')}
            />
          </Col>
          <Divider />

          <Col sm={{ span: 12, offset: 0 }}>
            <OverViewCard
              data={props.feedbackStore?.feedbackOverview || []}
              handleClickItem={() => {
                throw new Error('Not implement')
              }}
              cardTitle={L('FEEDBACK_OVERVIEW')}
            />
          </Col>
          <Col sm={{ span: 12, offset: 0 }}>
            <OverViewCard
              data={props.reservationStore?.reservationOverview || []}
              handleClickItem={() => {
                throw new Error('Not implement')
              }}
              cardTitle={L('RESERVATION_OVERVIEW')}
            />
          </Col>

          <Divider />
          <Col sm={{ span: 24, offset: 0 }}>
            <OverViewCard
              data={props.workOrderStore?.workOrderOverview || []}
              handleClickItem={() => {
                throw new Error('Not implement')
              }}
              cardTitle={L('WORK_ORDER_OVERVIEW')}
            />
          </Col>
          <Col sm={{ span: 12 }}>
            <WorkOrderType filters={props.filters} />
          </Col>
          <Col sm={{ span: 12 }}>
            <WorkOrderStatus filters={props.filters} />
          </Col>
          <Col sm={{ span: 24 }}>
            <WorkOrderEmployee filters={props.filters} />
          </Col>
        </Row>
      </Spin>
    )
  })
)

export default ReportOverview
