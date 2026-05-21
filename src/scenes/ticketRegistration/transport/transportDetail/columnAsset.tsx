import { buildEditableCell } from '@components/DataTableV2/EditableCell'
import { L } from '@lib/abpUtility'
import { TableColumnGroupType, TableColumnType } from 'antd'
import { ColumnsType } from 'antd/lib/table'

const columnAsset = (actionColumn: TableColumnGroupType<any> | TableColumnType<any>, isEditing: any) => {
  const data: ColumnsType<any> = [
    {
      title: L('TRANSPORT_ASSETS_NAME'),
      dataIndex: 'name',
      key: 'name',
      width: 70,
      ellipsis: true,
      render: (name) => <div className="pl-2">{name}</div>,
      onCell: (record) => buildEditableCell(record, 'text', 'name', 'TRANSPORT_ASSETS_NAME', isEditing, '', true)
    },
    {
      title: L('TRANSPORT_SIZE_AND_TYPE'),
      dataIndex: 'sizeAndType',
      key: 'sizeAndType',
      width: 70,
      ellipsis: true,
      render: (name) => <div className="pl-2">{name}</div>,
      onCell: (record) =>
        buildEditableCell(record, 'text', 'sizeAndType', 'TRANSPORT_SIZE_AND_TYPE', isEditing, '', true)
    },
    {
      title: L('TRANSPORT_ASSETS_QUANTITY'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: 70,
      ellipsis: true,
      render: (name) => <div className="pl-2">{name}</div>,
      onCell: (record) =>
        buildEditableCell(record, 'number', 'quantity', 'TRANSPORT_ASSETS_QUANTITY', isEditing, '', true)
    },
    {
      title: L('TRANSPORT_ASSETS_UNIT_CACULATE'),
      dataIndex: 'unit',
      key: 'unit',
      width: 70,
      ellipsis: true,
      render: (name) => <div className="pl-2">{name}</div>,
      onCell: (record) =>
        buildEditableCell(record, 'text', 'unit', 'TRANSPORT_ASSETS_UNIT_CACULATE', isEditing, '', true)
    },
    {
      title: L('TRANSPORT_ASSET_DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',
      width: 70,
      ellipsis: true,
      render: (name) => <div className="pl-2 text-truncate">{name}</div>,
      onCell: (record) =>
        buildEditableCell(record, 'text', 'description', 'TRANSPORT_ASSET_DESCRIPTION', isEditing, '', false)
    }
  ]
  if (actionColumn) {
    data.push(actionColumn)
  }
  return data
}
export default columnAsset
