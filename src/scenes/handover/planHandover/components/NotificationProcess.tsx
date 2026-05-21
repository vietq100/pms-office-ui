import CheckCircleOutlined from '@ant-design/icons/lib/icons/CheckCircleOutlined'
import CloseCircleOutlined from '@ant-design/icons/lib/icons/CloseCircleOutlined'
import MobileTwoTone from '@ant-design/icons/lib/icons/MobileTwoTone'
import MailTwoTone from '@ant-design/icons/MailTwoTone'
import DataTable from '@components/DataTable'
import { L } from '@lib/abpUtility'
import { renderDateTime } from '@lib/helper'
import HandoverStore from '@stores/handover/handoverStore'
import Card from 'antd/es/card'
import Col from 'antd/lib/col'
import Row from 'antd/lib/row'
import Table from 'antd/lib/table'
import React from 'react'
import { useParams } from 'react-router-dom'
import FilterNotificationProcess from './FilterNotificationProcess'

type Props = {
  handoverStore: HandoverStore
}
const column = [
  {
    title: L('UNIT'),
    dataIndex: 'fullUnitCode',
    key: 'fullUnitCode',
    width: 100
  },
  {
    title: L('OWNER'),
    dataIndex: 'displayName',
    key: 'displayName',
    width: 120
  },
  {
    title: L('EMAIL'),
    dataIndex: 'emailAddress',
    key: 'emailAddress',
    width: 140
  },
  {
    title: L('PHONE_NUMBER'),
    dataIndex: 'phoneNumber',
    key: 'phoneNumber',
    width: 120
  },
  {
    title: L('SEND_TO_EMAIL'),
    dataIndex: 'sendToEmailState',
    key: 'sendToEmailState',
    width: 80,
    render: (sendToEmailState) => (
      <>
        {sendToEmailState ? (
          <CheckCircleOutlined className="text-success" />
        ) : (
          <CloseCircleOutlined className="text-danger" />
        )}
      </>
    )
  },
  {
    title: L('SEND_TO_APP'),
    dataIndex: 'sendToInAppState',
    key: 'sendToInAppState',
    width: 80,
    render: (sendToInAppState) => (
      <>
        {sendToInAppState ? (
          <CheckCircleOutlined className="text-success" />
        ) : (
          <CloseCircleOutlined className="text-danger" />
        )}
      </>
    )
  },
  {
    title: L('EXECUTE_TIME'),
    dataIndex: 'executeTime',
    key: 'executeTime',
    width: 150,
    ellipsis: true,
    render: (executeTime) => <>{renderDateTime(executeTime)}</>
  }
]
const NotificationProcess = (props: Props) => {
  const params: any = useParams()
  const [filters, setFilters] = React.useState<any>({
    maxResultCount: 20,
    skipCount: 0
  })
  React.useEffect(() => {
    if (filters.handoverId) props.handoverStore.getNotificationProcess(filters)
  }, [filters])
  React.useEffect(() => {
    setFilters({ ...filters, handoverId: params.id })
  }, [])
  const currentPage = () => Math.floor(filters.skipCount / filters.maxResultCount) + 1
  const handleTableChange = (pagination: any) => {
    const newFilter = {
      ...filters,
      skipCount: (pagination.current - 1) * filters.maxResultCount
    }
    setFilters(newFilter)
  }
  const handleSearch = async (name, value) => {
    const newFilter = { ...filters, [name]: value }
    setFilters(newFilter)
  }
  return (
    <Row gutter={[16, 16]}>
      <Col sm={{ span: 12, offset: 0 }} className="text-center ">
        <Card style={{ backgroundColor: 'white', borderRadius: '20px' }}>
          <div className="d-flex align-items-center ">
            <MailTwoTone style={{ fontSize: 28 }} />
            <span className="mx-3 fs-4">{props.handoverStore.notificationProcess.totalSentViaEmailCount}</span>
          </div>
        </Card>
      </Col>
      <Col sm={{ span: 12, offset: 0 }} className="text-center ">
        <Card style={{ backgroundColor: 'white', borderRadius: '20px' }}>
          <div className="d-flex align-items-center ">
            <MobileTwoTone style={{ fontSize: 28 }} />
            <span className="mx-3 fs-4">{props.handoverStore.notificationProcess.totalSentViaDeviceCount}</span>
          </div>
        </Card>
      </Col>
      <Col sm={{ span: 24, offset: 0 }}>
        <FilterNotificationProcess handleSearch={handleSearch} handoverStore={props.handoverStore} />
        <DataTable
          pagination={{
            pageSize: filters.maxResultCount,
            current: currentPage(),
            total: props.handoverStore.notificationProcess.totalCount ?? 0,
            onChange: handleTableChange
          }}>
          <Table
            size="middle"
            // scroll={{ y: window.innerHeight - 540 }}
            className="custom-ant-table"
            rowKey={(record) => record.id}
            columns={column}
            pagination={false}
            loading={props.handoverStore.isLoading}
            dataSource={props.handoverStore.notificationProcess.items ?? []}
          />
        </DataTable>
      </Col>
    </Row>
  )
}
export default NotificationProcess
