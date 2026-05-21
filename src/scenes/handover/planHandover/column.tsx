import { L } from '@lib/abpUtility'

import { renderDotActive, renderStatus } from '@lib/helper'
import AppConsts, { dateFormat, dateTimeFormat } from '@lib/appconst'
import dayjs from 'dayjs'
import SystemColumn from '@components/DataTable/columns'
import { CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons'

const { align } = AppConsts
const columns = (actionColumn?) => {
  const data = [
    {
      title: L(''),
      datainex: 'isActive',
      key: 'isActive',
      width: '3%',
      align: align.center,
      render: renderDotActive
    },
    actionColumn,
    {
      title: L('HANDOVER_TIME'),
      dataIndex: 'handOverDate',
      key: 'handOverDate',
      width: '12%',

      render: (handOverDate) => <>{dayjs(handOverDate).isValid() && dayjs(handOverDate).format(dateTimeFormat)}</>
    },
    {
      title: L('SENDING_STATUS'),
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      ellipsis: true,
      render: (status) => renderStatus(status?.name, status?.colorCode, status?.borderColorCode)
    },
    {
      title: L('SENDING_DATE'),
      dataIndex: 'fromDate',
      key: 'fromDate',
      width: '7%',
      ellipsis: true,
      render: (fromDate) => <>{dayjs(fromDate).format(dateFormat)}</>
    },
    {
      title: L('HANDOVER_UNIT_TOTAL_CONPLETED_UNHANDOVER'),
      dataIndex: 'totalUnits',
      key: 'totalUnits',
      width: '15%',
      align: align.center,
      render: (totalUnits, row) => (
        <>
          {totalUnits ?? 0}
          {' | '} {row.totalHandoverCompleted ?? 0} {' | '}
          {row.totalUnits - row.totalHandoverCompleted > 0 ? row.totalUnits - row.totalHandoverCompleted : 0}
          {row.totalUnits - row.totalHandoverCompleted === 0 ? (
            <CheckCircleOutlined className="mx-2 text-success" />
          ) : (
            <LoadingOutlined className="mx-2 text-success" />
          )}
        </>
      )
    },
    // {
    //   title: L('CURRENT'),
    //   dataIndex: 'totalHandoverCompleted',
    //   key: 'totalHandoverCompleted',
    //   width: '7%',
    //   ellipsis: true,
    //   render: (totalHandoverCompleted, row) => (
    //     <>
    //       {totalHandoverCompleted ?? 0}/{row.totalUnits ?? 0}
    //       {row.totalUnits - row.totalHandoverCompleted === 0
    // && <CheckCircleOutlined className="mx-2 text-success" />}
    //     </>
    //   )
    // },
    // {
    //   title: L('UNHANDOVER_UNIT'),
    //   dataIndex: 'totalHandoverCompleted',
    //   key: 'totalHandoverCompleted',
    //   width: '10%',
    //   ellipsis: true,
    //   render: (totalHandoverCompleted, row) => <>{row.totalUnits - row.totalHandoverCompleted}</>
    // },
    {
      title: L('TOTAL_ASSIGNED_USER'),
      dataIndex: 'totalAssignUsers',
      key: 'totalAssignUsers',
      width: '10%'
    },
    // {
    //   title: L('CREATED_AT'),
    //   dataIndex: 'creationTime',
    //   key: 'creationTime',
    //   ellipsis: true,
    //   render: (text, row) => (
    //     <div className="text-muted small">
    //       <CalendarOutlined className="mr-1" /> {renderDate(text)}
    //       {L('BY')} {row.creatorUser?.displayName}
    //     </div>
    //   )
    // }
    SystemColumn
  ]

  return data
}

export default columns
