import { L } from '@lib/abpUtility'
import { renderDotActive } from '@lib/helper'
import AppConst from '@lib/appconst'
import { Popover } from 'antd'
import { columnCreate, columnUpdate } from '@components/DataTable/columns'

const { align } = AppConst

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
      title: L('UNIT_DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',
      width: '30%',
      render: (text: string) => (
        <Popover trigger="hover" content={<label className="text-small">{text}</label>}>
          <label className="line-clamp px-1">{text}</label>
        </Popover>
      )
    },
    {
      title: L('ZONE_UNIT'),
      dataIndex: 'unit',
      key: 'unit',
      width: '15%',
      render: (unit) => <label className="line-clamp px-1 ">{unit?.fullUnitCode}</label>
    },
    columnCreate,
    columnUpdate
  ]

  return data
}

export default columns
