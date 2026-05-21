import { Modal, Table } from 'antd'

import { AppComponentListBase } from '@components/AppComponentBase'
import DataTable from '@components/DataTable'
import { L, LNotification } from '@lib/abpUtility'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import AppConst from '@lib/appconst'
import CustomDrawer from '@components/Drawer/CustomDrawer'
import { debounce } from 'lodash'
import CashAdvanceStore from '@stores/finance/cashAdvanceStore'
import { ColDeductPreview } from './columnDeductCashAdvancePreview'
import { formatCurrency, renderDate } from '@lib/helper'

const { pageSize, align } = AppConst
export interface IProps {
  visible: boolean
  dataSend: any
  onCancel: () => void
  cashAdvanceStore: CashAdvanceStore
}

export interface IState {
  maxResultCount: number
  skipCount: number
  filters: any
}

const confirm = Modal.confirm

@inject(Stores.CashAdvanceStore)
@observer
class DeductCashAdvancePreview extends AppComponentListBase<IProps, IState> {
  state = {
    maxResultCount: pageSize.pageSize_10,
    skipCount: 0,
    filters: {}
  }

  componentDidUpdate = async (prevProps) => {
    if (prevProps.visible !== this.props.visible) {
      if (this.props.visible) {
        this.getAutoDeductCashAdvance()
      }
    }
  }
  getAutoDeductCashAdvance = async () => {
    if (this.props.dataSend?.unitIds) {
      await this.props.cashAdvanceStore.getAutoDeductCashAdvance({
        unitIds: this.props.dataSend?.unitIds,
        packageId: this.props.dataSend?.packageId,
        isGroupReceipt: this.props.dataSend?.isGroupReceipt,
        isClearAllOutstanding: this.props.dataSend?.isClearAllOutstanding,
        maxResultCount: this.state.maxResultCount,
        skipCount: this.state.skipCount
      })
    } else {
      await this.props.cashAdvanceStore.getAutoDeductCashAdvance({
        packageId: this.props.dataSend?.packageId,
        isGroupReceipt: this.props.dataSend?.isGroupReceipt,
        isClearAllOutstanding: this.props.dataSend?.isClearAllOutstanding,
        maxResultCount: this.state.maxResultCount,
        skipCount: this.state.skipCount
      })
    }
  }
  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }
  cofirmAutoDeduct = async () => {
    const self = this
    confirm({
      title: LNotification('DO_YOU_WANT_TO_AUTO_DEDUC_TITLE'),
      content: LNotification('DO_YOU_WANT_TO_AUTO_DEDUC_CONTENT'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.cashAdvanceStore.autoDeductCashAdvance({
          ...this.props.dataSend
        })
        this.props.onCancel()
      }
    })
  }
  handleTableChange = (pagination: any) => {
    this.setState(
      { skipCount: (pagination.current - 1) * this.state.maxResultCount! },
      async () => await this.getAutoDeductCashAdvance()
    )
  }

  updateSearch = debounce((name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value } })
  }, 300)

  public render() {
    const columns = ColDeductPreview()
    const columnDetail = [
      {
        title: L('FEE_FILTER_TYPE'),
        dataIndex: 'feeType',
        key: 'feeType',
        width: '10%',
        ellipsis: true,
        render: (feeType) => <>{feeType?.name}</>
      },
      {
        title: L('FEE_DUE_DATE'),
        dataIndex: 'dueDate',
        key: 'dueDate',
        width: '10%',
        ellipsis: true,
        render: renderDate
      },
      {
        title: L('FEE_BILL_NUMBER'),
        dataIndex: 'billNumber',
        key: 'billNumber',
        width: '10%',
        ellipsis: true,
        render: (billNumber) => <>{billNumber}</>
      },
      {
        title: L('FEE_TOTAL_AMOUNT'),
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        align: align.right,
        width: '10%',
        ellipsis: true,
        render: (totalAmount) => <>{formatCurrency(totalAmount)}</>
      }
    ]

    return (
      <CustomDrawer
        useBottomAction
        title={L('PREVIEW_DEDUCT')}
        visible={this.props.visible}
        onClose={() => {
          this.setState({ skipCount: 0 })
          this.props.onCancel()
        }}
        onSave={this.cofirmAutoDeduct}>
        <DataTable
          title={this.L('GEN_FEE_LIST')}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total:
              this.props.cashAdvanceStore.pageDeduct?.totalCount === undefined
                ? 0
                : this.props.cashAdvanceStore.pageDeduct?.totalCount,
            onChange: this.handleTableChange
          }}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            columns={columns}
            loading={this.props.cashAdvanceStore.isLoading}
            rowKey="id"
            scroll={{ x: 1000, y: 800, scrollToFirstRowOnChange: true }}
            pagination={false}
            expandable={{
              expandedRowRender: (record) => (
                <Table
                  style={{ marginLeft: 150 }}
                  size="small"
                  className="custom-ant-table custom-ant-row"
                  rowKey={(record) => record.id || 0}
                  columns={columnDetail}
                  pagination={false}
                  // loading={this.props.feeTypeStore.isLoading}
                  dataSource={record.feeDetails || []}
                  scroll={{ x: 600, scrollToFirstRowOnChange: true }}
                />
              ),
              rowExpandable: (record) => record.feeDetails && record.feeDetails.length > 0
            }}
            dataSource={this.props.cashAdvanceStore?.pageDeduct?.items}
          />
        </DataTable>
      </CustomDrawer>
    )
  }
}

export default DeductCashAdvancePreview
