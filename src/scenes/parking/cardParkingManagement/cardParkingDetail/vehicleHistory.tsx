import { AppComponentListBase } from '@components/AppComponentBase'
import withRouter from '@components/Layout/Router/withRouter'
import { L } from '@lib/abpUtility'
import { renderDateTime } from '@lib/helper'
import ParkingStore from '@stores/parking/parkingStore'
import Stores from '@stores/storeIdentifier'
import { Col, Row, Table } from 'antd'
import { inject } from 'mobx-react'
import React from 'react'

export interface IParkingProps {
  navigate: any
  params: any
  parkingStore: ParkingStore
}

@inject(Stores.ParkingStore)
class VehicleHistory extends AppComponentListBase<IParkingProps> {
  formDocumentRef: any = React.createRef()

  state = {
    maxResultCount: 10,
    skipCount: 0
  }
  formRef: any = React.createRef()
  async componentDidMount() {
    await Promise.all([''])
  }

  public render() {
    const columns = [
      {
        title: L('AUDIT_LOG_PROPERTIES'),
        dataIndex: 'items',
        key: 'items',
        width: 150,
        render: (items) => (
          <>
            {(items || []).map((item, index) => (
              <div key={index}>{item?.propertyName}</div>
            ))}
          </>
        )
      },
      {
        title: L('AUDIT_LOG_OLD_VALUE'),
        dataIndex: 'items',
        key: 'items',
        width: 150,
        render: (items) => (
          <>
            {(items || []).map((item, index) => (
              <div key={index}>{item.originalValue}</div>
            ))}
          </>
        )
      },
      {
        title: L('AUDIT_LOG_NEW_VALUE'),
        dataIndex: 'items',
        key: 'items',
        width: 150,
        render: (items) => (
          <>
            {(items || []).map((item, index) => (
              <div key={index}>{item.newValueDisplay}</div>
            ))}
          </>
        )
      },
      {
        title: L('AUDIT_LOG_UPDATED_BY'),
        dataIndex: 'user',
        key: 'user',
        width: 150,
        render: (user) => <div>{user.displayName}</div>
      },

      {
        title: L('AUDIT_LOG_CHANGE_TIME'),
        dataIndex: 'changeTime',
        key: 'changeTime',
        width: 150,
        render: renderDateTime
      }
    ]

    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Table
            size="middle"
            className="custom-ant-table"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
          />
        </Col>
      </Row>
    )
  }
}

export default withRouter(VehicleHistory)
