import { L } from '@lib/abpUtility'
import { formatNumber, renderStatus } from '@lib/helper'
import moment from 'moment'
import { dateTimeFormat } from '@lib/appconst'
import SystemColumn from '@components/DataTable/columns'

const columns = (actionColumn?) => {
  const data = [
    {
      title: L('ID'),
      dataIndex: 'id',
      key: 'id',
      width: '4%',
      ellipsis: true,
      render: (id) => <div className="ml-1">{id}</div>
    },
    actionColumn,
    {
      title: L('OWNER'),
      dataIndex: 'user',
      key: 'user',
      width: '12%',
      ellipsis: true,
      render: (user) => <>{user?.displayName}</>
    },
    {
      title: L('REGISTER_DATE'),
      dataIndex: 'fromDate',
      key: 'fromDate',
      width: ' 8%',
      ellipsis: true,
      render: (fromDate) => <>{moment(fromDate).format(dateTimeFormat)}</>
    },
    {
      title: L('DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',
      width: ' 20%',
      ellipsis: true,
      render: (description) => <>{description}</>
    },
    {
      title: L('HAND_OVER_COUT_DEFECT'),
      dataIndex: 'totalDefect',
      key: 'totalDefect',
      width: ' 10%',
      ellipsis: true,
      render: (totalDefect) => <>{formatNumber(totalDefect) ?? 0}</>
    },
    {
      title: L('ASSIGNED_USER'),
      dataIndex: 'assignUser',
      key: 'assignUser',
      width: '10%',
      ellipsis: true,
      render: (assignUser) => <>{assignUser?.displayName}</>
    },
    {
      title: L('HANDOVER_STATUS'),
      dataIndex: 'status',
      key: 'status',
      width: '9%',
      ellipsis: true,
      render: (status) => renderStatus(status?.code, status?.colorCode, status?.borderColorCode)
    },

    SystemColumn
  ]

  return data
}

export default columns
