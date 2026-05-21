import { L } from '@lib/abpUtility'
import { CalendarOutlined, UserOutlined } from '@ant-design/icons/lib'
import { renderDotActive } from '@lib/helper'
import { renderDateTime, renderTag } from '@lib/helper'
import AppConsts from '@lib/appconst'
import DeleveriIcon from '@assets/icons/receiverIcon.png'
import Delivered from '@assets/icons/delivered.png'
import { Row } from 'antd'
const { align } = AppConsts

const columns = (actionColumn?) => {
  const data = [
    {
      title: L(''),
      dataIndex: 'isActive',
      key: 'isActive',
      width: '2%',
      align: align.center,
      ellipsis: true,
      render: renderDotActive
    },
    {
      title: L('DELIVERY_ID'),
      dataIndex: 'id',
      key: 'id',
      width: '4%',
      render: (id) => <>{id}</>
    },
    actionColumn,
    {
      title: L('DELIVERY_TYPE'),
      dataIndex: 'deliveryTypeId',
      key: 'deliveryTypeId',
      width: '8%',
      ellipsis: true,
      render: (deliveryTypeId, row) => <>{row.deliveryType?.name}</>
    },
    {
      title: L('RECEIVER_TIME_DELIVERY_TIME'),
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      ellipsis: true,
      width: '18%',
      render: (receivedDate, row) => (
        <div>
          <Row>
            <img style={{ height: 20, width: 20, marginRight: 5 }} src={DeleveriIcon} />
            {receivedDate ? renderDateTime(receivedDate) : ''}
          </Row>
          <Row>
            <img style={{ height: 20, width: 20, marginRight: 5 }} src={Delivered} />
            {row.receiver?.deliveredDate ? renderDateTime(row.receiver?.deliveredDate) : ''}
          </Row>
        </div>
      )
    },
    {
      title: L('ACTUAL_RECEIVER'),
      dataIndex: 'receiver',
      key: 'receiver',
      width: '10%',
      render: (receiver) => <>{receiver?.residentName}</>
    },

    {
      title: L('PERSONNEL'),
      dataIndex: 'creatorUser',
      key: 'creatorUser',
      width: '10%',
      ellipsis: true,
      render: (creatorUser, row) => <>{row.creatorUser?.displayName}</>
    },
    {
      title: L('STATUS'),
      dataIndex: 'statusId',
      key: 'statusId',
      width: '10%',
      render: (statusId, row) =>
        renderTag(row?.status?.name, row?.status?.colorCode || 'black', row?.status?.backgroudColor || 'white')
    },

    {
      title: L('DELIVERY_CREATED_AT'),
      dataIndex: 'workflow',
      key: 'workflow',

      ellipsis: true,
      render: (workflow, row) => (
        <div className="text-muted small">
          <CalendarOutlined className="mr-1" /> {renderDateTime(row?.creationTime)}
          <div>
            <UserOutlined className="mr-1" /> {row?.creatorUser?.displayName}
          </div>
        </div>
      )
    }
  ]

  return data
}

export default columns
