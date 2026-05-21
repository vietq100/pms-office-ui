import SystemColumn from '@components/DataTable/columns'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { formatNumber, renderDotActive } from '@lib/helper'
const { align, typeMeterReading } = AppConsts

const columns = () => {
  const data = [
    {
      title: L(''),
      dataIndex: 'isActive',
      key: 'isActive',
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
      title: L('METER_READING_WATER_NUM_OF_MEMBER'),
      dataIndex: 'numOfPopulation',
      key: 'numOfPopulation',
      width: '7%',
      ellipsis: true,
      render: (numOfPopulation) => <>{numOfPopulation}</>
    },
    {
      title: L('METER_READING_WATER_CLOCK_CODE'),
      dataIndex: 'code',
      key: 'code',
      width: '10%',
      ellipsis: true,
      render: (code) => <>{code}</>
    },
    {
      title: L('METER_READING_WATER_CLOCK_TYPE'),
      dataIndex: 'type',
      key: 'type',
      width: '10%',
      ellipsis: true,
      render: (type) => {
        const typeName = typeMeterReading.find((item) => item.value === type)

        return <>{L(typeName?.name || '')}</>
      }
    },
    {
      title: L('METER_READING_WATER_PERIOD_CURRENT'),
      dataIndex: 'currentMeter',
      key: 'currentMeter',
      width: '18%',

      render: (currentMeter) => <div className="text-truncate-2">{currentMeter?.currentPackage?.name}</div>
    },
    {
      title: L('METER_READING_WATER_FROM_INDEX'),
      dataIndex: 'lastIndex',
      key: 'lastIndex',
      width: '8%',
      ellipsis: true,
      render: (text, row) => <div>{formatNumber(row.currentMeter?.lastIndex)}</div>
    },
    {
      title: L('METER_READING_WATER_TO_INDEX'),
      dataIndex: 'newIndex',
      key: 'newIndex',
      width: '8%',
      ellipsis: true,
      render: (text, row) => <div>{formatNumber(row.currentMeter?.newIndex)}</div>
    },
    {
      title: L('METER_READING_WATER_TOTALL_USE_IN_PERIOD'),
      dataIndex: 'lastIndexUsed',
      key: 'lastIndexUsed',
      width: '8%',
      ellipsis: true,
      render: (text, row) => <>{formatNumber(row.currentMeter?.lastIndexUsed)}</>
    },
    SystemColumn
  ]

  return data
}

export default columns
