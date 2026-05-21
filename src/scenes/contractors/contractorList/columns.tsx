import { L } from '@lib/abpUtility'
import { renderDotActive } from '@lib/helper'
import AppConst from '@lib/appconst'

import SystemColumn from '@components/DataTable/columns'
const { align } = AppConst
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
    actionColumn,
    {
      title: L('CONTRACTOR_TAX'),
      dataIndex: 'tax',
      key: 'tax',
      width: '12%',
      ellipsis: true,
      render: (tax) => <>{tax}</>
    },
    {
      title: L('CONTRACTOR_ADDRESS'),
      dataIndex: 'address',
      key: 'address',
      width: '20%',
      ellipsis: true,
      render: (address) => <>{address}</>
    },

    {
      title: L('CONTRACTOR_FIRM'),
      dataIndex: 'contractorFirms',
      key: 'contractorFirms',
      width: '10%',
      ellipsis: true,
      align: align.center,
      render: (contractorFirms, row) => (
        <div>
          {(row.contractorFirms || []).map((item, index) => (
            <>
              {' '}
              {index > 0 ? ', ' : ''}
              <span>{item?.firm.name}</span>
            </>
          ))}
        </div>
      )
    },

    SystemColumn
  ]

  return data
}

export default getContractorColumns
