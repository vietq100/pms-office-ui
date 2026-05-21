import { L } from '@lib/abpUtility'
import { CalendarOutlined } from '@ant-design/icons/lib'
import AppConst from '@lib/appconst'
import { renderDate, renderTag, renderDotActive } from '@lib/helper'
import SystemColumn from '@components/DataTable/columns'
const { align } = AppConst
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
      title: `${L('PLANED_MAINTENANCE_STATUS')}/${L('PLANED_MAINTENANCE_PRIORITY')}`,
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      ellipsis: true,
      render: (status, row) => (
        <div>
          {renderTag(status?.name, status?.colorCode || 'black')} /{' '}
          {renderTag(row.priority?.name, row.priority?.colorCode || 'black')}
        </div>
      )
    },
    // {
    //   title: L('DESCRIPTION'),
    //   dataIndex: 'description',
    //   key: 'description',
    //   width: '20%',
    //   ellipsis: true,
    //   render: (description) => description
    // },
    // {
    //   title: L('PLANED_MAINTENANCE_ASSIGNED_TO'),
    //   dataIndex: 'teamUser',
    //   key: 'teamUser',
    //   width: '14%',
    //   ellipsis: true,
    //   render: (teamUser) => (
    //     <div className="text-muted small">
    //       <UserOutlined className="mr-1" /> {teamUser?.label}
    //     </div>
    //   )
    // },
    {
      title: `${L('PLANED_MAINTENANCE_START_DATE')}`,
      dataIndex: 'startDate',
      key: 'startDate',
      width: '10%',
      render: (startDate) => (
        <div className="text-muted small">
          <CalendarOutlined className="mr-1" /> {renderDate(startDate)}
        </div>
      )
    },
    {
      title: `${L('PLANED_MAINTENANCE_END_DATE')}`,
      dataIndex: 'endDate',
      key: 'endDate',
      width: '10%',
      render: (endDate) => (
        <div className="text-muted small">
          <CalendarOutlined className="mr-1" /> {renderDate(endDate)}
        </div>
      )
    },
    {
      title: `${L('PLANED_MAINTENANCE_ACTUAL_START_DATE')}`,
      dataIndex: 'actualStartDate',
      key: 'actualStartDate',
      width: '10%',
      render: (actualStartDate) => (
        <div className="text-muted small">
          <CalendarOutlined className="mr-1" /> {renderDate(actualStartDate)}
        </div>
      )
    },
    {
      title: `${L('PLANED_MAINTENANCE_ACTUAL_END_DATE')}`,
      dataIndex: 'actualEndDate',
      key: 'actualEndDate',
      width: '10%',
      render: (actualEndDate) => (
        <div className="text-muted small">
          <CalendarOutlined className="mr-1" /> {renderDate(actualEndDate)}
        </div>
      )
    },

    SystemColumn
  ]

  return data
}

export default columns
