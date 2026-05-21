import * as React from 'react'
import { Col, Input, Modal, Row, Table, Select, Button, Dropdown, Menu } from 'antd'
import { AppComponentListBase } from '../../../components/AppComponentBase'
import DataTable from '../../../components/DataTable'
import ResetPasswordFormModal from '../../../components/Modals/ResetPassword'
import { L, LNotification, isGrantedAny } from '../../../lib/abpUtility'
import ResidentStore from '../../../stores/member/resident/residentStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppConst, { appPermissions } from '../../../lib/appconst'
import { portalLayouts } from '../../../components/Layout/Router/router.config'
import ProjectStore from '../../../stores/project/projectStore'
import { notifySuccess } from '../../../lib/helper'
import getColumns from './columns'
import { CheckOutlined, CloseOutlined, EllipsisOutlined, ImportOutlined } from '@ant-design/icons/lib'
import debounce from 'lodash/debounce'
import { ExcelIcon } from '@components/Icon'
import ActionFooter from '@components/ActionFooter'
import OverViewBar from '@components/DataTable/OverViewBar'
import withRouter from '@components/Layout/Router/withRouter'
import ImportUserModal from './components/importModal'
import NoRole from '@components/ComponentNoRole'
import dayjs from 'dayjs'

const { activeStatus, authorization } = AppConst

export interface IResidentsProps {
  navigate: any
  params: any
  residentStore: ResidentStore
  projectStore: ProjectStore
}

export interface IResidentsState {
  selectedResidentId: number
  selectedResidentIds: number[]
  modalResetPasswordVisible: boolean
  modalVisible: boolean
  maxResultCount: number
  skipCount: number
  currentPage: number
  residentId?: number
  filters: any
  showImportUser: boolean
  listdateOfMonth: any[]
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.ResidentStore)
@inject(Stores.ProjectStore)
@observer
class Residents extends AppComponentListBase<IResidentsProps, IResidentsState> {
  formRef: any = React.createRef()

  state = {
    selectedResidentId: 0,
    selectedResidentIds: [],
    modalVisible: false,
    modalResetPasswordVisible: false,
    maxResultCount: 10,
    skipCount: 0,
    residentId: 0,
    currentPage: 1,
    listdateOfMonth: [] as any,
    filters: {
      buildingId: undefined,
      isActive: 'true',
      IsLogin: ' ',
      roleId: undefined,
      monthOfBirth: undefined,
      dayOfBirth: undefined,
      yearOfBirth: undefined,
      gender: -1, //all gebder
      countryId: undefined
    },
    projectId: localStorage.getItem(authorization.projectId),
    showImportUser: false
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.resident.page) &&
      (await Promise.all([this.getAll(), this.findBuildings(), this.getListCountry('')]))
  }

  getAll = async () => {
    await this.props.residentStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
    await this.props.residentStore.getOverview({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
    const currentPage = (this.state.skipCount % this.state.maxResultCount) + 1
    this.setState({ currentPage })
  }
  getListCountry = async (keyword?) => {
    await this.props.projectStore.getListCountry(keyword)
  }
  findProjects = async (keyword) => {
    await this.props.projectStore.filterOptions({ keyword })
  }

  findBuildings = async (keyword?) => {
    const { filters, projectId } = this.state

    if (!projectId) {
      this.props.projectStore.filterBuildingOptions({})
      this, this.props.residentStore.getMemberRoles()
      this.setState({
        filters: { ...filters, buildingId: undefined, roleId: undefined }
      })
      return
    }
    await this.props.projectStore.filterBuildingOptions({
      keyword,
      projectId: projectId
    })
    await this.props.residentStore.getMemberRoles()
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  Modal = () => {
    this.setState({
      modalVisible: !this.state.modalVisible
    })
  }
  onCloseModal = async () => {
    await this.toggleModal()
    await this.getAll()
  }

  handleImport = async (file, params?) => {
    if (file) {
      await this.props.residentStore?.importFromExcel(file, params)
    }
    await this.toggleModal()
    await this.getAll()
  }

  createOrUpdateModalOpen = async (id?: number) => {
    if (!id) {
      await this.props.residentStore.createResident()
    } else {
      const isShowPhoneEmail = false
      await this.props.residentStore.get(id, isShowPhoneEmail)
    }

    this.setState({ residentId: id })
    this.Modal()

    this.formRef.current.setFieldsValue({})
  }

  handleRowSelect = (selectedResidentIds) => {
    this.setState({ selectedResidentIds })
  }

  activateOrDeactivate = async (id: number, isActive) => {
    const self = this
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.residentStore.activateOrDeactivate(id, isActive)
        self.handleTableChange({ current: 1 })
      }
    })
  }

  activateOrDeactivateListResident = async (isActive) => {
    const self = this
    const { selectedResidentIds } = this.state
    if (!selectedResidentIds || !selectedResidentIds.length) {
      return
    }

    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THESE_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THESE_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.residentStore.activateOrDeactivateListResident(selectedResidentIds, isActive)
        self.handleTableChange({ current: 1 })
        self.setState({ selectedResidentIds: [] })
      }
    })
  }

  handleCreate = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (this.state.residentId === 0) {
        await this.props.residentStore.create(values)
      } else {
        await this.props.residentStore.update({
          id: this.state.residentId,
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
    if (name === 'birthday') {
      this.setState(
        {
          filters: { ...filters, birthday: `${dayjs(value).get('date')}/${dayjs(value).get('month') + 1}` },
          skipCount: 0
        },
        async () => {
          await this.getAll()
        }
      )
    } else {
      if (name === 'yearOfBirth') {
        const yearOfBirth = dayjs(value).year()
        this.setState({ filters: { ...filters, [name]: yearOfBirth }, skipCount: 0 }, async () => {
          await this.getAll()
        })
      } else {
        this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => {
          if (name === 'projectId') {
            this.findBuildings('')
          }
          await this.getAll()
        })
      }
    }
  }

  handleExportResidents = async () => {
    const { residentStore } = this.props
    await residentStore.exportResidents(this.state.filters)
  }

  handleSendEmailInstallApp = async (residentId) => {
    confirm({
      title: LNotification('ARE_YOU_SURE'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        const { residentStore } = this.props
        await residentStore.sendEmailInstallApp(residentId)
        notifySuccess(LNotification('SUCCESS'), LNotification(L('ITEM_UPDATE_SUCCEED')))
      }
    })
  }

  handleSendDeactive = async (residentId, isActive) => {
    confirm({
      title: LNotification('ARE_YOU_SURE'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        const { residentStore } = this.props
        await residentStore.activateOrDeactivate(residentId, !isActive)
        notifySuccess(LNotification('SUCCESS'), LNotification(L('ITEM_UPDATE_SUCCEED')))
        this.getAll()
      }
    })
  }

  gotoDetail = (id) => {
    const { navigate } = this.props
    id ? navigate(portalLayouts.residentDetail.path.replace(':id', id)) : navigate(portalLayouts.residentCreate.path)
  }

  showChangePasswordModal = (id) => {
    this.setState({ selectedResidentId: id, modalResetPasswordVisible: true })
  }
  toggleModal = () => this.setState((prevState) => ({ showImportUser: !prevState.showImportUser }))
  renderActionGroups = () => {
    const {
      residentStore: { residents }
    } = this.props
    return (
      <span>
        {this.isGranted(appPermissions.resident.export) && (
          <Button
            shape="circle"
            type="primary"
            className="mr-1"
            onClick={this.handleExportResidents}
            icon={<ExcelIcon />}
            disabled={!residents || !residents.totalCount}
          />
        )}
        {this.isGranted(appPermissions.resident.import) && (
          <Button type="primary" shape="round" onClick={this.toggleModal} className="mr-1">
            {this.L('BTN_IMPORT')}
            <ImportOutlined />
          </Button>
        )}
      </span>
    )
  }

  onGetListDate = (name, value) => {
    if (value) {
      const listdateOfMonth = [] as any
      switch (value) {
        case 2:
          for (let i = 1; i <= 29; i++) {
            listdateOfMonth.push(i)
          }

          this.setState({ listdateOfMonth })
          break
        case 4:
        case 6:
        case 9:
        case 11:
          for (let i = 0; i <= 30; i++) {
            listdateOfMonth.push(i)
          }
          this.setState({ listdateOfMonth })
          break
        default:
          for (let i = 0; i <= 31; i++) {
            listdateOfMonth.push(i)
          }
          this.setState({ listdateOfMonth })
      }
      this.handleSearch(name, value)
    } else {
      const listdateOfMonth = [] as any

      for (let i = 0; i <= 31; i++) {
        listdateOfMonth.push(i)
      }
      this.setState({ listdateOfMonth })
      this.handleSearch(name, value)
    }
  }

  public render() {
    const {
      residentStore: { residents }
    } = this.props
    const { filters, selectedResidentIds } = this.state

    const columns = getColumns({
      title: L('RESIDENT_FULL_NAME'),
      dataIndex: 'displayName',
      key: 'displayName',
      width: '20%',
      render: (text: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <div className="table-cell-profile">
              <div className="info ml-2">
                <div
                  className="full-name text-truncate"
                  onClick={() => this.isGranted(appPermissions.resident.detail) && this.gotoDetail(item.id)}>
                  <a className="link-text-table">
                    {/* {L(item.gender === null ? '' : item.gender === true ? 'GENDER_MR' : 'GENDER_MS')} */}
                    {text?.length > 40 ? text.substring(0, 40) + '...' : text}
                  </a>
                </div>
              </div>
            </div>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            {isGrantedAny(appPermissions.resident.update) && (
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {this.isGranted(appPermissions.resident.update) && (
                      <Menu.Item onClick={() => this.showChangePasswordModal(item.id)}>{L('RESET_PASSWORD')}</Menu.Item>
                    )}
                    {this.isGranted(appPermissions.resident.update) && (
                      <Menu.Item onClick={() => this.handleSendEmailInstallApp(item.id)}>
                        {L('BTN_SEND_EMAIL_INSTALL_APP')}
                      </Menu.Item>
                    )}
                    {this.isGranted(appPermissions.resident.delete) && (
                      <Menu.Item onClick={() => this.handleSendDeactive(item.id, item.isActive)}>
                        {item.isActive ? L('BTN_DEACTIVE_RESIDENT') : L('BTN_ACTIVE_RESIDENT')}
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

    const keywordPlaceholder = `${this.L('RESIDENT_FULL_NAME')}, ${this.L('RESIDENT_USER_NAME')}, ${this.L(
      'RESIDENT_EMAIL'
    )}, ${this.L('RESIDENT_IDENTITY_NUMBER')}`

    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            maxLength={200}
            placeholder={keywordPlaceholder}
            onSearch={(value) => this.handleSearch('keyword', value)}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
          />
        </Col>
        {/* <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_BUILDING')}</label>
          <Select
            showSearch
            allowClear
            filterOption={false}
            className="full-width"
            onSearch={this.findBuildings}
            onChange={(value) => this.handleSearch('buildingId', value)}
            disabled={!projectId}
            value={filters.buildingId}>
            {this.renderOptions(buildingOptions)}
          </Select>
        </Col> */}
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
          <Select
            style={{ width: '100%' }}
            defaultValue={filters.isActive}
            onChange={(value) => this.handleSearch('isActive', value)}>
            {this.renderOptions(activeStatus)}
          </Select>
        </Col>
        {/* <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_LOGIN_STATUS')}</label>
          <Select
            allowClear
            style={{ width: '100%' }}
            defaultValue={filters.IsLogin}
            onChange={(value) => this.handleSearch('IsLogin', value)}>
            {this.renderOptions(LoginStatus)}
          </Select>
        </Col> */}
        {/* <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_RESIDENT_ROLE')}</label>
          <Select
            allowClear
            filterOption={false}
            style={{ width: '100%' }}
            value={filters.roleId}
            onChange={(value) => this.handleSearch('roleId', value)}>
            {this.renderOptions(memberRoles)}
          </Select>
        </Col> */}
        {/* <Col sm={{ span: 3, offset: 0 }}>
          <label>{this.L('FILTER_RESIDENT_MONTH_OF_BIRTH_DATE')}</label>
          <Select
            allowClear
            filterOption={false}
            style={{ width: '100%' }}
            value={filters.monthOfBirth}
            onChange={(value) => this.onGetListDate('monthOfBirth', value)}
            options={monthNamesShort.map((item) => ({ id: item.value, label: L(item.name), value: item.value }))}
          />
        </Col> */}
        {/* <Col sm={{ span: 3, offset: 0 }}>
          <label>{this.L('FILTER_DATE_MONTH_OF_BIRTH_DATE')}</label>
          <Select
            allowClear
            filterOption={false}
            style={{ width: '100%' }}
            value={filters.dayOfBirth}
            options={this.state.listdateOfMonth.map((item) => ({ id: item, label: item, value: item }))}
            onChange={(value) => this.handleSearch('dayOfBirth', value)}
          />
        </Col> */}

        {/* <Col sm={{ span: 3, offset: 0 }}>
          <label>{this.L('FILTER_YEAR_OF_BIRTH')}</label>
          <DatePicker
            style={{ width: '100%' }}
            onChange={(value) => this.handleSearch('yearOfBirth', value)}
            picker="year"
          />
        </Col> */}
        {/* <Col sm={{ span: 3, offset: 0 }}>
          <label>{this.L('RESIDENT_GENDER')}</label>
          <Select
            allowClear
            filterOption={false}
            style={{ width: '100%' }}
            value={filters.dayOfBirth}
            defaultValue={-1}
            options={genderFilterResident.map((item) => ({ id: item.value, label: L(item.name), value: item.value }))}
            onChange={(value) => this.handleSearch('gender', value)}
          />
        </Col> */}
        {/* <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('RESIDENT_COUNTRY')}</label>
          <Select
            style={{ width: '100%' }}
            showSearch
            allowClear
            filterOption={filterOptions}
            onChange={(value) => this.handleSearch('countryId', value)}>
            {countryOptions.map((country: any, index) => (
              <Select.Option key={index} value={country.id}>
                {L(country.name)}
              </Select.Option>
            ))}
          </Select>
        </Col> */}
      </Row>
    )
    return this.isGranted(appPermissions.resident.page) ? (
      <>
        <OverViewBar data={this.props.residentStore.residentOverview} />

        <DataTable
          title={this.L('RESIDENT_LIST')}
          onCreate={() => this.gotoDetail(null)}
          onRefresh={this.getAll}
          extraFilterComponent={filterComponent}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: residents === undefined ? 0 : residents.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.resident.create}
          actionGroups={this.renderActionGroups}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={this.props.residentStore.isLoading}
            dataSource={residents === undefined ? [] : residents.items}
            scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
        <ActionFooter show={this.isGranted(appPermissions.resident.delete) && selectedResidentIds.length > 0}>
          <Button
            shape="round"
            size={'large'}
            className="mr-1 primary btn-icon-customize"
            type="primary"
            onClick={() => this.activateOrDeactivateListResident(true)}
            icon={
              <span>
                <CheckOutlined className="color-success" />
              </span>
            }
            disabled={!residents || !residents.totalCount}>
            {L('BTN_ACTIVATE')}
          </Button>
          <Button
            shape="round"
            size={'large'}
            className="mr-1 primary btn-icon-customize"
            type="primary"
            onClick={() =>
              this.isGranted(appPermissions.resident.update) && this.activateOrDeactivateListResident(false)
            }
            icon={
              <span>
                <CloseOutlined className="color-error" />
              </span>
            }
            disabled={!residents || !residents.totalCount}>
            {L('BTN_DEACTIVATE')}
          </Button>
        </ActionFooter>
        <ResetPasswordFormModal
          visible={this.state.modalResetPasswordVisible}
          userId={this.state.selectedResidentId}
          onCancel={() =>
            this.setState({
              modalResetPasswordVisible: false
            })
          }
        />
        <ImportUserModal visible={this.state.showImportUser} onClose={this.onCloseModal} onOk={this.handleImport} />
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(Residents)
