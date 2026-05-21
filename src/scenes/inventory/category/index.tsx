import find from 'lodash/find'
import filter from 'lodash/filter'
import { inject, observer } from 'mobx-react'

import { AppComponentListBase } from '@components/AppComponentBase'
import { Col, Input, Modal, Row, Table, Select, Dropdown, Menu } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'

import { InventoryModel } from '@models/Inventory'
// import Filter from '@components/Filter'
import DataTable from '@components/DataTable'
import { L, LNotification } from '@lib/abpUtility'
import InventoryCategoryStore from '@stores/inventory/inventoryCategoryStore'
import Stores from '@stores/storeIdentifier'
import AppConst, { appPermissions } from '@lib/appconst'
import ProjectStore from '@stores/project/projectStore'
import { portalLayouts } from '@components/Layout/Router/router.config'
import { InventoryCategoryModal } from './components/InventoryCategoryModal'
import debounce from 'lodash/debounce'
import getColumns from './columns'
import withRouter from '@components/Layout/Router/withRouter'
import { notifySuccess } from '@lib/helper'

export interface IInventoryProps {
  navigate: any
  routedata?: any
  inventoryCategoryStore: InventoryCategoryStore
  projectStore: ProjectStore
}

export interface IInventoryState {
  currentPage: number
  maxResultCount: number
  skipCount: number
  filters: any
  modalVisible: boolean
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.InventoryCategoryStore, Stores.ProjectStore)
@observer
class InventoryCategory extends AppComponentListBase<IInventoryProps, IInventoryState> {
  constructor(props) {
    super(props)
    const defaultStatus = find(AppConst.activeStatus, { value: 'true' }) || ({} as any)
    this.state = {
      currentPage: 1,
      maxResultCount: 10,
      skipCount: 0,
      modalVisible: false,
      filters: {
        keyword: '',
        projectIds: undefined,
        isActive: defaultStatus.value
      }
    }
  }
  // formRef: any = React.createRef()
  async componentDidMount() {
    await this.getAll()
  }

  getAll = async () => {
    await this.props.inventoryCategoryStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      isIncludeParentNotChild: true,
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

  activateOrDeactivate = async (item, isActive) => {
    console.log(item)
    const self = this
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        const body = {
          id: item?.id,
          isActive: isActive,
          childIds: item?.childs?.map((child) => child.id) || []
        }

        await self.props.inventoryCategoryStore.activateOrDeactivateV2(body)
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

  createOrUpdateModalOpen = async (inventoryCategory?: InventoryModel) => {
    if (!inventoryCategory) {
      await this.props.inventoryCategoryStore.createInventoryCategory()
    } else {
      await this.props.inventoryCategoryStore.edit(inventoryCategory)
    }

    this.Modal()
  }

  onCreateOrUpdate = async (formValues) => {
    // const form = this.formRef.current

    if (!this.props.inventoryCategoryStore.editInventoryCategory?.id) {
      await this.props.inventoryCategoryStore.create(formValues)
    } else {
      await this.props.inventoryCategoryStore.update({
        ...this.props.inventoryCategoryStore.editInventoryCategory,
        ...formValues
      })
    }

    await this.getAll()
    this.setState({ modalVisible: false })
    // form.resetFields()
  }

  gotoDetail = (id: number) => {
    const { navigate } = this.props
    return navigate(portalLayouts.inventoryCategoryDetail.path.replace(':id', id))
  }

  public render() {
    const {
      inventoryCategoryStore: { inventories }
    } = this.props
    const columns = getColumns({
      title: L('NAME'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: '25%',
      render: (name: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <div
              className="full-name text-truncate text-link-to-detail"
              onClick={() => this.isGranted(appPermissions.inventory.detail) && this.gotoDetail(item.id)}>
              <a className="link-text-table"> {name}</a>
            </div>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {this.isGranted(appPermissions.inventory.delete) && (
                    <Menu.Item onClick={() => this.activateOrDeactivate(item, !item.isActive)}>
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
            placeholder={L('INVENTORY_TYPE_LIST_KEYWORD_SEARCH')}
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
          onRefresh={this.getAll}
          extraFilterComponent={filterComponent}
          title={this.L('INVENTORY_CATEGORY_LIST')}
          onCreate={() => this.createOrUpdateModalOpen()}
          pagination={{
            pageSize: this.state.maxResultCount,
            total: inventories === undefined ? 0 : inventories.totalCount,
            current: this.state.currentPage,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.inventory.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={this.props.inventoryCategoryStore.isLoading}
            dataSource={filterInventories}
            scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
          />
        </DataTable>

        <InventoryCategoryModal
          inventoryCategoryStore={this.props.inventoryCategoryStore}
          visible={this.state.modalVisible}
          onCreate={this.onCreateOrUpdate}
          onClose={() => this.createOrUpdateModalOpen()}
          onCancel={() =>
            this.setState({
              modalVisible: false
            })
          }
        />
      </>
    )
  }
}

export default withRouter(InventoryCategory)
