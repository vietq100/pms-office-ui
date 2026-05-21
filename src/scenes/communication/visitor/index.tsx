import * as React from 'react'

import { Col, Input, Modal, Row, Table, Select, Dropdown, Menu, Button } from 'antd'

import { AppComponentListBase } from '../../../components/AppComponentBase'

import DataTable from '../../../components/DataTable'
import { L, LNotification, isGrantedAny } from '../../../lib/abpUtility'
import VisitorStore from '../../../stores/communication/visitorStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppConst, { appPermissions, dateFormat } from '../../../lib/appconst'
import ProjectStore from '../../../stores/project/projectStore'
import { portalLayouts } from '../../../components/Layout/Router/router.config'
import UnitStore from '../../../stores/project/unitStore'
import WorkflowStore from '../../../stores/workflow/workflowStore'
import staffService from '@services/member/staff/staffService'
import DatePicker from 'antd/lib/date-picker'
import debounce from 'lodash/debounce'
import getColumns from './columns'
import withRouter from '@components/Layout/Router/withRouter'
import { convertFilterDate, notifySuccess } from '@lib/helper'
import { EllipsisOutlined, ImportOutlined } from '@ant-design/icons'
import VisitorCheckOutModal from './components/VIsitorCheckOutModal'
import NoRole from '@components/ComponentNoRole'
import ImportVisitorModal from './components/ImportVisitorModal'

const { RangePicker } = DatePicker
const { activeStatus } = AppConst

export interface IVisitorsProps {
  navigate: any
  params: any
  routedata?: any
  workflowStore: WorkflowStore
  visitorStore: VisitorStore
  projectStore: ProjectStore
  unitStore: UnitStore
}

export interface IVisitorsState {
  maxResultCount: number
  skipCount: number
  listStatus: any[]
  filters: any
  employees: any[]
  listTracker: any[]
  visiblePopupCheckOut: boolean
  RowVisitor: any
  visibleImportModal: boolean
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.VisitorStore, Stores.ProjectStore, Stores.UnitStore, Stores.WorkflowStore)
@observer
class Visitors extends AppComponentListBase<IVisitorsProps, IVisitorsState> {
  formRef: any = React.createRef()

  state = {
    maxResultCount: 10,
    skipCount: 0,
    listStatus: [],
    filters: { projectIds: undefined, isActive: 'true' },
    employees: [],
    listTracker: [],
    visiblePopupCheckOut: false,
    RowVisitor: {},
    visibleImportModal: false
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    await Promise.all([this.props.visitorStore.getVisitReasons(), this.getAll()])
  }

  getAll = async () => {
    await this.props.visitorStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  findProjects = async (keyword) => {
    await this.props.projectStore.filterOptions({ keyword })
  }

  findBuildings = async (keyword) => {
    const { filters } = this.state
    if (!filters.projectIds) {
      this.props.projectStore.filterBuildingOptions({})
      this.setState({
        filters: { ...filters, buildingIds: undefined, unitIds: undefined }
      })
      return
    }
    await this.props.projectStore.filterBuildingOptions({
      keyword,
      projectId: filters.projectIds
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
        await self.props.visitorStore.activateOrDeactivate(id, isActive)
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

  gotoDetail = (id?) => {
    const { navigate } = this.props
    id
      ? navigate(portalLayouts.communicationVisitorDetail.path.replace(':id', id))
      : navigate(portalLayouts.communicationVisitorCreate.path)
  }

  toggleModal = (isShow) => {
    this.setState({ visibleImportModal: isShow })
  }

  handleImportFile = async (file) => {
    if (file) {
      try {
        await this.props.visitorStore?.importFromExcel(file)
        notifySuccess(
          LNotification('SUCCESS'),
          LNotification('UPLOAD_SUCCESS_WE_WILL_INFORM_YOU_ONCE_PROGRESSION_IS_DONE')
        )
      } catch {
        console.log('error')
      }
    }
    await this.toggleModal(false)
    await this.getAll()
  }

  checkOut = (visitor) => {
    this.setState({ visiblePopupCheckOut: true })
    this.setState({ RowVisitor: visitor })
  }

  renderActionGroups = () => {
    return (
      <span>
        {this.isGranted(appPermissions.visitor.import) && (
          <Button type="primary" shape="round" onClick={() => this.toggleModal(true)} className="mr-1">
            {this.L('BTN_IMPORT')}
            <ImportOutlined />
          </Button>
        )}
      </span>
    )
  }

  public render() {
    const {
      visitorStore: { visitors, visitReasons, isLoading }
    } = this.props
    const { filters } = this.state
    const columns = getColumns({
      title: L('UNIT_FULL_CODE'),
      dataIndex: 'fullUnitCode',
      key: 'fullUnitCode',
      ellipsis: true,
      width: '15%',
      render: (fullUnitCode: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 20, offset: 0 }} className="col-info">
            <a
              onClick={() => this.isGranted(appPermissions.visitor.detail) && this.gotoDetail(item.id)}
              className="link-text-table">
              <div>
                {fullUnitCode}
                <div className="text-muted small">{item.visitorReason?.name}</div>
              </div>
            </a>
          </Col>
          <Col sm={{ span: 4, offset: 0 }}>
            {isGrantedAny(appPermissions.visitor.delete, appPermissions.visitor.update) && (
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {this.isGranted(appPermissions.visitor.update) && !item.checkOutTime && (
                      <Menu.Item onClick={item.id ? () => this.checkOut(item) : undefined}>
                        {L('VISITOR_CHECK_OUT')}
                      </Menu.Item>
                    )}
                    {this.isGranted(appPermissions.visitor.delete) && (
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
    const keywordPlaceholder = this.L('VISITOR_NAME')
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            maxLength={200}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            placeholder={keywordPlaceholder}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('VISITOR_REASON')}</label>
          <Select
            showSearch
            allowClear
            filterOption={false}
            className="full-width"
            onChange={(value) => this.handleSearch('visitorReasonIds', value)}>
            {this.renderOptions(visitReasons)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{L('FILTER_FROM_TO_DATE')}</label>
          <RangePicker
            format={dateFormat}
            onChange={(value) => this.handleSearch('dateFromTo', value)}
            style={{ width: '100%' }}
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
    return this.isGranted(appPermissions.visitor.page) ? (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          title={this.L('VISITOR_LIST')}
          onCreate={this.gotoDetail}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: visitors === undefined ? 0 : visitors.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.visitor.create}
          actionGroups={this.renderActionGroups}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={isLoading}
            dataSource={visitors === undefined ? [] : visitors.items}
            scroll={{ x: 1000, y: 550, scrollToFirstRowOnChange: true }}
          />
        </DataTable>

        <VisitorCheckOutModal
          visitorStore={this.props.visitorStore}
          visible={this.state.visiblePopupCheckOut}
          visistor={this.state.RowVisitor}
          onCancel={() => {
            this.setState({ visiblePopupCheckOut: false }), this.getAll()
          }}
        />

        <ImportVisitorModal
          visible={this.state.visibleImportModal}
          onClose={() => this.toggleModal(false)}
          onOk={this.handleImportFile}
        />
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(Visitors)
