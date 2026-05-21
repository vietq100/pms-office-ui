import { L } from '@lib/abpUtility'
import { CalendarOutlined } from '@ant-design/icons/lib'
import { renderDate, renderStatus } from '@lib/helper'
import AppConsts from '@lib/appconst'
const { align } = AppConsts
const columns = (actionColumn?) => {
  const data = [
    {
      title: L('ID'),
      dataIndex: 'id',
      key: 'id',
      width: '4%',
      align: align.center,
      ellipsis: true,
      render: (id) => <>{id}</>
    },
    actionColumn,
    {
      title: L('CREATE_USER'),
      dataIndex: 'userId',
      key: 'userId',
      width: '10%',
      ellipsis: true,
      render: (userId, row) => <>{row.user.displayName}</>
    },
    {
      title: L('UNIT'),
      dataIndex: 'unitId',
      key: 'unitId',
      width: '10%',
      ellipsis: true,
      render: (unitId, row) => <>{row.unit?.name}</>
    },
    {
      title: L('BEDROOM'),
      dataIndex: 'numOfBedroom',
      key: 'numOfBedroom',
      width: '6%',
      ellipsis: true,
      render: (numOfBedroom) => <>{numOfBedroom ?? 0}</>
    },
    {
      title: L('BATHROOM'),
      dataIndex: 'numOfBathroom',
      key: 'numOfBathroom',
      width: '6%',
      ellipsis: true,
      render: (numOfBathroom) => <>{numOfBathroom ?? 0}</>
    },
    {
      title: L('STATUS'),
      dataIndex: 'status',
      key: 'status',
      width: '9%',
      ellipsis: true,
      render: (status) => renderStatus(status?.name, status?.colorCode, status?.borderColorCode)
    },
    {
      title: L('ASSIGN_USER'),
      dataIndex: 'assignUserId',
      key: 'assignUserId',
      width: '10%',
      ellipsis: true,
      render: (assignUserId, row) => <>{row.assignUser?.displayName}</>
    },
    {
      title: L('CREATED_AT'),
      dataIndex: 'creationTime',
      key: 'creationTime',

      ellipsis: true,
      render: (text, row) => (
        <div className="text-muted small">
          <CalendarOutlined className="mr-1" /> {renderDate(text)}
          {L('BY')}
          {row.creatorUser?.displayName}
        </div>
      )
    }
  ]

  return data
}

export default columns
