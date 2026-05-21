import AppComponentBase from '@components/AppComponentBase'
import { Spin, Table } from 'antd'
import feeGroupService from '@services/fee/feeGroupService'
import get from 'lodash/get'
import Tag from 'antd/es/tag'
import { StatusColors } from '@components/StatusTag'
import { formatCurrency, renderDate } from '@lib/helper'
import { L } from '@lib/abpUtility'

interface Props {
  markUpdate: string
  data: {
    feeStatusId?: number
    feeTypeId?: number | string
    packageId: number
    companyId: number
    isActive?: boolean | string | undefined
    groupName?: string
  }
}

interface State {
  feeUnits: any[]
  loading: boolean
}

export default class GroupFeeTableExpanded extends AppComponentBase<Props, State> {
  state = {
    loading: false,
    feeUnits: []
  }
  async componentDidMount() {
    this.setState({ loading: true })

    const feeUnits = await feeGroupService.getGroupFee(this.props.data)
    this.setState({ feeUnits, loading: false })
  }

  async componentDidUpdate(prevProps: Readonly<Props>) {
    if (prevProps.markUpdate !== this.props.markUpdate) {
      const feeUnits = await feeGroupService.getGroupFee(this.props.data)
      this.setState({ feeUnits, loading: false })
    }
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="flex center-content">
          <Spin size="small" />
        </div>
      )
    }
    return (
      <Table
        bordered
        size="small"
        pagination={false}
        columns={this.columns}
        className={'table-group'}
        rowKey={(record: any) => record.id}
        dataSource={this.state.feeUnits}
        scroll={{ x: 800, scrollToFirstRowOnChange: true }}
      />
    )
  }

  columns = [
    {
      title: this.L('FEE_FILTER_TYPE'),
      render: (_, record) => <div>{get(record, 'feeType.name')}</div>,
      width: 200
    },
    {
      title: this.L('FEE_DUE_DATE'),
      dataIndex: 'dueDate',
      width: 100,
      align: 'center' as const,
      render: (text) => <div>{renderDate(text)}</div>
    },
    {
      title: this.L('FEE_BILL_NUMBER'),
      dataIndex: 'billNumber',
      align: 'center' as const,
      width: 150
    },
    {
      title: this.L('FEE_DEBIT_AMOUNT'),
      dataIndex: 'debitAmount',
      align: 'right' as const,
      width: 120,
      render: (debitAmount) => <div>{formatCurrency(debitAmount)}</div>
    },
    {
      title: this.L('FEE_TOTAL_AMOUNT'),
      dataIndex: 'totalAmount',
      align: 'right' as const,
      render: (text) => <div>{formatCurrency(text)}</div>,
      width: 120
    },
    {
      title: this.L('FEE_STATUS'),
      dataIndex: 'feePayStatus',
      align: 'center' as const,
      width: 120,
      render: (feePayStatus) => {
        return (
          <Tag color={feePayStatus?.color} className="cell-round mr-0">
            {feePayStatus?.name}
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
    }
  ]
}
