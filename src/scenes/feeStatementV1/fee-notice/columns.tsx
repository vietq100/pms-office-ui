import SystemColumn from '@components/DataTable/columns'
import { L } from '@lib/abpUtility'
import { renderDotActive } from '@lib/helper'

import appConsts from '@lib/appconst'
import { Tag, Tooltip } from 'antd'
const { align, statusFeeNotice } = appConsts
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
      title: L('ID'),
      dataIndex: 'id',
      key: 'id',
      width: '5%',
      align: align.center,
      render: (id) => <>{id}</>
    },

    actionColumn,
    {
      title: L('FEE_NOTICE_FEE_PERIOD'),
      dataIndex: 'feePackage',
      key: 'feePackage',
      width: '25%',
      align: align.center,
      render: (feePackage) => (
        <div className="text-truncate-2 text-small">
          <Tooltip title={feePackage?.name} trigger="contextMenu">
            {feePackage?.name}
          </Tooltip>
        </div>
      )
    },
    {
      title: L('FEE_NOTICE_TOAL_METHOD'),
      dataIndex: 'method',
      key: 'method',
      width: '10%',
      render: (method) =>
        method?.map((item, index) => (
          <>
            {index > 0 ? ', ' : ''}
            {L(item)}
          </>
        ))
    },
    {
      title: L('FEE_NOTICE_TOAL_COMPANY'),
      dataIndex: 'totalCompany',
      key: 'totalCompany',
      width: '10%',
      align: align.center,
      render: (totalCompany) => <>{totalCompany}</>
    },

    {
      title: L('FEE_NOTICE_TOTAL_COMPLETED'),
      dataIndex: 'totalCompleted',
      key: 'totalCompleted',
      align: align.center,
      width: '9%',
      render: (totalCompleted) => <>{totalCompleted}</>
    },

    {
      title: L('FEE_NOTICE_FEE_STATUS'),
      dataIndex: 'statusId',
      key: 'statusId',
      width: '14%',
      ellipsis: true,
      align: align.center,
      render: (statusId) =>
        statusFeeNotice.map(
          (item) =>
            item.value === statusId && (
              <Tag
                className="cell-round mr-0"
                style={{ color: item.color, backgroundColor: item.backgroundColor, border: 'none', fontSize: 11 }}>
                {item.label}
              </Tag>
            )
        )
    },
    // {
    //   title: L('FEE_NOTICE_AMOUNT'),
    //   dataIndex: 'amount',
    //   key: 'amount',
    //   width: '10%',
    //   ellipsis: true,
    //   render: (amount) => <>{formatCurrency(amount)}</>
    // },
    // {
    //   title: L('FEE_NOTICE_LAST_PERIOD_AMUNT'),
    //   dataIndex: 'lastPeriodAmount',
    //   key: 'lastPeriodAmount',
    //   width: '10%',
    //   render: (lastPeriodAmount) => <>{lastPeriodAmount}</>
    // },

    SystemColumn
  ]

  return data
}

export default columns
