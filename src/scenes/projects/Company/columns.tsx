import SystemColumn from '@components/DataTable/columns'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { renderDotActive } from '@lib/helper'
import { BpType } from '@models/Project/Company/CompanyModel'
const { align } = AppConsts
const columns = (actionColumn?) => {
  const data = [
    {
      title: L(''),
      dataIndex: 'isActive',
      key: 'isActive',
      width: '3%',
      ellipsis: true,
      align: align.center,
      render: renderDotActive
    },
    actionColumn,

    {
      title: L('COMPANY_BP_TYPE'),
      dataIndex: 'bpType',
      key: 'bpType',
      width: '15%',
      ellipsis: true,
      render: (bpType) => (
        <div className="text-muted small">
          {bpType === BpType.Personal ? L('COMPANY_BP_PERSONAL') : L('COMPANY_BP_ORGANIZATION')}
        </div>
      )
    },
    {
      title: L('COMPANY_PHONE'),
      dataIndex: 'primaryPhone',
      key: 'primaryPhone',
      width: '15%',
      ellipsis: true,
      render: (primaryPhone) => <div className="text-muted small">{primaryPhone}</div>
    },
    {
      title: L('COMPANY_EMAIL'),
      dataIndex: 'primaryEmail',
      key: 'primaryEmail',
      ellipsis: true,
      render: (primaryEmail) => <div className="text-muted small">{primaryEmail}</div>
    },

    SystemColumn
  ]

  return data
}

export default columns
