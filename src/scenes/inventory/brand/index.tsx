import * as React from 'react'
import find from 'lodash/find'
import filter from 'lodash/filter'

import { Col, Input, Modal, Row, Table, Select, Dropdown, Menu } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'

import { InventoryModel } from '@models/Inventory'
import { AppComponentListBase } from '@components/AppComponentBase'
// import Filter from '@components/Filter'
import DataTable from '@components/DataTable'
import { L, LNotification } from '@lib/abpUtility'
import InventoryBrandStore from '@stores/inventory/inventoryBrandStore'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import AppConst, { appPermissions } from '@lib/appconst'
import ProjectStore from '@stores/project/projectStore'
import { InventoryBrandModal } from './components/InventoryBrandModal'
import debounce from 'lodash/debounce'
import getColumns from './columns'
import { notifySuccess } from '@lib/helper'
import withRouter from '@components/Layout/Router/withRouter'
export interface IInventoryProps {
  navigate: any
  routedata?: any
  inventoryBrandStore: InventoryBrandStore
  projectStore: ProjectStore
}

export interface IInventoryState {
  currentPage: number
  maxResultCount: number
  skipCount: number
  filters: any
  modalVisible: boolean
  selectedItem: any
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.InventoryBrandStore, Stores.ProjectStore)
@observer
class InventoryBrand extends AppComponentListBase<IInventoryProps, IInventoryState> {
  formRef: any = React.createRef()

  constructor(props) {
    super(props)
    const defaultStatus = find(AppConst.activeStatus, { value: 'true' }) || ({} as any)
    this.state = {
      currentPage: 1,
      maxResultCount: 10,
      skipCount: 0,
      selectedItem: {},
      modalVisible: false,
      filters: {
        keyword: '',
        projectIds: undefined,
        isActive: defaultStatus.value
      }
    }
  }

  async componentDidMount() {
    await this.getAll()
  }

  getAll = async () => {
    await this.props.inventoryBrandStore.getAll({
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

  activateOrDeactivate = async (id: number, isActive) => {
    const self = this
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.inventoryBrandStore.activateOrDeactivate(id, isActive)
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

  Modal = () => {
    this.setState({
      modalVisible: !this.state.modalVisible
    })
  }

  createOrUpdateModalOpen = async (inventoryBrand?: InventoryModel) => {
    if (!inventoryBrand) {
      await this.props.inventoryBrandStore.createInventoryBrand()
    } else {
      await this.props.inventoryBrandStore.edit(inventoryBrand)
    }

    this.Modal()
  }

  onCreateOrUpdate = async (formValues) => {
    if (!this.props.inventoryBrandStore.editInventoryBrand?.id) {
      await this.props.inventoryBrandStore.create(formValues)
    } else {
      await this.props.inventoryBrandStore.update({
        ...this.props.inventoryBrandStore.editInventoryBrand,
        ...formValues
      })
    }

    await this.getAll()
    this.setState({ modalVisible: false })
  }

  public render() {
    const {
      inventoryBrandStore: { inventories }
    } = this.props
    const columns = getColumns({
      title: L('NAME'),
      dataIndex: 'name',
      key: 'name',
      width: '15%',
      ellipsis: true,
      render: (name: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 20, offset: 0 }} className="col-info">
            <div
              className="full-name text-truncate text-link-to-detail"
              onClick={() => this.isGranted(appPermissions.inventory.detail) && this.createOrUpdateModalOpen(item)}>
              <a className="link-text-table"> {name}</a>
            </div>
          </Col>
          <Col sm={{ span: 4, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {this.isGranted(appPermissions.inventory.delete) && (
                    <Menu.Item onClick={() => this.activateOrDeactivate(item.id, !item.isActive)}>
                      {L(item.isActive ? 'BTN_DEACTIVATE' : 'BTN_ACTIVATE')}
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

    const {
      filters: { isActive: selectedStatus }
    } = this.state
    const filterInventories = filter(inventories.items, (_item) => {
      if (!selectedStatus?.trim()) return true
      return `${_item.isActive}` === selectedStatus
    })
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            maxLength={200}
            placeholder={L('INVENTORY_BRAND_LIST_KEYWORD_SEARCH')}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>
        <Col sm={{ span: 8, offset: 0 }}>
          <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
          <Select onChange={this.onSelectStatus} style={{ width: '100%' }} value={selectedStatus}>
            {AppConst.activeStatus.map((status, index) => (
              <Select.Option key={index} value={status.value}>
                {status.label}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
    )
    return (
      <>
        <DataTable
          onRefresh={this.getAll}
          extraFilterComponent={filterComponent}
          title={this.L('INVENTORY_BRAND_LIST')}
          onCreate={() => this.createOrUpdateModalOpen()}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.state.currentPage,
            total: inventories === undefined ? 0 : inventories.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.inventory.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={this.props.inventoryBrandStore.isLoading}
            dataSource={filterInventories}
            scroll={{ x: 1000, y: 500, scrollToFirstRowOnChange: true }}
          />
        </DataTable>

        <InventoryBrandModal
          inventoryBrandStore={this.props.inventoryBrandStore}
          visible={this.state.modalVisible}
          onCreate={this.onCreateOrUpdate}
          onCancel={() => {
            this.setState({
              modalVisible: false
            })
          }}
          id={this.props.inventoryBrandStore.editInventoryBrand.id}
        />
      </>
    )
  }
}

export default withRouter(InventoryBrand)
