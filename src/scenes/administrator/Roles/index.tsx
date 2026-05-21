import * as React from 'react'

import { Col, Dropdown, Input, Menu, Modal, Row, Table } from 'antd'
import { inject, observer } from 'mobx-react'

import AppComponentBase from '../../../components/AppComponentBase'
import CreateOrUpdateRole from './components/createOrUpdateRole'
import { EntityDto } from '../../../services/dto/entityDto'
import { L, LNotification } from '../../../lib/abpUtility'
import RoleStore from '../../../stores/administrator/roleStore'
import Stores from '../../../stores/storeIdentifier'

import DataTable from '../../../components/DataTable'
import { appPermissions } from '../../../lib/appconst'
import { EllipsisOutlined } from '@ant-design/icons/lib'
import debounce from 'lodash/debounce'
import getColumns from './columns'
import NoRole from '@components/ComponentNoRole'

export interface IRoleProps {
  roleStore: RoleStore
}

export interface IRoleState {
  modalVisible: boolean
  maxResultCount: number
  skipCount: number
  roleId: number
  filter: string
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.RoleStore)
@observer
class Role extends AppComponentBase<IRoleProps, IRoleState> {
  formRef: any = React.createRef()

  state = {
    modalVisible: false,
    maxResultCount: 10,
    skipCount: 0,
    roleId: 0,
    filter: ''
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    await this.getAll()
    await this.props.roleStore.getAllPermissions()
  }

  async getAll() {
    await this.props.roleStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      keyword: this.state.filter
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

  async createOrUpdateModalOpen(id) {
    if (id === 0) {
      this.props.roleStore.createRole()
    } else {
      await this.props.roleStore.getRoleForEdit(id)
    }

    this.setState({ roleId: id })
    this.Modal()
    this.formRef.current?.setFieldsValue({
      ...this.props.roleStore.roleEdit.role,
      grantedPermissions: this.props.roleStore.roleEdit.grantedPermissionNames || []
    })
  }

  delete(input: EntityDto) {
    const self = this
    confirm({
      title: LNotification('DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk() {
        self.props.roleStore.delete(input)
      }
    })
  }

  handleCreate = (grantedPermissions) => {
    const form = this.formRef.current
    form.validateFields().then(async (values: any) => {
      if (this.state.roleId === 0) {
        await this.props.roleStore.create({
          ...values,
          grantedPermissions
        })
      } else {
        await this.props.roleStore.update({
          id: this.state.roleId,
          ...values,
          grantedPermissions
        })
      }

      await this.getAll()
      this.setState({ modalVisible: false })
      form.resetFields()
    })
  }

  updateSearch = debounce((event) => {
    this.setState({ filter: event.target?.value })
  }, 100)

  handleSearch = (value: string) => {
    this.setState({ filter: value, skipCount: 0 }, async () => await this.getAll())
  }

  public render() {
    const { allPermissions, roles } = this.props.roleStore
    const columns = getColumns({
      title: L('ST_ROLE_UNIQUE_NAME'),
      dataIndex: 'name',
      ellipsis: true,
      width: '18%',
      render: (name: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <a
              style={{ color: item.colorCode }}
              onClick={() => this.isGranted(appPermissions.adminRole.detail) && this.createOrUpdateModalOpen(item.id)}
              className="link-text-table">
              <label className="ml-2">{name}</label>
            </a>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {this.isGranted(appPermissions.adminRole.delete) && (
                    <Menu.Item onClick={() => this.delete({ id: item.id })}>{L('BTN_DEACTIVATE')}</Menu.Item>
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
    const keywordPlaceHolder = `${this.L('ST_ROLE_UNIQUE_NAME')}`
    const filterComponent = (
      <Row>
        <Col sm={{ span: 10, offset: 0 }}>
          <Search
            maxLength={200}
            placeholder={keywordPlaceHolder}
            onChange={this.updateSearch}
            onSearch={this.handleSearch}
          />
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.adminRole.page) ? (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={() => this.handleSearch(this.state.filter)}
          title={this.L('ST_ROLE_LIST')}
          onCreate={() => this.createOrUpdateModalOpen(0)}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: roles === undefined ? 0 : roles.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.adminRole.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey="id"
            pagination={false}
            columns={columns}
            loading={this.props.roleStore.isLoading}
            dataSource={roles === undefined ? [] : roles.items}
          />
        </DataTable>

        <CreateOrUpdateRole
          visible={this.state.modalVisible}
          grantedPermissions={this.props.roleStore.roleEdit.grantedPermissionNames || []}
          onCancel={() =>
            this.setState({
              modalVisible: false
            })
          }
          modalType={this.state.roleId === 0 ? 'edit' : 'create'}
          onOk={this.handleCreate}
          permissions={allPermissions}
          roleStore={this.props.roleStore}
          formRef={this.formRef}
        />
      </>
    ) : (
      <NoRole />
    )
  }
}

export default Role
