import AppConst from '@lib/appconst'
import { formatCurrency } from '@lib/helper'
import SystemColumn from '@components/DataTable/columns'
import { L } from '@lib/abpUtility'
import { Tooltip } from 'antd'

const { align } = AppConst

const columns = (actionColumn?) => {
  return [
    actionColumn,
    {
      title: L('CASH_ADVANCE_CODE_WALLET'),
      dataIndex: 'cashNumber',
      key: 'cashNumber',
      width: '15%',
      render: (cashNumber) => <label text-truncate-3>{cashNumber}</label>
    },
    {
      title: L('FEE_TYPE'),
      dataIndex: 'feeType',
      key: 'feeType',
      width: '16%',
      render: (feeType) => <label className="px-1 text-truncate-2">{feeType?.name}</label>
    },
    {
      title: L('CASH_ADVANCE_BALANCE_AMOUNT'),
      dataIndex: 'balanceAmount',
      key: 'balanceAmount',
      width: '14%',
      ellipsis: true,
      align: align.right,
      render: (balanceAmount) => <div>{formatCurrency(balanceAmount)}</div>
    },
    {
      title: L('CASH_ADVANCE_DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',
      width: '24%',
      render: (description) => (
        <>
          <Tooltip trigger="contextMenu" placement="topLeft" title={description} color="#2db7f5">
            <div className=" text-truncate-2">{description}</div>
          </Tooltip>
        </>
      )
    },
    SystemColumn
  ]
}

export default columns
