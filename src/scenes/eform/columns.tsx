import SystemColumn from '@components/DataTable/columns'
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
      title: L('EFORM_QUESTION_COUNT'),
      dataIndex: 'questionCount',
      key: 'questionCount',
      width: '10%',
      render: (questionCount) => <div>{questionCount}</div>
    },
    {
      title: L('EFORM_SUBMIT_COUNT'),
      dataIndex: 'submitCount',
      key: 'submitCount',
      width: '10%',
      render: (submitCount) => <div>{submitCount}</div>
    },
    SystemColumn
  ]

  return data
}

export default columns
