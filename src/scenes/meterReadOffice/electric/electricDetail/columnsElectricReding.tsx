import { buildEditableCell } from '@components/DataTableV2/EditableCell'
import { L } from '@lib/abpUtility'
import { formatNumber } from '@lib/helper'
import { TableColumnGroupType, TableColumnType } from 'antd'
import { ColumnsType } from 'antd/lib/table'

const columnsElectricReding = (actionColumn: TableColumnGroupType<any> | TableColumnType<any>, isEditing: any) => {
  const data: ColumnsType<any> = [
    {
      title: L('UNIT_NAME'),
      dataIndex: 'fullUnitCode',
      key: 'fullUnitCode',
      width: '30%',
      ellipsis: true,
      render: (fullUnitCode) => <div className="pl-2">{fullUnitCode}</div>
    },
    {
      title: L('INDEX_OLD'),
      dataIndex: 'previousReading',
      key: 'previousReading',
      width: 70,
      ellipsis: true,
      render: (previousReading) => <div className="pl-2">{previousReading && formatNumber(previousReading)}</div>,
      onCell: (record) => buildEditableCell(record, 'number', 'previousReading', 'INDEX_OLD', isEditing, '', true)
    },
    {
      title: L('INDEX_TO'),
      dataIndex: 'newReading',
      key: 'newReading',
      width: 70,
      ellipsis: true,
      render: (newReading) => <div className="pl-2">{newReading && formatNumber(newReading)}</div>,
      onCell: (record) => buildEditableCell(record, 'number', 'newReading', 'INDEX_TO', isEditing, '', true)
    },
    // {
    //   title: L('SUN_INDEX_OLD'),
    //   dataIndex: 'previousSunReading',
    //   key: 'previousSunReading',
    //   width: 70,
    //   ellipsis: true,
    //   render: (previousSunReading) => (
    //     <div className="pl-2">{previousSunReading && formatNumber(previousSunReading)}</div>
    //   ),
    //   onCell: (record) =>
    //     buildEditableCell(record, 'number', 'previousSunReading', 'SUN_INDEX_OLD', isEditing, '', true)
    // },
    // {
    //   title: L('SUN_INDEX_NEW'),
    //   dataIndex: 'newSunReading',
    //   key: 'newSunReading',
    //   width: 70,
    //   render: (newSunReading) => <div className="pl-2">{newSunReading && formatNumber(newSunReading)}</div>,
    //   onCell: (record) => buildEditableCell(record, 'number', 'newSunReading', 'SUN_INDEX_NEW', isEditing, '', true)
    // },
    // {
    //   title: L('METER_QUANTITY_SUN_CONSUMPTION'),
    //   dataIndex: 'quantitySunConsumption',
    //   key: 'quantitySunConsumption',
    //   width: 70,
    //   render: (quantitySunConsumption) => (
    //     <div className="pl-2">{quantitySunConsumption && formatNumber(quantitySunConsumption)}</div>
    //   )
    // },
    {
      title: L('METER_QUANTITY_CONSUMPTION'),
      dataIndex: 'quantityConsumption',
      key: 'quantityConsumption',
      width: 70,

      render: (quantityConsumption) => (
        <div className="pl-2">{quantityConsumption && formatNumber(quantityConsumption)}</div>
      )
    }
    // {
    //   title: L('METER_QUANTITY'),
    //   dataIndex: 'quantity',
    //   key: 'quantity',
    //   width: 70,
    //   render: (quantity) => <div className="pl-2">{quantity && formatNumber(quantity)}</div>
    // }
  ]
  if (actionColumn) {
    data.push(actionColumn)
  }
  return data
}
export default columnsElectricReding
