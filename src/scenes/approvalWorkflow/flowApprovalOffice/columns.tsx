import { columnCreate } from '@components/DataTable/columns'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { renderIsActiveBlue } from '@lib/helper'

const { align, listPositionType } = AppConsts

const columns = (actionColumn?) => {
  const data = [
    actionColumn,
    {
      title: () => <> {L('REQUEST_APPROVAL_FROM')}</>,
      dataIndex: 'approvalOrder',
      key: 'approvalOrder',
      ellipsis: true,
      width: '10%',
      align: align.center,
      render: (approvalOrder) => (
        <div>{L(listPositionType.find((item) => item.value === approvalOrder)?.label ?? '--')}</div>
      )
    },
    {
      title: () => <> {L('REQUEST_STATUS')}</>,
      dataIndex: 'isActive',
      key: 'isActive',
      ellipsis: true,
      width: '20%',
      align: align.center,
      render: renderIsActiveBlue
    },

    columnCreate
  ]

  return data
}

export default columns
