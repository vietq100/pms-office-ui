import { L } from '@lib/abpUtility'
import { CalendarOutlined, UserOutlined } from '@ant-design/icons/lib'
import { Tag } from 'antd'
import { renderDate } from '@lib/helper'

const columns = (actionColumn?) => {
  const data = [
    {
      title: L('FEE_TYPE_NAME'),
      dataIndex: 'name',
      key: 'name',
      width: 250,
      ellipsis: true,
      render: (text: string) => <div>{text}</div>
    },
    {
      title: L('FEE_TYPE_CODE'),
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (text: string) => <div>{text}</div>
    },
    {
      title: L('FEE_TYPE_DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',
      width: 250,
      ellipsis: true,
      render: (text) => <div>{text}</div>
    },
    {
      title: L('FEE_TYPE_STATUS'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (text: boolean) =>
        text === true ? <Tag color="#2db7f5">{L('YES')}</Tag> : <Tag color="red">{L('NO')}</Tag>
    },
    {
      title: L('LAST_UPDATE_TIME'),
      dataIndex: 'lastModificationTime',
      key: 'lastModificationTime',
      width: 150,
      ellipsis: true,
      render: (text, row) => (
        <div className="text-muted small">
          <CalendarOutlined className="mr-1" /> {renderDate(text)}
          <div>
            <UserOutlined className="mr-1" /> {row.lastModifierUser?.displayName}
          </div>
        </div>
      )
    },
    {
      title: L('CREATED_AT'),
      dataIndex: 'creationTime',
      key: 'creationTime',
      width: 150,
      ellipsis: true,
      render: (text, row) => (
        <div className="text-muted small">
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

export default columns
