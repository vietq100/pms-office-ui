import { buildEditableCell } from '@components/DataTableV2/EditableCell'
import { L } from '@lib/abpUtility'
import { TableColumnGroupType, TableColumnType } from 'antd'
import { ColumnsType } from 'antd/lib/table'

const columnItemElectric = (actionColumn: TableColumnGroupType<any> | TableColumnType<any>, isEditing: any) => {
  const data: ColumnsType<any> = [
    {
      title: L('STT'),
      dataIndex: 'id',
      key: 'id',
      width: 20,
      ellipsis: true,
      render: (id, row, index) => <div className="pl-2">{index + 1}</div>
    },
    {
      title: L('ITEM_ELECTRIC_NAME'),
      dataIndex: 'name',
      key: 'name',
      width: 70,
      ellipsis: true,
      render: (name) => <div className="pl-2">{name}</div>,
      onCell: (record) => buildEditableCell(record, 'text', 'name', 'ITEM_ELECTRIC_NAME', isEditing, '', true)
    },

    {
      title: L('WORKER_NOTE'),
      dataIndex: 'description',
      key: 'description',
      width: 70,
      ellipsis: true,
      render: (name) => <div className="pl-2">{name}</div>,
      onCell: (record) => buildEditableCell(record, 'text', 'description', 'WORKER_NOTE', isEditing, '', false)
    }
  ]
  if (actionColumn) {
    data.push(actionColumn)
  }
  return data
}
export default columnItemElectric
