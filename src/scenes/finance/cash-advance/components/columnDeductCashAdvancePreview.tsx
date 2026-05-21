import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { formatCurrency } from '@lib/helper'
const { align } = AppConsts
export const ColDeductPreview = () => {
  const data = [
    {
      title: L('CASH_ADVANCE_UNIT'),
      dataIndex: 'unit',
      key: 'unit',
      width: '15%',
      ellipsis: true,
      render: (unit) => <>{unit?.fullUnitCode}</>
    },
    {
      title: L('CASH_ADVANCE_CODE'),
      dataIndex: 'cashNumber',
      key: 'cashNumber',
      width: '15%',
      ellipsis: true,
      render: (cashNumber) => <>{cashNumber}</>
    },
    {
      title: L('CASH_ADVANCE_FEE_TYPE'),
      dataIndex: 'feeType',
      key: 'feeType',
      width: '15%',
      ellipsis: true,
      render: (feeType) => <>{feeType?.name}</>
    },

    {
      title: L('CASH_ADVANCE_AMOUNT'),
      dataIndex: 'balanceAmount',
      key: 'balanceAmount',
      ellipsis: true,
      width: '15%',
      align: align.right,
      render: (balanceAmount) => <>{formatCurrency(balanceAmount)}</>
    },
    {
      title: L('CASH_AVANCE_DESCRIPTON'),
      dataIndex: 'balanceAmount',
      key: 'balanceAmount',
      ellipsis: true,
      align: align.center,
      render: (balanceAmount, row) =>
        row.feeDetails.length > 0 ? (
          <></>
        ) : (
          <label className="custom-label-table">{L('CASH_AVANCE_DEDUCT_NOT_CRATE_RECEIPT')}</label>
        )
    }
  ]

  return data
}
