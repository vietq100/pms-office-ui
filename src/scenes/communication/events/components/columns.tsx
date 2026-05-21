import { L } from '@lib/abpUtility'
import { renderDotActive } from '@lib/helper'
import AppConsts from '@lib/appconst'
import SystemColumn from '@components/DataTable/columns'

const { align } = AppConsts

const columns = (actionColumn?) => {
  const data = [
    {
      title: L(''),
      dataIndex: 'isActive',
      key: 'isActive',
      width: '2%',
      align: align.center,
      ellipsis: true,
      render: renderDotActive
    },
    {
      title: L('NEW_IMG'),
      dataIndex: 'subject',
      key: 'subject',
      width: '6%',
      ellipsis: true,
      render: (subject, row: any) => <img style={{ maxHeight: 48, maxWidth: 48 }} src={row.file?.fileUrl} />
    },
    actionColumn,

    {
      title: L('NEW_SHORT_DESCRIPTION'),
      dataIndex: 'shortDescription',
      key: 'shortDescription',
      width: '15%',
      ellipsis: true,
      render: (shortDescription) => <>{shortDescription}</>
    },
    {
      title: L('NEW_SORT_ORDER'),
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: '8%',
      ellipsis: true,
      render: (sortOrder) => <>{sortOrder}</>
    },
    SystemColumn
  ]

  return data
}

export default columns
