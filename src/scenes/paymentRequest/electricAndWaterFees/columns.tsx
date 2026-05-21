import SystemColumn from '@components/DataTable/columns'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { formatNumber } from '@lib/helper'

const { listTicketRequestStatus, align } = AppConsts

const columns = (actionColumn?) => {
  const data = [
    {
      title: L('ID'),
      dataIndex: 'id',
      key: 'id',
      width: '10%',
      ellipsis: true,
      align: align.center,
      render: (id) => id
    },
    actionColumn,
    {
      title: L('FEE_PERIOD'),
      dataIndex: 'feePackage',
      key: 'feePackage',
      width: '17%',
      render: (feePackage) => <>{feePackage?.name}</>
    },
    {
      title: L('WATER_VAT'),
      dataIndex: 'waterTotalAmount',
      key: 'waterTotalAmount',
      width: '17%',
      render: (waterTotalAmount, item) => <>{formatNumber(waterTotalAmount, item.totalAmountWaterFeeIncludeVAT)}</>
    },
    {
      title: L('ELECTRIC_FEE_EXCLUDE_VAT'),
      dataIndex: 'costPaidToElectricitySupplier',
      key: 'costPaidToElectricitySupplier',
      width: '17%',
      render: (costPaidToElectricitySupplier, item) => (
        <>{formatNumber(costPaidToElectricitySupplier, item.totalAmountElectricityFeeInvestorPaid)}</>
      )
    },
    {
      title: L('TENANT_USED_EXCLUDE_VAT'),
      dataIndex: 'rentalFees',
      key: 'unitPrice',
      width: '17%',
      render: (unitPrice, item) => <>{formatNumber(unitPrice, item.totalAmountTenantUsed)}</>
    },
    {
      title: L('TENANT_USED_OVERTIME'),
      dataIndex: 'externalFees',
      key: 'externalFees',
      width: '17%',
      render: (externalFees, item) => <>{formatNumber(externalFees, item.totalAmountOvertimeElectricity)}</>
    },
    {
      title: L('CONST_REFUND_TO_INVESTOR_EXCLUDE_VAT'),
      dataIndex: 'costPaidToInvestor',
      key: 'costPaidToInvestor',
      width: '17%',
      render: (costPaidToInvestor, item) => (
        <>{formatNumber(costPaidToInvestor ?? item.totalAmountManagementPaidToInvestor)}</>
      )
    },
    {
      title: L('CONST_REFUND_TO_INVESTOR_INCLUDE_VAT'),
      dataIndex: 'costPaidToInvestorTotalAmountIncludeVAT',
      key: 'costPaidToInvestorTotalAmountIncludeVAT',
      width: '17%',
      render: (costPaidToInvestorTotalAmountIncludeVAT, item) => (
        <>
          {formatNumber(costPaidToInvestorTotalAmountIncludeVAT ?? item.totalAmountInvestorPaidToManagementIncludeVAT)}
        </>
      )
    },
    {
      title: L('CURRENT_AMOUNT_THIS_PERIOD'),
      dataIndex: 'totalAmountCurrentPeriod',
      key: 'totalAmountCurrentPeriod',
      width: '17%',
      render: (totalAmountCurrentPeriod, item) => (
        <>{formatNumber(totalAmountCurrentPeriod ?? item.totalAmountCurrentFeePackageIncludeVAT)}</>
      )
    },
    {
      title: L('STATUS'),
      dataIndex: 'statusId',
      key: 'statusId',
      width: '17%',
      render: (statusId) => <> {L(listTicketRequestStatus.find((item) => item.value === statusId)?.label ?? '')}</>
    },
    SystemColumn
  ]

  return data
}

export default columns
