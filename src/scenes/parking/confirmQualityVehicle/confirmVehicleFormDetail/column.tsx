import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { formatInteger, formatNumber, formatOneDecimal } from '@lib/helper'
const { listVehicleParkingType } = AppConsts

const columns = () => {
  const data = [
    {
      title: L('PARKING_CARD_PARKING_TIME'),
      dataIndex: 'vehicleParkingType',
      key: 'vehicleParkingType',
      width: '13%',
      ellipsis: true,
      render: (vehicleParkingType) =>
        L(listVehicleParkingType.find((item) => item.value === vehicleParkingType)?.name ?? '')
    },

    {
      title: L('METER_QUANLITY'),
      dataIndex: 'totalVehicle',
      key: 'totalVehicle',
      width: '13%',
      ellipsis: true,
      render: (totalVehicle) => <div> {formatNumber(totalVehicle)}</div>
    },
    {
      title: L('METER_UNIT_PRICE'),
      dataIndex: 'price',
      key: 'price',
      width: '13%',
      ellipsis: true,
      render: (price) => <div> {formatNumber(price)}</div>
    },
    {
      title: L('METER_TOTAL_MOUNT'),
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: '13%',
      ellipsis: true,
      render: (totalPrice) => <div> {formatNumber(totalPrice)}</div>
    },
    {
      title: L('METER_PRECENT_VAT'),
      dataIndex: 'vat',
      key: 'vat',
      width: '13%',
      ellipsis: true,
      render: (vat) => <div> {formatNumber(vat)}</div>
    },
    {
      title: L('METER_AMOUNT_VAT'),
      dataIndex: 'vatPrice',
      key: 'vatPrice',
      width: '13%',
      ellipsis: true,
      render: (vatPrice) => <div> {formatOneDecimal(vatPrice)}</div>
    },
    {
      title: L('METER_TOTAL_AMOUNT_VAT'),
      dataIndex: 'vatTotalPrice',
      key: 'vatTotalPrice',
      width: '13%',
      ellipsis: true,
      render: (vatTotalPrice) => <div> {formatInteger(vatTotalPrice)}</div>
    }
  ]

  return data
}

export default columns
