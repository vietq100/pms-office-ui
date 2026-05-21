import SystemColumn from '@components/DataTable/columns'
import { L } from '@lib/abpUtility'
import { formatNumber } from '@lib/helper'

const columns = (actionColumn?) => {
  const data = [
    actionColumn,
    {
      title: L('FEE_PERIOD'),
      dataIndex: 'feePackage',
      key: 'feePackage',
      width: '12%',
      render: (feePackage) => <>{feePackage?.name}</>
    },
    {
      title: L('OLD_SCORE'),
      dataIndex: 'fromIndex',
      key: 'fromIndex',
      width: '17%',
      render: (fromIndex) => <>{fromIndex}</>
    },
    {
      title: L('NEW_SCORE'),
      dataIndex: 'toIndex',
      key: 'toIndex',
      width: '17%',
      render: (toIndex) => <>{toIndex}</>
    },
    {
      title: L('METER_QUANTITY'),
      dataIndex: 'total',
      key: 'total',
      width: '17%',
      ellipsis: true,
      render: (total) => <div className="pl-2">{total && formatNumber(total)}</div>
    },

    {
      title: L('TOTAL_AMOUNT'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: '20%',
      ellipsis: true,
      render: (totalAmount) => <div className="pl-2">{totalAmount && formatNumber(totalAmount)}</div>
    },
    SystemColumn
  ]

  return data
}

export default columns
