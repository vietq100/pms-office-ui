import SystemColumn from '@components/DataTable/columns'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { renderDotActive } from '@lib/helper'
const { align } = AppConsts

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
      title: L('METER_READING_ELECTRIC_UNIT'),
      dataIndex: 'numOfPopulation',
      key: 'numOfPopulation',
      width: '10%',
      render: (numOfPopulation) => <>{numOfPopulation}</>
    },
    {
      title: L('METER_READING_ELECTRIC_NUM_OF_MEMBER'),
      dataIndex: 'unit',
      key: 'unit',
      width: '8%',
      ellipsis: true,
      render: (unit) => <>{unit}</>
    },
    {
      title: L('METER_READING_ELECTRIC_CLOCK_CODE'),
      dataIndex: 'id',
      key: 'id',
      width: '10%',
      ellipsis: true,
      render: (id, item) => <>{item.contractCategory?.name}</>
    },
    {
      title: L('METER_READING_ELECTRIC_CLOCK_TYPE'),
      dataIndex: 'id',
      key: 'id',
      width: '10%',
      ellipsis: true,
      render: (id, item) => <>{item.contractCategory?.name}</>
    },
    {
      title: L('METER_READING_ELECTRIC_PERIOD_CURRENT'),
      dataIndex: 'signedDate',
      key: 'signedDate',
      width: '10%',
      ellipsis: true,
      render: (signedDate) => <>{signedDate}</>
    },
    {
      title: L('METER_READING_ELECTRIC_FROM_INDEX'),
      dataIndex: 'validDate',
      key: 'validDate',
      width: '10%',
      ellipsis: true,
      render: (validDate) => <div>{validDate}</div>
    },
    {
      title: L('METER_READING_ELECTRIC_TO_INDEX'),
      dataIndex: 'expiredDate',
      key: 'expiredDate',
      width: '10%',
      ellipsis: true,
      render: (expiredDate) => <div>{expiredDate}</div>
    },
    {
      title: L('METER_READING_ELECTRIC_TOTALL_USE_IN_PERIOD'),
      dataIndex: 'expiredInDays',
      key: 'expiredInDays',
      width: '10%',
      render: (expiredInDays) => <>{expiredInDays}</>
    },
    SystemColumn
  ]

  return data
}

export default columns
