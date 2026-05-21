import { buildEditableCell } from '@components/DataTableV2/EditableCell'
import { L } from '@lib/abpUtility'
import { formatNumber, renderDate } from '@lib/helper'
import { TableColumnGroupType, TableColumnType } from 'antd'
import { ColumnsType } from 'antd/lib/table'

const columnExchangeRate = (actionColumn: TableColumnGroupType<any> | TableColumnType<any>, isEditing: any) => {
  const data: ColumnsType<any> = [
    {
      title: L('IS_DEFAULT'),
      dataIndex: 'isStatic',
      key: 'isStatic',
      width: 30,
      ellipsis: true,
      render: (isStatic) => <div className="pl-2 text-truncate">{isStatic ? L('IS_DEFAULT') : ''}</div>
    },
    {
      title: L('EXCHANGE_RATE_NUMBER'),
      dataIndex: 'rate',
      key: 'rate',
      width: 70,
      ellipsis: true,
      render: (rate) => <div className="pl-2 text-truncate">{formatNumber(rate)}</div>,
      onCell: (record) => buildEditableCell(record, 'number', 'rate', 'EXCHANGE_RATE_NUMBER', isEditing, '', true)
    },
    {
      title: L('EXCHANGE_RATE_START_DATE'),
      dataIndex: 'startDate',
      key: 'startDate',
      width: 70,
      ellipsis: true,
      render: (startDate) => <div className="pl-2 text-truncate">{renderDate(startDate)}</div>,
      onCell: (record) =>
        buildEditableCell(record, 'date', 'startDate', 'EXCHANGE_RATE_START_DATE', isEditing, '', true)
    },
    {
      title: L('EXCHANGE_RATE_END_DATE'),
      dataIndex: 'endDate',
      key: 'endDate',
      width: 70,
      ellipsis: true,
      render: (endDate) => <div className="pl-2 text-truncate">{renderDate(endDate)}</div>,
      onCell: (record) => buildEditableCell(record, 'date', 'endDate', 'EXCHANGE_RATE_END_DATE', isEditing, '', true)
    }
  ]
  if (actionColumn) {
    data.push(actionColumn)
  }
  return data
}
export default columnExchangeRate
