import * as React from 'react'
import find from 'lodash/find'
import filter from 'lodash/filter'

import { Col, Input, Modal, Row, Table, Select, Tabs, Dropdown, Menu, Button, DatePicker } from 'antd'

import { AppComponentListBase } from '@components/AppComponentBase'
// import Filter from '@components/Filter'
import DataTable from '@components/DataTable'
import { L, LNotification, isGrantedAny } from '@lib/abpUtility'
import InventoryItemsStore from '@stores/inventory/inventoryItemsStore'
import InventoryStockInOutStore from '@stores/inventory/inventoryStockInOutStore'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import AppConst, { appPermissions, dateFormat } from '@lib/appconst'
import ProjectStore from '@stores/project/projectStore'
import { portalLayouts } from '@components/Layout/Router/router.config'
import debounce from 'lodash/debounce'
import getColumns from './columns'
import InventoriesQRCode from './qrcode'
import InventoryStockInModal from '../stockInOut/components/InventoryStockInModal'
import InventoryStockOutModal from '../stockInOut/components/InventoryStockOutModal'
import { IInventoryStockTypes, IInventoryItem } from '@models/Inventory/InventoryItemModel'
import withRouter from '@components/Layout/Router/withRouter'
import { convertFilterDate, notifySuccess } from '@lib/helper'
import { BarcodeOutlined, EllipsisOutlined, TagOutlined } from '@ant-design/icons'
import StockIn from '../stockInOut/stockIn'
import StockOut from '../stockInOut/stockOut'
import ActionFooter from '@components/ActionFooter'
import NoRole from '@components/ComponentNoRole'
import { ExcelIcon } from '@components/Icon'
export enum tabKeys {
  tabList = 'INVENTORY_TAB_LIST',
  tabStockIn = 'INVENTORY_TAB_STOCK_IN',
  tabStockOut = 'INVENTORY_TAB_STOCK_OUT'
}
export interface IInventoryProps {
  navigate: any
  routedata?: any
  inventoryItemsStore: InventoryItemsStore
  inventoryStockInOutStore: InventoryStockInOutStore
  projectStore: ProjectStore
}

export interface IInventoryState {
  currentPage: number
  maxResultCount: number
  skipCount: number
  filters: any
  modalVisible?: IInventoryStockTypes
  selectedItem: any
  tabActiveKey: string
  showAction: boolean
  showPopupQRCode: boolean
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.InventoryItemsStore, Stores.ProjectStore, Stores.UnitStore, Stores.InventoryStockInOutStore)
@observer
class InventoryLocation extends AppComponentListBase<IInventoryProps, IInventoryState> {
  formRef: any = React.createRef()
  formStockInRef: any = React.createRef()
  formStockOutRef: any = React.createRef()

  constructor(props) {
    super(props)
    const defaultStatus = find(AppConst.activeStatus, { value: 'true' }) || ({} as any)
    this.state = {
      currentPage: 1,
      maxResultCount: 10,
      skipCount: 0,
      selectedItem: {},
      modalVisible: undefined,
      filters: {
        keyword: '',
        projectIds: undefined,
        isActive: defaultStatus.value
      },
      tabActiveKey: tabKeys.tabList,
      showAction: false,
      showPopupQRCode: false
    }
  }

  async componentDidMount() {
    this.props.inventoryItemsStore.itemsToQRCode = []
    this.isGranted(appPermissions.inventory.page) && (await this.getAll())
  }

  getAll = async () => {
    await this.props.inventoryItemsStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  handleTableChange = (pagination: any) => {
    this.setState(
      {
        skipCount: (pagination.current - 1) * this.state.maxResultCount!,
        currentPage: pagination.current
      },
      async () => await this.getAll()
    )
  }

  activateOrDeactivate = async (id: number, isActive) => {
    const self = this
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.inventoryItemsStore.activateOrDeactivate(id, isActive)
        notifySuccess(L('SUCCESSFULLY'), L('UPDATE_SUCCESSFULLY'))
        self.handleTableChange({ current: 1 })
      }
    })
  }

  updateSearch = debounce((name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value } })
  }, 100)

  handleSearch = (name, value) => {
    const { filters } = this.state
    if (name === 'dateFromTo') {
      this.setState({ filters: convertFilterDate(filters, value), skipCount: 0 }, async () => {
        await this.getAll()
      })
    } else {
      this.setState({ filters: { ...filters, [name]: value } }, async () => {
        if (name === 'projectIds') {
          this.setState({
            filters: {
              ...this.state.filters,
              buildingIds: undefined,
              unitIds: undefined
            }
          })
        }
        await this.getAll()
      })
    }
  }

  onSelectStatus = (isActive: string) => {
    this.setState(
      {
        filters: { ...this.state.filters, isActive },
        skipCount: 0,
        currentPage: 1
      },
      this.getAll
    )
  }

  gotoDetail = (id?) => {
    this.props.inventoryItemsStore.createInventory()
    const { navigate } = this.props
    id
      ? navigate(portalLayouts.inventoryItemsDetail.path.replace(':id', id))
      : navigate(portalLayouts.inventoryItemsCreate.path)
  }

  goToHistory = (id) => {
    this.props.navigate({
      pathname: portalLayouts.inventoryItemsDetail.path.replace(':id', id),
      search: 'history'
    })
  }

  onSelectChange = async (itemsToQRCode) => {
    await this.props.inventoryItemsStore.storeItemsToQRCode(itemsToQRCode)
    itemsToQRCode.length > 0 ? this.setState({ showAction: true }) : this.setState({ showAction: false })
  }

  changeTab = (tabActiveKey) => this.setState({ tabActiveKey })

  Modal = (type?: IInventoryStockTypes) => {
    this.setState({
      modalVisible: type ? type : undefined
    })
  }

  createOrUpdateModalOpen = async (type: IInventoryStockTypes, inventoryItem: IInventoryItem) => {
    await this.props.inventoryStockInOutStore.createInventoryStock(type, inventoryItem)

    this.Modal(type)

    if (type === IInventoryStockTypes.stockIn) {
      this.formStockInRef.current.setFieldsValue({
        ...this.props.inventoryStockInOutStore.editStockIn
      })
    } else {
      this.formStockOutRef.current.setFieldsValue({
        ...this.props.inventoryStockInOutStore.editStockOut
      })
    }
  }

  onCreateOrUpdate = async (type: IInventoryStockTypes, inventoryItem: IInventoryItem, files: any) => {
    const { inventoryStockInOutStore } = this.props
    let form

    if (type === IInventoryStockTypes.stockIn) {
      form = this.formStockInRef.current

      await form.validateFields().then(async (values: any) => {
        if (!inventoryStockInOutStore.editStockIn?.id) {
          await inventoryStockInOutStore.createStockIn(values, files)
        } else {
          await inventoryStockInOutStore.updateStockIn(
            {
              ...inventoryStockInOutStore.editStockIn,
              ...values
            },
            files
          )
        }
      })
    } else {
      form = this.formStockOutRef.current

      await form.validateFields().then(async (values: any) => {
        if (!inventoryStockInOutStore.editStockOut?.id) {
          await inventoryStockInOutStore.createStockStockOut(values, files)
        } else {
          await inventoryStockInOutStore.updateStockOut(
            {
              ...inventoryStockInOutStore.editStockOut,
              ...values
            },
            files
          )
        }
      })
    }

    this.setState({ modalVisible: undefined })
    form.resetFields()
    await this.getAll()
  }

  handleExportExcel = async () => {
    await this.props.inventoryItemsStore.exportExcel({
      ...this.state.filters
    })
  }

  renderInventories = () => {
    const {
      inventoryItemsStore: { inventories, isLoading, itemsToQRCode }
    } = this.props
    const columns = getColumns({
      title: L('INVENTORY_ITEM'),
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      ellipsis: true,
      render: (name: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <div
              className="full-name text-truncate text-link-to-detail"
              onClick={() => this.isGranted(appPermissions.inventory.detail) && this.gotoDetail(item.id)}>
              <a className="link-text-table"> {name}</a>
              <div className="text-muted small">
                {item.itemCode && (
                  <>
                    <BarcodeOutlined className="mr-1" /> {item.itemCode}
                  </>
                )}
                <TagOutlined className="mr-1" /> {item.category?.parent ? item.category.parent.name : ''} -{' '}
                {item.category ? item.category.name : ''}
              </div>
            </div>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {this.isGranted(appPermissions.inventory.delete) && (
                    <Menu.Item onClick={() => this.activateOrDeactivate(item.id, !item.isActive)}>
                      {L(item.isActive ? 'BTN_DEACTIVATE' : 'BTN_ACTIVATE')}
                    </Menu.Item>
                  )}
                  {isGrantedAny(appPermissions.inventory.update, appPermissions.inventory.create) && (
                    <Menu.Item onClick={() => this.createOrUpdateModalOpen(IInventoryStockTypes.stockIn, item)}>
                      {L('STOCK_IN')}
                    </Menu.Item>
                  )}
                  {isGrantedAny(appPermissions.inventory.update, appPermissions.inventory.create) && (
                    <Menu.Item onClick={() => this.createOrUpdateModalOpen(IInventoryStockTypes.stockOut, item)}>
                      {L('STOCK_OUT')}
                    </Menu.Item>
                  )}
                  {isGrantedAny(appPermissions.inventory.update, appPermissions.inventory.create) && (
                    <Menu.Item onClick={() => this.goToHistory(item.id)}>{L('GO_TO_HISTORY')}</Menu.Item>
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
    const {
      filters: { isActive: selectedStatus }
    } = this.state
    const filterInventories = filter(inventories.items, (_item) => {
      if (!selectedStatus?.trim()) return true
      return `${_item.isActive}` === selectedStatus
    })
    const { modalVisible } = this.state
    const isStockInModalOpened = !!modalVisible && modalVisible === IInventoryStockTypes.stockIn
    const isStockOutModalOpened = !!modalVisible && modalVisible === IInventoryStockTypes.stockOut
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            maxLength={200}
            placeholder={L('INVENTORY_LIST_KEYWORD_SEARCH')}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>
        <Col sm={{ span: 5, offset: 0 }}>
          <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
          <Select onChange={this.onSelectStatus} style={{ width: '100%' }} value={selectedStatus}>
            {AppConst.activeStatus.map((status, index) => (
              <Select.Option key={index} value={status.value}>
                {L(status.label)}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_FROM_TO_DATE')}</label>
          <DatePicker.RangePicker
            format={dateFormat}
            className="full-width"
            onChange={(value) => this.handleSearch('dateFromTo', value)}
          />
        </Col>
      </Row>
    )

    const renderActionGroups = () => {
      return (
        <span>
          {this.isGranted(appPermissions.inventory.export) && (
            <Button
              shape="circle"
              type="primary"
              className="mr-1"
              onClick={this.handleExportExcel}
              icon={<ExcelIcon />}
            />
          )}
        </span>
      )
    }
    return (
      <>
        <DataTable
          onRefresh={this.getAll}
          extraFilterComponent={filterComponent}
          actionGroups={renderActionGroups}
          title={this.L('INVENTORY_LOCATION_LIST')}
          onCreate={() => this.gotoDetail()}
          pagination={{
            pageSize: this.state.maxResultCount,
            currentPage: this.state.currentPage,
            current: this.state.currentPage,
            total: inventories === undefined ? 0 : inventories.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.inventory.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowSelection={{
              selectedRowKeys: itemsToQRCode,
              onChange: this.onSelectChange
            }}
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={isLoading}
            dataSource={filterInventories}
            scroll={{ x: 1000, y: 500, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
        <InventoriesQRCode
          inventoryItemsStore={this.props.inventoryItemsStore}
          onCancel={() => this.setState({ showPopupQRCode: false })}
          visible={this.state.showPopupQRCode}
        />
        <ActionFooter show={this.state.showAction}>
          <Button className="mr-1" shape="round" onClick={() => this.setState({ showPopupQRCode: true })}>
            {L('BTN_SHOW_QR_CODE')}
          </Button>
        </ActionFooter>

        {isStockInModalOpened && (
          <InventoryStockInModal
            formRef={this.formStockInRef}
            visible={isStockInModalOpened}
            onCreate={(values, files) => this.onCreateOrUpdate(IInventoryStockTypes.stockIn, values, files)}
            onCancel={() => this.Modal()}
          />
        )}
        {isStockOutModalOpened && (
          <InventoryStockOutModal
            formRef={this.formStockOutRef}
            visible={isStockOutModalOpened}
            onCreate={(values, files) => this.onCreateOrUpdate(IInventoryStockTypes.stockOut, values, files)}
            onCancel={() => this.Modal()}
          />
        )}
      </>
    )
  }

  public render() {
    const { tabActiveKey } = this.state
    return this.isGranted(appPermissions.inventory.page) ? (
      <>
        <Tabs type="card" activeKey={tabActiveKey} onTabClick={this.changeTab}>
          <Tabs.TabPane tab={L(tabKeys.tabList)} key={tabKeys.tabList}>
            {this.renderInventories()}
          </Tabs.TabPane>
          <Tabs.TabPane tab={L(tabKeys.tabStockIn)} key={tabKeys.tabStockIn}>
            <StockIn />
          </Tabs.TabPane>
          <Tabs.TabPane tab={L(tabKeys.tabStockOut)} key={tabKeys.tabStockOut}>
            <StockOut />
          </Tabs.TabPane>
        </Tabs>
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(InventoryLocation)
