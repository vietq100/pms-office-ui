import SystemColumn from '@components/DataTable/columns'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { formatNumber, renderDate } from '@lib/helper'

const { listTicketRequestStatus, align } = AppConsts

const columns = (actionColumn?) => {
  const data = [
    {
      title: L('ID'),
      dataIndex: 'id',
      key: 'id',
      width: '6%',
      ellipsis: true,
      align: align.center,
      render: (id) => id
    },
    actionColumn,
    {
      title: L('FEE_PERIOD'),
      dataIndex: 'feePackage',
      key: 'feePackage',
      width: '12%',
      render: (feePackage) => <>{feePackage?.name}</>
    },
    {
      title: L('START_DATE'),
      dataIndex: 'startOfDate',
      key: 'startOfDate',
      width: '12%',
      render: renderDate
    },
    {
      title: L('END_DATE'),
      dataIndex: 'endOfDate',
      key: 'endOfDate',
      width: '12%',
      render: renderDate
    },
    {
      title: L('UNIT_SIZE'),
      dataIndex: 'unitSize',
      key: 'unitSize',
      width: '12%',
      render: (unitSize) => <>{formatNumber(unitSize)}</>
    },
    {
      title: L('METER_UNIT_PRICE'),
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: '12%',
      render: (unitPrice) => <>{formatNumber(unitPrice)}</>
    },
    {
      title: L('TOTAL_AMOUNT_VAT'),
      dataIndex: 'totalAmountIncludeVAT',
      key: 'totalAmountIncludeVAT',
      width: '12%',
      render: (totalAmountIncludeVAT, item) => <>{formatNumber(totalAmountIncludeVAT ?? item.totalAmount)}</>
    },
    {
      title: L('STATUS'),
      dataIndex: 'statusId',
      key: 'statusId',
      width: '12%',
      render: (statusId) => <> {L(listTicketRequestStatus.find((item) => item.value === statusId)?.label ?? '')}</>
    },
    SystemColumn
  ]

  return data
}

export default columns
