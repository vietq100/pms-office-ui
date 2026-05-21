import * as React from 'react'
import find from 'lodash/find'
import filter from 'lodash/filter'
import { InventoryModel } from '@models/Inventory'
import { EllipsisOutlined } from '@ant-design/icons'
import { Col, Input, Modal, Row, Table, Select, Dropdown, Menu } from 'antd'
import { AppComponentListBase } from '@components/AppComponentBase'
// import Filter from '@components/Filter'
import DataTable from '@components/DataTable'
import { L, LNotification } from '@lib/abpUtility'
import InventoryLocationStore from '@stores/inventory/inventoryLocationStore'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import AppConst, { appPermissions } from '@lib/appconst'
import ProjectStore from '@stores/project/projectStore'
import { InventoryLocationModal } from './components/InventoryLocationModal'
import debounce from 'lodash/debounce'
import getColumns from './columns'
import withRouter from '@components/Layout/Router/withRouter'

export interface IInventoryProps {
  navigate: any
  routedata?: any
  inventoryLocationStore: InventoryLocationStore
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

@inject(Stores.InventoryLocationStore, Stores.ProjectStore)
@observer
class InventoryLocation extends AppComponentListBase<IInventoryProps, IInventoryState> {
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
    await this.props.inventoryLocationStore.getAll({
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
        await self.props.inventoryLocationStore.activateOrDeactivate(id, isActive)
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

  Modal = () => {
    this.setState({
      modalVisible: !this.state.modalVisible
    })
  }

  createOrUpdateModalOpen = async (InventoryLocation?: InventoryModel) => {
    if (!InventoryLocation) {
      await this.props.inventoryLocationStore.createInventoryLocation()
    } else {
      await this.props.inventoryLocationStore.edit(InventoryLocation)
    }
    this.formRef.current?.setFieldsValue({
      ...this.props.inventoryLocationStore.editInventoryLocation
    })
    this.Modal()
  }

  onCreateOrUpdate = async () => {
    await this.getAll()
    this.setState({ modalVisible: false })
  }

  public render() {
    const {
      inventoryLocationStore: { inventories }
    } = this.props
    const columns = getColumns({
      title: L('INVENTORY_LOCATION_NAME'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: '15%',
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
            placeholder={L('INVENTORY_LOCATION_LIST_KEYWORD_SEARCH')}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>
        <Col sm={{ span: 8, offset: 0 }}>
          <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
          <Select onChange={this.onSelectStatus} style={{ width: '100%' }} value={selectedStatus}>
            {AppConst.activeStatus.map((status, index) => (
              <Select.Option key={index} value={status.value}>
                {L(status.label)}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
    )
    return (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          title={this.L('INVENTORY_LOCATION_LIST')}
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
            loading={this.props.inventoryLocationStore.isLoading}
            dataSource={filterInventories}
            scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
          />
        </DataTable>

        <InventoryLocationModal
          inventoryLocationStore={this.props.inventoryLocationStore}
          visible={this.state.modalVisible}
          onCreate={this.onCreateOrUpdate}
          onCancel={() =>
            this.setState({
              modalVisible: false
            })
          }
          id={this.props.inventoryLocationStore.editInventoryLocation.id}
        />
      </>
    )
  }
}

export default withRouter(InventoryLocation)
