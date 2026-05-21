import { L } from '@lib/abpUtility'

import { renderDotActive } from '@lib/helper'
import SystemColumn from '@components/DataTable/columns'

const columns = (actionColumn?) => {
  const data = [
    {
      title: '',
      dataIndex: 'isActive',
      key: 'isActive',
      width: '2%',
      render: renderDotActive
    },
    actionColumn,

    {
      title: L('FEE_TYPE_CODE'),
      dataIndex: 'code',
      key: 'code',
      width: '12%',
      render: (text: string) => <div>{text}</div>
    },
    {
      title: L('FEE_TYPE_DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',
      width: '20%',
      ellipsis: true,
      render: (text) => <div>{text}</div>
    },

    SystemColumn
  ]

  return data
}

export default columns
