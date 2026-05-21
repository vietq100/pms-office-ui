import React from 'react'
import { Checkbox, Table } from 'antd'
import { StatusTransitionModel } from '../../../../models/Workflow/ConfigurationModels'
import { L } from '../../../../lib/abpUtility'
import AppConsts from '../../../../lib/appconst'
const { align } = AppConsts

interface TableStatusTransitionProps {
  loading?: boolean
  wfStatusTransition: StatusTransitionModel
  onChange: (checked, name, statusId, field) => void
}

const TableStatusTransition: React.FC<TableStatusTransitionProps> = ({ loading, wfStatusTransition, onChange }) => {
  const columnProperties: any[] = [
    {
      title: L('WF_STATUS_NAME'),
      dataIndex: 'statusName',
      key: 'statusName',
      width: 150,
      fixed: 'left',
      render: (text: string) => <div>{text}</div>
    }
  ]
  ;(wfStatusTransition.status || []).forEach((status) => {
    columnProperties.push({
      title: status.name,
      dataIndex: 'isChecked',
      key: 'isChecked',
      width: 100,
      align: align.center,
      render: (value, record) => {
        const item = record.items.find((item) => item.statusId === status.id)
        return (
          <>
            <Checkbox
              checked={item?.isChecked}
              onChange={(e) => onChange(e.target.checked, record.statusId, status.id, 'isChecked')}></Checkbox>
          </>
        )
      }
    })
  })
  return (
    <Table
      size="middle"
      className="custom-ant-table"
      rowKey={(record) => record.statusId}
      columns={columnProperties}
      dataSource={wfStatusTransition.rows || []}
      scroll={{ x: 1300 }}
      pagination={false}
      loading={loading}
    />
  )
}

export default TableStatusTransition
