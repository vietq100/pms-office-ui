import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'

import { renderDate, renderDotActive } from '@lib/helper'
const { align } = AppConsts
export const getContractorColumns = (actionColumn?) => {
  const data = [
    {
      title: L(''),
      dataIndex: 'isActive',
      key: 'isActive',
      width: '2%',
      align: align.center,
      render: renderDotActive
    },
    {
      title: L('CONTRACTOR_ID'),
      dataIndex: 'id',
      key: 'id',
      width: '4%',
      align: align.center,
      render: (id) => <>{id}</>
    },
    actionColumn,
    {
      title: L('CONTRACTOR_NAME'),
      dataIndex: 'contractorName',
      key: 'contractorName',
      width: '15%',
      render: (contractorName) => <div className="pl-2">{contractorName}</div>
    },
    {
      title: L('CONTRACTOR_WO_CHECK_IN_TIME'),
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      align: align.center,
      width: '10%',

      render: (checkInTime) => <>{renderDate(checkInTime)}</>
    },
    {
      title: L('CONTRACTOR_WO_CHECK_OUT_TIME'),
      dataIndex: 'checkOutTime',
      key: 'checkOutTime',
      align: align.center,
      width: '10%',
      render: (checkOutTime) => <>{renderDate(checkOutTime)}</>
    },
    {
      title: L('CONTRACTOR_APPROVAL_STATUS'),
      dataIndex: 'status',
      key: 'status',
      width: '8%',
      align: align.center,
      render: (status) => <>{status?.name}</>
    },
    {
      title: L('CONTRACTOR_REMARK'),
      dataIndex: 'remarks',
      key: 'remarks',

      render: (remarks) => <>{remarks}</>
    }
  ]

  return data
}

export default getContractorColumns
