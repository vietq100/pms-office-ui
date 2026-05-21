import { L } from '@lib/abpUtility'
import { CalendarOutlined, UserOutlined } from '@ant-design/icons/lib'
import { renderAvatar, renderDate, renderIsActive } from '@lib/helper'

export const getAnnouncementUserColumnsBeforeSend = (actionColumn?) => {
  const data = [
    {
      title: L('RESIDENT_FULL_NAME'),
      dataIndex: 'displayName',
      key: 'displayName',
      width: 200,
      ellipsis: true,
      render: (displayName, row) => renderAvatar(displayName, row, true, false, false)
    },
    {
      title: L('EMAIL'),
      dataIndex: 'user',
      key: 'user',
      width: 150,
      render: (user) => <>{user?.emailAddress}</>
    },
    {
      title: L('UNIT_FULL_CODE'),
      dataIndex: 'fullUnitCode',
      key: 'fullUnitCode',
      width: 150,
      render: (fullUnitCode) => <>{fullUnitCode}</>
    }
  ]

  if (actionColumn) {
    data.push(actionColumn)
  }

  return data
}

const columnsBeforeSend = (actionColumn?) => {
  const data = [
    {
      title: L('ID'),
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id) => <>{id}</>
    },
    {
      title: L('ANNOUNCEMENT_TITLE'),
      dataIndex: 'subject',
      key: 'subject',
      width: 200,
      render: (text) => <>{text}</>
    },
    {
      title: L('ANNOUNCEMENT_METHOD'),
      dataIndex: 'method',
      key: 'method',
      width: 100,
      render: (method) => <>{L(method)}</>
    },
    {
      title: L('ANNOUNCEMENT_STATUS'),
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => <>{L(status)}</>
    },
    {
      title: L('IS_ACTIVE'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: renderIsActive
    },
    {
      title: L('CREATED_AT'),
      dataIndex: 'creationTime',
      key: 'creationTime',
      width: 150,
      ellipsis: true,
      render: (text, row) => (
        <div className="small">
          <CalendarOutlined className="mr-1" /> {renderDate(text)}
          <div>
            <UserOutlined className="mr-1" /> {row.creatorUser?.displayName}
          </div>
        </div>
      )
    }
  ]

  if (actionColumn) {
    data.push(actionColumn)
  }

  return data
}

export default columnsBeforeSend
