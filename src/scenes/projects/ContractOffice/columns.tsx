import { columnUpdate } from '@components/DataTable/columns'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { renderDate } from '@lib/helper'
import { Tag } from 'antd'

const { align } = AppConsts

const columns = (actionColumn?) => {
  const data = [
    actionColumn,
    {
      title: L('COMPANY_NAME'),
      dataIndex: 'company',
      key: 'company',
      width: 100,
      render: (company) => <>{company?.companyName}</>
    },

    {
      title: L('CONTRACT_RENT_COMPANY_UNIT'),
      dataIndex: 'leaseAgreementUnit',
      key: 'leaseAgreementUnit',
      width: 150,
      render: (units) =>
        units?.map((item) => (
          <span
            style={{
              color: '#A594F9',
              backgroundColor: '#F5EFFF',
              border: `1px solid '#4D3C77'`,
              borderRadius: '4px',
              padding: '3px 3px',
              width: 'fit-content',
              fontWeight: 600,
              marginRight: '3px',
              textAlign: 'center'
            }}
            key={item?.unitId}>
            {item?.unit?.name}
          </span>
        ))
    },
    {
      title: L('CONTRACT_SIGN_DATE'),
      dataIndex: 'signContractDate',
      key: 'signContractDate',
      width: 100,
      align: align.center,
      render: renderDate
    },
    {
      title: L('SYNC_SAP_STATUS'),
      dataIndex: 'maSAP',
      key: 'maSAP',
      width: 100,
      align: align.center,
      render: (maSAP) =>
        maSAP ? (
          <Tag color="success">
            {L('SAP_CODE')} — {maSAP}
          </Tag>
        ) : (
          <Tag color="default">{L('COMPANY_SAP_NOT_SYNCED')}</Tag>
        )
    },
    columnUpdate
  ]

  return data
}

export default columns
