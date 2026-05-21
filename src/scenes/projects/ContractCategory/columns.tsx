import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'

import { renderDotActive } from '@lib/helper'
const { align } = AppConsts
const columns = (actionColumn?) => {
  const data = [
    {
      title: '',
      dataIndex: 'isActive',
      key: 'isActive',
      width: '4%',
      align: align.center,
      render: renderDotActive
    },
    {
      title: L('CONTRACT_CATEGORY_ID'),
      dataIndex: 'id',
      key: 'id',
      width: '4%',
      align: align.center,
      render: (id) => <>{id}</>
    },
    actionColumn,

    {
      title: L('CONTRACT_CATEGORY_CODE'),
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (code) => <>{code}</>
    }
  ]

  return data
}

export default columns
