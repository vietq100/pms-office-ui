import SystemColumn from '@components/DataTable/columns'
import { L } from '@lib/abpUtility'
import { formatCurrency, renderDotActive } from '@lib/helper'

import AppConst from '../../../lib/appconst'
import { Popover, Tag } from 'antd'
const { align, statusGenerateFee, targetSource } = AppConst

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
      title: L('GEN_FEE_TYPE'),
      dataIndex: 'feeType',
      key: 'feeType',
      width: '10%',
      ellipsis: true,
      render: (feeType) => <>{feeType?.name}</>
    },
    {
      title: L('GEN_FEE_DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',
      width: '20%',
      ellipsis: true,
      render: (description: string) => <div className="full-name text-truncate text-link-to-detail">{description}</div>
    },

    {
      title: L('FEE_NOTICE_FEE_SOURCE'),
      dataIndex: 'targetSource',
      key: 'targetSource',
      width: '11%',
      ellipsis: true,
      render: (statusId) => <> {targetSource.find((item) => item.value === statusId)?.label}</>
    },

    {
      title: L('GEN_FEE_PERIOD'),
      dataIndex: 'feePackage',
      key: 'feePackage',
      width: '6%',
      align: align.center,
      ellipsis: true,
      render: (feePackage) => <>{feePackage.name}</>
    },

    {
      title: L('GENN_FEE_AMOUNT'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: '11%',
      align: align.right,
      ellipsis: true,
      render: (totalAmount) =>
        totalAmount === null ? (
          <>
            <Popover trigger="hover" content={L('GEN_FEE_CONTEXT_COL_TOTAL_AMOUNT')}>
              <div style={{ color: '#FCCC75' }}>{L('GEN_FEE_CONTEXT_CALCULATING')}</div>
            </Popover>
          </>
        ) : (
          <>{formatCurrency(totalAmount)}</>
        )
    },

    {
      title: L('GEN_FEE_STATUS'),
      dataIndex: 'statusId',
      key: 'statusId',
      ellipsis: true,
      align: align.center,
      width: '15%',
      render: (statusId) =>
        statusGenerateFee.map(
          (item) =>
            item.value === statusId && (
              <Tag
                className="cell-round mr-0"
                style={{ color: item.color, backgroundColor: item.backgroundColor, border: 'none' }}>
                {item.label}
              </Tag>
            )
        )
    },
    SystemColumn
  ]

  return data
}

export default columns
