import { buildEditableCell } from '@components/DataTableV2/EditableCell'
import { L } from '@lib/abpUtility'
import { renderTimeDate } from '@lib/helper'
import { TableColumnGroupType, TableColumnType } from 'antd'
import { ColumnsType } from 'antd/lib/table'

const columnStaff = (actionColumn: TableColumnGroupType<any> | TableColumnType<any>, isEditing: any) => {
  const data: ColumnsType<any> = [
    {
      title: L('STT'),
      dataIndex: 'id',
      key: 'id',
      width: 20,
      ellipsis: true,
      render: (name, row, index) => <div className="pl-2">{index + 1}</div>
    },
    {
      title: L('WORKER_NAME'),
      dataIndex: 'name',
      key: 'name',
      width: 70,
      ellipsis: true,
      render: (name) => <div className="pl-2 text-truncate">{name}</div>,
      onCell: (record) => buildEditableCell(record, 'text', 'name', 'WORKER_NAME', isEditing, '', true)
    },
    {
      title: L('WORKER_DEPARTMENT'),
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 70,
      ellipsis: true,
      render: (name) => <div className="pl-2 text-truncate">{name}</div>,
      onCell: (record) => buildEditableCell(record, 'text', 'departmentName', 'WORKER_DEPARTMENT', isEditing, '', true)
    },
    {
      title: L('WORKER_FLOOR'),
      dataIndex: 'floorId',
      key: 'floorId',
      width: 70,
      ellipsis: true,
      render: (name) => <div className="pl-2 text-truncate">{name}</div>,
      onCell: (record) => buildEditableCell(record, 'text', 'floorId', 'WORKER_FLOOR', isEditing, '', true)
    },
    {
      title: L('WORKER_START_TIME'),
      dataIndex: 'startTime',
      key: 'startTime',
      width: 70,
      ellipsis: true,
      render: (name) => <div className="pl-2 text-truncate">{renderTimeDate(name)}</div>,
      onCell: (record) =>
        buildEditableCell(record, 'datetime', 'startTime', 'WORKER_START_TIME', isEditing, '', true, true)
    },
    {
      title: L('WORKER_END_TIME'),
      dataIndex: 'endTime',
      key: 'endTime',
      width: 70,
      ellipsis: true,
      render: (name) => <div className="pl-2 text-truncate">{renderTimeDate(name)}</div>,
      onCell: (record) => buildEditableCell(record, 'datetime', 'endTime', 'WORKER_END_TIME', isEditing, '', true, true)
    }
  ]
  if (actionColumn) {
    data.push(actionColumn)
  }
  return data
}
export default columnStaff
