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
      title: L('BUILDING_CODE'),
      dataIndex: 'code',
      key: 'code',
      width: '9%',
      render: (text: string) => <div>{text}</div>
    },
    {
      title: L('BUILDING_DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => <>{text}</>
    }
  ]

  return data
}

export default columns
