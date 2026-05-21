import { L } from '@lib/abpUtility'
import { formatCurrency, renderDate } from '@lib/helper'
import { CalendarOutlined, UserOutlined } from '@ant-design/icons/lib'

const columns = (actionColumn?) => {
  const data = [
    actionColumn,

    {
      title: L('FEE_RECEIPT_ORDER_NUMBER'),
      dataIndex: 'orderId',
      width: '10%'
    },
    {
      title: L('FEE_RECEIPT_UNIT') + ' - ' + L('FEE_RECEIPT_PAYER'),
      dataIndex: 'fullUnitCode',
      width: '10%',
      ellipsis: true,
      render: (text, record) => (
        <>
          {text}
          <div className="text-truncate-1 small">{record.feePayer?.fullName}</div>
        </>
      )
    },
    {
      title: L('FEE_RECEIPT_PAID_AMOUNT'),
      dataIndex: 'paidAmount',
      width: '10%',
      render: (text, row) => <div className={row.isActive ? '' : 'color-error'}>{formatCurrency(text)}</div>,
      align: 'right' as const
    },
    {
      title: L('FEE_RECEIPT_DATE'),
      dataIndex: 'incomingDate',
      width: '8%',
      render: (text) => <div>{renderDate(text)}</div>
    },
    {
      title: L('FEE_RECEIPT_PAYMENT_CHANEL'),
      dataIndex: 'paymentChannel',
      width: '13%',
      render: (paymentChannel, row) => (
        <>
          <div>{paymentChannel?.name}</div>
          {/* Only show when payment online */}
          <div>{paymentChannel.id === 4 && row.paymentProvider?.name}</div>
        </>
      )
    },
    {
      title: L('CREATED_AT'),
      dataIndex: 'creatorUser',
      render: (creatorUser, row) => (
        <div className="text-muted small">
          <CalendarOutlined className="mr-1" /> {renderDate(row.creationTime)}
          <div>
            <UserOutlined className="mr-1" /> {creatorUser?.displayName}
          </div>
        </div>
      )
    }
  ]

  return data
}

export default columns
