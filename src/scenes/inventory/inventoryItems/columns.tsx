import { L } from '@lib/abpUtility'
import { CalendarOutlined, UserOutlined } from '@ant-design/icons/lib'
import { renderDate, renderDotActive } from '@lib/helper'
import AppConst from '@lib/appconst'

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
      title: L('QUANTITY'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: '6%',
      render: (quantity) => quantity
    },
    {
      title: L('INVENTORY_LOCATION'),
      dataIndex: 'location',
      key: 'location',
      width: '12%',
      render: (location) => <>{location?.name}</>
    },
    {
      title: L('INVENTORY_TOBE_USED_AT'),
      dataIndex: 'locationUseAt',
      key: 'locationUseAt',
      width: '12%',
      render: (locationUseAt) => <>{locationUseAt}</>
    },
    {
      title: L('DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',
      width: '20%',
      ellipsis: true,
      render: (description) => <div>{description}</div>
    },
    {
      title: L('INVENTORY_UPDATED_AT'),
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
