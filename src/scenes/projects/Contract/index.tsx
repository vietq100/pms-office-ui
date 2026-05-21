import * as React from 'react'

import { Col, Input, Modal, Row, Table, Select, Dropdown, Menu, Popover } from 'antd'
import { AppComponentListBase } from '../../../components/AppComponentBase'

import DataTable from '../../../components/DataTable'
import { L, LNotification, isGrantedAny } from '../../../lib/abpUtility'
import ContractStore from '../../../stores/project/contractStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppConst, { appPermissions } from '../../../lib/appconst'
import ProjectStore from '../../../stores/project/projectStore'
import { portalLayouts } from '../../../components/Layout/Router/router.config'
import UnitStore from '../../../stores/project/unitStore'
import WorkflowStore from '../../../stores/workflow/workflowStore'
import staffService from '@services/member/staff/staffService'
import SessionStore from '@stores/sessionStore'
import debounce from 'lodash/debounce'
import getColumns from './columns'
import ContractCategoryStore from '@stores/project/contractCategoryStore'
import OverViewBar from '@components/DataTable/OverViewBar'
import CompanyStore from '@stores/project/companyStore'
import withRouter from '@components/Layout/Router/withRouter'
import { EllipsisOutlined } from '@ant-design/icons'
import NoRole from '@components/ComponentNoRole'
import Paragraph from 'antd/es/typography/Paragraph'

const { activeStatus, authorization, expiredOptions } = AppConst

export interface IContractProps {
  navigate: any
  params: any
  routedata?: any
  workflowStore: WorkflowStore
  contractStore: ContractStore
  projectStore: ProjectStore
  unitStore: UnitStore
  sessionStore: SessionStore
  contractCategoryStore: ContractCategoryStore
  companyStore: CompanyStore
}

export interface IContractState {
  maxResultCount: number
  skipCount: number
  listStatus: any[]
  filters: any
  employees: any[]
  listTracker: any[]
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(
  Stores.SessionStore,
  Stores.ContractStore,
  Stores.ProjectStore,
  Stores.UnitStore,
  Stores.WorkflowStore,
  Stores.ContractCategoryStore,
  Stores.CompanyStore
)
@observer
class Contract extends AppComponentListBase<IContractProps, IContractState> {
  formRef: any = React.createRef()

  state = {
    maxResultCount: 10,
    skipCount: 0,
    listStatus: [],
    filters: {
      projectIds: [this.props.sessionStore.projectId],
      buildingIds: undefined,
      unitIds: undefined,
      contractCategoryIds: undefined,
      companyId: undefined,
      isIncludeExpired: 'false',
      isActive: 'true'
    },
    projectId: localStorage.getItem(authorization.projectId),
    employees: [],
    listTracker: []
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.companyContract.page) &&
      (await Promise.all([
        this.props.workflowStore.getListWfStatus(),

        this.getAll(),
        this.findBuildings(''),
        this.findUnits(''),
        this.findCompany(''),
        await this.props.contractCategoryStore.filterContractCategoryOptions({})
      ]))
    this.isGranted(appPermissions.companyContract.page) &&
      this.setState({
        listStatus: this.props.workflowStore.wfStatus,
        listTracker: this.props.workflowStore.wfTrackers
      })
  }

  getAll = async () => {
    await this.props.contractStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
    await this.props.contractStore.getOverview({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
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
      this.props.unitStore.getAll({ projectId })
      this.setState({ filters: { ...this.state.filters, unitIds: undefined } })
      return
    }

    await this.props.unitStore.getAll({
      keyword,
      projectId,
      buildingId: buildingIds
    })
  }

  findCompany = async (keyword) => {
    this.props.companyStore.getAll({ keyword })
  }

  findContractCategories = async (keyword) => {
    await this.props.contractCategoryStore.filterContractCategoryOptions({
      keyword
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
        await self.props.contractStore.activateOrDeactivate(id, isActive)
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
      if (name === 'projectIds') {
        await this.findBuildings('')
        this.setState({
          filters: {
            ...this.state.filters,
            buildingIds: undefined,
            unitIds: undefined
          }
        })
      }
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
    id
      ? navigate(portalLayouts.companyContractDetail.path.replace(':id', id))
      : navigate(portalLayouts.companyContractCreate.path)
  }

  public render() {
    const {
      contractStore: { companies },
      contractCategoryStore: { contractCategoryOptions }
    } = this.props
    const { filters } = this.state
    const columns = getColumns({
      title: L('CONTRACT_NAME'),
      dataIndex: 'contractName',
      key: 'contractName',
      ellipsis: true,
      width: '20%',
      render: (contractName: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <div className="text-link-to-detail">
              {/* {contractName} */}
              <a
                onClick={() => this.isGranted(appPermissions.companyContract.detail) && this.gotoDetail(item.id)}
                className="link-text-table">
                {contractName}
              </a>
              <div className="text-muted small"></div>
              <Popover trigger="click" content={<div className="custom-text-show-table">{item?.description}</div>}>
                <Paragraph
                  ellipsis={{
                    rows: 1
                  }}>
                  {item.company?.companyName}
                </Paragraph>
              </Popover>
            </div>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            {isGrantedAny(appPermissions.companyContract.delete) && (
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {this.isGranted(appPermissions.companyContract.delete) && item.isActive === true && (
                      <Menu.Item onClick={() => this.activateOrDeactivate(item.id, !item.isActive)}>
                        {L('BTN_DEACTIVATE')}
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
    const keywordPlaceholder = ` ${this.L('CONTRACT_NAME')}`
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
          <label>{this.L('CONTRACT_CATEGORY')}</label>
          <Select
            mode="multiple"
            showSearch
            showArrow
            allowClear
            filterOption={false}
            className="full-width"
            onSearch={this.findContractCategories}
            value={filters.contractCategoryIds}
            onChange={(value) => this.handleSearch('contractCategoryIds', value)}>
            {this.renderOptions(contractCategoryOptions)}
          </Select>
        </Col>
        {/*<Col sm={{ span: 6, offset: 0 }}>*/}
        {/*  <label>{this.L('FILTER_BUILDING')}</label>*/}
        {/*  <Select*/}
        {/*    showSearch*/}
        {/*    allowClear*/}
        {/*    filterOption={false}*/}
        {/*    className="full-width"*/}
        {/*    onSearch={this.findBuildings}*/}
        {/*    value={filters.buildingIds}*/}
        {/*    onChange={(value) => this.handleSearch('buildingIds', value)}*/}
        {/*    disabled={!filters.projectIds}*/}
        {/*  >*/}
        {/*    {this.renderOptions(buildingOptions)}*/}
        {/*  </Select>*/}
        {/*</Col>*/}
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_COMPANY')}</label>
          <Select
            showSearch
            allowClear
            filterOption={false}
            onSearch={debounce(this.findCompany, 400)}
            onChange={(value) => this.handleSearch('companyId', value)}
            style={{ width: '100%' }}
            value={filters.companyId}
            // disabled={!filters.projectIds}
          >
            {this.props.companyStore.companies?.items.map((company, index) => (
              <Select.Option value={`${company.id}`} key={index}>
                {company.companyName} <div className="text-muted small">({company.companyLegalName})</div>
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_EXPIRED')}</label>
          <Select
            showSearch
            allowClear
            filterOption={false}
            onChange={(value) => this.handleSearch('isIncludeExpired', value)}
            className="w-100"
            value={filters?.isIncludeExpired}>
            {this.renderOptions(expiredOptions)}
          </Select>
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
    return this.isGranted(appPermissions.companyContract.page) ? (
      <>
        <OverViewBar data={this.props.contractStore.contractOverview} />

        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          title={this.L('CONTRACT_LIST')}
          onCreate={this.gotoDetail}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: companies === undefined ? 0 : companies.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.companyContract.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={this.props.contractStore.isLoading}
            dataSource={companies === undefined ? [] : companies.items}
            scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(Contract)
