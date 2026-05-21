import { L } from '@lib/abpUtility'
import { formatCurrency, renderDate } from '@lib/helper'
import SystemColumn from '@components/DataTable/columns'

const columns = (actionColumn?) => {
  const data = [
    actionColumn,
    {
      title: () => (
        <>
          {L('FEE_RECEIPT_UNIT')}
          {L('/')} <br /> {L('FEE_RECEIPT_PAYER')}
        </>
      ),
      dataIndex: 'fullUnitCode',
      width: '15%',

      render: (text, record) => (
        <>
          {text}
          <div className="text-truncate-2 small">{record.feePayer?.fullName}</div>
        </>
      )
    },
    {
      title: L('FEE_RECEIPT_PAID_AMOUNT'),
      dataIndex: 'paidAmount',
      width: '15%',
      render: (text, row) => <div className={row.isActive ? '' : 'color-error'}>{formatCurrency(text)}</div>,
      align: 'right' as const
    },
    {
      title: L('FEE_RECEIPT_DATE'),
      dataIndex: 'incomingDate',
      width: '10%',

      render: (text) => <div>{renderDate(text)}</div>,
      align: 'center' as const
    },
    {
      title: L('FEE_RECEIPT_PAYMENT_CHANEL'),
      dataIndex: 'paymentChannel',
      width: '22%',
      render: (paymentChannel, row) => (
        <>
          <div>{paymentChannel?.name}</div>
          {/* Only show when payment online */}
          <div>{paymentChannel.id === 4 && row.paymentProvider?.name}</div>
          <label className="custom-text-table">
            {row.paymentChannelExternal && L('ACCOUNT_NO')} {row.paymentChannelExternal?.accountNo}
          </label>
        </>
      )
    },
    SystemColumn
  ]

  return data
}

export default columns
