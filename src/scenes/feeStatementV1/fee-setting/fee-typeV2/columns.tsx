import { L } from '@lib/abpUtility'

import { renderDotActive, renderTag } from '@lib/helper'
import SystemColumn from '@components/DataTable/columns'
import AppConsts from '@lib/appconst'
const { align } = AppConsts

const getColumns = (actionColumn?) => {
  const data = [
    {
      title: '',
      dataIndex: 'isActive',
      key: 'isActive',
      width: '2%',
      align: align.center,
      render: renderDotActive
    },
    actionColumn,
    {
      title: L('FEE_TYPE_CODE'),
      dataIndex: 'code',
      key: 'code',
      align: align.center,
      width: '10%',
      render: (code: string) => <div>{code}</div>
    },
    {
      title: L('FEE_TYPE_IS_GEN_FEE'),
      dataIndex: 'isGenFee',
      key: 'isGenFee',
      width: '13%',
      ellipsis: true,
      align: align.center,
      render: (isGenFee, row) =>
        renderTag(
          isGenFee === true ? L('YES') : L('-'),
          row?.status?.colorCode || 'black',
          row?.status?.backgroudColor || 'white'
        )
    },
    {
      title: L('IS_FEE_NOTICE'),
      dataIndex: 'isFeeNotification',
      key: 'isFeeNotification',
      width: '12%',
      ellipsis: true,
      align: align.center,
      render: (isGenFee, row) =>
        renderTag(
          isGenFee === true ? L('YES') : L('-'),
          row?.status?.colorCode || 'black',
          row?.status?.backgroudColor || 'white'
        )
    },
    {
      title: L('FEE_TYPE_DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',
      width: '30%',
      render: (description) => <div className="text-truncate-2">{description}</div>
    },

    SystemColumn
  ]

  return data
}

export default getColumns
