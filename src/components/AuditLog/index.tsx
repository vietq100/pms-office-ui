import { Card, Col, Row, Table } from 'antd'
import { inject, observer } from 'mobx-react'
import Stores from '../../stores/storeIdentifier'
import AppComponentBase from '../AppComponentBase'
import AuditLogStore from '../../stores/common/auditLogStore'
import { L } from '../../lib/abpUtility'
import { renderDateTime } from '../../lib/helper'

export interface IAuditLogProps {
  moduleId: number
  parentId: number
  auditLogStore: AuditLogStore
}

@inject(Stores.AuditLogStore)
@observer
class AuditLog extends AppComponentBase<IAuditLogProps> {
  state = {
    maxResultCount: 10,
    skipCount: 0
  }

  async componentDidMount() {
    await this.handleSearch()
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.parentId !== this.props.parentId) {
      await this.handleSearch()
    }
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => {
      await this.handleSearch()
    })
  }

  handleSearch = async () => {
    const { moduleId, parentId } = this.props

    await this.props.auditLogStore.getAll({
      ...this.state,
      moduleId,
      id: parentId
    })
  }

  render() {
    const { auditLogs } = this.props.auditLogStore

    const columns = [
      {
        title: L('AUDIT_LOG_CHANGE_TIME'),
        dataIndex: 'changeTime',
        key: 'changeTime',
        width: 150,
        render: renderDateTime
      },
      {
        title: L('AUDIT_LOG_UPDATED_BY'),
        dataIndex: 'user',
        key: 'user',
        width: 150,
        render: (user) => <div>{user.displayName}</div>
      },
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
      }
    ]

    return (
      <Card style={{ minHeight: 700 }}>
        <Row>
          <Col sm={{ span: 24, offset: 0 }}>
            <Table
              size="middle"
              className="custom-ant-table"
              rowKey={(record) => record.id}
              columns={columns}
              pagination={false}
              dataSource={auditLogs === undefined ? [] : auditLogs.items}
              onChange={this.handleTableChange}
            />
          </Col>
        </Row>
      </Card>
    )
  }
}

export default AuditLog
