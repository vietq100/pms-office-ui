import * as React from 'react'
import find from 'lodash/find'
import filter from 'lodash/filter'

import { Col, Dropdown, Input, Menu, Modal, Row, Table, Select } from 'antd'
import { MoreOutlined } from '@ant-design/icons'

import { AppComponentListBase } from '@components/AppComponentBase'
import Filter from '@components/Filter'
import DataTable from '@components/DataTable'
import { L, LNotification } from '@lib/abpUtility'
import InventoryWarehouseStore from '@stores/inventory/inventoryWarehouseStore'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import AppConst, { appPermissions } from '@lib/appconst'
import ProjectStore from '@stores/project/projectStore'
import { portalLayouts } from '@components/Layout/Router/router.config'
import { filterOptions } from '@lib/helper'
import { InventoryWarehouseModal } from './components/InventoryWarehouseModal'
import debounce from 'lodash/debounce'
import withRouter from '@components/Layout/Router/withRouter'

const { align } = AppConst

export interface IInventoryProps {
  navigate: any
  routedata?: any
  inventoryWarehouseStore: InventoryWarehouseStore
  projectStore: ProjectStore
}

export interface IInventoryState {
  currentPage: number
  maxResultCount: number
  skipCount: number
  filters: any
  visible: boolean
  selectedItem: any
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.InventoryWarehouseStore, Stores.ProjectStore)
@observer
class InventoryWarehouse extends AppComponentListBase<IInventoryProps, IInventoryState> {
  formRef: any = React.createRef()

  constructor(props) {
    super(props)
    const defaultStatus = find(AppConst.activeStatus, { value: 'true' }) || ({} as any)
    this.state = {
      currentPage: 1,
      maxResultCount: 10,
      skipCount: 0,
      selectedItem: {},
      visible: false,
      filters: {
        keyword: '',
        projectIds: undefined,
        isActive: defaultStatus.value
      }
    }
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    await this.getAll()
  }

  getAll = async () => {
    await this.props.inventoryWarehouseStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  activateOrDeactivate = async (id: number, isActive) => {
    const self = this
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.inventoryWarehouseStore.activateOrDeactivate(id, isActive)
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
    this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => {
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

  onShowAddEditModal = (newState: boolean) => () => {
    this.setState({ visible: newState, selectedItem: {} as any })
  }

  onCancelAddEditModal = () => {
    this.setState({ visible: false, selectedItem: {} as any })
  }

  onCreateOrUpdate = async (item: any) => {
    const { inventoryWarehouseStore } = this.props
    if (item.id) {
      await inventoryWarehouseStore.update(item)
    } else {
      await inventoryWarehouseStore.create(item)
    }
  }

  gotoDetail = (id?) => {
    const { navigate } = this.props
    id
      ? navigate(portalLayouts.communicationInventoryDetail.path.replace(':id', id))
      : navigate(portalLayouts.communicationInventoryCreate.path)
  }

  public render() {
    const {
      inventoryWarehouseStore: { inventories },
      projectStore: { projectOptions }
    } = this.props
    const columns = [
      {
        title: L('INVENTORY_WAREHOUSE_NAME'),
        dataIndex: 'name',
        key: 'name',
        width: 150,
        render: (name) => <>{name}</>
      },
      {
        title: L('DESCRIPTION'),
        dataIndex: 'workflow',
        key: 'workflow',
        width: 250,
        ellipsis: true,
        render: (checkInDate) => <div>{this.renderDate(checkInDate)}</div>
      },
      {
        title: L('ACTIONS'),
        dataIndex: 'operation',
        key: 'operation',
        fixed: align.right,
        align: align.right,
        width: 90,
        render: (text: string, item: any) => (
          <div>
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
              <MoreOutlined />
            </Dropdown>
          </div>
        )
      }
    ]

    const {
      filters: { isActive: selectedStatus }
    } = this.state
    const filterInventories = filter(inventories.items, (_item) => {
      if (!selectedStatus?.trim()) return true
      return `${_item.isActive}` === selectedStatus
    })

    return (
      <>
        <Filter title={this.L('FILTER')} handleRefresh={this.getAll}>
          <Row gutter={[16, 8]}>
            <Col sm={{ span: 6, offset: 0 }}>
              <label>{this.L('FILTER_KEYWORD')}</label>
              <Search
                onChange={(value) => this.updateSearch('keyword', value.target?.value)}
                onSearch={(value) => this.handleSearch('keyword', value)}
              />
            </Col>
            <Col sm={{ span: 6, offset: 0 }}>
              <label>{this.L('PROJECT')}</label>
              <Select
                showSearch
                allowClear
                className="full-width"
                filterOption={filterOptions}
                onChange={(value) => this.handleSearch('projectIds', value)}>
                {this.renderOptions(projectOptions)}
              </Select>
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
        </Filter>
        <DataTable
          title={this.L('INVENTORY_WAREHOUSE_LIST')}
          onCreate={this.onShowAddEditModal(true)}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: inventories === undefined ? 0 : inventories.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.inventory.create}>
          <Table
            size="middle"
            className="custom-ant-table"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={this.props.inventoryWarehouseStore.isLoading}
            dataSource={filterInventories}
            scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
          />
        </DataTable>

        <InventoryWarehouseModal
          visible={this.state.visible}
          handleOK={this.onCreateOrUpdate}
          onClose={this.onShowAddEditModal(false)}
          handleCancel={this.onCancelAddEditModal}
          data={this.state.selectedItem}
        />
      </>
    )
  }
}

export default withRouter(InventoryWarehouse)
