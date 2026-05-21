import * as React from 'react'

import { Button, Col, Dropdown, Input, Menu, Row, Select, Table, Tooltip } from 'antd'
import { inject, observer } from 'mobx-react'

import { AppComponentListBase } from '@components/AppComponentBase'
import { L } from '@lib/abpUtility'
import Stores from '@stores/storeIdentifier'
import CashAdvanceStore from '@stores/finance/cashAdvanceStore'
import { appPermissions, dateFormat, rangePickerPlaceholder } from '@lib/appconst'
import debounce from 'lodash/debounce'
import DataTable from '@components/DataTable'
import getColumns from './columns'
import withRouter from '@components/Layout/Router/withRouter'

import { EllipsisOutlined, FileExcelOutlined } from '@ant-design/icons'
import NoRole from '@components/ComponentNoRole'
import UnitStore from '@stores/project/unitStore'
import ProjectStore from '@stores/project/projectStore'
import feeService from '@services/fee/feeService'
import { portalLayouts } from '@components/Layout/Router/router.config'
import DatePicker from 'antd/es/date-picker'
import { convertFilterDate } from '@lib/helper'
export interface ICashAdvanceDetailProps {
  params: any
  navigate: any
  unitStore: UnitStore
  cashAdvanceStore: CashAdvanceStore
  projectStore: ProjectStore
}

export interface ICashAdvanceDetailState {
  maxResultCount: number
  skipCount: number
  filters: any
  listPayment: any[]
}
const Search = Input.Search
@inject(Stores.CashAdvanceStore, Stores.UnitStore, Stores.ProjectStore)
@observer
class CashAdvanceTransctions extends AppComponentListBase<ICashAdvanceDetailProps, ICashAdvanceDetailState> {
  formRef: any = React.createRef()
  state = {
    visible: false,
    visibleExpenseMandateModal: false,
    maxResultCount: 10,
    skipCount: 0,
    cashAdvanceId: 0,
    filters: { isActive: 'true', buildingIds: undefined, unitIds: undefined },
    isDirty: false,
    depositData: {},
    expenseMandateData: {},
    listPayment: []
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.CashAdvance.page) &&
      (await Promise.all([
        this.getAll(),
        this.findUnits(''),
        this.getListPaymentChannels(),

        this.props.cashAdvanceStore.getTransactionTypes()
      ]))
  }

  getListPaymentChannels = async () => {
    const listPayment = await feeService.getListPaymentChannels({})
    this.setState({ listPayment })
  }

  async getAll() {
    await this.props.cashAdvanceStore.filterCashAdvanceTransactions({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }
  findBuildings = async (keyword) => {
    await this.props.projectStore.filterBuildingOptions({ keyword })
  }
  findUnits = debounce(async (keyword) => {
    const {
      filters: { buildingIds }
    } = this.state
    if (!buildingIds) {
      this.setState({ filters: { ...this.state.filters, unitIds: undefined } })
    }

    await this.props.unitStore.getAll({ keyword, buildingIds: buildingIds })
  }, 200)

  handlePagingChange = ({ current }) => {
    this.setState({ skipCount: --current * this.state.maxResultCount }, this.getAll)
  }

  updateSearch = debounce((name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value } })
  }, 100)

  handleSearch = async (name, value) => {
    const { filters } = this.state
    if (name === 'buildingIds') {
      await this.findUnits('')
      this.setState({
        filters: { ...this.state.filters, unitIds: undefined }
      })
    }
    if (name === 'datePicker') {
      this.setState({ filters: convertFilterDate(filters, value), skipCount: 0 }, async () => {
        await this.getAll()
      })
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
  gotoPrint = async (id) => {
    if (id) {
      await this.props.cashAdvanceStore.getCashReceipt(id)
      this.props.navigate(portalLayouts.cashAdvanceReceipt.path.replace(':id', id))
    }
  }

  actionComponent = () =>
    this.isGranted(appPermissions.CashAdvance.export) && (
      <Button
        className="mr-2"
        onClick={this.handleExport}
        loading={this.props.cashAdvanceStore?.isLoadingExport}
        icon={<FileExcelOutlined />}>
        {L('BTN_EXPORT')}
      </Button>
    )

  public render() {
    const {
      cashAdvanceStore: { transactionTypes },

      unitStore: { units }
    } = this.props
    const { filters } = this.state

    const filterComponent = (
      <Row gutter={8}>
        <Col sm={{ span: 24 }} md={{ span: 4 }}>
          <Search
            maxLength={200}
            placeholder={L('FILTER_CAS_TAB_2')}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>
        <Col sm={{ span: 24 }} md={{ span: 5 }}>
          <Select
            maxLength={50}
            showSearch
            placeholder={this.L('FILTER_UNIT')}
            allowClear
            showArrow
            filterOption={false}
            maxTagCount={2}
            mode="multiple"
            onSearch={this.findUnits}
            onChange={(value) => this.handleSearch('unitIds', value)}
            className="full-width"
            value={filters.unitIds}>
            {units?.items.map((pfStore) => (
              <Select.Option value={`${pfStore.id}`} key={pfStore.id}>
                <Tooltip
                  trigger="contextMenu"
                  title={
                    <>
                      {pfStore.fullUnitCode} <span className="text-muted small">({pfStore.name})</span>
                    </>
                  }>
                  {pfStore.fullUnitCode} <span className="text-muted small">({pfStore.name})</span>
                </Tooltip>
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col sm={{ span: 24 }} md={{ span: 5 }}>
          <Select
            showSearch
            placeholder={this.L('FILTER_PAYMENT_CHANNEL')}
            allowClear
            showArrow
            filterOption={false}
            className="full-width"
            onChange={(value) => this.handleSearch('CashChannelId', value)}>
            {this.renderOptions(this.state.listPayment)}
          </Select>
        </Col>
        <Col sm={{ span: 24 }} md={{ span: 4 }}>
          <Select
            showSearch
            placeholder={this.L('FILTER_TRANSACTION_TYPE')}
            allowClear
            showArrow
            filterOption={false}
            className="full-width"
            onChange={(value) => this.handleSearch('CashTransactionTypeId', value)}>
            {this.renderOptions(transactionTypes)}
          </Select>
        </Col>
        <Col sm={{ span: 5, offset: 0 }}>
          <DatePicker.RangePicker
            className="w-100"
            format={dateFormat}
            placeholder={rangePickerPlaceholder()}
            onChange={(value) => this.handleSearch('datePicker', value)}
          />
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.CashAdvance.page) ? (
      <DataTable
        filterComponent={filterComponent}
        pagination={{
          pageSize: this.state.maxResultCount,
          current: this.currentPage,
          total: this.props.cashAdvanceStore.pagedTransactionData.totalCount,
          onChange: this.handlePagingChange
        }}
        onRefresh={() => this.getAll()}
        actionGroups={this.actionComponent}>
        <Table
          size={'middle'}
          columns={this.columns}
          loading={this.props.cashAdvanceStore.isLoading}
          dataSource={this.props.cashAdvanceStore.pagedTransactionData.items}
          scroll={{ x: 1024, scrollToFirstRowOnChange: true }}
          className="custom-ant-table custom-ant-row"
          pagination={false}
          rowKey={(record: any) => record.id}
        />
      </DataTable>
    ) : (
      <NoRole />
    )
  }
  columns = getColumns({
    title: L('CASH_ADVANCE_CODE_WALLET'),
    dataIndex: 'cashAdvance',
    key: 'cashAdvance',
    width: '15%',
    ellipsis: true,
    render: (cashAdvance, item: any) => (
      <Row style={{ justifyContent: 'space-between' }}>
        <Col sm={{ span: 20, offset: 0 }} className="col-info">
          <div className="full-name text-truncate text-link-to-detail">{item?.cashAdvance?.cashNumber}</div>
        </Col>
        <Col sm={{ span: 4, offset: 0 }}>
          <Dropdown
            trigger={['click']}
            overlay={
              <Menu>
                <Menu.Item key={4} onClick={() => this.gotoPrint(item.id)}>
                  {L('BTN_PRINT_CASH_ADVANCE')}
                </Menu.Item>
              </Menu>
            }
            placement="bottomLeft">
            <EllipsisOutlined className="button-action-hiden-table-cell" />
          </Dropdown>
        </Col>
      </Row>
    )
  })
}

export default withRouter(CashAdvanceTransctions)
