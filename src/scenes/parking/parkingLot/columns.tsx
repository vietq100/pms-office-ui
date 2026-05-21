// import SystemColumn from '@components/DataTable/columns'
import SystemColumn from '@components/DataTable/columns'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { formatNumber, renderIsActiveBlue } from '@lib/helper'
const { align } = AppConsts

export const getParkingLotColumns = (actionColumn?) => {
  const data = [
    actionColumn,
    {
      title: L('PARKING_CODE'),
      dataIndex: 'code',
      key: 'code',
      width: '10%',
      ellipsis: true,
      render: (code) => <>{code}</>
    },
    {
      title: L('PARKING_LOT_ADDRESS'),
      dataIndex: 'description',
      key: 'description',
      width: '20%',
      ellipsis: true,
      render: (description) => <>{description}</>
    },
    {
      title: L('NUM_OF_SLOT_MOTO'),
      dataIndex: 'numOfSlots',
      key: 'numOfSlots',
      ellipsis: true,
      width: '10%',
      render: (numOfSlots) => <>{formatNumber(numOfSlots)}</>
    },
    {
      title: L('NUM_OF_SLOT_CAR'),
      dataIndex: 'numOfSlots',
      key: 'numOfSlots',
      ellipsis: true,
      width: '10%',
      render: (numOfSlots) => <>{formatNumber(numOfSlots)}</>
    },
    {
      title: L('STATUS'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: '10%',
      align: align.center,
      ellipsis: true,
      render: renderIsActiveBlue
    },
    SystemColumn
  ]

  return data
}

export default getParkingLotColumns
