import { buildEditableCell } from '@components/DataTableV2/EditableCell'
import { L } from '@lib/abpUtility'
import { formatNumber, renderTimeDate } from '@lib/helper'
import { TableColumnGroupType, TableColumnType } from 'antd'
import { ColumnsType } from 'antd/lib/table'

const columnItemParking = (
  actionColumn: TableColumnGroupType<any> | TableColumnType<any>,
  isEditing: any,
  listZone
) => {
  const data: ColumnsType<any> = [
    {
      title: L('ITEM_START_TIME'),
      dataIndex: 'startTime',
      key: 'startTime',
      width: 70,
      ellipsis: true,
      render: (name) => <div className="pl-2 text-truncate">{renderTimeDate(name)}</div>,
      onCell: (record) =>
        buildEditableCell(record, 'datetimeInterval', 'startTime', 'WORKER_START_TIME', isEditing, '', true)
    },
    {
      title: L('ITEM_END_TIME'),
      dataIndex: 'endTime',
      key: 'endTime',
      width: 70,
      ellipsis: true,
      render: (name) => <div className="pl-2 text-truncate">{renderTimeDate(name)}</div>,
      onCell: (record) =>
        buildEditableCell(record, 'datetimeInterval', 'endTime', 'WORKER_END_TIME', isEditing, '', true)
    },
    {
      title: L('OVERTIME_ZONE_USE'),
      dataIndex: 'zoneId',
      key: 'zoneId',
      width: 70,
      ellipsis: true,
      render: (zoneId) => (
        <div className="pl-2 text-truncate">{listZone.find((item) => item?.id == zoneId)?.name ?? '--'}</div>
      ),
      onCell: (record) => buildEditableCell(record, 'select', 'zoneId', 'OVERTIME_ZONE_USE', isEditing, listZone, true)
    },
    {
      title: L('OVERTIME_ZONE_SIZE'),
      dataIndex: 'size',
      key: 'size',
      width: 70,
      ellipsis: true,
      render: (name) => <div className="pl-2 text-truncate">{formatNumber(name)}</div>
    },
    {
      title: L('OVERTIME_PRICE_PER_HOUSE'),
      dataIndex: 'pricePerHour',
      key: 'pricePerHour',
      width: 70,
      ellipsis: true,
      render: (name) => <div className="pl-2 text-truncate">{formatNumber(name)}</div>
      // onCell: (record) =>
      //   buildEditableCell(record, 'number', 'pricePerHour', 'OVERTIME_PRICE_PER_HOUSE', isEditing, '', true)
    },
    {
      title: L('OVERTIME_TOTAL_HOUSE'),
      dataIndex: 'totalHours',
      key: 'totalHours',
      width: 70,
      ellipsis: true,
      render: (name) => <div className="pl-2 text-truncate">{formatNumber(name)}</div>
    },
    {
      title: L('OVERTIME_TOTAL_PRICE'),
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 70,
      ellipsis: true,
      render: (name) => <div className="pl-2 text-truncate">{formatNumber(name)}</div>
    }
  ]
  if (actionColumn) {
    data.push(actionColumn)
  }
  return data
}
export default columnItemParking
