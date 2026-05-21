import * as React from 'react'

import { Col, Dropdown, Input, Menu, Modal, Row, Table, Select, Button, Popover } from 'antd'

import { AppComponentListBase } from '../../../components/AppComponentBase'
import DataTable from '../../../components/DataTable'
import { L, LNotification, isGrantedAny } from '../../../lib/abpUtility'
import FeedbackStore from '../../../stores/communication/feedbackStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppConst, { appPermissions, dateFormat, moduleIds, rangePickerPlaceholder } from '../../../lib/appconst'
import ProjectStore from '../../../stores/project/projectStore'
import { portalLayouts } from '../../../components/Layout/Router/router.config'
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
import CommentListModal from '@components/Modals/CommentList/indext'
import SessionStore from '@stores/sessionStore'
import CommentStore from '@stores/common/commentStore'
import { EllipsisOutlined, MessageOutlined } from '@ant-design/icons'
import Paragraph from 'antd/lib/typography/Paragraph'
import NoRole from '@components/ComponentNoRole'
import dayjs from 'dayjs'
const { activeStatus } = AppConst
const { Option } = Select

export interface IFeedbacksProps {
  navigate: any
  params: any
  location: any
  workflowStore: WorkflowStore
  feedbackStore: FeedbackStore
  projectStore: ProjectStore
  unitStore: UnitStore
}

export interface IFeedbacksState {
  maxResultCount: number
  skipCount: number
  listStatus: any[]
  employees: any[]
  listTracker: any[]
  isShowMoreFilter: boolean
  showComment: boolean
  uniqueId: any
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.FeedbackStore, Stores.ProjectStore, Stores.UnitStore, Stores.WorkflowStore)
@observer
class Feedbacks extends AppComponentListBase<IFeedbacksProps, IFeedbacksState> {
  formRef: any = React.createRef()

  state = {
    isShowMoreFilter: false,
    maxResultCount: 10,
    skipCount: 0,
    listStatus: [],
    employees: [],
    listTracker: [],
    showComment: false,
    uniqueId: ''
  }

  get currentPage() {
    return Math.floor(this.props.feedbackStore.filters.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    await this.checkKeepFilter()
    this.isGranted(appPermissions.feedback.page) &&
      (await Promise.all([
        this.props.workflowStore.getListWfStatus(undefined, moduleIds.feedback),
        this.props.workflowStore.getListWfTracker(moduleIds.feedback),
        this.findBuildings(''),
        this.findUnits(''),
        this.findEmployees(''),
        this.getAll()
      ]))
    this.isGranted(appPermissions.feedback.page) &&
      this.setState({
        listStatus: this.props.workflowStore.wfStatus,
        listTracker: this.props.workflowStore.wfTrackers
      })
  }
  checkKeepFilter = () => {
    this.props.location.search !== '?keep-filter' && this.props.feedbackStore.resetFilers()
  }
  getAll = async () => {
    await this.props.feedbackStore.getAll({
      maxResultCount: this.state.maxResultCount,
      ...this.props.feedbackStore.filters
    })
    await this.props.feedbackStore.getOverview(this.props.feedbackStore.filters)
  }

  handleTableChange = async (pagination: any) => {
    await this.props.feedbackStore.setFilers({
      ...this.props.feedbackStore.filters,
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
    } = this.props.feedbackStore
    if (!buildingIds) {
      this.props.feedbackStore.setFilers({ ...this.props.feedbackStore.filters, unitIds: undefined })
    }

    await this.props.unitStore.getAll({ keyword, buildingId: buildingIds })
  }

  findEmployees = debounce(async (keyword) => {
    const employees = await staffService.filterOptions({ keyword })
    this.setState({ employees })
  }, 200)

  activateOrDeactivate = async (id: number, isActive) => {
    const self = this
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.feedbackStore.activateOrDeactivate(id, isActive)
        self.handleTableChange({ current: 1 })
      }
    })
  }

  handleSearch = async (name, value) => {
    const { filters } = this.props.feedbackStore
    if (name === 'date') {
      await this.props.feedbackStore.setFilers({ ...convertFilterDate(filters, value), skipCount: 0 })
      return this.getAll()
    }
    if (name === 'dateLastModifi') {
      await this.props.feedbackStore.setFilers({ ...convertFilterLatModifiDate(filters, value), skipCount: 0 })
      return this.getAll()
    }
    await this.props.feedbackStore.setFilers({ ...filters, [name]: value, skipCount: 0 })
    if (name === 'projectIds') {
      await this.findBuildings('')
      await this.props.feedbackStore.setFilers({
        ...this.props.feedbackStore.filters,
        buildingIds: undefined,
        unitIds: undefined
      })
    }
    await this.getAll()
  }

  updateSearch = debounce((name, value) => {
    const { filters } = this.props.feedbackStore
    this.props.feedbackStore.setFilers({ ...filters, [name]: value })
  }, 100)

  handleExportFeedback = async () => {
    const { feedbackStore } = this.props
    await feedbackStore.exportFeedbacks(this.props.feedbackStore.filters)
  }

  gotoDetail = (id?) => {
    const { navigate } = this.props
    id
      ? navigate(portalLayouts.communicationFeedbackDetail.path.replace(':id', id))
      : navigate(portalLayouts.communicationFeedbackCreate.path)
  }

  renderActionGroups = () => {
    const {
      feedbackStore: { feedbacks }
    } = this.props

    return (
      <span>
        {this.isGranted(appPermissions.feedback.export) && (
          <Button
            shape="circle"
            type="primary"
            className="mr-1"
            onClick={this.handleExportFeedback}
            icon={<ExcelIcon />}
            disabled={!feedbacks || !feedbacks.totalCount}
          />
        )}
      </span>
    )
  }
  handleCollapseFilter = () => {
    const { filters } = this.props.feedbackStore
    this.props.feedbackStore.filters(
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
  handleShowComment = async (value) => {
    await this.props.feedbackStore.get(value.id)
    this.setState({ uniqueId: value.workflow.uniqueId })
    this.setState({ showComment: true })
  }
  public render() {
    const {
      feedbackStore: { feedbacks, filters },
      projectStore: { buildingOptions },
      unitStore: { units }
    } = this.props
    const { listStatus, listTracker, employees } = this.state
    const columns = getColumns(
      {
        title: L('UNIT_FULL_CODE'),
        dataIndex: 'unit',
        key: 'unit',
        width: '14%',
        ellipsis: true,
        render: (unit, item: any) => (
          <Row style={{ justifyContent: 'space-between' }}>
            <Col sm={{ span: 20, offset: 0 }} className="col-info">
              <a
                onClick={() => this.isGranted(appPermissions.feedback.detail) && this.gotoDetail(item.id)}
                className="link-text-table">
                <div>
                  {unit?.fullUnitCode}
                  <div className="text-muted small">{item.project?.name}</div>
                </div>
              </a>
            </Col>
            <Col sm={{ span: 4, offset: 0 }}>
              {isGrantedAny(appPermissions.feedback.delete) && (
                <Dropdown
                  trigger={['click']}
                  overlay={
                    <Menu>
                      {this.isGranted(appPermissions.feedback.delete) && (
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
        width: '10%',
        ellipsis: true,
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

    const keywordPlaceholder = ` ${this.L('SEARCH_FEEDBACK_ID')}, ${this.L('RESIDENT_PHONE')}, ${this.L(
      'RESIDENT_EMAIL'
    )}`
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            defaultValue={
              this.props.location.search === '?keep-filter'
                ? filters?.keyword && decodeURIComponent(filters?.keyword)
                : undefined
            }
            maxLength={200}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            placeholder={keywordPlaceholder}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_BUILDING')}</label>
          <Select
            showSearch
            allowClear
            defaultValue={filters?.buildingIds}
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
            maxLength={50}
            showSearch
            allowClear
            defaultValue={filters?.unitIds}
            filterOption={false}
            onSearch={this.findUnits}
            onChange={(value) => this.handleSearch('unitIds', value)}
            style={{ width: '100%' }}
            value={filters.unitIds}>
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
            defaultValue={filters?.statusIds}
            showArrow
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
            defaultValue={filters?.trackerIds}
            showArrow
            className="full-width"
            filterOption={false}
            mode="multiple"
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
          <label>{this.L('FILTER_FEEDBACK_LASTMODIFICATION_DATE')}</label>
          <DatePicker.RangePicker
            className="w-100"
            format={dateFormat}
            defaultValue={
              this.props.location.search === '?keep-filter'
                ? filters?.FromLastModificationDate &&
                  filters?.ToLastModificationDate && [
                    (dayjs(filters?.FromLastModificationDate), dayjs(filters?.ToLastModificationDate))
                  ]
                : undefined
            }
            placeholder={rangePickerPlaceholder()}
            onChange={(value) => this.handleSearch('dateLastModifi', value)}
          />
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.feedback.page) ? (
      <>
        <OverViewBar
          handleClickItem={() => {
            throw new Error('Not implement')
          }}
          data={this.props.feedbackStore.feedbackOverview}
        />

        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          title={this.L('FEEDBACK_LIST')}
          onCreate={this.gotoDetail}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: feedbacks === undefined ? 0 : feedbacks.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.feedback.create}
          actionGroups={this.renderActionGroups}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={this.props.feedbackStore.isLoading}
            dataSource={feedbacks === undefined ? [] : feedbacks.items}
            scroll={{ x: 1000, y: 500, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
        <CommentListModal
          uniqueId={this.state.uniqueId}
          visible={this.state.showComment}
          moduleId={moduleIds.feedback}
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

export default withRouter(Feedbacks)
