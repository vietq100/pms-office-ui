import { L } from '@lib/abpUtility'
import { renderDotActive } from '@lib/helper'

const columns = (actionColumn?) => {
  const data = [
    {
      title: L(''),
      dataIndex: 'isActive',
      key: 'isActive',
      width: '5%',

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
