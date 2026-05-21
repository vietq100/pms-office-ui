import { Col, Input, Modal, Row, Table, Select, Dropdown, Menu, Button, DatePicker } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'
import AppConst, { dateFormat, moduleIds, servicePlanEnum } from '@lib/appconst'
import withRouter from '@components/Layout/Router/withRouter'
import { portalLayouts } from '@components/Layout/Router/router.config'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import { AppComponentListBase } from '@components/AppComponentBase'
import { L, LNotification } from '@lib/abpUtility'
import { appPermissions } from '@lib/appconst'
import DataTable from '@components/DataTable'
import getColumns from './column'
import NoRole from '@components/ComponentNoRole'
import ServicePlanStore from '@stores/planSanitation/planSanitationStore'
import { ExcelIcon } from '@components/Icon'
import staffService from '@services/member/staff/staffService'
import { convertFilterDate, filterOptions } from '@lib/helper'

const { activeStatus, pageSize } = AppConst

export interface IContactProfileProps {
  navigate: any
  params: any
  servicePlanStore: ServicePlanStore
}

export interface IContractProfileState {
  maxResultCount: number
  skipCount: number
  filters: any
  assigners: any[]
}

const confirm = Modal.confirm
const Search = Input.Search
const moduleId = moduleIds.SanitationAndBonsai

@inject(Stores.ServicePlanStore)
@observer
class PlanSanitation extends AppComponentListBase<IContactProfileProps, IContractProfileState> {
  state = {
    maxResultCount: pageSize.pageSize_10,
    skipCount: 0,
    assigners: [] as any,
    filters: { firmId: undefined, isActive: 'true', type: servicePlanEnum.SANITTION }
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.servicePlan.page) &&
      (await Promise.all([
        this.props.servicePlanStore.getPriorityOptions({
          moduleId,
          culture: 'en'
        }),
        this.props.servicePlanStore.getStatusOptions({
          moduleId,
          culture: 'en'
        }),
        this.findEmployees(''),
        this.getAll()
      ]))
  }

  getAll = async () => {
    await this.props.servicePlanStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  findEmployees = async (keyword) => {
    const assigners = await staffService.filterWfAssigner({
      keyword,
      moduleId: moduleId
    })
    this.setState({ assigners })
  }

  activateOrDeactivate = async (id: number, isActive) => {
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await this.props.servicePlanStore.activateOrDeactivate(id, isActive)
        this.handleTableChange({ current: 1 })
      }
    })
  }

  gotoDetail = async (id?) => {
    const { navigate } = this.props
    if (id) {
      navigate(portalLayouts.planSanitationEdit.path.replace(':id', id))
    } else {
      navigate(portalLayouts.planSanitationCreate.path)
    }
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  handleSearch = (name, value) => {
    const { filters } = this.state

    if (name === 'dateFromTo') {
      this.setState({ filters: convertFilterDate(filters, value), skipCount: 0 }, async () => {
        await this.getAll()
      })
    } else {
      this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => {
        await this.getAll()
      })
    }
  }

  handleExportPlanMaintenancess = async () => {
    await this.props.servicePlanStore?.exportServicePlan({ ...this.state.filters })
  }

  renderActionGroups = () => {
    const { servicePlanStore } = this.props

    return (
      <span>
        <>
          {this.isGranted(appPermissions.servicePlan.export) && (
            <Button
              shape="circle"
              type="primary"
              className="mr-1"
              onClick={this.handleExportPlanMaintenancess}
              icon={<ExcelIcon />}
              disabled={!servicePlanStore?.pagedResult || !servicePlanStore?.pagedResult.totalCount}
            />
          )}
        </>
      </span>
    )
  }

  public render() {
    const { filters } = this.state
    const {
      servicePlanStore: { pagedResult, isLoading }
    } = this.props
    const columns = getColumns({
      title: L('PLAN_SANITATION_NAME'),
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      ellipsis: true,
      render: (name: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <div
              className="full-name text-truncate text-link-to-detail"
              onClick={() => {
                this.isGranted(appPermissions.servicePlan.detail) && this.gotoDetail(item.id)
              }}>
              <a className="link-text-table"> {name}</a>
            </div>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {this.isGranted(appPermissions.servicePlan.update) && (
                    <Menu.Item onClick={() => this.activateOrDeactivate(item.id, !item.isActive)}>
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

    const keywordPlaceHolder = `${this.L('PLANED_MAINTENANCE_NAME')}`
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            maxLength={200}
            placeholder={keywordPlaceHolder}
            onSearch={(value) => this.handleSearch('keyword', value)}></Search>
        </Col>

        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('PLANED_MAINTENANCE_PERSON_IN_CHARGE')}</label>
          <Select
            showArrow
            style={{ width: '100%' }}
            showSearch
            mode="multiple"
            filterOption={false}
            onSearch={this.findEmployees}
            allowClear
            onChange={(value) => this.handleSearch('employeeIds', value)}>
            {this.renderOptions(this.state.assigners)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_FROM_TO_DATE')}</label>
          <DatePicker.RangePicker
            format={dateFormat}
            className="full-width"
            onChange={(value) => this.handleSearch('dateFromTo', value)}
          />
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('PLANED_MAINTENANCE_STATUS')}</label>
          <Select
            showArrow
            allowClear
            showSearch
            mode="multiple"
            style={{ width: '100%' }}
            filterOption={filterOptions}
            onChange={(value) => this.handleSearch('statusIds', value)}>
            {this.renderOptions(this.props.servicePlanStore.statusOptions)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('PLANED_MAINTENANCE_PRIORITY')}</label>
          <Select
            showArrow
            allowClear
            showSearch
            filterOption={filterOptions}
            style={{ width: '100%' }}
            mode="multiple"
            onChange={(value) => this.handleSearch('priorityIds', value)}>
            {this.renderOptions(this.props.servicePlanStore.priorityOptions)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('PLANED_MAINTENANCE_ISACTIVE_STATUS')}</label>
          <Select
            allowClear
            style={{ width: '100%' }}
            defaultValue={filters.isActive}
            onChange={(value) => this.handleSearch('isActive', value)}>
            {this.renderOptions(activeStatus)}
          </Select>
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.servicePlan.page) ? (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          onCreate={this.gotoDetail}
          createPermission={appPermissions.servicePlan.create}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: pagedResult === undefined ? 0 : pagedResult.totalCount,
            onChange: this.handleTableChange
          }}
          actionGroups={this.renderActionGroups}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={isLoading}
            dataSource={pagedResult.items}
            scroll={{ x: 1000, y: 500, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(PlanSanitation)
