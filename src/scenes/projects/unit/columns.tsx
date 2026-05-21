import { L } from '@lib/abpUtility'
import { renderDotActive } from '@lib/helper'
import AppConst from '@lib/appconst'
import './style.css'
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
      width: '20%',
      render: (text: string) => (
        <Popover trigger="hover" content={<label className="text-small">{text}</label>}>
          <label className="line-clamp px-1 text-small">{text}</label>
        </Popover>
      )
    },
    {
      title: L('UNIT_ZONE'),
      dataIndex: 'zones',
      key: 'zones',
      width: '20%',
      render: (zones) => (
        <div className="full-width line-clamp">
          {zones.map((item) => (
            <label
              key={item?.id}
              className=" mx-1 text-small"
              style={{ backgroundColor: '#DDDDDD', borderRadius: '8px', padding: '7px' }}>
              {item?.zoneName}
            </label>
          ))}
        </div>
      )
    },
    columnCreate,
    columnUpdate
  ]

  return data
}

export default columns
