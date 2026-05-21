import { L } from '@lib/abpUtility'
import { formatCurrency, renderDate } from '@lib/helper'
import { CalendarOutlined, UserOutlined } from '@ant-design/icons/lib'

const columns = (actionColumn?) => {
  const data = [
    actionColumn,
    {
      title: L('FEE_VOUCHER_DESCRIPTION'),
      dataIndex: 'description',
      ellipsis: true,
      width: '15%'
    },
    {
      title: L('PACKAGE_FEE_NAME'),
      dataIndex: 'package',
      render: (feePackage) => <div>{feePackage?.name}</div>,
      width: '8%'
    },
    {
      title: L('PAYMENT_CHANNEL'),
      dataIndex: 'paymentChannel',
      render: (paymentChannel) => <div>{paymentChannel?.name}</div>,
      width: '13%'
    },
    {
      title: L('FEE_VOUCHER_DATE'),
      dataIndex: 'payableDate',
      render: (text) => <div>{renderDate(text)}</div>,
      width: '8%'
    },
    {
      title: L('FEE_VOUCHER_TOTAL_AMOUNT'),
      dataIndex: 'totalAmount',
      render: (text) => <div>{formatCurrency(text)}</div>,
      align: 'right' as const,
      width: '10%'
    },
    {
      title: L('CREATED_AT'),
      dataIndex: 'creatorUser',
      render: (creatorUser, row) => (
        <div className="small">
          <CalendarOutlined className="mr-1" /> {renderDate(row.creationTime)}
          <div>
            <UserOutlined className="mr-1" /> {creatorUser?.displayName}
          </div>
        </div>
      ),
      width: 150
    }
  ]

  return data
}

export default columns
