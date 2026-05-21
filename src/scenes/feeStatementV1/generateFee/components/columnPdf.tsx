import { L } from '@lib/abpUtility'
import { formatCurrency, formatNumber, renderDateTime } from '@lib/helper'
import { Tag } from 'antd'

export const columnsFeeManagement = () => {
  const data = [
    {
      title: L('GEN_FEE_CODE_CONTRACT'),
      dataIndex: 'leaseAgreement',
      key: 'leaseAgreement',
      render: (leaseAgreement) => leaseAgreement?.contractId
    },
    {
      title: L('GEN_FEE_COMPANY'),
      dataIndex: 'company',
      key: 'company',
      render: (company) => company?.companyName
    },
    {
      title: L('GEN_FEE_SIZE'),
      dataIndex: 'totalUnitsSize',
      key: 'totalUnitsSize',
      render: (totalUnitsSize) => formatNumber(totalUnitsSize)
    },
    {
      title: L('GEN_FEE_UNIT_PRICE'),
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (unitPrice) => unitPrice
    },

    {
      title: L('GEN_FEE_VAT'),
      dataIndex: 'vatPercentage',
      key: 'vatPercentage',
      render: (vatPercentage) => {
        formatNumber(vatPercentage) + ' %'
      }
    },
    {
      title: L('GEN_FEE_VAT_AMOUNT'),
      dataIndex: 'vatAmount',
      key: 'vatAmount',
      render: (vatAmount) => formatNumber(vatAmount)
    },
    {
      title: L('GEN_FEE_TOTA_AMOUNT'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (totalAmount) => formatNumber(totalAmount)
    },
    {
      title: L('GEN_FEE_TOTAL_AMOUNT_VAT'),
      dataIndex: 'totalAmountIncludeVAT',
      key: 'totalAmountIncludeVAT',
      render: (totalAmountIncludeVAT) => formatCurrency(totalAmountIncludeVAT)
    },
    {
      title: L('GEN_FEE_STATUS'),
      dataIndex: 'statusId',
      key: 'statusId',
      ellipsis: true,
      render: () => (
        <Tag className="cell-round mr-0" style={{ color: '#008000', backgroundColor: '#d6f0d6', border: 'none' }}>
          {L('TICKET_REQUEST_APPROVAL')}
        </Tag>
      )
    }
  ]

  return data
}

export const columnsFeeRent = () => {
  const data = [
    {
      title: L('GEN_FEE_CODE_CONTRACT'),
      dataIndex: 'leaseAgreement',
      key: 'leaseAgreement',
      render: (leaseAgreement) => leaseAgreement?.contractId
    },
    {
      title: L('GEN_FEE_COMPANY'),
      dataIndex: 'company',
      key: 'company',
      render: (company) => company?.companyName
    },
    {
      title: L('GEN_FEE_SIZE'),
      dataIndex: 'totalUnitsSize',
      key: 'totalUnitsSize',
      render: (totalUnitsSize) => formatNumber(totalUnitsSize)
    },
    {
      title: L('GEN_FEE_UNIT_PRICE'),
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (unitPrice) => unitPrice
    },
    {
      title: L('GEN_FEE_VAT'),
      dataIndex: 'vatPercentage',
      key: 'vatPercentage',
      render: (vatPercentage) => {
        formatNumber(vatPercentage) + ' %'
      }
    },
    {
      title: L('GEN_FEE_VAT_AMOUNT'),
      dataIndex: 'vatAmount',
      key: 'vatAmount',
      render: (vatAmount) => formatNumber(vatAmount)
    },
    {
      title: L('GEN_FEE_TOTA_AMOUNT'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (totalAmount) => formatNumber(totalAmount)
    },
    {
      title: L('GEN_FEE_TOTAL_AMOUNT_VAT'),
      dataIndex: 'totalAmountIncludeVAT',
      key: 'totalAmountIncludeVAT',
      render: (totalAmountIncludeVAT) => formatCurrency(totalAmountIncludeVAT)
    },
    {
      title: L('GEN_FEE_STATUS'),
      dataIndex: 'statusId',
      key: 'statusId',
      ellipsis: true,
      render: () => (
        <Tag className="cell-round mr-0" style={{ color: '#008000', backgroundColor: '#d6f0d6', border: 'none' }}>
          {L('TICKET_REQUEST_APPROVAL')}
        </Tag>
      )
    }
  ]

  return data
}

export const columnsOvertimeElectric = () => {
  const data = [
    {
      title: L('GEN_FEE_COMPANY'),
      dataIndex: 'company',
      key: 'company',
      render: (company) => company?.companyName
    },
    {
      title: L('GEN_FEE_ZONE'),
      dataIndex: 'zoneName',
      key: 'zoneName',
      render: (zoneName) => zoneName
    },
    {
      title: L('GEN_FEE_TOTAL_UNIT_SIZE'),
      dataIndex: 'totalUnitsSize',
      key: 'totalUnitsSize',
      render: (totalUnitsSize) => formatNumber(totalUnitsSize)
    },
    {
      title: L('GEN_FEE_HOURS_USE'),
      dataIndex: 'totalHoursUsed',
      key: 'totalHoursUsed',
      render: (totalHoursUsed) => totalHoursUsed
    },
    {
      title: L('GEN_FEE_START_DATE'),
      dataIndex: 'fromDate',
      key: 'fromDate',
      render: renderDateTime
    },

    {
      title: L('GEN_FEE_END_DATE'),
      dataIndex: 'toDate',
      key: 'toDate',
      render: renderDateTime
    },
    {
      title: L('GEN_FEE_UNIT_PRICE'),
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (unitPrice) => unitPrice
    },
    {
      title: L('GEN_FEE_VAT'),
      dataIndex: 'vatPercentage',
      key: 'vatPercentage',
      render: (vatPercentage) => {
        formatNumber(vatPercentage) + ' %'
      }
    },
    {
      title: L('GEN_FEE_VAT_AMOUNT'),
      dataIndex: 'vatAmount',
      key: 'vatAmount',
      render: (vatAmount) => formatNumber(vatAmount)
    },
    {
      title: L('GEN_FEE_TOTA_AMOUNT'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (totalAmount) => formatNumber(totalAmount)
    },
    {
      title: L('GEN_FEE_TOTAL_AMOUNT_VAT'),
      dataIndex: 'totalAmountIncludeVAT',
      key: 'totalAmountIncludeVAT',
      render: (totalAmountIncludeVAT) => formatCurrency(totalAmountIncludeVAT)
    },
    {
      title: L('GEN_FEE_STATUS'),
      dataIndex: 'statusId',
      key: 'statusId',
      ellipsis: true,
      render: () => (
        <Tag className="cell-round mr-0" style={{ color: '#008000', backgroundColor: '#d6f0d6', border: 'none' }}>
          {L('TICKET_REQUEST_APPROVAL')}
        </Tag>
      )
    }
  ]
  return data
}
