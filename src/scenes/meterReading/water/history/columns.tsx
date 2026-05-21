import SystemColumn from '@components/DataTable/columns'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { renderDotActive } from '@lib/helper'
const { align } = AppConsts

const columns = () => {
  const data = [
    {
      title: L(''),
      dataIndex: 'isGenerated',
      key: 'isGenerated',
      width: '2%',
      align: align.center,
      render: renderDotActive
    },
    {
      title: L('METER_READING_WATER_UNIT'),
      dataIndex: 'unit',
      key: 'unit',
      width: '10%',
      ellipsis: true,
      render: (unit) => <>{unit?.fullUnitCode}</>
    },
    {
      title: L('METER_READING_WATER_PERIOD'),
      dataIndex: 'package',
      key: 'package',
      width: '10%',
      ellipsis: true,
      render: (text) => <>{text?.name}</>
    },
    {
      title: L('METER_READING_WATER_FROM_INDEX'),
      dataIndex: 'lastIndex',
      key: 'lastIndex',
      width: '10%',
      ellipsis: true,
      render: (lastIndex) => <div>{lastIndex}</div>
    },
    {
      title: L('METER_READING_WATER_TO_INDEX'),
      dataIndex: 'newIndex',
      key: 'newIndex',
      width: '10%',
      ellipsis: true,
      render: (newIndex) => <div>{newIndex}</div>
    },
    {
      title: L('METER_READING_WATER_STATUS'),
      dataIndex: 'id',
      key: 'id',
      width: '10%',
      ellipsis: true,
      render: (id, item) => <>{item.contractCategory?.name}</>
    },
    SystemColumn
  ]

  return data
}

export default columns
