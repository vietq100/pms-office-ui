import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { renderDotActive } from '@lib/helper'
const { align } = AppConsts
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
      title: L('BUILDING_NAME'),
      dataIndex: 'building',
      key: 'building',
      width: '8%',
      render: (building) => <div>{building?.name}</div>
    },
    {
      title: L('FLOOR_NAME'),
      dataIndex: 'name',
      key: 'name',
      width: '8%',
      render: (text: string) => <>{text}</>
    },
    {
      title: L('FLOOR_CODE'),
      dataIndex: 'code',
      key: 'code',
      width: '8%',
      render: (text: string) => <div>{text}</div>
    },
    {
      title: L('FLOOR_DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',

      ellipsis: true,
      render: (text: string) => <>{text}</>
    }
  ]

  return data
}

export default columns
