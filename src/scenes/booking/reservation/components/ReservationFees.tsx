import React from 'react'
import { Table } from 'antd'
import Tag from 'antd/es/tag'
import { StatusColors } from '@components/StatusTag'
import { formatCurrency, renderDate } from '@lib/helper'
import { L } from '@lib/abpUtility'
import Button from 'antd/es/button'

interface ReservationFeeProps {
  reservationFees?: any[]
  onRefund: (feeData) => void
}

export const ReservationFees: React.FC<ReservationFeeProps> = ({ reservationFees, onRefund }) => {
  const columns = [
    {
      title: L('FEE_FILTER_TYPE'),
      dataIndex: 'feeType',
      render: (feeType) => <div>{feeType.name}</div>,
      width: 200
    },
    {
      title: L('FEE_DUE_DATE'),
      dataIndex: 'dueDate',
      width: 100,
      align: 'center' as const,
      render: (text) => <div>{renderDate(text)}</div>
    },
    {
      title: L('FEE_BILL_NUMBER'),
      dataIndex: 'billNumber',
      align: 'center' as const,
      width: 150
    },
    {
      title: L('FEE_TOTAL_AMOUNT'),
      dataIndex: 'totalAmount',
      align: 'right' as const,
      render: (text) => <div>{formatCurrency(text)}</div>,
      width: 120
    },
    {
      title: L('FEE_STATUS'),
      dataIndex: 'feePayStatusId',
      align: 'center' as const,
      width: 120,
      render: (value: number) => {
        const tagColor = value === 2 ? StatusColors.Active : StatusColors.Inactive
        return (
          <Tag color={tagColor} className="cell-round mr-0">
            {value === 1 ? L('FEE_UNPAID') : L('FEE_PAID')}
          </Tag>
        )
      }
    },
    {
      title: L('FEE_SHOW_TO_RESIDENT'),
      dataIndex: 'isShowToResident',
      align: 'center' as const,
      width: 132,
      render: (value: string) => {
        const tagColor = value ? StatusColors.Active : StatusColors.Inactive
        return (
          <Tag color={tagColor} className="cell-round mr-0">
            {value ? L('YES') : L('NO')}
          </Tag>
        )
      }
    },
    {
      title: L('REFUND'),
      dataIndex: 'feePayStatusId',
      align: 'center' as const,
      width: 132,
      render: (value, row) => {
        return (
          <Button
            shape="round"
            size="small"
            className="ml-1"
            type="primary"
            // ghost
            disabled={!(value === 2)}
            onClick={() => onRefund(row)}>
            {L('REFUND')}
          </Button>
        )
      }
    }
  ]
  return (
    <Table
      bordered
      size="small"
      pagination={false}
      columns={columns}
      className={'table-group'}
      rowKey={(record: any) => record.id}
      dataSource={reservationFees}
      scroll={{ x: 900, scrollToFirstRowOnChange: true }}
    />
  )
}
