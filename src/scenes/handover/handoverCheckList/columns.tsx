import { columnCreate, columnUpdate } from '@components/DataTable/columns'
import { L } from '@lib/abpUtility'
import { renderStatusActive, renderStatusEform } from '@lib/helper'

const columns = (actionColumn?) => {
  const data = [
    actionColumn,
    {
      title: L('EFORM_QUESTION_COUNT'),
      dataIndex: 'questionCount',
      key: 'questionCount',
      width: '10%',
      render: (questionCount) => <div>{questionCount}</div>
    },

    columnCreate,
    columnUpdate,
    {
      title: L('EFORM_QUESTION_STATUS'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: '8%',
      render: (isActive, row) => renderStatusEform(row?.status?.name, row?.status?.colorCode)
    },
    {
      title: L('EFORM_QUESTION_ISAVTIVE'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: '8%',
      render: renderStatusActive
    }
  ]

  return data
}

export default columns
