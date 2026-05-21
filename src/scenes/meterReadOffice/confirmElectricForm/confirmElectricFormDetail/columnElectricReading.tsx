import { buildEditableCell } from '@components/DataTableV2/EditableCell'
import { L } from '@lib/abpUtility'
import { formatNumber } from '@lib/helper'
import { TableColumnGroupType, TableColumnType } from 'antd'
import { ColumnsType } from 'antd/lib/table'

// const columns = () => {
//   const data = [
//     {
//       title: L('UNIT_NAME'),
//       dataIndex: 'fullUnitCode',
//       key: 'fullUnitCode',
//       width: '30%',
//       ellipsis: true,
//       render: (fullUnitCode) => <div className="pl-2">{fullUnitCode}</div>
//     },
//     {
//       title: L('INDEX_OLD'),
//       dataIndex: 'previousReading',
//       key: 'previousReading',
//       width: '13%',
//       ellipsis: true,
//       render: (previousReading) => <div> {formatNumber(previousReading)}</div>
//     },
//     {
//       title: L('INDEX_TO'),
//       dataIndex: 'newReading',
//       key: 'newReading',
//       width: '13%',
//       ellipsis: true,
//       render: (newReading) => <div> {formatNumber(newReading)}</div>
//     },
//     {
//       title: L('SUN_INDEX_OLD'),
//       dataIndex: 'previousSunReading',
//       key: 'previousSunReading',
//       width: '13%',

//       render: (previousSunReading) => (
//         <div className="pl-2">{previousSunReading && formatNumber(previousSunReading)}</div>
//       )
//     },
//     {
//       title: L('SUN_INDEX_NEW'),
//       dataIndex: 'newSunReading',
//       key: 'newSunReading',
//       width: '13%',

//       render: (newSunReading) => <div className="pl-2">{newSunReading && formatNumber(newSunReading)}</div>
//     },
//     {
//       title: L('METER_QUANTITY_SUN_CONSUMPTION'),
//       dataIndex: 'quantitySunConsumption',
//       key: 'quantitySunConsumption',
//       width: '13%',

//       render: (quantitySunConsumption) => (
//         <div className="pl-2">{quantitySunConsumption && formatNumber(quantitySunConsumption)}</div>
//       )
//     },
//     {
//       title: L('METER_QUANTITY_CONSUMPTION'),
//       dataIndex: 'quantityConsumption',
//       key: 'quantityConsumption',
//       width: '13%',

//       render: (quantityConsumption) => (
//         <div className="pl-2">{quantityConsumption && formatNumber(quantityConsumption)}</div>
//       )
//     },
//     {
//       title: L('METER_QUANLITY'),
//       dataIndex: 'quantity',
//       key: 'quantity',
//       width: '13%',
//       ellipsis: true,
//       render: (totalQuantity) => <div> {formatNumber(totalQuantity)}</div>
//     },
//     {
//       title: L('METER_UNIT_PRICE'),
//       dataIndex: 'amount',
//       key: 'amount',
//       width: '13%',
//       ellipsis: true,
//       render: (amount) => <div> {formatNumber(amount)}</div>
//     },
//     {
//       title: L('METER_TOTAL_MOUNT'),
//       dataIndex: 'totalAmount',
//       key: 'totalAmount',
//       width: '13%',
//       ellipsis: true,
//       render: (totalAmount) => <div> {formatNumber(totalAmount)}</div>
//     }
//   ]

//   return data
// }

const columns = (
  isEditing: any,
  actionColumn?: TableColumnGroupType<any> | TableColumnType<any>,
  isShowFull = false
) => {
  const data: ColumnsType<any> = [
    {
      title: L('UNIT_NAME'),
      dataIndex: 'fullUnitCode',
      key: 'fullUnitCode',
      width: '30%',
      ellipsis: isShowFull,
      render: (fullUnitCode) => <div className="pl-2">{fullUnitCode}</div>
    },
    {
      title: L('INDEX_OLD'),
      dataIndex: 'previousReading',
      key: 'previousReading',
      width: '12%',
      ellipsis: isShowFull,
      render: (previousReading) => <div> {formatNumber(previousReading)}</div>
    },
    {
      title: L('INDEX_TO'),
      dataIndex: 'newReading',
      key: 'newReading',
      width: '12%',
      ellipsis: isShowFull,
      render: (newReading) => <div> {formatNumber(newReading)}</div>
    },
    // {
    //   title: L('SUN_INDEX_OLD'),
    //   dataIndex: 'previousSunReading',
    //   key: 'previousSunReading',
    //   width: '13%',
    //   ellipsis: isShowFull,
    //   render: (previousSunReading) => (
    //     <div className="pl-2">{previousSunReading && formatNumber(previousSunReading)}</div>
    //   )
    // },
    // {
    //   title: L('SUN_INDEX_NEW'),
    //   dataIndex: 'newSunReading',
    //   key: 'newSunReading',
    //   width: '13%',
    //   ellipsis: isShowFull,
    //   render: (newSunReading) => <div className="pl-2">{newSunReading && formatNumber(newSunReading)}</div>
    // },
    // {
    //   title: L('METER_QUANTITY_SUN_CONSUMPTION'),
    //   dataIndex: 'quantitySunConsumption',
    //   key: 'quantitySunConsumption',
    //   width: '13%',
    //   ellipsis: isShowFull,
    //   render: (quantitySunConsumption) => (
    //     <div className="pl-2">{quantitySunConsumption && formatNumber(quantitySunConsumption)}</div>
    //   )
    // },
    {
      title: L('METER_QUANTITY_CONSUMPTION'),
      dataIndex: 'quantityConsumption',
      key: 'quantityConsumption',
      width: '13%',
      ellipsis: isShowFull,
      render: (quantityConsumption) => (
        <div className="pl-2">{quantityConsumption && formatNumber(quantityConsumption)}</div>
      )
    },
    {
      title: L('METER_QUANLITY'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: '13%',
      ellipsis: isShowFull,
      render: (totalQuantity) => <div> {formatNumber(totalQuantity)}</div>
    },
    {
      title: L('METER_UNIT_PRICE'),
      dataIndex: 'amount',
      key: 'amount',
      width: '13%',
      ellipsis: isShowFull,
      render: (amount) => <div> {formatNumber(amount)}</div>,
      onCell: (record) => buildEditableCell(record, 'number', 'amount', 'METER_UNIT_PRICE', isEditing, '', true)
    },
    {
      title: L('METER_TOTAL_MOUNT'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: '13%',
      ellipsis: isShowFull,
      render: (totalAmount) => <div> {formatNumber(totalAmount)}</div>
    }
  ]
  if (actionColumn) {
    data.push(actionColumn)
  }
  return data
}

export default columns
