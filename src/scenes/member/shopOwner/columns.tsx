import { L } from '@lib/abpUtility'
import { CalendarOutlined, UserOutlined } from '@ant-design/icons/lib'
import AppConst from '@lib/appconst'
import { renderDate, renderDotActive } from '@lib/helper'
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
      title: L('SHOP_OWNER_DOB'),
      dataIndex: 'birthDate',
      key: 'birthDate',
      width: '10%',
      ellipsis: true,
      render: renderDate
    },
    {
      title: L('SHOP_OWNER_PHONE_EMAIL'),
      dataIndex: 'emailAddress',
      key: 'emailAddress',
      width: '13%',
      ellipsis: true,
      render: (emailAddress) => <>{emailAddress}</>
    },
    {
      title: L('SHOP_OWNER_PHONE_NUMBER'),
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: '10%',
      ellipsis: true,
      render: (phoneNumber) => <>{phoneNumber}</>
    },
    {
      title: L('LAST_UPDATE_TIME'),
      dataIndex: 'lastModificationTime',
      key: 'lastModificationTime',

      ellipsis: true,
      render: (text, row) => (
        <div className="text-muted small">
          <CalendarOutlined className="mr-1" /> {renderDate(text)}
          <div>
            <UserOutlined className="mr-1" /> {row.lastModifierUser?.displayName}
          </div>
        </div>
      )
    }
  ]

  return data
}

export default columns
