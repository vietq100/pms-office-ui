import { formatCurrency, renderDate, renderDotActive } from '@lib/helper'
import { L } from '@lib/abpUtility'
import SystemColumn from '@components/DataTable/columns'
import AppConsts from '@lib/appconst'
const { align } = AppConsts
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
      title: L('ASSET_SERIAL_NUMBER'),
      dataIndex: 'serialNumber',
      width: '10%'
    },

    {
      title: L('ASSET_PRICE'),
      dataIndex: 'price',
      width: '10%',

      render: (text) => <div>{formatCurrency(text)}</div>
    },
    {
      title: L('ASSET_PURCHASED_DATE'),
      dataIndex: 'purchasedDate',
      width: '8%',
      render: renderDate
    },
    {
      title: L('ASSET_WARRANTY_DATE'),
      dataIndex: 'warrantDate',
      width: '8%',
      render: renderDate
    },
    {
      title: L('ASSET_EXPIRED_DATE'),
      dataIndex: 'expiredInDays',
      key: 'expiredInDays',
      width: '8%',
      ellipsis: true,
      render: (expiredInDays) => <>{expiredInDays}</>
    },

    SystemColumn
  ]

  return data
}

export default columns
