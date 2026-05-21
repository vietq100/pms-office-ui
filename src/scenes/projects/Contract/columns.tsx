import SystemColumn from '@components/DataTable/columns'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { renderDate, renderDotActive } from '@lib/helper'
const { align } = AppConsts

const columns = (actionColumn?) => {
  const data = [
    {
      title: L(''),
      dataIndex: 'isActive',
      key: 'isActive',
      width: '3%',
      align: align.center,
      render: renderDotActive
    },
    {
      title: L('CONTRACT_ID'),
      dataIndex: 'id',
      key: 'id',
      width: '4%',
      render: (id) => <>{id}</>
    },
    actionColumn,
    {
      title: L('CONTRACT_CATEGORY'),
      dataIndex: 'id',
      key: 'id',
      width: '11%',
      render: (id, item) => <>{item.contractCategory?.name}</>
    },
    {
      title: L('CONTRACT_SIGNED_DATE'),
      dataIndex: 'signedDate',
      key: 'signedDate',
      width: '9%',
      ellipsis: true,
      render: (signedDate) => <>{renderDate(signedDate)}</>
    },
    {
      title: L('CONTRACT_START_DATE'),
      dataIndex: 'validDate',
      key: 'validDate',
      width: '9%',
      ellipsis: true,
      render: (validDate) => <div>{renderDate(validDate)}</div>
    },
    {
      title: L('CONTRACT_EXPIRED_DATE'),
      dataIndex: 'expiredDate',
      key: 'expiredDate',
      ellipsis: true,
      width: '9%',
      render: (expiredDate) => <div>{renderDate(expiredDate)}</div>
    },
    {
      title: L('CONTRACT_EXPIRED_IN'),
      dataIndex: 'expiredInDays',
      key: 'expiredInDays',
      ellipsis: true,
      width: '8%',
      render: (expiredInDays) => <>{expiredInDays}</>
    },

    // {
    //   title: L('IS_ACTIVE'),
    //   dataIndex: 'isActive',
    //   key: 'isActive',
    //   render: renderIsActive
    // }
    SystemColumn
  ]

  return data
}

export default columns
