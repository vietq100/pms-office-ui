import { L } from '@lib/abpUtility' // isGranted,
import { formatCurrency, renderDate, renderDotActive } from '@lib/helper'
// import { MoreOutlined } from '@ant-design/icons'
import AppConst from '@lib/appconst'
import SystemColumn from '@components/DataTable/columns'
// import { Dropdown, Menu } from 'antd'

const { align } = AppConst

const columns = () => {
  return [
    {
      title: L(''),
      dataIndex: 'status',
      key: 'status',
      width: '3%',
      align: align.center,
      render: renderDotActive
    },
    {
      title: () => (
        <>
          {L('TRANSACTION_NUMBER')}/ <br /> {L('TRANSACTION_RECEIPT_DATE')}
        </>
      ),
      dataIndex: 'expenseMandateNumber',
      render: (expenseMandateNumber, row) => (
        <>
          {expenseMandateNumber} <br />
          <span className="text-muted">{renderDate(row.expenseDate)}</span>
        </>
      ),
      width: '16%',
      ellipsis: true
    },
    {
      title: L('TRANSACTION_TOTAL_AMOUNT'),
      dataIndex: 'totalAmount',
      render: (text) => <div>{formatCurrency(text)}</div>,
      align: 'right' as const,
      width: '14%',
      ellipsis: true
    },
    {
      title: L('PAYMENT_CHANNEL'),
      dataIndex: 'paymentChannel',
      render: (paymentChannel) => <div className="ml-2">{paymentChannel?.name}</div>,
      width: '17%'
    },
    {
      title: L('TRANSACTION_TYPE'),
      dataIndex: 'cashTransactionType',
      render: (cashTransactionType) => <div className="ml-2">{cashTransactionType?.name}</div>,
      width: '16%',
      ellipsis: true
    },
    {
      title: L('TRANSACTION_DESCRIPTION'),
      dataIndex: 'description',
      width: '28%',
      ellipsis: true
    },

    SystemColumn
  ]
}

export default columns
