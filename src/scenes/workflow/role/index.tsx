import * as React from 'react'

import { Col, Dropdown, Input, Menu, Modal, Row, Select, Table } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'
import { inject, observer } from 'mobx-react'

import { AppComponentListBase } from '../../../components/AppComponentBase'
import WfRoleFormModal from './components/wfRoleFormModal'
import { L, LNotification } from '../../../lib/abpUtility'
import Stores from '../../../stores/storeIdentifier'
import WfRoleStore from '../../../stores/workflow/wfRoleStore'
import DataTable from '../../../components/DataTable'
import Filter from '../../../components/Filter'
import AppConsts, { appPermissions } from '../../../lib/appconst'
import { IUserModel } from '../../../models/User/IUserModel'
import debounce from 'lodash/debounce'
import getColumns from './columns'

const { activeStatus } = AppConsts

export interface IWfRoleProps {
  wfRoleStore: WfRoleStore
  moduleId?: number
}

export interface IWfRoleState {
  modalMemberRoleVisible: boolean
  modalVisible: boolean
  maxResultCount: number
  skipCount: number
  wfRoleId: number
  filters: any
  roleMembers: IUserModel[]
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.WfRoleStore)
@observer
class WfRole extends AppComponentListBase<IWfRoleProps, IWfRoleState> {
  formRef: any = React.createRef()

  state = {
    modalVisible: false,
    modalMemberRoleVisible: false,
    maxResultCount: 10,
    skipCount: 0,
    wfRoleId: 0,
    filters: { isActive: 'true' },
    roleMembers: [] as IUserModel[]
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    await this.getAll()
  }

  async getAll() {
    await this.props.wfRoleStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ModuleId: this.props.moduleId,
      ...this.state.filters
    })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  Modal = (name) => {
    this.setState({
      ...this.state,
      wfRoleId: 0,
      [name]: !this.state[name]
    })
  }

  createOrUpdateModalOpen = async (id?) => {
    if (!id) {
      await this.props.wfRoleStore.createWfRole()
    } else {
      await this.props.wfRoleStore.get(id)
    }

    this.setState({ wfRoleId: id })
    this.Modal('modalVisible')

    this.formRef.current.setFieldsValue({
      ...this.props.wfRoleStore.editWfRole
    })
  }

  handleCreate = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (this.props.moduleId) {
        values.moduleIds = [this.props.moduleId]
      }
      if (!this.props.wfRoleStore.editWfRole?.id) {
        await this.props.wfRoleStore.create(values)
      } else {
        await this.props.wfRoleStore.update({
          id: this.props.wfRoleStore.editWfRole?.id,
          ...values
        })
      }

      await this.getAll()
      this.setState({ modalVisible: false })
      form.resetFields()
    })
  }

  openRoleMemberModal = async (roleId) => {
    await this.props.wfRoleStore.getRoleMembers(roleId)
    this.setState({
      wfRoleId: roleId,
      roleMembers: this.props.wfRoleStore.roleMembers,
      modalMemberRoleVisible: true
    })
  }

  handleAddOrRemoveMember = (isAdd, member) => {
    const { roleMembers } = this.state
    if (isAdd && roleMembers.findIndex((item) => item.id === member.id) === -1) {
      roleMembers.push(member)
    }
  }

  handleUpdateMemberRole = async (userIds) => {
    await this.props.wfRoleStore.updateRoleMembers(this.state.wfRoleId, userIds)
    this.setState({ modalMemberRoleVisible: false, wfRoleId: 0 })
  }

  delete(id, isActive) {
    const self = this
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.wfRoleStore.activateOrDeactivate(id, isActive)
        self.handleTableChange({ current: 1 })
      }
    })
  }

  updateSearch = debounce((name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value } })
  }, 100)

  handleSearch = (name, value) => {
    this.setState({ filters: { ...this.state.filters, [name]: value }, skipCount: 0 }, async () => await this.getAll())
  }

  public render() {
    const { wfRole } = this.props.wfRoleStore
    const { filters } = this.state
    let columns = getColumns({
      title: L('WF_ROLE_NAME'),
      width: '15%',
      dataIndex: 'name',
      render: (name: string, item: any) => (
        <Row>
          <Col sm={{ span: 21, offset: 0 }}>
            <a
              onClick={
                this.isGranted(appPermissions.workflow.update) ? () => this.createOrUpdateModalOpen(item.id) : undefined
              }
              className="link-text-table">
              {name}
            </a>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {this.isGranted(appPermissions.workflow.delete) && (
                    <Menu.Item onClick={() => this.delete(item.id, !item.isActive)}>
                      {L(item.isActive ? 'BTN_DEACTIVATE' : 'BTN_ACTIVATE')}
                    </Menu.Item>
                  )}
                </Menu>
              }
              placement="bottomLeft">
              <EllipsisOutlined className="button-action-hiden-table-cell" />
            </Dropdown>
          </Col>
        </Row>
      )
    })

    if (this.props.moduleId) {
      columns = columns.filter((item) => item.key !== 'modules')
    }

    return (
      <>
        <Filter title={this.L('FILTER')}>
          <Row gutter={[16, 8]}>
            <Col sm={{ span: 6, offset: 0 }}>
              <label>{this.L('FILTER_KEYWORD')}</label>
              <Search
                maxLength={200}
                placeholder={this.L('WF_ROLE_NAME')}
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
          </Row>
        </Filter>
        <DataTable
          title={this.L('WF_ROLE_LIST')}
          onCreate={() => this.createOrUpdateModalOpen()}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: wfRole === undefined ? 0 : wfRole.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.workflow.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id.toString()}
            columns={columns}
            pagination={false}
            loading={this.props.wfRoleStore.isLoading}
            dataSource={wfRole === undefined ? [] : wfRole.items}
          />
        </DataTable>
        <WfRoleFormModal
          formRef={this.formRef}
          visible={this.state.modalVisible}
          onCancel={() =>
            this.setState({
              modalVisible: false
            })
          }
          modalType={this.state.wfRoleId === 0 ? 'edit' : 'create'}
          onCreate={this.handleCreate}
          id={this.props.wfRoleStore.editWfRole?.id}
          isLoading={this.props.wfRoleStore.isLoading}
          moduleId={this.props.moduleId}
        />
      </>
    )
  }
}

export default WfRole
