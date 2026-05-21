import { buildEditableCell } from '@components/DataTableV2/EditableCell'
import { L } from '@lib/abpUtility'
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
      render: (name, row, index) => <div className="pl-2 text-truncate">{index + 1}</div>
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
      title: L('WORKER_POSITION'),
      dataIndex: 'roleName',
      key: 'roleName',
      width: 70,
      ellipsis: true,
      render: (name) => <div className="pl-2 text-truncate">{name}</div>,
      onCell: (record) => buildEditableCell(record, 'text', 'roleName', 'WORKER_POSITION', isEditing, '', true)
    },
    {
      title: L('WORKER_CCCD'),
      dataIndex: 'identityCard',
      key: 'identityCard',
      width: 70,
      ellipsis: true,
      render: (name) => <div className="pl-2 text-truncate">{name}</div>,
      onCell: (record) => buildEditableCell(record, 'text', 'identityCard', 'WORKER_CCCD', isEditing, '', true)
    },
    {
      title: L('WORKER_GENDER'),
      dataIndex: 'gender',
      key: 'gender',
      width: 70,
      ellipsis: true,
      render: (name) => <div className="pl-2 text-truncate">{name}</div>,
      onCell: (record) => buildEditableCell(record, 'text', 'gender', 'WORKER_GENDER', isEditing, '', true)
    },
    {
      title: L('WORKER_NOTE'),
      dataIndex: 'description',
      key: 'description',
      width: 70,
      ellipsis: true,
      render: (name) => <div className="pl-2 text-truncate">{name}</div>,
      onCell: (record) => buildEditableCell(record, 'text', 'description', 'WORKER_NOTE', isEditing, '', false)
    }
  ]
  if (actionColumn) {
    data.push(actionColumn)
  }
  return data
}
export default columnStaff
