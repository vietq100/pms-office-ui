import { L } from '@lib/abpUtility'
import { renderDate, renderTag, renderTime } from '@lib/helper'
import { CalendarOutlined, FieldTimeOutlined } from '@ant-design/icons/lib'
import SystemColumn from '@components/DataTable/columns'
import AppConsts from '@lib/appconst'
const { align } = AppConsts
const columns = (actionColumn?) => {
  const data = [
    {
      title: L('RESERVATION_ID'),
      dataIndex: 'id',
      key: 'id',
      width: '6%',
      align: align.center,
      render: (id) => <>{id}</>
    },
    actionColumn,
    {
      title: L('RESERVATION_AMENITY'),
      dataIndex: 'amenity',
      key: 'amenity',
      width: '12%',
      ellipsis: true,
      render: (amenity, row) => (
        <div>
          {amenity?.amenityName}
          <div className="small">
            <CalendarOutlined style={{ width: '15px' }} /> {renderDate(row.startDate)}
          </div>
          <div className="small">
            <FieldTimeOutlined style={{ width: '15px' }} /> {renderTime(row.startDate)} - {renderTime(row.endDate)}
          </div>
        </div>
      )
    },
    {
      title: L('RESERVATION_STATUS'),
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      render: (status) => renderTag(status?.name, status?.colorCode || 'black')
    },
    {
      title: L('RESERVATION_PAYMENT_STATUS'),
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: '14%',
      render: (paymentStatus) => renderTag(paymentStatus?.name, paymentStatus?.borderColorCode || 'black')
    },
    SystemColumn
  ]

  return data
}

export default columns
