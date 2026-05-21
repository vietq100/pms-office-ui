import { useEffect, useState } from 'react'
import withRouter from '@components/Layout/Router/withRouter'
import get from 'lodash/get'
import feeService from '@services/fee/feeService'
import { Table } from 'antd'
import { L } from '@lib/abpUtility'
import { renderDateTime } from '@lib/helper'

const MAX_RESULT_COUNT = 10

function FeeAuditLog(props) {
  const [data, setData] = useState<any>([])

  useEffect(() => {
    const id = get(props, 'params.id')
    if (id) {
      feeService.getAuditLog({ id, maxResultCount: MAX_RESULT_COUNT, skipCount: 0 }).then((response) => {
        setData(response)
      })
    }
  }, [])

  const handleTableChange = (paging) => {
    const id = get(props, 'params.id')
    feeService
      .getAuditLog({
        id,
        maxResultCount: MAX_RESULT_COUNT,
        skipCount: (paging.current - 1) * MAX_RESULT_COUNT
      })
      .then((response) => {
        setData(response)
      })
  }

  return (
    <div className="flex column">
      <h3>{L('FEE_AUDIT')}</h3>
      <Table
        size="middle"
        className="custom-ant-table"
        rowKey="id"
        pagination={false}
        dataSource={data}
        columns={dataColumns}
        onChange={handleTableChange}
      />
    </div>
  )
}

const dataColumns = [
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
    render: (user) => {
      if (!user) return null
      return <div>{user.displayName}</div>
    }
  },
  {
    title: L('AUDIT_LOG_PROPERTIES'),
    dataIndex: 'items',
    key: 'items',
    width: 150,
    render: (items) => (
      <>
        {(items || []).map((item, index) => (
          <div key={index}>{item.propertyName}</div>
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

export default withRouter(FeeAuditLog)
