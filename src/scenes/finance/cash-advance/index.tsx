import { Button, Checkbox, Col, Dropdown, Input, Menu, Row, Select, Table, Tooltip } from 'antd'
import { inject, observer } from 'mobx-react'

import { AppComponentListBase } from '@components/AppComponentBase'
import { L, isGrantedAny } from '@lib/abpUtility'
import Stores from '../../../stores/storeIdentifier'
import CashAdvanceStore from '../../../stores/finance/cashAdvanceStore'
import DataTable from '../../../components/DataTable'
import AppConsts, { appPermissions } from '../../../lib/appconst'
import debounce from 'lodash/debounce'
import getColumns from './columns'
import DepositFormModal from '@scenes/finance/cash-advance/components/depositFormModal'
import { portalLayouts } from '@components/Layout/Router/router.config'
import withRouter from '@components/Layout/Router/withRouter'
import { ExcelIcon } from '@components/Icon'
import { EllipsisOutlined, ImportOutlined, WalletOutlined } from '@ant-design/icons'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import AutoDeductCashAvanceModal from './components/AutoDeductCashAvanceModal'
import WithDrawModal from './components/withDrawModal'
import ImportCashAdvanceModal from './components/ImportCashAdvanceModal'
import NoRole from '@components/ComponentNoRole'
import feeTypeService from '@services/fee/feeTypeService'
import { CheckboxValueType } from 'antd/es/checkbox/Group'
import UnitStore from '@stores/project/unitStore'
import ProjectStore from '@stores/project/projectStore'
const { pageSize } = AppConsts

export interface ICashAdvanceProps {
  navigate: any
  cashAdvanceStore: CashAdvanceStore
  projectStore: ProjectStore
  unitStore: UnitStore
  location: any
}

export interface ICashAdvanceState {
  visible: boolean
  visibleExpenseMandateModal: boolean
  maxResultCount: number
  skipCount: number
  cashAdvanceId: number
  filters: any
  depositData: any
  withDrawData: any
  expenseMandateData: any
  isLoading: boolean
  showModalAutoDeductCashAdvance: boolean
  withDrawModalVisible: boolean
  showModalImport: boolean
  selectedRowKeys: any[]
  listFeeType: any[]
  isMultipleSelect: boolean
}
const Search = Input.Search

@inject(Stores.CashAdvanceStore, Stores.ProjectStore, Stores.UnitStore)
@observer
class CashAdvanceListScreen extends AppComponentListBase<ICashAdvanceProps, ICashAdvanceState> {
  state = {
    isLoading: false,
    visible: false,
    visibleExpenseMandateModal: false,
    maxResultCount: pageSize.pageSize_10,
    skipCount: 0,
    cashAdvanceId: 0,
    filters: { isActive: 'true', buildingIds: undefined, unitIds: undefined },
    depositData: {},
    showModalAutoDeductCashAdvance: false,
    withDrawData: {} as any,
    expenseMandateData: {},
    withDrawModalVisible: false,
    showModalImport: false,
    selectedRowKeys: [],
    listFeeType: [],
    isMultipleSelect: false
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    // if (this.props.location.search) {
    // const searchInformationFromRedirect = this.props.location.search.slice(9)
    //   this.isGranted(appPermissions.CashAdvance.page) &&
    //     (await Promise.all([
    //       this.handleSearch('keyword', searchInformationFromRedirect),

    //       this.props.cashAdvanceStore.getPaymentChannels()
    //     ]))
    // } else {
    this.isGranted(appPermissions.CashAdvance.page) &&
      (await Promise.all([
        this.getAll(),
        this.getListFeeType(''),
        this.props.cashAdvanceStore.getPaymentChannels(),
        this.findBuildings(''),
        this.findUnits('')
      ]))
  }
  // }

  async getAll() {
    await this.props.cashAdvanceStore.filter({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  getListFeeType = async (keyword) => {
    const feeTypes = await feeTypeService.getList({ keyword, isActice: true })
    this.setState({ listFeeType: feeTypes })
  }

  gotoDetail = (id) => {
    if (!id) {
      return
    }
    const { navigate } = this.props
    this.props.cashAdvanceStore.cashAdvanceDetail =
      (this.props.cashAdvanceStore.pagedData.items ?? []).find((i) => i.id === id) ?? null
    navigate(portalLayouts.cashAdvanceDetail.path.replace(':userId', id))
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  handlePagingChange = (paging) => {
    const skipCount = --paging.current * paging.pageSize
    const maxResultCount = paging.pageSize
    this.setState({ maxResultCount })
    this.setState({ skipCount: skipCount, maxResultCount }, async () => await this.getAll())
  }

  openOrCloseModalDeposit = async (cashAdvance?) => {
    this.setState({
      depositData: cashAdvance,
      visible: !this.state.visible
    })
  }
  openOrCloseModalWithDraw = async (data?) => {
    this.setState({
      withDrawData: data,
      withDrawModalVisible: !this.state.withDrawModalVisible
    })
  }
  openOrCloseModalExpenseMandate = async (cashAdvance?) => {
    this.setState({
      expenseMandateData: { userId: cashAdvance?.userId },
      visibleExpenseMandateModal: !this.state.visibleExpenseMandateModal
    })
  }

  updateSearch = debounce((name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value } })
  }, 100)

  handleSearch = async (name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => {
      if (name === 'buildingIds') {
        await this.findUnits('')
        this.setState({
          filters: { ...this.state.filters, unitIds: undefined }
        })
      }
      await this.getAll()
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
  onChangeCheckBoxUnit = (checkedValues: CheckboxValueType[]) => {
    this.setState({ selectedRowKeys: [...this.state.selectedRowKeys, ...checkedValues] })
  }
  showModalAutoDeductCashAdvance = () => {
    this.setState({ showModalAutoDeductCashAdvance: !this.state.showModalAutoDeductCashAdvance })
  }
  handleExport = async () => {
    await this.props.cashAdvanceStore.downloadCashAdvances(this.state.filters)
  }
  handleSelectionChange = (selectedRowKeys) => {
    if (selectedRowKeys.length > 0) {
      this.setState({ isMultipleSelect: true })
    } else {
      this.setState({ isMultipleSelect: false })
    }

    this.setState({ selectedRowKeys: selectedRowKeys })
  }
  showImport = () => this.setState((prevState) => ({ showModalImport: !prevState.showModalImport }))

  public render() {
    const { selectedRowKeys, filters } = this.state
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleSelectionChange
    }
    const {
      projectStore: { buildingOptions },
      unitStore: { units }
    } = this.props
    const { pagedData } = this.props.cashAdvanceStore
    const columns = getColumns({
      title: () => <>{L('UNIT')}</>,
      dataIndex: 'unit',
      key: 'unit',
      width: '13%',
      render: (unit: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 19, offset: 0 }} className="col-info">
            <a
              onClick={() => this.isGranted(appPermissions.CashAdvance.detail) && this.gotoDetail(item?.id)}
              className="link-text-table">
              <label className="text-truncate-2">{item?.unit?.fullUnitCode}</label>
            </a>
          </Col>

          <Col sm={{ span: 5, offset: 0 }} className="custom-menu-select">
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {isGrantedAny(appPermissions.CashAdvance.create, appPermissions.CashAdvance.update) && (
                    <Menu.Item key={1} onClick={() => this.openOrCloseModalDeposit(item)}>
                      {L('DEPOSIT')}
                    </Menu.Item>
                  )}
                  {isGrantedAny(appPermissions.CashAdvance.withDraw, appPermissions.CashAdvance.create) && (
                    <Menu.Item key={2} onClick={() => this.openOrCloseModalWithDraw(item)}>
                      {L('WITH_DRAW')}
                    </Menu.Item>
                  )}
                </Menu>
              }
              placement="bottomLeft">
              <button className="button-action-hiden-table-cell">
                <EllipsisOutlined />
              </button>
            </Dropdown>
          </Col>
        </Row>
      )
    })
    const keywordPlaceHolder = `${this.L('CASH_ADVANCE_NAME')}, ${this.L('CASH_ADVANCE_CODE')}`
    return this.isGranted(appPermissions.CashAdvance.page) ? (
      <>
        <DataTable
          title={this.L('CASH_ADVANCE_LIST')}
          onRefresh={() => this.getAll()}
          onCreate={this.openOrCloseModalDeposit}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: pagedData === undefined ? 0 : pagedData.totalCount,
            onChange: this.handlePagingChange
          }}
          showChangePageSize={true}
          filterComponent={
            <Row gutter={[8, 8]} style={{ display: 'flex', alignItems: 'center' }}>
              <Col span={6}>
                <Search
                  maxLength={200}
                  placeholder={keywordPlaceHolder}
                  onChange={(value) => this.updateSearch('keyword', value.target?.value)}
                  onSearch={(value) => this.handleSearch('keyword', value)}
                />
              </Col>
              <Col span={5}>
                <Select
                  allowClear
                  showArrow
                  className="w-100"
                  maxTagCount={2}
                  showSearch
                  placeholder={L('FEE_TYPE')}
                  onSearch={(value) => this.getListFeeType(value)}
                  onChange={(value) => this.handleSearch('feeTypeIds', value)}
                  mode="multiple">
                  {this.renderOptions(this.state.listFeeType)}
                </Select>
              </Col>
              <Col span={4}>
                <Select
                  showSearch
                  placeholder={this.L('FILTER_BUILDING')}
                  allowClear
                  maxTagCount={2}
                  filterOption={false}
                  mode="multiple"
                  className="full-width"
                  showArrow
                  onSearch={this.findBuildings}
                  value={filters.buildingIds}
                  onChange={(value) => this.handleSearch('buildingIds', value)}>
                  {this.renderOptions(buildingOptions)}
                </Select>
              </Col>
              <Col span={4}>
                <Select
                  maxLength={50}
                  showArrow
                  showSearch
                  placeholder={this.L('FILTER_UNIT')}
                  allowClear
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
                          <div className="text-small">
                            {pfStore.fullUnitCode} <span className="text-muted small">({pfStore.name})</span>
                          </div>
                        }>
                        {pfStore.fullUnitCode} <span className="text-muted small">({pfStore.name})</span>
                      </Tooltip>
                    </Select.Option>
                  ))}
                </Select>
              </Col>
              <Col span={4}>
                <Checkbox
                  onChange={(e: CheckboxChangeEvent) => this.handleSearch('IsIncludeEmptyCash', e.target.checked)}>
                  {L('CASH_ADVANDE_FILTER_IS_INCLUDE_EMPTY_CASH')}
                </Checkbox>
              </Col>
            </Row>
          }
          // actionAfterTitle={
          //   <Row gutter={[8, 8]}
          // style={{ display: 'flex', alignItems: 'center', height: '100%', marginLeft: '5px' }}>
          //     <Col span={24}>
          //       <Checkbox
          //         onChange={(e: CheckboxChangeEvent) => this.handleSearch('IsIncludeEmptyCash', e.target.checked)}>
          //         {L('CASH_ADVANDE_FILTER_IS_INCLUDE_EMPTY_CASH')}
          //       </Checkbox>
          //     </Col>
          //   </Row>
          // }
          actionGroups={() => {
            return (
              <>
                {isGrantedAny(appPermissions.CashAdvance.import) && (
                  <Button
                    key={3}
                    type="primary"
                    shape="round"
                    onClick={this.showImport}
                    icon={<ImportOutlined />}
                    className="mr-1"
                    loading={this.props.cashAdvanceStore.isLoadingExport}>
                    {this.L('BTN_IMPORT')}
                  </Button>
                )}
                {isGrantedAny(appPermissions.CashAdvance.export) && (
                  <Button
                    key={1}
                    shape="circle"
                    type="primary"
                    className="mr-1"
                    onClick={this.handleExport}
                    icon={<ExcelIcon />}
                    loading={this.props.cashAdvanceStore.isLoadingExport}
                  />
                )}
                {isGrantedAny(appPermissions.CashAdvance.deduct) && (
                  <Button
                    key={2}
                    shape="circle"
                    type="primary"
                    className="mr-1"
                    onClick={this.showModalAutoDeductCashAdvance}
                    icon={<WalletOutlined />}
                    loading={this.props.cashAdvanceStore.isLoadingExport}
                  />
                )}
              </>
            )
          }}
          createPermission={appPermissions.CashAdvance.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id || 0}
            columns={columns}
            pagination={false}
            loading={this.props.cashAdvanceStore.isLoading}
            dataSource={pagedData === undefined ? [] : pagedData.items}
            onChange={this.handleTableChange}
            scroll={{ x: 1000, scrollToFirstRowOnChange: true, y: '70vh' }}
            rowSelection={rowSelection}
          />
        </DataTable>
        <DepositFormModal
          visible={this.state.visible}
          cashAdvanceStore={this.props.cashAdvanceStore}
          handleOK={this.handleSearch}
          handleCancel={this.openOrCloseModalDeposit}
          data={this.state.depositData}
        />
        <AutoDeductCashAvanceModal
          isMultiple={this.state.isMultipleSelect}
          unitIds={this.state.selectedRowKeys}
          cashAdvanceStore={this.props.cashAdvanceStore}
          visible={this.state.showModalAutoDeductCashAdvance}
          onCancel={() => {
            this.setState({ showModalAutoDeductCashAdvance: false }), this.setState({ selectedRowKeys: [] })
          }}
          onCancelAndRefresh={() => {
            this.setState({ showModalAutoDeductCashAdvance: false }),
              this.getAll(),
              this.setState({ selectedRowKeys: [] })
          }}
        />
        <WithDrawModal
          visible={this.state.withDrawModalVisible}
          cashAdvanceStore={this.props.cashAdvanceStore}
          handleOK={this.handleSearch}
          handleCancel={this.openOrCloseModalWithDraw}
          data={this.state.withDrawData}
        />
        <ImportCashAdvanceModal
          visible={this.state.showModalImport}
          cashAdvanceStore={this.props.cashAdvanceStore}
          onCloseAndRefresh={async () => {
            await this.setState({ showModalImport: false }), await this.getAll()
          }}
          onClose={async () => {
            await this.setState({ showModalImport: false })
          }}
        />
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(CashAdvanceListScreen)
