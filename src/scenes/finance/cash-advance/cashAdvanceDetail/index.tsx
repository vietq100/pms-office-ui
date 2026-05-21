import * as React from 'react'

import { Button, Card, Col, DatePicker, Descriptions, Form, Input, Modal, Row, Select, Table } from 'antd'
import { inject, observer } from 'mobx-react'

import { AppComponentListBase } from '@components/AppComponentBase'
import { L, LNotification } from '@lib/abpUtility'
import Stores from '../../../../stores/storeIdentifier'
import CashAdvanceStore from '../../../../stores/finance/cashAdvanceStore'
import AppConsts, { appPermissions, dateFormat, rangePickerPlaceholder } from '../../../../lib/appconst'
import debounce from 'lodash/debounce'
import { validateMessages } from '@lib/validation'
import WrapPageScroll from '@components/WrapPageScroll'
import DataTable from '@components/DataTable'
import getColumns from './columns'
import withRouter from '@components/Layout/Router/withRouter'
import { formatCurrency } from '@lib/helper'
import moment from 'moment'
import { FileExcelOutlined } from '@ant-design/icons'
import NoRole from '@components/ComponentNoRole'
const { cashChanelOptions, cashAdvanceTransactionOptions } = AppConsts
const { confirm } = Modal

export interface ICashAdvanceDetailProps {
  params: any
  navigate: any
  cashAdvanceStore: CashAdvanceStore
}

export interface ICashAdvanceDetailState {
  visible: boolean
  visibleExpenseMandateModal: boolean
  maxResultCount: number
  skipCount: number
  cashAdvanceId: number
  filters: any
  isDirty: boolean
  depositData: any
  expenseMandateData: any
}

const Search = Input.Search

@inject(Stores.CashAdvanceStore)
@observer
class CashAdvanceDetail extends AppComponentListBase<ICashAdvanceDetailProps, ICashAdvanceDetailState> {
  formRef: any = React.createRef()
  state = {
    visible: false,
    visibleExpenseMandateModal: false,
    maxResultCount: 10,
    skipCount: 0,
    cashAdvanceId: 0,
    filters: { isActive: 'true', cashChanelId: undefined },
    isDirty: false,
    depositData: {},
    expenseMandateData: {}
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.CashAdvance.detail) && (await Promise.all([this.getDetail()]))
  }

  getDetail = async () => {
    this.formRef.current.setFieldsValue({
      ...this.props.cashAdvanceStore.editCashAdvance
    })

    this.setState(
      {
        filters: {
          ...this.state.filters,
          cashAdvanceId: this.props.params?.userId
        }
      },
      this.getAll
    )
  }

  async getAll() {
    await this.props.cashAdvanceStore.filterCashAdvanceTransactions({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      cashAdvanceId: this.props.params?.userId,
      ...this.state.filters
    })
  }

  onSave = () => {
    const form = this.formRef.current

    form.validateFields().then(async () => {
      this.props.navigate(-1)()
    })
  }

  onCancel = () => {
    if (this.state.isDirty) {
      confirm({
        title: LNotification('ARE_YOU_SURE'),
        okText: L('BTN_YES'),
        cancelText: L('BTN_NO'),
        onOk: () => {
          this.props.navigate(-1)()
        }
      })
      return
    }
    this.props.navigate(-1)()
  }

  handlePagingChange = ({ current }) => {
    this.setState({ skipCount: --current * this.state.maxResultCount }, this.getAll)
  }

  updateSearch = debounce((name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value } })
  }, 100)

  handleSearch = (name, value) => {
    const { filters } = this.state
    if (name === 'datePicker') {
      value
        ? this.setState(
            {
              filters: {
                ...filters,
                fromDate: moment(value[0]).toISOString(),
                toDate: moment(value[1]).toISOString()
              },
              skipCount: 0
            },
            async () => {
              await this.getAll()
            }
          )
        : this.setState(
            {
              filters: { ...filters, fromDate: undefined, toDate: undefined },
              skipCount: 0
            },
            async () => {
              await this.getAll()
            }
          )
    } else {
      this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => {
        await this.getAll()
      })
    }
  }

  handleExport = async () => {
    const { cashAdvanceStore } = this.props

    await cashAdvanceStore.downloadCashAdvanceDetailTransaction(this.state.filters)
  }

  renderFilterComponent = () => {
    const { filters } = this.state
    const keywordPlaceHolder = `${this.L('DEPOSIT_NAME')}, ${this.L('DEPOSIT_CODE')}`
    return (
      <Row gutter={8}>
        <Col sm={{ span: 6, offset: 0 }}>
          <Search
            placeholder={keywordPlaceHolder}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>
        <Col md={{ span: 6, offset: 0 }}>
          <DatePicker.RangePicker
            allowClear
            onChange={(value) => this.handleSearch('dateFromTo', value)}
            style={{ width: '100%' }}
            placeholder={rangePickerPlaceholder()}
            format={dateFormat}
          />
        </Col>
        <Col md={{ span: 6, offset: 0 }}>
          <Select
            showArrow
            allowClear
            value={filters.cashChanelId}
            onChange={(value) => this.handleSearch('cashChanelId', value)}
            style={{ width: '100%' }}
            placeholder={L('CASH_CHANEL')}>
            {this.renderOptions(cashChanelOptions)}
          </Select>
        </Col>
        <Col md={{ span: 6, offset: 0 }}>
          <Select
            showArrow
            allowClear
            onChange={(value) => this.handleSearch('transactionType', value)}
            style={{ width: '100%' }}
            placeholder={L('TRANSACTION_TYPE')}>
            {this.renderOptions(cashAdvanceTransactionOptions)}
          </Select>
        </Col>
      </Row>
    )
  }

  actionComponent = () =>
    this.isGranted(appPermissions.CashAdvance.export) && (
      <Button
        className="mx-3"
        onClick={this.handleExport}
        loading={this.props.cashAdvanceStore?.isLoadingExport}
        icon={<FileExcelOutlined />}>
        {L('BTN_EXPORT')}
      </Button>
    )

  // TransactionType
  renderActions = () => {
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BTN_BACK')}
          </Button>
        </Col>
      </Row>
    )
  }

  public render() {
    // const firstLetter = getFirstLetterAndUpperCase(
    //   this.props.cashAdvanceStore?.editCashAdvance?.user?.name || 'G'
    // )
    // const color = colorByLetter(firstLetter)
    const { cashAdvanceDetail } = this.props.cashAdvanceStore
    return this.isGranted(appPermissions.CashAdvance.detail) ? (
      <WrapPageScroll renderActions={this.renderActions}>
        <Form
          ref={this.formRef}
          layout={'vertical'}
          onFinish={this.onSave}
          onAbort={this.onCancel}
          onValuesChange={() => this.setState({ isDirty: true })}
          validateMessages={validateMessages}
          size="middle">
          {cashAdvanceDetail !== null && (
            <Card bordered={false}>
              <Descriptions bordered size="small" title={L('CASH_ADVANCE_USER_INFORMATION')}>
                <Descriptions.Item label={L('CUSTOMER_FULL_NAME')}>
                  {cashAdvanceDetail?.user?.displayName}
                </Descriptions.Item>

                <Descriptions.Item label={L('CUSTOMER_EMAIL')}>
                  {cashAdvanceDetail?.user?.emailAddress}
                </Descriptions.Item>
                <Descriptions.Item label={L('CUSTOMER_PHONE')}>
                  {cashAdvanceDetail?.user?.phoneNumber}
                </Descriptions.Item>
                <Descriptions.Item label={L('TOTAL_AMOUNT')} span={2}>
                  <strong>{formatCurrency(cashAdvanceDetail?.balanceAmount)}</strong>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}
          <div className="mt-3">
            {this.renderFilterComponent}
            <DataTable
              pagination={{
                pageSize: this.state.maxResultCount,
                current: this.currentPage,
                total: this.props.cashAdvanceStore.pagedTransactionData.totalCount,
                onChange: this.handlePagingChange
              }}
              actionGroups={this.actionComponent}
              createPermission={appPermissions.CashAdvance.create}>
              <Table
                size={'middle'}
                columns={this.columns}
                loading={this.props.cashAdvanceStore.isLoading}
                dataSource={this.props.cashAdvanceStore.pagedTransactionData.items}
                scroll={{ x: 1024, scrollToFirstRowOnChange: true }}
                className="custom-ant-table"
                pagination={false}
                rowKey={(record: any) => record.id}
              />
            </DataTable>
          </div>
        </Form>
        <style>{`
        .disable-style {
          background: none !important;
          color: #000000 !important;
        }
        `}</style>
      </WrapPageScroll>
    ) : (
      <NoRole />
    )
  }
  columns = getColumns()
}

export default withRouter(CashAdvanceDetail)
