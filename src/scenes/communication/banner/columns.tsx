import SystemColumn from '@components/DataTable/columns'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'

import { formatNumber, renderDate, renderDotActive } from '@lib/helper'
const { align } = AppConsts
const columns = (actionColumn?) => {
  return [
    {
      title: L(''),
      dataIndex: 'isActive',
      key: 'isActive',
      width: '2%',
      align: align.center,
      render: renderDotActive
    },
    {
      title: L('BANNER_WELCOME_ID'),
      dataIndex: 'id',
      key: 'id',
      width: '3%',
      render: (id) => <>{formatNumber(id)}</>
    },
    actionColumn,
    {
      title: L('BANNER_WELCOME_TYPE'),
      dataIndex: 'announcementType',
      key: 'announcementType',
      width: '10%',
      render: (announcementType) => <>{announcementType?.name}</>
    },
    {
      title: L('BANNER_WELCOME_START_DATE'),
      dataIndex: 'startDate',
      key: 'startDate',
      width: '8%',
      render: (startDate) => renderDate(startDate)
    },
    {
      title: L('BANNER_WELCOME_VIEW_COUNT'),
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: '8%',
      align: align.right,
      render: (viewCount) => <span className="pr-1">{viewCount}</span>
    },
    {
      title: L('BANNER_WELCOME_END_DATE'),
      dataIndex: 'endDate',
      key: 'endDate',
      width: '10%',
      align: align.center,
      render: (endDate) => renderDate(endDate)
    },
    SystemColumn
  ]
}

export default columns
