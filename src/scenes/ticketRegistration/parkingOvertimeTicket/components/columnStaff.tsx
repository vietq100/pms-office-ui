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
      title: L('FULL_NAME'),
      dataIndex: 'fullName',
      key: 'fullName',
      width: 70,
      ellipsis: true,
      render: (fullName) => <div className="pl-2 text-truncate">{fullName}</div>,
      onCell: (record) => buildEditableCell(record, 'text', 'fullName', 'FULL_NAME', isEditing, '', true)
    },
    {
      title: L('BUILD_CARD_VEHICLE_NUMBER_PLATE'),
      dataIndex: 'numberPlate',
      key: 'numberPlate',
      width: 70,
      ellipsis: true,
      render: (numberPlate) => <div className="pl-2 text-truncate">{numberPlate}</div>,
      onCell: (record) =>
        buildEditableCell(record, 'text', 'numberPlate', 'BUILD_CARD_VEHICLE_NUMBER_PLATE', isEditing, '', true)
    },
    {
      title: L('WORKER_FLOOR'),
      dataIndex: 'floorId',
      key: 'floorId',
      width: 70,
      ellipsis: true,
      render: (name) => <div className="pl-2 text-truncate">{name}</div>,
      onCell: (record) => buildEditableCell(record, 'number', 'floorId', 'WORKER_FLOOR', isEditing, '', true)
    },
    {
      title: L('WORKER_START_TIME'),
      dataIndex: 'fromDate',
      key: 'fromDate',
      width: 70,
      ellipsis: true,
      render: (fromDate) => <div className="pl-2 text-truncate">{renderTimeDate(fromDate)}</div>,
      onCell: (record) =>
        buildEditableCell(record, 'datetime', 'fromDate', 'WORKER_START_TIME', isEditing, '', true, true)
    },
    {
      title: L('WORKER_END_TIME'),
      dataIndex: 'toDate',
      key: 'toDate',
      width: 70,
      ellipsis: true,
      render: (toDate) => <div className="pl-2 text-truncate">{renderTimeDate(toDate)}</div>,
      onCell: (record) => buildEditableCell(record, 'datetime', 'toDate', 'WORKER_END_TIME', isEditing, '', true, true)
    }
  ]
  if (actionColumn) {
    data.push(actionColumn)
  }
  return data
}
export default columnStaff
