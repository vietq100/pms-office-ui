import * as React from 'react'

import { Col, Input, Modal, Row, Table, Select, Dropdown, Menu, Avatar } from 'antd'

import { AppComponentListBase } from '../../../components/AppComponentBase'

import DataTable from '../../../components/DataTable'
import { L, LNotification, isGrantedAny } from '../../../lib/abpUtility'
import StaffStore from '../../../stores/member/staff/staffStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppConst, { appPermissions, moduleAvatar } from '../../../lib/appconst'
import { portalLayouts } from '../../../components/Layout/Router/router.config'
import ProjectStore from '../../../stores/project/projectStore'
import debounce from 'lodash/debounce'
import getColumns from './columns'
import OverViewBar from '@components/DataTable/OverViewBar'
import RoleStore from '@stores/administrator/roleStore'
import withRouter from '@components/Layout/Router/withRouter'
import ResetPasswordFormModal from '@components/Modals/ResetPassword'
import { EllipsisOutlined } from '@ant-design/icons'
import { getFirstLetterAndUpperCase } from '@lib/helper'
import NoRole from '@components/ComponentNoRole'

const { activeStatus, authorization } = AppConst

export interface IStaffsProps {
  staffStore: StaffStore
  projectStore: ProjectStore
  roleStore: RoleStore
  navigate: any
}

export interface IStaffsState {
  modalResetPasswordVisible: boolean
  modalVisible: boolean
  maxResultCount: number
  skipCount: number
  staffId?: number
  projects: any
  filters: any
}

const confirm = Modal.confirm
const Search = Input.Search
const { colorByLetter } = moduleAvatar
@inject(Stores.StaffStore, Stores.RoleStore, Stores.ProjectStore)
@observer
class Staffs extends AppComponentListBase<IStaffsProps, IStaffsState> {
  formRef: any = React.createRef()

  state = {
    modalResetPasswordVisible: false,
    modalVisible: false,
    maxResultCount: 10,
    skipCount: 0,
    staffId: 0,
    projects: [],
    filters: {
      projectId: undefined,
      buildingId: undefined,
      isActive: 'true',
      roleId: undefined
    },
    projectId: localStorage.getItem(authorization.projectId)
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.staff.page) &&
      (await Promise.all([this.props.roleStore.getAllRoles(), this.getAll()]))
  }

  getAll = async () => {
    await this.props.staffStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
    await this.props.staffStore.getOverview({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  findProjects = async (keyword) => {
    await this.props.projectStore.filterOptions({ keyword })
  }

  findBuildings = async (keyword) => {
    const { filters, projectId } = this.state
    if (!projectId) {
      this.props.projectStore.filterBuildingOptions({})
      this.setState({ filters: { ...filters, buildingId: undefined } })
      return
    }
    await this.props.projectStore.filterBuildingOptions({
      keyword,
      projectId
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
      await this.props.staffStore.createStaff()
    } else {
      await this.props.staffStore.get(id)
    }

    this.setState({ staffId: id })
    this.Modal()

    this.formRef.current.setFieldsValue({})
  }

  activateOrDeactivate = async (id: number, isActive) => {
    const self = this
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.staffStore.activateOrDeactivate(id, isActive)
        self.handleTableChange({ current: 1 })
      }
    })
  }

  gotoDetail = (id) => {
    const { navigate } = this.props
    id ? navigate(portalLayouts.staffDetail.path.replace(':id', id)) : navigate(portalLayouts.staffCreate.path)
  }

  handleCreate = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (this.state.staffId === 0) {
        await this.props.staffStore.create(values)
      } else {
        await this.props.staffStore.update({
          id: this.state.staffId,
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
    this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => {
      if (name === 'projectId') {
        this.findBuildings('')
      }
      await this.getAll()
    })
  }

  showChangePasswordModal = (id) => {
    this.setState({ staffId: id, modalResetPasswordVisible: true })
  }

  render() {
    const { filters } = this.state
    const keywordPlaceholder = `${this.L('STAFF_FULL_NAME')}, ${this.L('STAFF_EMAIL')}`
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            maxLength={200}
            placeholder={keywordPlaceholder}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
          <Select
            value={filters.isActive}
            onChange={(value) => this.handleSearch('isActive', value)}
            style={{ width: '100%' }}>
            {this.renderOptions(activeStatus)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_ROLES_STATUS')}</label>
          <Select
            allowClear
            value={filters.roleId}
            onChange={(value) => this.handleSearch('roleId', value)}
            style={{ width: '100%' }}>
            {this.renderOptions(this.props.roleStore.allRoles)}
          </Select>
        </Col>
      </Row>
    )
    const {
      staffStore: { staffs, isLoading }
    } = this.props

    const columns = getColumns({
      title: L('STAFF_FULL_NAME'),
      dataIndex: 'displayName',
      ellipsis: true,
      key: 'displayName',
      width: '20%',
      render: (text: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <div className="table-cell-profile">
              <div>
                <Avatar
                  src={item.profilePictureUrl}
                  style={{
                    background: colorByLetter(getFirstLetterAndUpperCase(text || 'G'))
                  }}>
                  {getFirstLetterAndUpperCase(text || 'G')}
                </Avatar>
              </div>
              <div className="info ml-2">
                <div
                  className="full-name text-truncate text-link-to-detail"
                  onClick={() => this.isGranted(appPermissions.staff.detail) && this.gotoDetail(item.id)}>
                  <a className="link-text-table"> {text}</a>
                </div>

                <div className="phone text-truncate text-muted">{item.userName}</div>
              </div>
            </div>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            {isGrantedAny(appPermissions.staff.update, appPermissions.staff.delete) && (
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {this.isGranted(appPermissions.staff.update) && (
                      <Menu.Item onClick={() => this.showChangePasswordModal(item.id)}>{L('RESET_PASSWORD')}</Menu.Item>
                    )}
                    {this.isGranted(appPermissions.staff.delete) && (
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

    return this.isGranted(appPermissions.staff.page) ? (
      <>
        <OverViewBar data={this.props.staffStore.staffOverview} />

        <DataTable
          extraFilterComponent={filterComponent}
          title={this.L('STAFF_LIST')}
          onCreate={() => this.gotoDetail(null)}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: staffs === undefined ? 0 : staffs.totalCount,
            onChange: this.handleTableChange
          }}
          onRefresh={this.getAll}
          createPermission={appPermissions.staff.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={isLoading}
            dataSource={staffs === undefined ? [] : staffs.items}
            scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
        <ResetPasswordFormModal
          visible={this.state.modalResetPasswordVisible}
          userId={this.state.staffId}
          onCancel={() =>
            this.setState({
              modalResetPasswordVisible: false,
              staffId: 0
            })
          }
        />
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(Staffs)
