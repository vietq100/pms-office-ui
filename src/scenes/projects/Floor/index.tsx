import * as React from 'react'

import { Col, Input, Modal, Row, Table, Select, Dropdown, Menu } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'

import { AppComponentListBase } from '../../../components/AppComponentBase'
import DataTable from '../../../components/DataTable'
import FloorFormModal from './components/floorFormModal'
import { L, LNotification, isGrantedAny } from '../../../lib/abpUtility'
import FloorStore from '../../../stores/project/floorStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppConst, { appPermissions } from '../../../lib/appconst'
import ProjectStore from '../../../stores/project/projectStore'
import debounce from 'lodash/debounce'
import getColumns from './columns'
import NoRole from '@components/ComponentNoRole'
const { activeStatus } = AppConst

export interface IFloorsProps {
  floorStore: FloorStore
  projectStore: ProjectStore
}

export interface IFloorsState {
  modalVisible: boolean
  maxResultCount: number
  skipCount: number
  floorId?: number
  filters: any
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.FloorStore)
@inject(Stores.ProjectStore)
@observer
class Floors extends AppComponentListBase<IFloorsProps, IFloorsState> {
  formRef: any = React.createRef()

  state = {
    modalVisible: false,
    maxResultCount: 10,
    skipCount: 0,
    floorId: 0,
    filters: { projectId: undefined, buildingId: undefined, isActive: 'true' }
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.floor.page) && (await Promise.all([this.getAll(), this.findBuildings('')]))
  }

  getAll = async () => {
    await this.props.floorStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  findBuildings = async (keyword) => {
    this.props.projectStore.filterBuildingOptions({
      keyword
    })
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
      const { filters } = this.state
      await this.props.floorStore.createFloor(filters.projectId, filters.buildingId)
    } else {
      await this.props.floorStore.get(id)
    }

    this.setState({ floorId: id, modalVisible: true })

    this.formRef.current.setFieldsValue(this.props.floorStore.editFloor)
  }

  activateOrDeactivate = async (id: number, isActive) => {
    const self = this
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.floorStore.activateOrDeactivate(id, isActive)
        self.handleTableChange({ current: 1 })
      }
    })
  }

  handleCreate = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (this.props.floorStore.editFloor?.id) {
        await this.props.floorStore.update({
          ...this.props.floorStore.editFloor,
          ...values
        })
      } else {
        await this.props.floorStore.create(values)
      }

      await this.getAll()
      this.setState({ modalVisible: false })
      form.resetFields()
    })
  }

  handleCancel = () => {
    const form = this.formRef.current
    form.resetFields()
    this.setState({ modalVisible: false })
  }

  updateSearch = debounce((name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value } })
  }, 100)

  handleSearch = (name, value) => {
    const isProjectChange = name === 'projectId'
    const { filters } = this.state
    this.setState(
      {
        filters: {
          ...filters,
          buildingId: isProjectChange && !value ? undefined : filters.buildingId,
          [name]: value
        },
        skipCount: 0
      },
      async () => {
        if (name === 'projectId') {
          this.findBuildings('')
        }
        await this.getAll()
      }
    )
  }

  public render() {
    const {
      floorStore: { floors },
      projectStore: { buildingOptions }
    } = this.props
    const { filters } = this.state
    const columns = getColumns({
      title: L('PROJECT_NAME'),
      dataIndex: 'project',
      ellipsis: true,
      width: '20%',
      render: (project, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 20, offset: 0 }} className="col-info">
            <a
              onClick={() => this.isGranted(appPermissions.floor.detail) && this.createOrUpdateModalOpen(item.id)}
              className="link-text-table">
              {project?.name}
            </a>
          </Col>
          <Col sm={{ span: 4, offset: 0 }}>
            {isGrantedAny(appPermissions.floor.delete) && (
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {this.isGranted(appPermissions.floor.delete) && (
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
    const keywordPlaceHolder = `${this.L('FLOOR_NAME')}, ${this.L('FLOOR_CODE')}`
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
          <label>{this.L('BUILDING')}</label>
          <Select
            showSearch
            allowClear
            filterOption={false}
            className="full-width"
            onSearch={this.findBuildings}
            value={filters.buildingId}
            onChange={(value) => this.handleSearch('buildingId', value)}>
            {this.renderOptions(buildingOptions)}
          </Select>
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
    return this.isGranted(appPermissions.floor.page) ? (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          title={this.L('FLOOR_LIST')}
          onCreate={this.createOrUpdateModalOpen}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: floors === undefined ? 0 : floors.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.floor.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={this.props.floorStore.isLoading}
            dataSource={floors === undefined ? [] : floors.items}
            scroll={{ x: 800, y: 500, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
        <FloorFormModal
          formRef={this.formRef}
          projectStore={this.props.projectStore}
          floorStore={this.props.floorStore}
          visible={this.state.modalVisible}
          isUpdateForm={this.state.floorId > 0}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
        />
      </>
    ) : (
      <NoRole />
    )
  }
}

export default Floors
