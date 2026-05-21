import { Col, Dropdown, Input, Menu, Modal, Row, Select, Table } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'

import { AppComponentListBase } from '../../../components/AppComponentBase'

import DataTable from '../../../components/DataTable'
import { L, LNotification, isGrantedAny } from '../../../lib/abpUtility'
import BuildingDirectoryStore from '../../../stores/communication/buildingDirectoryStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppConst, { appPermissions } from '../../../lib/appconst'
import ProjectStore from '../../../stores/project/projectStore'
import { BuildingDirectoryModal } from '@scenes/communication/buildingDirectory/components/BuildingDirectoryModal'
import {
  BuildingDirectoryModel,
  IBuildingDirectoryModel
} from '@models/communication/buildingDirectory/BuildingDirectoryModel'
import debounce from 'lodash/debounce'
import getColumns from './columns'
import NoRole from '@components/ComponentNoRole'

const { activeStatus } = AppConst

export interface IBuildingDirectoryProps {
  routedata?: any
  buildingDirectoryStore: BuildingDirectoryStore
  projectStore: ProjectStore
}

export interface IBuildingDirectoryState {
  maxResultCount: number
  skipCount: number
  filters: any
  visible: boolean
  selectedItem: IBuildingDirectoryModel
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.BuildingDirectoryStore, Stores.ProjectStore)
@observer
class BuildingDirectory extends AppComponentListBase<IBuildingDirectoryProps, IBuildingDirectoryState> {
  state = {
    maxResultCount: 10,
    skipCount: 0,
    filters: { isActive: 'true' },
    visible: false,
    selectedItem: new BuildingDirectoryModel()
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    await Promise.all([this.getAll()])
  }

  getAll = async () => {
    await this.props.buildingDirectoryStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  onShowAddModal = async () => {
    this.setState({ visible: true }, async () => {
      await this.props.buildingDirectoryStore.createBuildingDirectory()
      this.setState({
        selectedItem: this.props.buildingDirectoryStore.editBuildingDirectory
      })
    })
  }

  onCancelAddEditModal = () => {
    this.setState({
      visible: false,
      selectedItem: {} as IBuildingDirectoryModel
    })
  }

  findProjects = async (keyword) => {
    await this.props.projectStore.filterOptions({ keyword })
  }

  activateOrDeactivate = async (id: number, isActive) => {
    const self = this
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.buildingDirectoryStore.activateOrDeactivate(id, isActive)
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

  onCreateOrUpdate = async (buildingDirectory: any) => {
    const { buildingDirectoryStore } = this.props
    const { editBuildingDirectory } = buildingDirectoryStore
    if (buildingDirectory.id) {
      await buildingDirectoryStore.update({
        ...editBuildingDirectory,
        ...buildingDirectory
      })
    } else {
      await buildingDirectoryStore.create(buildingDirectory)
    }

    await this.getAll()
  }

  onEdit = async (id) => {
    this.setState({ visible: true }, async () => {
      await this.props.buildingDirectoryStore.get(id)
      this.setState({
        selectedItem: this.props.buildingDirectoryStore.editBuildingDirectory
      })
    })
  }

  public render() {
    const {
      buildingDirectoryStore: { buildingDirectories }
    } = this.props
    const { visible, filters } = this.state
    const columns = getColumns({
      title: L('DISPLAY_NAME'),
      dataIndex: 'displayName',
      key: 'displayName',
      width: '17%',
      ellipsis: true,
      render: (displayName: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 20, offset: 0 }} className="col-info">
            <a
              onClick={() => this.isGranted(appPermissions.buildingDirectory.detail) && this.onEdit(item.id)}
              className="link-text-table">
              {displayName}
            </a>
          </Col>
          <Col sm={{ span: 4, offset: 0 }}>
            {isGrantedAny(appPermissions.buildingDirectory.delete) && (
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {this.isGranted(appPermissions.buildingDirectory.delete) && (
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
    const keywordPlaceholder = `${this.L('DISPLAY_NAME')}, ${this.L('EMAIL_ADDRESS')}, ${this.L('PHONE_NUMBER')}`
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            maxLength={200}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            placeholder={keywordPlaceholder}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
          <Select
            style={{ width: '100%' }}
            defaultValue={filters.isActive}
            onChange={(value) => this.handleSearch('isActive', value)}>
            {this.renderOptions(activeStatus)}
          </Select>
        </Col>
      </Row>
    )

    return this.isGranted(appPermissions.buildingDirectory.page) ? (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          title={this.L('BUILDING_DIRECTORY_LIST')}
          onCreate={() => this.onShowAddModal()}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: buildingDirectories === undefined ? 0 : buildingDirectories.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.buildingDirectory.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={this.props.buildingDirectoryStore.isLoading}
            dataSource={buildingDirectories === undefined ? [] : buildingDirectories.items}
            scroll={{ x: 768, scrollToFirstRowOnChange: true }}
          />
        </DataTable>

        <BuildingDirectoryModal
          visible={visible}
          loading={this.props.buildingDirectoryStore.isLoading}
          handleOK={this.onCreateOrUpdate}
          onClose={this.onCancelAddEditModal}
          handleCancel={this.onCancelAddEditModal}
          projectOptions={this.props.projectStore.projectOptions}
          renderOptions={this.renderOptions}
          data={this.state.selectedItem}
        />
      </>
    ) : (
      <NoRole />
    )
  }
}

export default BuildingDirectory
