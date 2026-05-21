import { L } from '@lib/abpUtility'
import { renderDateTime, renderDotActive, renderTag } from '@lib/helper'
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
      ellipsis: true,
      align: align.center,
      render: (id) => <>{id}</>
    },
    actionColumn,

    {
      title: L('AMENITY'),
      dataIndex: 'amenities',
      key: 'amenities',
      width: '10%',
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
      title: L('BLOCK_TIME'),
      dataIndex: 'startDate',
      key: 'startDate',
      width: '10%',
      render: (startDate, row) => (
        <>
          {renderDateTime(startDate)} - {renderDateTime(row.endDate)}
        </>
      )
    },
    {
      title: L('REASON'),
      dataIndex: 'reasonNote',
      key: 'reasonNote',
      width: '20%',
      ellipsis: true
    },

    SystemColumn
  ]

  return data
}

export default columns
