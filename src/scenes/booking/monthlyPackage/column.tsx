import { L } from '@lib/abpUtility'
import { renderDateTime, renderTag, formatCurrency, renderDotActive } from '@lib/helper'
import AppConsts from '@lib/appconst'
import SystemColumn from '@components/DataTable/columns'
const { align } = AppConsts

const columns = (actionColumn?) => {
  const data = [
    {
      title: L(''),
      dataIndex: 'isActive',
      key: 'isActive',
      width: '2%',
      align: align.center,
      render: renderDotActive
    },
    {
      title: L('ID'),
      dataIndex: 'id',
      key: 'id',
      width: '4%',
      align: align.center,
      ellipsis: true,
      render: (id) => <>{id}</>
    },
    actionColumn,

    {
      title: L('UNIT'),
      dataIndex: 'fullUnitCode',
      key: 'fullUnitCode',
      width: '8%'
    },
    {
      title: L('AMENITY'),
      dataIndex: 'amenities',
      key: 'amenities',
      width: '20%',
      ellipsis: true,
      render: (amenities) => (
        <>
          {(amenities || []).map((amenity, index) => (
            <div key={index}>{renderTag(amenity.amenityName, 'coral')}</div>
          ))}
        </>
      )
    },
    {
      title: L('PACKAGE_TIME'),
      dataIndex: 'startDate',
      key: 'startDate',
      width: '12%',
      render: (startDate, row) => (
        <>
          {renderDateTime(startDate)} - {renderDateTime(row.endDate)}
        </>
      )
    },
    {
      title: L('PRICE'),
      dataIndex: 'price',
      key: 'price',
      width: '10%',
      render: (price) => formatCurrency(price)
    },
    {
      title: L('DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',
      width: '20%',
      ellipsis: true
    },

    SystemColumn
  ]

  return data
}

export default columns
