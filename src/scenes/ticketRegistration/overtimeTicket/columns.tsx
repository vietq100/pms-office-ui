import { columnCreate, columnUpdate } from '@components/DataTable/columns'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { getLighterColor, renderDateTime } from '@lib/helper'

const { listTicketRequestStatus, align } = AppConsts

const columns = (actionColumn?) => {
  const data = [
    {
      title: () => <> {L('TRANSPORT_ID')}</>,
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
      width: '4%',
      align: align.center,
      render: (id) => id
    },
    actionColumn,
    {
      title: () => <> {L('OVERTIME_ZONE_USE')}</>,
      dataIndex: 'airConditioners',
      key: 'airConditioners',
      ellipsis: true,
      width: '15%',
      render: (airConditioners) => airConditioners?.map((item) => item?.zone?.zoneName).join(', ')
    },
    columnCreate,
    columnUpdate,
    {
      title: L('TICKET_REQUEST_STATUS'),
      dataIndex: 'statusHistory',
      key: 'statusHistory',
      ellipsis: true,
      width: '20%',
      render: (statusHistory) => (
        <div>
          <div
            style={{
              color: listTicketRequestStatus.find((item) => item.value === statusHistory?.statusId)?.color,
              backgroundColor: getLighterColor(
                listTicketRequestStatus.find((item) => item.value === statusHistory?.statusId)?.color,
                0.8
              ),
              borderRadius: '6px',
              padding: '4px 6px',
              width: 'fit-content',
              textAlign: 'center',
              marginBottom: '5px'
            }}>
            {L(listTicketRequestStatus.find((item) => item.value === statusHistory?.statusId)?.label ?? '-')}
          </div>

          <span className="text-muted small">{statusHistory?.aprrovalUser}</span>
          <br />
          <span className="text-muted small">{renderDateTime(statusHistory?.approvalDate)}</span>
        </div>
      )
    }
  ]

  return data
}

export const columnData4Tenant = (actionColumn?) => {
  const data = [
    {
      title: () => <> {L('TICKET_REQUEST_ID')}</>,
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
      align: align.center,
      width: '5%',
      render: (id) => id
    },
    actionColumn,
    {
      title: <> {L('OVERTIME_ZONE_USE')}</>,
      dataIndex: 'airConditioners',
      key: 'airConditioners',
      ellipsis: true,
      width: '15%',
      render: (airConditioners) => airConditioners?.map((item) => item?.zone?.zoneName).join(', ')
    },
    {
      title: () => <> {L('TRANSPORT_CREATE_EMAIL')}</>,
      dataIndex: 'creatorUser',
      key: 'creatorUser',
      ellipsis: true,
      width: '20%',
      align: align.center,
      render: (creatorUser) => creatorUser?.emailAddress
    },

    columnCreate,
    columnUpdate,
    {
      title: L('TICKET_REQUEST_STATUS'),
      dataIndex: 'statusHistory',
      key: 'statusHistory',
      ellipsis: true,
      width: '17%',
      render: (statusHistory) => (
        <div>
          <div
            style={{
              color: listTicketRequestStatus.find((item) => item.value === statusHistory?.statusId)?.color,
              backgroundColor: getLighterColor(
                listTicketRequestStatus.find((item) => item.value === statusHistory?.statusId)?.color,
                0.8
              ),
              borderRadius: '6px',
              padding: '4px 6px',
              width: 'fit-content',
              textAlign: 'center',
              marginBottom: '5px'
            }}>
            {L(listTicketRequestStatus.find((item) => item.value === statusHistory?.statusId)?.label ?? '-')}
          </div>

          <span className="text-muted small">{statusHistory?.aprrovalUser}</span>
          <br />
          <span className="text-muted small">{renderDateTime(statusHistory?.approvalDate)}</span>
        </div>
      )
    }
  ]

  return data
}
export default columns
