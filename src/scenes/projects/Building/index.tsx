import { Col, Input, Modal, Row, Table, Select, Dropdown, Menu } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'

import AppComponentBase from '../../../components/AppComponentBase'
import DataTable from '../../../components/DataTable'
import BuildingFormModal from './components/buildingFormModal'
import { L, LNotification, isGrantedAny } from '../../../lib/abpUtility'
import BuildingStore from '../../../stores/project/buildingStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppConst, { appPermissions } from '../../../lib/appconst'
import ProjectStore from '../../../stores/project/projectStore'
import debounce from 'lodash/debounce'
import getColumns from './columns'
import NoRole from '@components/ComponentNoRole'

const { activeStatus } = AppConst

export interface IBuildingsProps {
  buildingStore: BuildingStore
  projectStore: ProjectStore
  projectId?: number
}

export interface IBuildingsState {
  modalVisible: boolean
  maxResultCount: number
  currentPage: number
  skipCount: number
  buildingId?: number
  filters: any
  dataSend: any
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.BuildingStore)
@inject(Stores.ProjectStore)
@observer
class BuildingsComponent extends AppComponentBase<IBuildingsProps, IBuildingsState> {
  state = {
    modalVisible: false,
    maxResultCount: 10,
    currentPage: 1,
    skipCount: 0,
    buildingId: 0,
    filters: { projectId: this.props.projectId || undefined, isActive: 'true' },
    dataSend: undefined
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.building.page) && (await this.getAll())
  }

  getAll = async () => {
    await this.props.buildingStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  findProjects = async (keyword) => {
    await this.props.projectStore.filterOptions({ keyword })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  Modal = () => {
    this.setState({
      modalVisible: !this.state.modalVisible
    })
  }

  createOrUpdateModalOpen = async (id?: number) => {
    if (!id) {
      this.setState({ dataSend: null })
    } else {
      this.setState({ dataSend: id })
    }

    this.Modal()
  }

  activateOrDeactivate = async (id: number, isActive) => {
    const self = this
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.buildingStore.activateOrDeactivate(id, isActive)
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
    this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => await this.getAll())
  }

  public render() {
    const {
      buildingStore: { buildings },
      projectId
    } = this.props
    const { filters } = this.state
    const columns = getColumns({
      title: L('BUILDING_NAME'),
      dataIndex: 'name',
      key: 'name',
      width: '15%',
      ellipsis: true,
      render: (name: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 20, offset: 0 }} className="col-info">
            <a
              onClick={() => this.isGranted(appPermissions.building.detail) && this.createOrUpdateModalOpen(item.id)}
              className="link-text-table">
              {name}
            </a>
          </Col>
          <Col sm={{ span: 4, offset: 0 }}>
            {isGrantedAny(appPermissions.building.delete) && (
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {this.isGranted(appPermissions.building.delete) && (
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

    const keywordPlaceHolder = `${this.L('BUILDING_NAME')}, ${this.L('BUILDING_CODE')}`
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
          <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
          <Select
            defaultValue={filters.isActive}
            onChange={(value) => this.handleSearch('isActive', value)}
            style={{ width: '100%' }}>
            {this.renderOptions(activeStatus)}
          </Select>
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.building.page) ? (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          title={this.L('BUILDING_LIST')}
          onCreate={this.createOrUpdateModalOpen}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: buildings === undefined ? 0 : buildings.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.building.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            loading={this.props.buildingStore.isLoading}
            dataSource={buildings === undefined ? [] : buildings.items}
            pagination={false}
            scroll={{ x: 1000, y: 500, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
        <BuildingFormModal
          buildingStore={this.props.buildingStore}
          projectStore={this.props.projectStore}
          visible={this.state.modalVisible}
          dataSend={this.state.dataSend}
          onCancel={() =>
            this.setState({
              modalVisible: false
            })
          }
          hideProject={!!projectId}
        />
      </>
    ) : (
      <NoRole />
    )
  }
}

export default BuildingsComponent
