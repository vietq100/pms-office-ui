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
      dataIndex: 'unit',
      key: 'unit',
      width: '10%',
      render: (unit) => <>{unit}</>
    },
    {
      title: L('METER_READING_ELECTRIC_PERIOD'),
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
      title: L('METER_READING_ELECTRIC_STATUS'),
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
