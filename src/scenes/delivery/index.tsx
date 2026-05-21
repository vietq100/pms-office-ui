import * as React from 'react'

import { Col, Input, Modal, Row, Table, Select, Dropdown, Menu } from 'antd'

import { AppComponentListBase } from '../../components/AppComponentBase'
import DataTable from '../../components/DataTable'
import { L, LNotification } from '../../lib/abpUtility'
import { inject, observer } from 'mobx-react'
import Stores from '../../stores/storeIdentifier'
import AppConst, { appPermissions } from '../../lib/appconst'
import ProjectStore from '../../stores/project/projectStore'
import { portalLayouts } from '../../components/Layout/Router/router.config'
import { EllipsisOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons/lib'
import getColumns from './columns'
import debounce from 'lodash/debounce'
import withRouter from '@components/Layout/Router/withRouter'
import DeliveryStore from '@stores/delivery/deliveryStore'
import UnitStore from '@stores/project/unitStore'
import AppConsts from '../../lib/appconst'
import { filterOptions } from '@lib/helper'

const { pageSize } = AppConsts
export interface IDeliveryProps {
  navigate: any
  deliveryStore: DeliveryStore
  projectStore: ProjectStore
  unitStore: UnitStore
}

export interface IDeliveryState {
  maxResultCount: number
  skipCount: number
  listStatus: any[]
  filters: any
}

const confirm = Modal.confirm
const Search = Input.Search
const { activeStatus } = AppConst

@inject(Stores.DeliveryStore, Stores.ProjectStore, Stores.UnitStore)
@observer
class Deliveries extends AppComponentListBase<IDeliveryProps, IDeliveryState> {
  formRef: any = React.createRef()

  state = {
    maxResultCount: pageSize.pageSize_10,
    skipCount: 0,
    listStatus: [],
    listTypes: [],
    filters: {
      status: undefined,
      unitIds: undefined,
      types: undefined,
      isActive: 'true'
    }
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    await Promise.all([
      await this.props.deliveryStore.getListStatus({}),
      await this.props.deliveryStore.getListTypes({}),
      this.findUnits(''),
      this.getAll()
    ])
  }

  getAll = async () => {
    await this.props.deliveryStore.getAll({
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
        await self.props.deliveryStore.activateOrDeactivate(id, isActive)
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
      await this.getAll()
    })
  }
  findUnits = async (keyword) => {
    const {
      filters: { unitIds }
    } = this.state
    if (!unitIds) {
      this.setState({ filters: { ...this.state.filters, unitIds: undefined } })
    }

    await this.props.unitStore.getAll({ keyword, unitIds: unitIds })
  }
  gotoDetail = (id?) => {
    const { navigate } = this.props
    id ? navigate(portalLayouts.deliveryDetail.path.replace(':id', id)) : navigate(portalLayouts.deliveryCreate.path)
  }

  public render() {
    const {
      deliveryStore: { pagedResult, listStatus, listTypes },

      unitStore: { units }
    } = this.props
    const { filters } = this.state
    const columns = getColumns({
      title: L('UNIT_RECEIVER'),
      dataIndex: 'unitId',
      key: 'unitId',

      width: '15%',
      render: (unitId: string, item: any) => (
        <Row>
          <Col sm={{ span: 21, offset: 0 }}>
            <a
              onClick={this.isGranted(appPermissions.delivery.detail) ? () => this.gotoDetail(item.id) : undefined}
              className="link-text-table">
              {item.unit?.name}
            </a>
            <br />
            <div className="text-truncate">
              <div className="text-muted small">
                <UserOutlined className="mr-1" />
                {item.user.displayName}
              </div>
              <div className="text-muted small">
                <PhoneOutlined className="mr-1" />
                {item.user.phoneNumber || 'N/A'}
              </div>
            </div>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {this.isGranted(appPermissions.delivery.delete) && (
                    <Menu.Item onClick={() => this.activateOrDeactivate(item.id, !item.isActive)}>
                      {L(item.isActive ? 'BTN_DEACTIVATE' : 'BTN_ACTIVATE')}
                    </Menu.Item>
                  )}
                  {/* {this.isGranted(appPermissions.delivery.update) &&
                    (item.statusId === 1 || item.statusId === 2) && (
                      <Menu.Item
                      // onClick={() =>
                      //   this.activateOrDeactivate(item.id, !item.isActive)
                      // }
                      >
                        {L('BTN_RECEIVED')}
                      </Menu.Item>
                    )} */}
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
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            placeholder={L('PLACEHOLDER_DELIVERY')}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>

        <Col sm={{ span: 5, offset: 0 }}>
          <label>{this.L('FILTER_STATUS')}</label>
          <Select
            allowClear
            showArrow
            mode="multiple"
            filterOption={filterOptions}
            onChange={(value) => this.handleSearch('StatusIds', value)}
            value={filters.status}
            style={{ width: '100%' }}>
            {this.renderOptions(listStatus)}
          </Select>
        </Col>
        <Col sm={{ span: 5, offset: 0 }}>
          <label>{this.L('FILTER_UNIT')}</label>
          <Select
            showSearch
            allowClear
            filterOption={false}
            className="full-width"
            onSearch={this.findUnits}
            value={filters.unitIds}
            onChange={(value) => this.handleSearch('UnitId', value)}>
            {units?.items.map((pfStore) => (
              <Select.Option value={`${pfStore.id}`} key={pfStore.id}>
                {pfStore.fullUnitCode} {/* <span className="text-muted small">({pfStore.name})</span> */}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col sm={{ span: 4, offset: 0 }}>
          <label>{this.L('DELIVERY_TYPE')}</label>
          <Select
            allowClear
            showArrow
            filterOption={filterOptions}
            mode="multiple"
            onChange={(value) => this.handleSearch('TypeIds', value)}
            value={filters.types}
            style={{ width: '100%' }}>
            {this.renderOptions(listTypes)}
          </Select>
        </Col>
        <Col sm={{ span: 4, offset: 0 }}>
          <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
          <Select
            value={filters.isActive}
            onChange={(value) => this.handleSearch('isActive', value)}
            style={{ width: '100%' }}>
            {this.renderOptions(activeStatus)}
          </Select>
        </Col>
      </Row>
    )
    return (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          title={this.L('DELIVERY_LIST')}
          onCreate={this.gotoDetail}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: pagedResult === undefined ? 0 : pagedResult.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.delivery.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            columns={columns}
            scroll={{ x: 1000, y: 550, scrollToFirstRowOnChange: true }}
            pagination={false}
            loading={this.props.deliveryStore.isLoading}
            dataSource={pagedResult === undefined ? [] : pagedResult.items}
          />
        </DataTable>
      </>
    )
  }
}

export default withRouter(Deliveries)
