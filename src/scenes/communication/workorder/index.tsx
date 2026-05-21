import * as React from 'react'

import { Col, Input, Modal, Row, Table, Select, Button, Popover, Dropdown, Menu, Tooltip } from 'antd'
import { EllipsisOutlined, MessageOutlined } from '@ant-design/icons'

import { AppComponentListBase } from '../../../components/AppComponentBase'

import DataTable from '../../../components/DataTable'
import { L, LNotification, isGrantedAny } from '../../../lib/abpUtility'
import WorkOrderStore from '../../../stores/communication/workOrderStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppConst, { appPermissions, dateFormat, moduleIds, rangePickerPlaceholder } from '../../../lib/appconst'
import ProjectStore from '../../../stores/project/projectStore'
import { portalLayouts, routers } from '../../../components/Layout/Router/router.config'
import UnitStore from '../../../stores/project/unitStore'
import WorkflowStore from '../../../stores/workflow/workflowStore'
import staffService from '@services/member/staff/staffService'
import debounce from 'lodash/debounce'
import { ExcelIcon } from '@components/Icon'
import getColumns from './columns'
import OverViewBar from '@components/DataTable/OverViewBar'
import withRouter from '@components/Layout/Router/withRouter'
import DatePicker from 'antd/es/date-picker'
import { convertFilterDate, convertFilterLatModifiDate } from '@lib/helper'
import Paragraph from 'antd/lib/typography/Paragraph'
import CommentListModal from '@components/Modals/CommentList/indext'
import CommentStore from '@stores/common/commentStore'
import SessionStore from '@stores/sessionStore'
import NoRole from '@components/ComponentNoRole'
import dayjs from 'dayjs'

const { activeStatus } = AppConst
const { Option } = Select

export interface IWorkOrdersProps {
  navigate: any
  params: any
  location: any
  workflowStore: WorkflowStore
  workOrderStore: WorkOrderStore
  projectStore: ProjectStore
  unitStore: UnitStore
}

export interface IWorkOrdersState {
  maxResultCount: number
  listStatus: any[]
  employees: any[]
  listTracker: any[]
  isShowMoreFilter: boolean
  showComment: boolean
  uniqueId: any
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.WorkOrderStore, Stores.ProjectStore, Stores.UnitStore, Stores.WorkflowStore)
@observer
class WorkOrders extends AppComponentListBase<IWorkOrdersProps, IWorkOrdersState> {
  formRef: any = React.createRef()

  state = {
    isShowMoreFilter: false,
    maxResultCount: 10,
    listStatus: [],
    employees: [],
    listTracker: [],
    showComment: false,
    uniqueId: ''
  }

  get currentPage() {
    return Math.floor(this.props.workOrderStore.filters.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    await this.checkKeepFilter()
    this.isGranted(appPermissions.workOrder.page) &&
      (await Promise.all([
        this.props.workflowStore.getListWfStatus(undefined, moduleIds.workOrder),
        this.props.workflowStore.getListWfTracker(moduleIds.workOrder),
        this.findBuildings(''),
        this.findUnits(''),
        this.findEmployees(''),
        this.getAll()
      ]))
    this.isGranted(appPermissions.workOrder.page) &&
      this.setState({
        listStatus: this.props.workflowStore.wfStatus,
        listTracker: this.props.workflowStore.wfTrackers
      })
  }

  checkKeepFilter = () => {
    this.props.location.search !== '?keep-filter' && this.props.workOrderStore.resetFilers()
  }
  getAll = async () => {
    const isMyWorkOder = this.props.params['*'] === routers.communicationMyWorkOrder.path.slice(1)
    if (isMyWorkOder) {
      await this.props.workOrderStore.getAllMyWorkOrder({
        maxResultCount: this.state.maxResultCount,
        ...this.props.workOrderStore.filters
      })
      return
    }
    await this.props.workOrderStore.getAll({
      maxResultCount: this.state.maxResultCount,
      ...this.props.workOrderStore.filters
    })
    this.props.workOrderStore.getOverview(this.props.workOrderStore.filters)
  }

  handleTableChange = async (pagination: any) => {
    await this.props.workOrderStore.setFilers({
      ...this.props.workOrderStore.filters,
      skipCount: (pagination.current - 1) * this.state.maxResultCount!
    })
    await this.getAll()
  }

  findBuildings = async (keyword) => {
    await this.props.projectStore.filterBuildingOptions({ keyword })
  }

  findUnits = async (keyword) => {
    const {
      filters: { buildingIds }
    } = this.props.workOrderStore
    if (!buildingIds) {
      this.props.workOrderStore.setFilers({ ...this.props.workOrderStore.filters, unitIds: undefined })
    }

    await this.props.unitStore.getAll({ keyword, buildingId: buildingIds })
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
        await self.props.workOrderStore.activateOrDeactivate(id, isActive)
        self.handleTableChange({ current: 1 })
      }
    })
  }

  updateSearch = debounce((name, value) => {
    const { filters } = this.props.workOrderStore

    this.props.workOrderStore.setFilers({ ...filters, [name]: value })
  }, 100)

  handleSearch = async (name, value) => {
    const { filters } = this.props.workOrderStore
    if (name === 'date') {
      await this.props.workOrderStore.setFilers({ ...convertFilterDate(filters, value), skipCount: 0 })
      return this.getAll()
    }
    if (name === 'dateLastModifi') {
      await this.props.workOrderStore.setFilers({ ...convertFilterLatModifiDate(filters, value), skipCount: 0 })
      return this.getAll()
    }
    await this.props.workOrderStore.setFilers({ ...filters, [name]: value, skipCount: 0 })
    if (name === 'projectIds') {
      await this.findBuildings('')
      await this.props.workOrderStore.setFilers({
        ...this.props.workOrderStore.filters,
        buildingIds: undefined,
        unitIds: undefined
      })
    }
    await this.getAll()
  }

  handleExportWorkOrder = async () => {
    const { workOrderStore } = this.props
    await workOrderStore.exportWorkOrders(this.props.workOrderStore.filters)
  }
  handleExportWorkOrderWithImage = async () => {
    const { workOrderStore } = this.props
    await workOrderStore.exportWorkOrdersWithImage(this.props.workOrderStore.filters)
  }
  gotoDetail = (id?) => {
    const { navigate } = this.props
    id
      ? navigate(portalLayouts.communicationWorkOrderDetail.path.replace(':id', id))
      : navigate(portalLayouts.communicationWorkOrderCreate.path)
  }

  handleShowComment = async (value) => {
    await this.props.workOrderStore.get(value.id)
    this.setState({ uniqueId: value.workflow.uniqueId })
    this.setState({ showComment: true })
  }
  renderActionGroups = () => {
    const {
      workOrderStore: { workOrders }
    } = this.props
    const isMyWorkOder = this.props.params['*'] === routers.communicationMyWorkOrder.path.slice(1)
    return (
      <Dropdown
        trigger={['click']}
        overlay={
          <Menu>
            {this.isGranted(appPermissions.workOrder.export) && !isMyWorkOder && (
              <Menu.Item disabled={!workOrders || !workOrders.totalCount}>
                <span className="d-flex align-items-center" onClick={this.handleExportWorkOrder}>
                  <Button shape="circle" type="primary" className="mr-1" icon={<ExcelIcon />} />
                  {L('EXPORT_WO_WITH_NO_IMAGE')}
                </span>
              </Menu.Item>
            )}
            {this.isGranted(appPermissions.workOrder.export) && !isMyWorkOder && (
              <Menu.Item disabled={!workOrders || !workOrders.totalCount || workOrders.totalCount > 200}>
                <span
                  className="d-flex align-items-center"
                  onClick={() => (workOrders.totalCount <= 200 ? this.handleExportWorkOrderWithImage() : undefined)}>
                  <Tooltip title={workOrders.totalCount > 200 ? L('EXPORT_WO_WITH_IMAGE_LESS_THAN_200') : undefined}>
                    <Button
                      shape="circle"
                      type="primary"
                      className="mr-1"
                      icon={<ExcelIcon />}
                      disabled={!workOrders || !workOrders.totalCount || workOrders.totalCount > 200}
                    />
                    {L('EXPORT_WO_WITH_IMAGE')}
                  </Tooltip>
                </span>
              </Menu.Item>
            )}
          </Menu>
        }
        placement="bottomLeft">
        <span className="pointer">
          <Button
            shape="circle"
            type="primary"
            className="mr-1"
            icon={<ExcelIcon />}
            disabled={!workOrders || !workOrders.totalCount}
          />
        </span>
      </Dropdown>
    )
  }
  handleCollapseFilter = () => {
    const { filters } = this.props.workOrderStore
    this.props.workOrderStore.filters(
      {
        isShowMoreFilter: !this.state.isShowMoreFilter,

        ...filters,
        assignedIds: undefined,
        trackerIds: undefined,
        isActive: undefined
      },
      () => this.getAll()
    )
  }
  public render() {
    const {
      workOrderStore: { workOrders, filters },
      projectStore: { buildingOptions },
      unitStore: { units }
    } = this.props
    const { listStatus, listTracker, employees } = this.state
    const columns = getColumns(
      {
        title: L('UNIT_FULL_CODE'),
        dataIndex: 'unit',
        key: 'unit',
        width: 110,
        ellipsis: true,
        render: (unit, item: any) => (
          <Row style={{ justifyContent: 'space-between' }}>
            <Col sm={{ span: 20, offset: 0 }} className="col-info">
              <a
                onClick={() => this.isGranted(appPermissions.workOrder.detail) && this.gotoDetail(item.id)}
                className="link-text-table">
                <div>
                  {unit?.fullUnitCode}
                  <div className="text-muted small">{item.project?.name}</div>
                </div>
              </a>
            </Col>
            <Col sm={{ span: 4, offset: 0 }}>
              {isGrantedAny(appPermissions.workOrder.delete) && (
                <Dropdown
                  trigger={['click']}
                  overlay={
                    <Menu>
                      {this.isGranted(appPermissions.workOrder.delete) && (
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
      },
      {
        title: L('LIST_FEEBACK_ACTION_COMMENT'),
        dataIndex: 'lastMessage',
        key: 'lastMessage',
        ellipsis: true,
        width: 100,
        render: (lastMessage, item) => (
          <Row
            gutter={[18, 0]}
            className="text-muted small"
            onClick={() => this.isGranted(appPermissions.workOrder.update) && this.handleShowComment(item)}>
            <Col sm={{ span: 2, offset: 0 }}>{item.totalMessenge === 0 ? '0' : item.totalMessage}</Col>
            <Col sm={{ span: 21, offset: 0 }}>
              <Popover trigger="hover" content={lastMessage}>
                <Paragraph
                  ellipsis={{
                    rows: 1
                  }}>
                  <MessageOutlined className="mr-1" /> {lastMessage}
                </Paragraph>
              </Popover>
            </Col>
          </Row>
        )
      }
    )
    const keywordPlaceholder = ` ${this.L('SEARCH_WO_ID')}, ${this.L('RESIDENT_PHONE')}, ${this.L('RESIDENT_EMAIL')}`
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            defaultValue={
              this.props.location.search === '?keep-filter'
                ? filters?.keyword && decodeURIComponent(filters?.keyword)
                : ''
            }
            maxLength={200}
            placeholder={keywordPlaceholder}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_BUILDING')}</label>
          <Select
            showSearch
            defaultValue={this.props.location.search === '?keep-filter' ? filters?.buildingIds : undefined}
            allowClear
            filterOption={false}
            className="full-width"
            onSearch={this.findBuildings}
            value={filters.buildingIds}
            onChange={(value) => this.handleSearch('buildingIds', value)}>
            {this.renderOptions(buildingOptions)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_UNIT')}</label>
          <Select
            defaultValue={this.props.location.search === '?keep-filter' ? filters?.unitIds : undefined}
            showSearch
            allowClear
            filterOption={false}
            onSearch={this.findUnits}
            onChange={(value) => this.handleSearch('unitIds', value)}
            style={{ width: '100%' }}>
            {units?.items.map((pfStore) => (
              <Select.Option value={`${pfStore.id}`} key={pfStore.id}>
                {pfStore.fullUnitCode} <span className="text-muted small">({pfStore.name})</span>
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col sm={{ span: 3, offset: 0 }}>
          <label>{this.L('FILTER_STATUS')}</label>
          <Select
            mode="multiple"
            showSearch
            showArrow
            defaultValue={this.props.location.search === '?keep-filter' ? filters?.statusIds : undefined}
            allowClear
            onChange={(value) => this.handleSearch('statusIds', value)}
            style={{ width: '100%' }}>
            {(listStatus || []).map((status: any, index) => (
              <Option key={index} value={status.id}>
                {status.name}
              </Option>
            ))}
          </Select>
        </Col>

        <Col sm={{ span: 3, offset: 0 }}>
          <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
          <Select
            allowClear
            defaultValue={filters?.isActive}
            onChange={(value) => this.handleSearch('isActive', value)}
            style={{ width: '100%' }}>
            {this.renderOptions(activeStatus)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_EMPLOYEE')}</label>
          <Select
            showSearch
            showArrow
            defaultValue={this.props.location.search === '?keep-filter' ? filters?.assignedIds : undefined}
            className="full-width"
            onSearch={this.findEmployees}
            filterOption={false}
            mode="multiple"
            onChange={(value) => this.handleSearch('assignedIds', value)}>
            {(employees || []).map((item: any, index) => (
              <Option key={index} value={item.id}>
                {item.displayName}
              </Option>
            ))}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_WO_CATEGORY')}</label>
          <Select
            showSearch
            showArrow
            className="full-width"
            filterOption={false}
            mode="multiple"
            defaultValue={this.props.location.search === '?keep-filter' ? filters?.trackerIds : undefined}
            onChange={(value) => this.handleSearch('trackerIds', value)}>
            {(listTracker || []).map((item: any, index) => (
              <Option key={index} value={item.id}>
                {item.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_WO_DATE')}</label>
          <DatePicker.RangePicker
            className="w-100"
            defaultValue={
              this.props.location.search === '?keep-filter'
                ? filters?.fromDate && filters?.toDate && [dayjs(filters?.fromDate), dayjs(filters?.toDate)]
                : undefined
            }
            format={dateFormat}
            placeholder={rangePickerPlaceholder()}
            onChange={(value) => this.handleSearch('date', value)}
          />
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_WO_LASTMODIFICATION_DATE')}</label>
          <DatePicker.RangePicker
            className="w-100"
            defaultValue={
              this.props.location.search === '?keep-filter'
                ? filters?.FromLastModificationDate &&
                  filters?.ToLastModificationDate && [
                    dayjs(filters?.FromLastModificationDate),
                    dayjs(filters?.ToLastModificationDate)
                  ]
                : undefined
            }
            format={dateFormat}
            placeholder={rangePickerPlaceholder()}
            onChange={(value) => this.handleSearch('dateLastModifi', value)}
          />
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.workOrder.page) ? (
      <>
        <OverViewBar
          data={this.props.workOrderStore.workOrderOverview}
          handleClickItem={() => {
            throw new Error('Not implement')
          }}
        />

        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          title={this.L('WORK_ORDER_LIST')}
          onCreate={this.gotoDetail}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: workOrders === undefined ? 0 : workOrders.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.workOrder.create}
          actionGroups={this.renderActionGroups}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={this.props.workOrderStore.isLoading}
            dataSource={workOrders === undefined ? [] : workOrders.items}
            scroll={{ x: 1000, y: 500, scrollToFirstRowOnChange: true }}
          />
        </DataTable>

        <CommentListModal
          uniqueId={this.state.uniqueId}
          visible={this.state.showComment}
          moduleId={moduleIds.workOrder}
          isPrivate={false}
          commentStore={new CommentStore()}
          sessionStore={new SessionStore()}
          onCancel={() => {
            this.setState({
              showComment: false
            })
          }}
        />
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(WorkOrders)
