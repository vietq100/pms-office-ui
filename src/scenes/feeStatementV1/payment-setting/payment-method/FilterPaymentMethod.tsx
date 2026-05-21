import SystemColumn from '@components/DataTable/columns'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { renderDotActive } from '@lib/helper'
const { align } = AppConsts
export const columns = (actionColumn?) => {
  const data = [
    actionColumn,
    {
      title: L(''),
      dataIndex: 'isActive',
      key: 'isActive',
      width: '2%',
      align: align.center,
      render: renderDotActive
    },
    {
      title: L('PAYMENT_CHANNEL'),
      dataIndex: 'feePaymentChannel',
      key: 'feePaymentChannel',
      width: '15%',
      ellipsis: true,
      render: (feePaymentChannel) => <>{feePaymentChannel?.name}</>
    },
    {
      title: L('ACCOUNT_NUMBER'),
      dataIndex: 'accountNo',
      key: 'accountNo',
      width: '10%',
      ellipsis: true
    },
    {
      title: L('BANK_NAME'),
      dataIndex: 'branchName',
      key: 'branchName',
      width: '10%',
      ellipsis: true
    },
    {
      title: L('BENEFICIARY_NAME'),
      dataIndex: 'beneficiaryName',
      key: 'beneficiaryName',
      width: '10%',
      ellipsis: true
    },
    {
      title: L('BANK_CIF'),
      dataIndex: 'bankCif',
      key: 'bankCif',
      width: '10%',
      ellipsis: true
    },
    {
      title: L('DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',

      ellipsis: true
    },
    SystemColumn
  ]

  return data
}
