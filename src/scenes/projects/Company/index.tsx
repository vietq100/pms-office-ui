import * as React from 'react'

import { Col, Input, Modal, Row, Table, Select, Dropdown, Menu } from 'antd'

import { AppComponentListBase } from '../../../components/AppComponentBase'
import DataTable from '../../../components/DataTable'
import { L, LNotification, isGrantedAny } from '../../../lib/abpUtility'
import CompanyStore from '../../../stores/project/companyStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppConst, { appPermissions } from '../../../lib/appconst'
import ProjectStore from '../../../stores/project/projectStore'
import { portalLayouts } from '../../../components/Layout/Router/router.config'
import UnitStore from '../../../stores/project/unitStore'
import WorkflowStore from '../../../stores/workflow/workflowStore'
import staffService from '@services/member/staff/staffService'
import debounce from 'lodash/debounce'
import getColumns from './columns'
import withRouter from '@components/Layout/Router/withRouter'
import { EllipsisOutlined } from '@ant-design/icons'
import NoRole from '@components/ComponentNoRole'
import { BpType } from '@models/Project/Company/CompanyModel'
const { activeStatus, authorization, companyType } = AppConst

export interface ICompanyProps {
  navigate: any
  params: any
  routedata?: any
  workflowStore: WorkflowStore
  companyStore: CompanyStore
  projectStore: ProjectStore
  unitStore: UnitStore
}

export interface ICompanyState {
  maxResultCount: number
  skipCount: number
  listStatus: any[]
  filters: any
  employees: any[]
  listTracker: any[]
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.CompanyStore, Stores.ProjectStore, Stores.UnitStore, Stores.WorkflowStore)
@observer
class Company extends AppComponentListBase<ICompanyProps, ICompanyState> {
  formRef: any = React.createRef()

  state = {
    maxResultCount: 10,
    skipCount: 0,
    listStatus: [],
    filters: { buildingIds: undefined, unitIds: undefined, isActive: 'true' },
    projectId: localStorage.getItem(authorization.projectId),
    employees: [],
    listTracker: []
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.company.page) && this.getAll()
    // (await Promise.all([await this.props.companyStore.getCompanyTypes(), this.getAll()]))
    this.isGranted(appPermissions.company.page) &&
      this.setState({
        listStatus: this.props.workflowStore.wfStatus,
        listTracker: this.props.workflowStore.wfTrackers
      })
  }

  getAll = async () => {
    await this.props.companyStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters,
      companyTypeId: companyType.tenant
    })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  findBuildings = async (keyword) => {
    const { filters, projectId } = this.state
    if (!projectId) {
      this.props.projectStore.filterBuildingOptions({})
      this.setState({
        filters: { ...filters, buildingIds: undefined, unitIds: undefined }
      })
      return
    }
    await this.props.projectStore.filterBuildingOptions({
      keyword,
      projectId
    })
  }

  findUnits = async (keyword) => {
    const {
      filters: { buildingIds },
      projectId
    } = this.state
    if (!projectId || !buildingIds) {
      await this.props.unitStore.getAll({ projectId })
      this.setState({ filters: { ...this.state.filters, unitIds: undefined } })
      return
    }

    await this.props.unitStore.getAll({
      keyword,
      projectId,
      buildingId: buildingIds
    })
  }

  findEmployees = async (keyword) => {
    const employees = await staffService.filterOptions({ keyword })
    this.setState({ employees })
  }

  activateOrDeactivate = async (id: number, isActive) => {
    const self = this
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.companyStore.activateOrDeactivate(id, isActive)
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
      if (name === 'buildingIds') {
        await this.findUnits('')
        this.setState({
          filters: { ...this.state.filters, unitIds: undefined }
        })
      }
      await this.getAll()
    })
  }

  gotoDetail = (id?) => {
    const { navigate } = this.props
    id ? navigate(portalLayouts.companyDetail.path.replace(':id', id)) : navigate(portalLayouts.companyCreate.path)
  }

  public render() {
    const {
      companyStore: {
        // companyTypes,
        companies
      }
    } = this.props
    const columns = getColumns({
      title: L('CUSTOMER_INFO'),
      dataIndex: 'companyName',
      key: 'companyName',
      ellipsis: true,
      width: '25%',
      render: (companyName: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <a
              className="link-text-table"
              onClick={() => this.isGranted(appPermissions.company.detail) && this.gotoDetail(item.id)}>
              {companyName ?? ' --'}
            </a>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            {isGrantedAny(appPermissions.company.delete) && (
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {this.isGranted(appPermissions.company.delete) && (
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
    const keywordPlaceholder = ` ${this.L('COMPANY_NAME')}`
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
          <label>{this.L('COMPANY_BP_TYPE')}</label>
          <Select
            allowClear
            filterOption={false}
            className="full-width"
            onChange={(value) => this.handleSearch('companyTypeId', value)}>
            {this.renderOptions([
              { id: BpType.Personal, label: L('COMPANY_BP_PERSONAL') },
              { id: BpType.Organization, label: L('COMPANY_BP_ORGANIZATION') }
            ])}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
          <Select
            style={{ width: '100%' }}
            defaultValue={this.state.filters.isActive}
            onChange={(value) => this.handleSearch('isActive', value)}>
            {this.renderOptions(activeStatus)}
          </Select>
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.company.page) ? (
      <>
        <DataTable
          onRefresh={this.getAll}
          extraFilterComponent={filterComponent}
          title={this.L('COMPANY_LIST')}
          onCreate={this.gotoDetail}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: companies === undefined ? 0 : companies.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.company.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={this.props.companyStore.isLoading}
            dataSource={companies === undefined ? [] : companies.items}
            scroll={{ x: 1000, y: 500, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(Company)
