import { L } from '@lib/abpUtility'
import { formatCurrency } from '@lib/helper'
import Tag from 'antd/es/tag'

const columns = (columnCheckbox?, actionColumn?) => {
  const data = [
    columnCheckbox,
    actionColumn,

    {
      title: L('PACKAGE_FEE_NAME'),
      render: (_, record) => <div>{record.package?.name}</div>,
      width: '8%',
      align: 'right' as const
    },
    {
      title: L('PERIOD'),
      width: '10%',
      align: 'center' as const,
      render: (_, record) => (
        <Tag className="cell-round mr-0" color="#2db7f5">
          {record.package?.period}/{record.package?.year}
        </Tag>
      )
    },
    {
      title: L('FEE_TOTAL_AMOUNT'),
      dataIndex: 'totalAmount',

      width: '10%',
      render: (text) => <div>{formatCurrency(text)}</div>
    },
    {
      title: L('FEE_DEBIT_AMOUNT'),
      dataIndex: 'debitAmount',
      render: (text) => <div>{formatCurrency(text)}</div>
    }
  ]

  return data
}

export default columns
