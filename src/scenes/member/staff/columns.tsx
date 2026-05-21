import SystemColumn from '@components/DataTable/columns'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { renderDate, renderDateTime, renderDotActive } from '@lib/helper'
const { align } = AppConsts
const columns = (actionColumn?) => {
  const data = [
    {
      title: L(''),
      dataIndex: 'isActive',
      key: 'isActive',
      width: '3%',
      align: align.center,
      render: renderDotActive
    },
    actionColumn,
    {
      title: L('STAFF_DOB'),
      dataIndex: 'birthDate',
      key: 'birthDate',
      width: '8%',
      render: renderDate
    },
    {
      title: L('RESIDENT_LIST_TIME_LOGIN'),
      dataIndex: 'loginTime',
      key: 'loginTime',
      width: '10%',
      align: align.center,
      render: (loginTime) => <div className="text-muted small">{renderDateTime(loginTime) || '--'}</div>
    },

    SystemColumn
  ]

  return data
}

export default columns
