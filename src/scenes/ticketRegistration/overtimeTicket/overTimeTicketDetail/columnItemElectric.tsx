import { buildEditableCell } from '@components/DataTableV2/EditableCell'
import { L } from '@lib/abpUtility'
import { formatNumber, renderDate, renderTime } from '@lib/helper'
import { TableColumnGroupType, TableColumnType } from 'antd'
import { ColumnsType } from 'antd/lib/table'

const columnItemElectric = (
  actionColumn: TableColumnGroupType<any> | TableColumnType<any>,
  isEditing: any,
  listZone,
  lastDayOfPeriod?: string | null
) => {
  const data: ColumnsType<any> = [
    {
      title: L('ITEM_START_TIME'),
      dataIndex: 'startTime',
      key: 'startTime',
      width: 120,
      ellipsis: true,
      render: (name) => <div className="pl-2 text-truncate">{renderTime(name)}</div>,
      onCell: (record) =>
        buildEditableCell(record, 'timeInterval', 'startTime', 'ITEM_START_TIME', isEditing, '', true, true)
    },
    {
      title: L('ITEM_END_TIME'),
      dataIndex: 'endTime',
      key: 'endTime',
      width: 120,
      ellipsis: true,
      render: (name) => <div className="pl-2 text-truncate">{renderTime(name)}</div>,
      onCell: (record) =>
        buildEditableCell(record, 'timeInterval', 'endTime', 'ITEM_END_TIME', isEditing, '', true, true)
    },
    {
      title: L('START_DATE'),
      dataIndex: 'startDate',
      key: 'startDate',
      width: 150,
      ellipsis: true,
      render: (name) => <div className="pl-2 text-truncate">{renderDate(name)}</div>,
      onCell: (record) =>
        buildEditableCell(record, 'date', 'startDate', 'START_DATE', isEditing, '', true, true, lastDayOfPeriod)
    },
    {
      title: L('END_DATE'),
      dataIndex: 'endDate',
      key: 'endDate',
      width: 150,
      ellipsis: true,
      render: (name) => <div className="pl-2 text-truncate">{renderDate(name)}</div>,
      onCell: (record) =>
        buildEditableCell(record, 'date', 'endDate', 'END_DATE', isEditing, '', true, true, lastDayOfPeriod)
    },
    {
      title: L('TOTAL_DAY'),
      dataIndex: 'totalDay',
      key: 'totalDay',
      width: 70,
      ellipsis: true,
      render: (totalDay) => <div className="pl-2 text-truncate">{totalDay}</div>
    },
    {
      title: L('TOTAL_DAY_NOT_USE'),
      dataIndex: 'totalDayNotUse',
      key: 'totalDayNotUse',
      width: 70,
      ellipsis: true,
      render: (totalDayNotUse) => <div className="pl-2 text-truncate">{totalDayNotUse}</div>,
      onCell: (record) =>
        buildEditableCell(record, 'number', 'totalDayNotUse', 'TOTAL_DAY_NOT_USE', isEditing, '', false, true)
    },
    {
      title: L('TOTAL_ACTUAL_DAY'),
      dataIndex: 'actTotalDay',
      key: 'actTotalDay',
      width: 70,
      ellipsis: true,
      render: (actTotalDay) => <div className="pl-2 text-truncate">{actTotalDay}</div>
    },
    {
      title: L('OVERTIME_ZONE_USE'),
      dataIndex: 'zoneId',
      key: 'zoneId',
      width: 180,
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
export default columnItemElectric
