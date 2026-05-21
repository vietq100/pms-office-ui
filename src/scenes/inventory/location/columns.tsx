import { L } from '@lib/abpUtility'
import { renderDotActive } from '@lib/helper'
import AppConst from '@lib/appconst'
const { align } = AppConst
const columns = (actionColumn?) => {
  const data = [
    {
      title: L(''),
      dataIndex: 'isActive',
      key: 'isActive',
      align: align.center,
      width: '2%',
      render: renderDotActive
    },
    actionColumn,
    {
      title: L('DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description) => <div>{description}</div>
    }
  ]

  return data
}

export default columns
