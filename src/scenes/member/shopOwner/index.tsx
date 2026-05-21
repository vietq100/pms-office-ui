import * as React from 'react'

import { Col, Input, Modal, Row, Table, Select, Menu, Dropdown, Avatar } from 'antd'

import { AppComponentListBase } from '../../../components/AppComponentBase'
import DataTable from '../../../components/DataTable'
import { L, LNotification } from '../../../lib/abpUtility'
import ShopOwnerStore from '../../../stores/member/shopOwner/shopOwnerStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppConst, { appPermissions, moduleAvatar } from '../../../lib/appconst'
import { portalLayouts } from '../../../components/Layout/Router/router.config'
import ResetPasswordFormModal from '../../../components/Modals/ResetPassword'
import ProjectStore from '../../../stores/project/projectStore'
import debounce from 'lodash/debounce'
import getColumns from './columns'
import withRouter from '@components/Layout/Router/withRouter'
import { EllipsisOutlined } from '@ant-design/icons'
import { getFirstLetterAndUpperCase } from '@lib/helper'
const { activeStatus } = AppConst
const { colorByLetter } = moduleAvatar
export interface IShopOwnersProps {
  navigate: any
  params: any
  shopOwnerStore: ShopOwnerStore
  projectStore: ProjectStore
}

export interface IShopOwnersState {
  modalResetPasswordVisible: boolean
  modalVisible: boolean
  maxResultCount: number
  skipCount: number
  shopOwnerId?: number
  projects: any
  filters: any
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.ShopOwnerStore)
@inject(Stores.ProjectStore)
@observer
class ShopOwners extends AppComponentListBase<IShopOwnersProps, IShopOwnersState> {
  formRef: any = React.createRef()
  state = {
    modalResetPasswordVisible: false,
    modalVisible: false,
    maxResultCount: 10,
    skipCount: 0,
    shopOwnerId: 0,
    projects: [],
    filters: { projectId: undefined, buildingId: undefined, isActive: 'true' }
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    await this.getAll()
  }

  getAll = async () => {
    await this.props.shopOwnerStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  findProjects = async (keyword) => {
    await this.props.projectStore.filterOptions({ keyword })
  }

  findBuildings = async (keyword) => {
    const { filters } = this.state
    if (!filters.projectId) {
      this.props.projectStore.filterBuildingOptions({})
      this.setState({ filters: { ...filters, buildingId: undefined } })
      return
    }
    await this.props.projectStore.filterBuildingOptions({
      keyword,
      projectId: filters.projectId
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
      await this.props.shopOwnerStore.createShopOwner()
    } else {
      await this.props.shopOwnerStore.get(id)
    }

    this.setState({ shopOwnerId: id })
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
        await self.props.shopOwnerStore.activateOrDeactivate(id, isActive)
        self.handleTableChange({ current: 1 })
      }
    })
  }

  gotoDetail = (id) => {
    const { navigate } = this.props
    id ? navigate(portalLayouts.shopOwnerDetail.path.replace(':id', id)) : navigate(portalLayouts.shopOwnerCreate.path)
  }

  handleCreate = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (this.state.shopOwnerId === 0) {
        await this.props.shopOwnerStore.create(values, null)
      } else {
        await this.props.shopOwnerStore.update(
          {
            id: this.state.shopOwnerId,
            ...values
          },
          null
        )
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
    this.setState({ shopOwnerId: id, modalResetPasswordVisible: true })
  }

  public render() {
    const {
      shopOwnerStore: { shopOwners, isLoading }
      // projectStore: { projectOptions }
    } = this.props
    const { filters } = this.state
    const columns = getColumns({
      title: L('SHOP_OWNER_FULL_NAME'),
      dataIndex: 'displayName',
      key: 'displayName',

      width: '20%',
      render: (text: string, item: any) => (
        <Row>
          <Col sm={{ span: 21, offset: 0 }}>
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
                <div className="full-name text-truncate text-link-to-detail" onClick={() => this.gotoDetail(item.id)}>
                  <a className="link-text-table"> {text}</a>
                </div>

                <div className="phone text-truncate text-muted">{item.userName}</div>
              </div>
            </div>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {this.isGranted(appPermissions.shopOwner.delete) && (
                    <Menu.Item onClick={() => this.showChangePasswordModal(item.id)}>{L('RESET_PASSWORD')}</Menu.Item>
                  )}
                  {this.isGranted(appPermissions.shopOwner.delete) && (
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
          </Col>
        </Row>
      )
    })
    const keywordPlaceholder = `${this.L('SHOP_OWNER_FULL_NAME')}, ${this.L('SHOP_OWNER_EMAIL')}`
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
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
      </Row>
    )
    return (
      <>
        <DataTable
          onRefresh={this.getAll}
          extraFilterComponent={filterComponent}
          title={this.L('SHOP_OWNER_LIST')}
          onCreate={() => this.gotoDetail(null)}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: shopOwners === undefined ? 0 : shopOwners.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.shopOwner.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={isLoading}
            dataSource={shopOwners === undefined ? [] : shopOwners.items}
          />
        </DataTable>
        <ResetPasswordFormModal
          visible={this.state.modalResetPasswordVisible}
          userId={this.state.shopOwnerId}
          onCancel={() =>
            this.setState({
              modalResetPasswordVisible: false,
              shopOwnerId: 0
            })
          }
        />
      </>
    )
  }
}

export default withRouter(ShopOwners)
