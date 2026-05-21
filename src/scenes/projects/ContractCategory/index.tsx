import * as React from 'react'

import { Col, Dropdown, Input, Menu, Modal, Row, Select, Table } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'

import { AppComponentListBase } from '../../../components/AppComponentBase'

import DataTable from '../../../components/DataTable'
import { L, LNotification, isGrantedAny } from '../../../lib/abpUtility'
import ContractCategoryStore from '../../../stores/project/contractCategoryStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppConst, { appPermissions } from '../../../lib/appconst'
import ProjectStore from '../../../stores/project/projectStore'
import { portalLayouts } from '../../../components/Layout/Router/router.config'
import UnitStore from '../../../stores/project/unitStore'
import WorkflowStore from '../../../stores/workflow/workflowStore'
import contractCategoryService from '@services/project/contractCategoryService'
import debounce from 'lodash/debounce'
import getColumns from './columns'
import withRouter from '@components/Layout/Router/withRouter'
import NoRole from '@components/ComponentNoRole'
const { activeStatus } = AppConst

export interface IContractCategoryProps {
  navigate: any
  params: any
  routedata?: any
  workflowStore: WorkflowStore
  contractCategoryStore: ContractCategoryStore
  projectStore: ProjectStore
  unitStore: UnitStore
}

export interface IContractCategoryState {
  maxResultCount: number
  skipCount: number
  filters: any
  parents: any[]
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.ContractCategoryStore, Stores.ProjectStore, Stores.UnitStore, Stores.WorkflowStore)
@observer
class ContractCategory extends AppComponentListBase<IContractCategoryProps, IContractCategoryState> {
  formRef: any = React.createRef()

  state = {
    maxResultCount: 10,
    skipCount: 0,
    filters: { isActive: 'true' },
    parents: []
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.companyContract.page) && (await Promise.all([this.getAll()]))
  }

  getAll = async () => {
    await this.props.contractCategoryStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  findParents = async (keyword) => {
    const parents = await contractCategoryService.filterOptions({
      keyword,
      maxResultCount: 10,
      skipCount: 0
    })
    this.setState({ parents })
  }

  activateOrDeactivate = async (id: number, isActive) => {
    const self = this
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.contractCategoryStore.activateOrDeactivate(id, isActive)
        self.handleTableChange({ current: 1 })
      }
    })
  }

  handleSearch = (name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => {
      await this.getAll()
    })
  }

  updateSearch = debounce((name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value } })
  }, 100)

  gotoDetail = (id?) => {
    const { navigate } = this.props
    id
      ? navigate(portalLayouts.contractCategoryDetail.path.replace(':id', id))
      : navigate(portalLayouts.contractCategoryCreate.path)
  }

  public render() {
    const {
      contractCategoryStore: { companies }
    } = this.props
    const { filters } = this.state
    const columns = getColumns({
      title: L('CONTRACT_CATEGORY_NAME'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: '20%',
      render: (name: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <a
              onClick={() => this.isGranted(appPermissions.contractCategory.detail) && this.gotoDetail(item.id)}
              className="link-text-table">
              {name}
            </a>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            {isGrantedAny(appPermissions.contractCategory.delete) && (
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {this.isGranted(appPermissions.contractCategory.delete) && (
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
    const keywordPlaceholder = ` ${this.L('CONTRACT_CATEGORY_NAME')}`
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
            style={{ width: '100%' }}
            defaultValue={filters.isActive}
            onChange={(value) => this.handleSearch('isActive', value)}>
            {this.renderOptions(activeStatus)}
          </Select>
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.contractCategory.page) ? (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          title={this.L('CONTRACT_CATEGORY_LIST')}
          onCreate={this.gotoDetail}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: companies === undefined ? 0 : companies.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.contractCategory.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={this.props.contractCategoryStore.isLoading}
            dataSource={companies === undefined ? [] : companies.items}
            scroll={{ x: 800, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(ContractCategory)
