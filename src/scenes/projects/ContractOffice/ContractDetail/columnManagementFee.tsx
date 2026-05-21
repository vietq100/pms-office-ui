import { buildEditableCell } from '@components/DataTableV2/EditableCell'
import { L } from '@lib/abpUtility'
import { formatNumber, renderDate } from '@lib/helper'
import { TableColumnGroupType, TableColumnType } from 'antd'
import { ColumnsType } from 'antd/lib/table'

const columnManagementFee = (actionColumn: TableColumnGroupType<any> | TableColumnType<any>, isEditing: any) => {
  const data: ColumnsType<any> = [
    {
      title: L('DESCRIPTION'),
      dataIndex: 'name',
      key: 'name',
      width: 70,
      ellipsis: true,
      render: (year) => <div className="pl-2">{year}</div>,
      onCell: (record) => buildEditableCell(record, 'text', 'name', 'RENT_YEAR', isEditing, '', true)
    },
    {
      title: L('RENT_FROM'),
      dataIndex: 'startDate',
      key: 'startDate',
      width: 90,
      ellipsis: true,
      render: (from) => <div className="pl-2">{renderDate(from)}</div>,
      onCell: (record) => buildEditableCell(record, 'date', 'startDate', 'RENT_FROM', isEditing, '', true, true)
    },
    {
      title: L('RENT_TO'),
      dataIndex: 'endDate',
      key: 'endDate',
      width: 90,
      ellipsis: true,
      render: (to) => <div className="pl-2">{renderDate(to)}</div>,
      onCell: (record) => buildEditableCell(record, 'date', 'endDate', 'RENT_TO', isEditing, '', true, true)
    },

    {
      title: L('RENT_MONTHS'),
      dataIndex: 'months',
      key: 'months',
      width: 70,
      ellipsis: true,
      render: (months) => <div className="pl-2">{formatNumber(months)}</div>
    },
    {
      title: L('RENT_DAYS'),
      dataIndex: 'days',
      key: 'days',
      width: 70,
      ellipsis: true,
      render: (days) => <div className="pl-2">{formatNumber(days)}</div>
    },
    {
      title: L('RENT_ONLY_IN_MONTHLY'),
      dataIndex: 'rentOnly',
      key: 'rentOnly',
      width: 90,
      ellipsis: true,
      render: (rentOnly) => <div className="pl-2">{formatNumber(rentOnly)}</div>,
      onCell: (record) => buildEditableCell(record, 'number', 'rentOnly', 'RENT_ONLY_IN_MONTHLY', isEditing, '', true)
    },

    {
      title: L('VAT_AMOUNT'),
      dataIndex: 'vatAmount',
      key: 'vatAmount',
      width: 90,
      ellipsis: true,
      render: (vatAmount) => <div className="pl-2">{formatNumber(vatAmount)}</div>,
      onCell: (record) => buildEditableCell(record, 'number', 'vatPercent', 'VAT_PERCENT', isEditing, '', true)
    },
    {
      title: L('RENT_INCLUDE_VAT'),
      dataIndex: 'amountIncludeVat',
      key: 'amountIncludeVat',
      width: 90,
      ellipsis: true,
      render: (amountIncludeVat) => <div className="pl-2">{formatNumber(amountIncludeVat)}</div>
    },

    {
      title: L('TOTAL_LA_AMOUNT_EXCL_VAT'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 90,
      ellipsis: true,
      render: (totalAmount) => <div className="pl-2">{formatNumber(totalAmount)}</div>
    },
    {
      title: L('TOTAL_LA_AMOUNT_INCLUDE_VAT'),
      dataIndex: 'totalAmountIncludeVat',
      key: 'totalAmountIncludeVat',
      width: 90,
      ellipsis: true,
      render: (totalAmount) => <div className="pl-2">{formatNumber(totalAmount)}</div>
    }
  ]
  if (actionColumn) {
    data.push(actionColumn)
  }
  return data
}
export default columnManagementFee
