import { L } from '@lib/abpUtility'
import { renderDate, renderDateTime, renderDotActive } from '@lib/helper'
import { Popover } from 'antd'
import SystemColumn from '@components/DataTable/columns'
import AppConsts from '@lib/appconst'
const { align } = AppConsts

const columns = (actionColumn?) => {
  const data = [
    {
      title: L(''),
      dataIndex: 'isActive',
      key: 'isActive',
      width: '3%',
      render: renderDotActive
    },
    actionColumn,

    {
      title: L('RESIDENT_DOB'),
      dataIndex: 'birthDate',
      key: 'birthDate',
      width: '8%',
      render: renderDate
    },
    {
      title: L('RESIDENT_DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',
      width: '20%',
      render: (description) => (
        <>
          <Popover trigger="click" content={<label className="text-small">{description}</label>}>
            <label className="text-truncate-2 px-1 text-small">{description}</label>
          </Popover>
        </>
      )
    },

    // {
    //   title: L('RESIDENT_ACTIVE_STATUS'),
    //   dataIndex: 'isActive',
    //   key: 'isActive',
    //   width: '8%',
    //   align: align.center,
    //   render: renderIsActive
    // },
    {
      title: L('RESIDENT_LIST_TIME_LOGIN'),
      dataIndex: 'loginTime',
      key: 'loginTime',
      width: '9%',
      align: align.center,
      render: (loginTime) => <div className="text-muted small">{renderDateTime(loginTime) || '--'}</div>
    },
    SystemColumn
  ]

  return data
}

export default columns
