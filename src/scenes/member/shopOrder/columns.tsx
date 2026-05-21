import { L } from '@lib/abpUtility'
import { CalendarOutlined, UserOutlined } from '@ant-design/icons/lib'
import { renderDate } from '@lib/helper'

const columns = (actionColumn?) => {
  const data = [
    {
      title: L('ORDER_ID'),
      dataIndex: 'id',
      key: 'id',
      width: 60,
      ellipsis: true,
      render: (id) => <>{id}</>
    },
    {
      title: L('ORDER_CUSTOMER_NAME'),
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150,
      ellipsis: true,
      render: (customerName) => <>{customerName}</>
    },
    {
      title: L('ORDER_CUSTOMER_PHONE'),
      dataIndex: 'customerPhoneNumber',
      key: 'customerPhoneNumber',
      width: 150,
      ellipsis: true,
      render: (customerPhoneNumber) => <>{customerPhoneNumber}</>
    },
    {
      title: L('CREATED_AT'),
      dataIndex: 'creationTime',
      key: 'creationTime',
      width: 150,
      ellipsis: true,
      render: (text, row) => (
        <div className="text-muted small">
          <CalendarOutlined className="mr-1" /> {renderDate(text)}
          <div>
            <UserOutlined className="mr-1" /> {row.creatorUser?.displayName}
          </div>
        </div>
      )
    },
    {
      title: L('ORDER_SHIPPING_DATE'),
      dataIndex: 'shippingDate',
      key: 'shippingDate',
      width: 120,
      ellipsis: true,
      render: (shippingDate) => (
        <div className="text-muted small">
          <CalendarOutlined className="mr-1" /> {renderDate(shippingDate)}
        </div>
      )
    },
    {
      title: L('ORDER_SHIPPING_ADDRESS'),
      dataIndex: 'shippingAddress',
      key: 'shippingAddress',
      width: 220,
      ellipsis: false,
      render: (shippingAddress) => <>{shippingAddress}</>
    },
    {
      title: L('ORDER_STATUS'),
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      width: 120,
      ellipsis: true,
      render: (orderStatus) => <>{orderStatus.code}</>
    }
  ]

  if (actionColumn) {
    data.push(actionColumn)
  }

  return data
}

export default columns
