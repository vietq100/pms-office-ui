import SystemColumn from '@components/DataTable/columns'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { renderDotActive } from '@lib/helper'
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
    actionColumn,
    {
      title: L('AMENITY_GROUP_TIME_LIMITATION'),
      dataIndex: 'numberOfTimes',
      key: 'numberOfTimes',
      width: '13%',
      render: (numberOfTimes, row) => (
        <>
          {row.numberOfLimit ? row.numberOfLimit : L('---')}/{numberOfTimes}
          {L(row.timeUnit)}
        </>
      )
    },
    {
      title: L('AMENITY_GROUP_DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',
      width: '22%',
      ellipsis: true,
      render: (description) => <>{description}</>
    },
    SystemColumn
  ]

  return data
}

export default columns
