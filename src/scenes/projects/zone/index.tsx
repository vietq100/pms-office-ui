import * as React from 'react'

import { Col, Dropdown, Input, Menu, Modal, Row, Table, Select } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'
import { AppComponentListBase } from '../../../components/AppComponentBase'
import DataTable from '../../../components/DataTable'
import { L, LNotification, isGrantedAny } from '../../../lib/abpUtility'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppConst, { appPermissions } from '../../../lib/appconst'
import debounce from 'lodash/debounce'
import getColumns from './columns'
import withRouter from '@components/Layout/Router/withRouter'
import NoRole from '@components/ComponentNoRole'
import ZoneStore from '@stores/project/zoneStore'
import ZoneFormModal from './components/ZoneModal'
import ProjectStore from '@stores/project/projectStore'
import UnitStore from '@stores/project/unitStore'

const { activeStatus } = AppConst

export interface IUnitsProps {
  navigate: any
  params: any
  zoneStore: ZoneStore
  projectStore: ProjectStore
  unitStore: UnitStore
}

export interface IUnitsState {
  maxResultCount: number
  skipCount: number
  filters: any
  isShowDetail: boolean
  idDetail?: number
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.ZoneStore, Stores.ProjectStore, Stores.UnitStore)
@observer
class Zones extends AppComponentListBase<IUnitsProps, IUnitsState> {
  formRef: any = React.createRef()

  state = {
    maxResultCount: 10,
    skipCount: 0,
    unitId: 0,
    filters: { isActive: 'true' },
    isShowDetail: false,
    idDetail: undefined
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.unit.page) && (await Promise.all([this.getAll(), this.findBuildings()]))
  }

  findBuildings = async (keyword?) => {
    await this.props.projectStore.filterBuildingOptions({ keyword })
  }

  getAll = async () => {
    await this.props.zoneStore.getAll({
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
        await self.props.zoneStore.activateOrDeactivate(id, isActive)
        self.handleTableChange({ current: 1 })
      }
    })
  }
  findUnits = async (keyword, buildingId?: number) => {
    await this.props.unitStore.getAll({ keyword, buildingId: buildingId })
  }
  updateSearch = debounce((name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value } })
  }, 100)

  handleSearch = (name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => {
      if (name === 'buildingId') {
        this.findUnits('', value)
      }
      await this.getAll()
    })
  }

  gotoDetail = (id?: number) => {
    if (id) {
      this.setState({ idDetail: id })
    } else {
      this.setState({ idDetail: undefined })
    }
    this.setState({ isShowDetail: true })
  }

  onCloseModal = (isReload: boolean) => {
    this.setState({ idDetail: undefined })
    this.setState({ isShowDetail: false })
    if (isReload) {
      this.getAll()
    }
  }

  public render() {
    const {
      zoneStore: { zones },
      projectStore: { buildingOptions },
      unitStore: { units }
    } = this.props
    const { filters } = this.state
    const columns = getColumns({
      title: L('ZONE_ZONE_NAME'),
      dataIndex: 'zoneName',
      key: 'zoneName',
      width: '18%',
      render: (zoneName: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 20, offset: 0 }} className="col-info">
            <a
              onClick={() => this.isGranted(appPermissions.unit.detail) && this.gotoDetail(item.id)}
              className="link-text-table">
              {zoneName}
            </a>
          </Col>
          <Col sm={{ span: 4, offset: 0 }}>
            {isGrantedAny(appPermissions.unit.delete) && (
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {this.isGranted(appPermissions.unit.delete) && (
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
            )}
          </Col>
        </Row>
      )
    })

    const keywordPlaceHolder = `${this.L('UNIT_FULL_CODE')}`
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            maxLength={200}
            placeholder={keywordPlaceHolder}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_BUILDING')}</label>
          <Select
            showSearch
            allowClear
            filterOption={false}
            className="full-width"
            onSearch={this.findBuildings}
            onChange={(value) => this.handleSearch('buildingId', value)}>
            {this.renderOptions(buildingOptions)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_UNIT')}</label>
          <Select
            showSearch
            allowClear
            filterOption={false}
            onSearch={this.findUnits}
            onChange={(value) => this.handleSearch('UnitId', value)}
            style={{ width: '100%' }}>
            {units?.items.map((pfStore) => (
              <Select.Option value={`${pfStore.id}`} key={pfStore.id}>
                {pfStore.fullUnitCode} <span className="text-muted small">({pfStore.name})</span>
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
          <Select
            allowClear
            defaultValue={filters.isActive}
            onChange={(value) => this.handleSearch('isActive', value)}
            style={{ width: '100%' }}>
            {this.renderOptions(activeStatus)}
          </Select>
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.unit.page) ? (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          title={this.L('UNIT_LIST')}
          onCreate={this.gotoDetail}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: zones === undefined ? 0 : zones.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.unit.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={this.props.zoneStore.isLoading}
            dataSource={zones === undefined ? [] : zones.items}
            scroll={{ x: 1000, y: 500, scrollToFirstRowOnChange: true }}
          />
        </DataTable>

        <ZoneFormModal
          idDetail={this.state.idDetail}
          zoneStore={this.props.zoneStore}
          visible={this.state.isShowDetail}
          onCancel={this.onCloseModal}
        />
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(Zones)
