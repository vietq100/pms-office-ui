import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import './style.less'
import { renderDateTime } from '@lib/helper'

const { listCardRequestType, listCardRequestStatus, align } = AppConsts

const columns = (actionColumn?) => {
  const data = [
    {
      title: L('ID'),
      dataIndex: 'id',
      key: 'id',
      width: '4%',
      ellipsis: true,
      align: align.center,
      render: (id) => id
    },
    actionColumn,
    {
      title: L('REQUEST_BUILDING_CARD_TYPE'),
      dataIndex: 'type',
      key: 'type',
      width: 200,
      render: (type) => <>{listCardRequestType.find((item) => item?.value === type)?.label ?? ''}</>
    },
    {
      title: L('CREATE_USER'),
      dataIndex: 'creatorUser',
      key: 'creatorUser',
      render: (creatorUser) => creatorUser?.displayName
    },
    {
      title: L('REQUEST_CREATION_TIME'),
      dataIndex: 'sentDate',
      key: 'sentDate',
      ellipsis: true,
      width: 200,
      align: align.center,
      render: renderDateTime
    },

    {
      title: L('REQUEST_CARD_BUILDING_STATUS'),
      dataIndex: 'status',
      key: 'status',
      align: align.center,
      width: 150,
      ellipsis: true,
      render: (status) => (
        <span
          className="custom-label-column"
          style={{
            backgroundColor: listCardRequestStatus.find((item) => item?.value === status)?.backgroundColors,
            color: listCardRequestStatus.find((item) => item?.value === status)?.color,
            fontWeight: 600
          }}>
          {listCardRequestStatus.find((item) => item?.value === status)?.label ?? ''}
        </span>
      )
    },

    {
      title: L('CREATE_AT'),
      dataIndex: 'creationTime',
      key: 'creationTime',
      width: 250,
      readonly: true,
      render: (creationTime, row) => {
        return (
          <div className="text-muted small">
            <div>
              <span>
                {L('CREATED_BY')} {row.creatorUser?.displayName}
              </span>
              <br />
              <span> {renderDateTime(creationTime) ?? '--'}</span>
            </div>
          </div>
        )
      }
    }
  ]

  return data
}

export default columns
