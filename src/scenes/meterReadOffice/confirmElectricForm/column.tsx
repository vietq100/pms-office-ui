import SystemColumn from '@components/DataTable/columns'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { getLighterColor, renderDateTime } from '@lib/helper'

const { align, listTicketRequestStatus } = AppConsts

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
      title: L('METER_ELLECTRIC_PERIOD'),
      dataIndex: 'feePackage',
      key: 'feePackage',
      width: '10%',
      align: align.center,
      render: (feePackage) => <div>{feePackage?.name}</div>
    },
    {
      title: L('COMPANY_RESPRESENTATIVE'),
      dataIndex: 'company',
      key: 'company',
      width: '15%',
      ellipsis: true,
      render: (company) => <div className="pl-1">{company?.representative}</div>
    },

    {
      title: L('METER_QUANLITY'),
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: '13%',
      ellipsis: true,
      render: (totalQuantity) => <div>{totalQuantity}</div>
    },

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
    },
    SystemColumn
  ]

  return data
}

export const columnData4Tenant = (actionColumn?) => {
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
      title: L('METER_QUANLITY'),
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: '13%',
      ellipsis: true,
      render: (totalQuantity) => <div>{totalQuantity}</div>
    },
    {
      title: () => <> {L('RENOVATION_START_DATE')}</>,
      dataIndex: 'startDate',
      key: 'startDate',
      ellipsis: true,
      width: '10%',
      render: (startDate) => renderDateTime(startDate)
    },
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
    },
    SystemColumn
  ]

  return data
}

export default columns
