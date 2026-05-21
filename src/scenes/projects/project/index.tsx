import * as React from 'react'

import { Col, Input, Modal, Row, Table, Select, Dropdown, Menu } from 'antd'
import { BarcodeOutlined, EllipsisOutlined, PhoneOutlined } from '@ant-design/icons'

import { AppComponentListBase } from '../../../components/AppComponentBase'
import DataTable from '../../../components/DataTable'
import { portalLayouts } from '../../../components/Layout/Router/router.config'
import { L, LNotification, isGrantedAny } from '../../../lib/abpUtility'
import ProjectStore from '../../../stores/project/projectStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppConst, { appPermissions } from '../../../lib/appconst'
import debounce from 'lodash/debounce'
import getColumns from './columns'
import withRouter from '@components/Layout/Router/withRouter'
import { formatNumber } from '@lib/helper'
import NoRole from '@components/ComponentNoRole'

const { activeStatus } = AppConst

export interface IProjectsProps {
  navigate: any
  params: any
  projectStore: ProjectStore
}

export interface IProjectsState {
  modalVisible: boolean
  maxResultCount: number
  skipCount: number
  projectId?: number
  filters: any
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.ProjectStore)
@observer
class Projects extends AppComponentListBase<IProjectsProps, IProjectsState> {
  formRef: any = React.createRef()

  state = {
    modalVisible: false,
    maxResultCount: 10,
    skipCount: 0,
    projectId: 0,
    filters: { isActive: 'true' }
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.project.page) && (await this.getAll())
  }

  getAll = async () => {
    await this.props.projectStore?.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
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

  activateOrDeactivate = async (id: number, isActive) => {
    const self = this
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.projectStore.activateOrDeactivate(id, isActive)
        self.handleTableChange({ current: 1 })
      }
    })
  }

  defaultOrNotDefault = async (id: number, isDefault) => {
    const self = this
    confirm({
      title: LNotification(
        isDefault ? 'DO_YOU_WANT_TO_MAKE_THIS_ITEM_DEFAULT' : 'DO_YOU_WANT_TO_MAKE_THIS_ITEM_NOT_DEFAULT'
      ),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.projectStore.defaultOrNotDefault(id, isDefault)
        self.handleTableChange({ current: 1 })
      }
    })
  }

  handleCreate = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (this.state.projectId === 0) {
        await this.props.projectStore.create(values)
      } else {
        await this.props.projectStore.update({
          id: this.state.projectId,
          ...values
        })
      }

      await this.getAll()
      this.setState({ modalVisible: false })
      form.resetFields()
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

  gotoDetail = (id) => {
    const { navigate } = this.props
    id ? navigate(portalLayouts.projectDetail.path.replace(':id', id)) : navigate(portalLayouts.projectCreate.path)
  }

  public render() {
    const {
      projectStore: { projects }
    } = this.props

    const { filters } = this.state
    const columns = getColumns({
      title: L('PROJECT_PROJECT_NAME'),
      dataIndex: 'name',
      key: 'name',
      width: '18%',
      ellipsis: true,
      render: (name: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <a
              onClick={() => this.isGranted(appPermissions.project.detail) && this.gotoDetail(item.id)}
              className="link-text-table">
              {name}
            </a>

            <div className="text-muted small">
              <div className="text-truncate">
                <BarcodeOutlined className="mr-1" /> {item.code}
              </div>
              <div className="text-truncate">
                <PhoneOutlined className="mr-1" /> {item.hotline || 'N/A'}
              </div>
              <div className="text-truncate">
                {L('PROJECT_BUILDING')}: {formatNumber(item.buildingCount)}
              </div>
              <div className="text-truncate">
                {L('PROJECT_UNIT')}: {formatNumber(item.unitCount)}
              </div>
            </div>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            {isGrantedAny(appPermissions.project.delete) && (
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {this.isGranted(appPermissions.project.delete) && (
                      <>
                        <Menu.Item onClick={() => this.activateOrDeactivate(item.id, !item.isActive)}>
                          {L(item.isActive ? 'BTN_DEACTIVATE' : 'BTN_ACTIVATE')}
                        </Menu.Item>
                        <Menu.Item onClick={() => this.defaultOrNotDefault(item.id, !item.isDefault)}>
                          {L(item.isDefault ? 'ISN_DEFAULT' : 'IS_DEFAULT')}
                        </Menu.Item>
                      </>
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
    const keywordPlaceHolder = `${this.L('PROJECT_PROJECT_NAME')}, ${this.L('PROJECT_PROJECT_CODE')}`
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
    return this.isGranted(appPermissions.project.page) ? (
      <>
        <DataTable
          onRefresh={this.getAll}
          extraFilterComponent={filterComponent}
          title={this.L('PROJECT_LIST')}
          onCreate={() => this.gotoDetail(null)}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: projects === undefined ? 0 : projects.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.project.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id.toString()}
            columns={columns}
            loading={this.props.projectStore.isLoading}
            dataSource={projects === undefined ? [] : projects.items}
            pagination={false}
            scroll={{ x: 1000, y: 580, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(Projects)
