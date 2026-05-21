import { HomeOutlined, UserOutlined } from '@ant-design/icons'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'

import { formatCurrency, formatNumber, renderDateTime, renderDotActive } from '@lib/helper'
import { Col, Row } from 'antd'

const { align } = AppConsts

export const columnsFeeManagement = (actionColumn?) => {
  const data = [
    actionColumn,
    {
      title: L('GEN_FEE_COMPANY'),
      dataIndex: 'company',
      key: 'company',
      width: '22%',
      ellipsis: true,
      render: (company) => <>{company?.companyName}</>
    },
    {
      title: L('GEN_FEE_SIZE'),
      dataIndex: 'totalUnitsSize',
      key: 'totalUnitsSize',
      width: '10%',
      ellipsis: true,
      align: align.right,
      render: (totalUnitsSize) => <>{formatNumber(totalUnitsSize)}</>
    },
    {
      title: L('GEN_FEE_UNIT_PRICE'),
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: '12%',
      align: align.right,
      ellipsis: true,
      render: (unitPrice) => <>{formatNumber(unitPrice)}</>
    },

    {
      title: L('GEN_FEE_VAT'),
      dataIndex: 'vatPercentage',
      key: 'vatPercentage',
      width: '10%',
      align: align.right,
      ellipsis: true,
      render: (vatPercentage) => <>{formatNumber(vatPercentage) + ' %'}</>
    },
    {
      title: L('GEN_FEE_VAT_AMOUNT'),
      dataIndex: 'vatAmount',
      key: 'vatAmount',
      width: '8%',
      align: align.right,
      ellipsis: true,
      render: (vatAmount) => <>{formatNumber(vatAmount)}</>
    },
    {
      title: L('GEN_FEE_TOTA_AMOUNT'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: '15%',
      align: align.right,
      ellipsis: true,
      render: (totalAmount) => <>{formatNumber(totalAmount)}</>
    },
    {
      title: L('GEN_FEE_TOTAL_AMOUNT_VAT'),
      dataIndex: 'totalAmountIncludeVAT',
      key: 'totalAmountIncludeVAT',
      width: '15%',
      align: align.right,
      ellipsis: true,
      render: (totalAmountIncludeVAT) => <>{formatCurrency(totalAmountIncludeVAT)}</>
    }
  ]

  return data
}

export const columnsFeeElectric = (actionColumn?) => {
  const data = [
    actionColumn,

    {
      title: L('GEN_FEE_UNIT_PRICE'),
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: '12%',
      align: align.right,
      ellipsis: true,
      render: (unitPrice) => <>{unitPrice}</>
    },
    {
      title: L('GEN_FEE_VAT'),
      dataIndex: 'vatPercentage',
      key: 'vatPercentage',
      width: '10%',
      align: align.right,
      ellipsis: true,
      render: (vatPercentage) => <>{formatNumber(vatPercentage) + ' %'}</>
    },
    {
      title: L('GEN_FEE_VAT_AMOUNT'),
      dataIndex: 'vatAmount',
      key: 'vatAmount',
      width: '8%',
      align: align.right,
      ellipsis: true,
      render: (vatAmount) => <>{formatNumber(vatAmount)}</>
    },
    {
      title: L('GEN_FEE_TOTA_AMOUNT'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: '15%',
      align: align.right,
      ellipsis: true,
      render: (totalAmount) => <>{formatNumber(totalAmount)}</>
    },
    {
      title: L('GEN_FEE_TOTAL_AMOUNT_VAT'),
      dataIndex: 'totalAmountIncludeVAT',
      key: 'totalAmountIncludeVAT',
      width: '15%',
      align: align.right,
      ellipsis: true,
      render: (totalAmountIncludeVAT) => <>{formatCurrency(totalAmountIncludeVAT)}</>
    }
  ]

  return data
}

export const columnsFeeWater = (actionColumn?) => {
  const data = [
    actionColumn,
    {
      title: L('GEN_FEE_UNIT_TYPE'),
      dataIndex: 'unit',
      key: 'unit',
      width: '10%',
      ellipsis: true,
      render: (unit) => <>{unit?.type?.name}</>
    },
    {
      title: L('GEN_FEE_DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',
      width: '30%',
      ellipsis: true,
      render: (description) => <>{description}</>
    },

    {
      title: L('GEN_FEE_IS_AVAILABLE'),
      dataIndex: 'isAvailable',
      key: 'isAvailable',
      width: '10%',
      align: align.center,
      ellipsis: true,
      render: renderDotActive
    },

    {
      title: L('GEN_FEE_OLD_INDEX'),
      dataIndex: 'fromIndex',
      key: 'fromIndex',
      width: '10%',

      ellipsis: true,
      render: (fromIndex) => <>{fromIndex}</>
    },
    {
      title: L('GEN_FEE_NEW_INDEX'),
      dataIndex: 'toIndex',
      key: 'toIndex',
      width: '10%',
      ellipsis: true,
      render: (toIndex) => <>{formatNumber(toIndex)}</>
    },
    {
      title: L('GEN_FEE_TOTAL_USE'),
      dataIndex: 'totalUsed',
      key: 'totalUsed',
      width: '10%',
      ellipsis: true,
      render: (totalUsed) => <>{formatNumber(totalUsed)}</>
    },
    {
      title: L('GEN_FEE_TOTAL_AMOUNT'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: '10%',
      align: align.right,
      ellipsis: true,
      render: (totalAmount) => <>{formatCurrency(totalAmount)}</>
    },
    {
      title: L('GEN_FEE_DEBIT_AMOUNT'),
      dataIndex: 'debitAmount',
      key: 'debitAmount',
      width: '10%',
      ellipsis: true,
      align: align.right,
      render: (debitAmount) => <div style={{ color: '#F03939', fontWeight: 500 }}>{formatCurrency(debitAmount)}</div>
    }
  ]

  return data
}
export const columnParking = (actionColumn?) => {
  const data = [
    actionColumn,
    {
      title: L('GEN_FEE_UNIT_TYPE'),
      dataIndex: 'unit',
      key: 'unit',
      width: '10%',
      ellipsis: true,
      render: (unit) => <>{unit?.type?.name}</>
    },
    {
      title: L('GEN_FEE_DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',
      width: '30%',
      ellipsis: true,
      render: (description) => <>{description}</>
    },

    {
      title: L('GEN_FEE_IS_AVAILABLE'),
      dataIndex: 'isAvailable',
      key: 'isAvailable',
      width: '10%',
      align: align.center,
      ellipsis: true,
      render: renderDotActive
    },

    {
      title: L('GEN_FEE_TOTAL_AMOUNT'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: '10%',
      ellipsis: true,
      render: (totalAmount) => <>{formatCurrency(totalAmount)}</>
    },
    {
      title: L('GEN_FEE_DEBIT_AMOUNT'),
      dataIndex: 'debitAmount',
      key: 'debitAmount',

      ellipsis: true,
      render: (debitAmount) => <div style={{ color: '#F03939', fontWeight: 500 }}>{formatCurrency(debitAmount)}</div>
    }
  ]

  return data
}

export const columnsFeeImport = (actionColumn?) => {
  const data = [
    actionColumn,
    {
      title: L('FEE_BILL_NUMBER'),
      dataIndex: 'billNumber',
      key: 'billNumber',
      width: '13%',
      ellipsis: true,
      render: (text, record) => (
        <>
          {record.id} - {record.billNumber}
        </>
      )
    },
    {
      title: L('FEE_CUSTOMER'),
      dataIndex: 'orderId',
      width: '15%',
      ellipsis: true,
      render: (text, record) => (
        <>
          <Row className="small text-muted">
            <Col flex="auto">
              <HomeOutlined /> {record.fullUnitCode}
              <br />
              <UserOutlined /> {record.customerName}
            </Col>
          </Row>
        </>
      )
    },
    {
      title: () => (
        <>
          {L('FEE_FILTER_PACKAGE')} - {L('FEE_FILTER_TYPE')}
          <br />
          {L('FEE_DESCRIPTION')} <br />
        </>
      ),
      render: (_, record) => (
        <div>
          {record?.package?.name} - {record?.feeType?.name}
          <br />
          <div className="text-truncate-2 small text-muted">{record?.description}</div>
        </div>
      ),
      ellipsis: true,
      width: '25%'
    },

    {
      title: () => <>{L('FEE_TOTAL_AMOUNT')}</>,
      dataIndex: 'totalAmount',
      width: '10%',
      render: (text) => {
        return (
          <div>
            {formatCurrency(text)} <br />
          </div>
        )
      }
    },
    {
      title: () => (
        <>
          {L('FEE_PAID_AMOUNT')} <br />
          {L('FEE_DEBIT_AMOUNT')}
        </>
      ),
      dataIndex: 'totalAmount',

      render: (text, record) => {
        const paymentStatusColor = record.feePayStatus?.color
        return (
          <>
            <div style={{ color: '#6a6a6a' }}>{formatCurrency(record.totalAmount - record.debitAmount)}</div>
            <div style={{ color: paymentStatusColor }}>{formatCurrency(record.debitAmount)}</div>
          </>
        )
      }
    }
  ]

  return data
}

export const columnsFeeRent = (actionColumn?) => {
  const data = [
    actionColumn,
    {
      title: L('GEN_FEE_COMPANY'),
      dataIndex: 'company',
      key: 'company',
      width: '22%',
      ellipsis: true,
      render: (company) => <>{company?.companyName}</>
    },
    {
      title: L('GEN_FEE_SIZE'),
      dataIndex: 'totalUnitsSize',
      key: 'totalUnitsSize',
      width: '10%',
      ellipsis: true,
      align: align.right,
      render: (totalUnitsSize) => <>{formatNumber(totalUnitsSize)}</>
    },
    {
      title: L('GEN_FEE_UNIT_PRICE'),
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: '12%',
      align: align.right,
      ellipsis: true,
      render: (unitPrice) => <>{unitPrice}</>
    },
    {
      title: L('GEN_FEE_VAT'),
      dataIndex: 'vatPercentage',
      key: 'vatPercentage',
      width: '10%',
      align: align.right,
      ellipsis: true,
      render: (vatPercentage) => <>{formatNumber(vatPercentage) + ' %'}</>
    },
    {
      title: L('GEN_FEE_VAT_AMOUNT'),
      dataIndex: 'vatAmount',
      key: 'vatAmount',
      width: '8%',
      align: align.right,
      ellipsis: true,
      render: (vatAmount) => <>{formatNumber(vatAmount)}</>
    },
    {
      title: L('GEN_FEE_TOTA_AMOUNT'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: '15%',
      align: align.right,
      ellipsis: true,
      render: (totalAmount) => <>{formatNumber(totalAmount)}</>
    },
    {
      title: L('GEN_FEE_TOTAL_AMOUNT_VAT'),
      dataIndex: 'totalAmountIncludeVAT',
      key: 'totalAmountIncludeVAT',
      width: '15%',
      align: align.right,
      ellipsis: true,
      render: (totalAmountIncludeVAT) => <>{formatCurrency(totalAmountIncludeVAT)}</>
    }
  ]

  return data
}

export const columnMotobikeParking12Hours = (actionColumn?) => {
  const data = [
    actionColumn,
    {
      title: L('GEN_FEE_NUMBER_VEHICLE'),
      dataIndex: 'totalVehicles',
      key: 'totalVehicles',
      width: '10%',
      ellipsis: true,
      render: (totalVehicles) => <>{formatNumber(totalVehicles)}</>
    },
    {
      title: L('GEN_FEE_UNIT_PRICE'),
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: '12%',
      align: align.right,
      ellipsis: true,
      render: (unitPrice) => <>{unitPrice}</>
    },
    {
      title: L('GEN_FEE_VAT'),
      dataIndex: 'vatPercentage',
      key: 'vatPercentage',
      width: '10%',
      align: align.right,
      ellipsis: true,
      render: (vatPercentage) => <>{formatNumber(vatPercentage) + ' %'}</>
    },
    {
      title: L('GEN_FEE_VAT_AMOUNT'),
      dataIndex: 'vatAmount',
      key: 'vatAmount',
      width: '8%',
      align: align.right,
      ellipsis: true,
      render: (vatAmount) => <>{formatNumber(vatAmount)}</>
    },
    {
      title: L('GEN_FEE_TOTA_AMOUNT'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: '15%',
      align: align.right,
      ellipsis: true,
      render: (totalAmount) => <>{formatNumber(totalAmount)}</>
    },
    {
      title: L('GEN_FEE_TOTAL_AMOUNT_VAT'),
      dataIndex: 'totalAmountIncludeVAT',
      key: 'totalAmountIncludeVAT',
      width: '15%',
      align: align.right,
      ellipsis: true,
      render: (totalAmountIncludeVAT) => <>{formatCurrency(totalAmountIncludeVAT)}</>
    }
  ]

  return data
}

export const columnOverTimeElectric = (actionColumn?) => {
  const data = [
    actionColumn,
    {
      title: L('GEN_FEE_ZONE'),
      dataIndex: 'zoneName',
      key: 'zoneName',
      width: '15%',
      ellipsis: true,
      align: align.left,
      render: (zoneName) => <>{zoneName}</>
    },
    {
      title: L('GEN_FEE_TOTAL_UNIT_SIZE'),
      dataIndex: 'totalUnitsSize',
      key: 'totalUnitsSize',
      width: '10%',
      align: align.right,
      ellipsis: true,
      render: (totalUnitsSize) => <>{formatNumber(totalUnitsSize)}</>
    },
    {
      title: L('GEN_FEE_HOURS_USE'),
      dataIndex: 'totalHoursUsed',
      key: 'totalHoursUsed',
      width: '10%',
      align: align.right,
      ellipsis: true,
      render: (totalHoursUsed) => <>{totalHoursUsed}</>
    },
    {
      title: L('GEN_FEE_START_DATE'),
      dataIndex: 'fromDate',
      key: 'fromDate',
      width: '13%',
      align: align.center,
      ellipsis: true,
      render: renderDateTime
    },

    {
      title: L('GEN_FEE_END_DATE'),
      dataIndex: 'toDate',
      key: 'toDate',
      width: '13%',
      align: align.center,
      ellipsis: true,
      render: renderDateTime
    },
    {
      title: L('GEN_FEE_UNIT_PRICE'),
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: '12%',
      align: align.right,
      ellipsis: true,
      render: (unitPrice) => <>{unitPrice}</>
    },
    {
      title: L('GEN_FEE_VAT'),
      dataIndex: 'vatPercentage',
      key: 'vatPercentage',
      width: '10%',
      align: align.right,
      ellipsis: true,
      render: (vatPercentage) => <>{formatNumber(vatPercentage) + ' %'}</>
    },
    {
      title: L('GEN_FEE_VAT_AMOUNT'),
      dataIndex: 'vatAmount',
      key: 'vatAmount',
      width: '8%',
      align: align.right,
      ellipsis: true,
      render: (vatAmount) => <>{formatNumber(vatAmount)}</>
    },
    {
      title: L('GEN_FEE_TOTA_AMOUNT'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: '15%',
      align: align.right,
      ellipsis: true,
      render: (totalAmount) => <>{formatNumber(totalAmount)}</>
    },
    {
      title: L('GEN_FEE_TOTAL_AMOUNT_VAT'),
      dataIndex: 'totalAmountIncludeVAT',
      key: 'totalAmountIncludeVAT',
      width: '15%',
      align: align.right,
      ellipsis: true,
      render: (totalAmountIncludeVAT) => <>{formatCurrency(totalAmountIncludeVAT)}</>
    }
  ]

  return data
}
