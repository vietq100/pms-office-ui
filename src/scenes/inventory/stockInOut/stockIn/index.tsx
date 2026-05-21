import find from 'lodash/find'
import { Col, Input, Row, Table, Select, Modal, DatePicker, Button } from 'antd'
import { AppComponentListBase } from '@components/AppComponentBase'

import DataTable from '@components/DataTable'
import { L, LNotification } from '@lib/abpUtility'
import InventoryStockInOutStore from '@stores/inventory/inventoryStockInOutStore'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import AppConst, { appPermissions, dateFormat } from '@lib/appconst'
import ProjectStore from '@stores/project/projectStore'
import { convertFilterDate, filterOptions, notifySuccess } from '@lib/helper'
import { IInventoryStockTypes } from '@models/Inventory/InventoryItemModel'
import debounce from 'lodash/debounce'
import getColumns from './columns'
import InventoryCategoryStore from '@stores/inventory/inventoryCategoryStore'
import withRouter from '@components/Layout/Router/withRouter'
import { ExcelIcon } from '@components/Icon'

export interface IInventoryProps {
  navigate: any
  routedata?: any
  inventoryStockInOutStore: InventoryStockInOutStore
  inventoryCategoryStore: InventoryCategoryStore
  projectStore: ProjectStore
}

export interface IInventoryState {
  currentPage: number
  maxResultCount: number
  skipCount: number
  filters: any
  selectedItem: any
}

const Search = Input.Search
const confirm = Modal.confirm

@inject(Stores.InventoryStockInOutStore, Stores.ProjectStore, Stores.InventoryCategoryStore)
@observer
class StockIn extends AppComponentListBase<IInventoryProps, IInventoryState> {
  constructor(props) {
    super(props)
    const defaultStatus = find(AppConst.activeStatus, { value: 'true' }) || ({} as any)
    this.state = {
      currentPage: 1,
      maxResultCount: 10,
      skipCount: 0,
      selectedItem: {},

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
    await Promise.all([this.props.inventoryCategoryStore.filterOptions({}), this.getAll()])
  }

  getAll = async () => {
    await this.props.inventoryStockInOutStore.getAll(IInventoryStockTypes.stockIn, {
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  activateOrDeactivate = async (id: number, isActive: boolean) => {
    const self = this
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.inventoryStockInOutStore.activateOrDeactivate(id, isActive)
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
  }

  handleExportExcel = async () => {
    await this.props.inventoryStockInOutStore.exportExcelStockIn({
      ...this.state.filters
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

  public render() {
    const {
      inventoryCategoryStore: { inventoryCategoryOptions }
    } = this.props

    const {
      inventoryStockInOutStore: { inventories }
    } = this.props
    const columns = getColumns(this)
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col
          sm={{
            span: 6,
            offset: 0
          }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            maxLength={200}
            placeholder={L('INVENTORY_LIST_STOCK_IN_OUT_KEYWORD_SEARCH')}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>
        <Col
          sm={{
            span: 5,
            offset: 0
          }}>
          <label>{this.L('INVENTORY_CATEGORY')}</label>
          <Select
            showSearch
            allowClear
            className="full-width"
            mode="multiple"
            filterOption={filterOptions}
            onChange={(value) => this.handleSearch('categoryIds', value)}>
            {inventoryCategoryOptions.map((cat, index) => (
              <Select.OptGroup label={cat.label} key={`main-cat-${index}`}>
                {cat.childs.map((sub) => (
                  <Select.Option key={`sub-cat-${sub.id}`} value={sub.value}>
                    {sub.label}
                  </Select.Option>
                ))}
              </Select.OptGroup>
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
          extraFilterComponent={filterComponent}
          actionGroups={renderActionGroups}
          onRefresh={this.getAll}
          title={this.L('INVENTORY_STOCK_IN_LIST')}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
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
            loading={this.props.inventoryStockInOutStore.isLoading}
            dataSource={inventories.items}
            scroll={{ x: 1000, y: 500, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
      </>
    )
  }
}

export default withRouter(StockIn)
