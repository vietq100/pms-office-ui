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
      title: L('LOW_SCORE'),
      dataIndex: 'lowScore',
      key: 'lowScore',
      width: '20%',
      render: (lowScore, index) => (
        <div className="flex space-between px-3">
          <span>
            {formatNumber(index?.lowFromIndex)} - {formatNumber(index?.lowToIndex)}
          </span>
          <span>
            {L('QUANTITY')}: {formatNumber(index?.lowTotal)}
          </span>
        </div>
      )
    },
    {
      title: L('HIGHT_SCORE'),
      dataIndex: 'hightScore',
      key: 'hightScore',
      width: '20%',
      render: (hightScore, index) => (
        <div className="flex space-between px-3">
          <span>
            {formatNumber(index?.peakFromIndex)} - {formatNumber(index?.peakToIndex)}
          </span>
          <span>
            {L('QUANTITY')}: {formatNumber(index?.peakTotal)}
          </span>
        </div>
      )
    },
    {
      title: L('NORMAL_SCORE'),
      dataIndex: 'normalScore',
      key: 'normalScore',
      width: '20%',
      render: (normalScore, index) => (
        <div className="flex space-between px-3">
          <span>
            {formatNumber(index?.normalFromIndex)} - {formatNumber(index?.normalToIndex)}
          </span>
          <span>
            {L('QUANTITY')}: {formatNumber(index?.normalTotal)}
          </span>
        </div>
      )
    },
    SystemColumn
  ]

  return data
}

export default columns
