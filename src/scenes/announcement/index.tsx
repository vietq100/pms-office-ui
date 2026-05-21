import * as React from 'react'

import { Col, Input, Modal, Row, Table, Select, DatePicker, Collapse, Dropdown, Menu, Button } from 'antd'

import { AppComponentListBase } from '../../components/AppComponentBase'
import DataTable from '../../components/DataTable'
import { L, LNotification } from '../../lib/abpUtility'
import AnnouncementStore from '../../stores/announcement/announcementStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../stores/storeIdentifier'
import AppConst, { appPermissions, dateFormat, rangePickerPlaceholder } from '../../lib/appconst'
import ProjectStore from '../../stores/project/projectStore'
import { portalLayouts } from '../../components/Layout/Router/router.config'
import { CaretRightOutlined, EllipsisOutlined } from '@ant-design/icons/lib'
import getColumns from './columns'
import debounce from 'lodash/debounce'
import OverViewAnnouncement from '@components/DataTable/OverViewAnnouncement'
import withRouter from '@components/Layout/Router/withRouter'
import { convertFilterDate } from '@lib/helper'
import NoRole from '@components/ComponentNoRole'
import { ExcelIcon } from '@components/Icon'
const { RangePicker } = DatePicker
const { activeStatus } = AppConst

export interface IAnnouncementsProps {
  navigate: any
  announcementStore: AnnouncementStore
  projectStore: ProjectStore
}

export interface IAnnouncementsState {
  maxResultCount: number
  skipCount: number
  listStatus: any[]
  filters: any
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.AnnouncementStore, Stores.ProjectStore)
@observer
class Announcements extends AppComponentListBase<IAnnouncementsProps, IAnnouncementsState> {
  formRef: any = React.createRef()

  state = {
    maxResultCount: 10,
    skipCount: 0,
    listStatus: [],
    filters: {
      projectIds: undefined,
      buildingIds: undefined,
      unitIds: undefined,
      isActive: 'true'
    }
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.announcement.page) && (await Promise.all([this.getAll()]))
  }

  getAll = async () => {
    await this.props.announcementStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
    await this.props.announcementStore.getOverview({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  activateOrDeactivate = async (id: number, isActive) => {
    const self = this
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.announcementStore.activateOrDeactivate(id, isActive)
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

  handleExportCampaigns = async () => {
    const { announcementStore } = this.props
    await announcementStore.exportCampaigns(this.state.filters)
  }

  gotoDetail = (id?) => {
    const { navigate } = this.props
    this.props.announcementStore.editAnnouncement = {}
    id
      ? navigate(portalLayouts.announcementDetail.path.replace(':id', id))
      : navigate(portalLayouts.announcementCreate.path)
  }

  renderActionGroups = () => {
    const {
      announcementStore: { pagedResult }
    } = this.props

    return (
      <span>
        {this.isGranted(appPermissions.announcement.read) && (
          <Button
            shape="circle"
            type="primary"
            className="mr-1"
            onClick={this.handleExportCampaigns}
            icon={<ExcelIcon />}
            disabled={!pagedResult || !pagedResult.totalCount}
          />
        )}
      </span>
    )
  }

  public render() {
    const {
      announcementStore: { pagedResult }
    } = this.props
    const { filters } = this.state
    const columns = getColumns({
      title: L('ANNOUNCEMENT_TITLE'),
      dataIndex: 'subject',
      key: 'subject',
      width: '35%',
      ellipsis: true,
      render: (subject: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 20, offset: 0 }} className="col-info">
            <a
              style={{ color: item.colorCode }}
              onClick={() => this.isGranted(appPermissions.announcement.detail) && this.gotoDetail(item.id)}
              className="link-text-table">
              {subject}
            </a>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {this.isGranted(appPermissions.announcement.delete) && (
                    <Menu.Item key={1} onClick={() => this.activateOrDeactivate(item.id, !item.isActive)}>
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
    const keywordPlaceholder = ` ${this.L('ANNOUNCEMENT_SUBJECT')}`
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
            allowClear
            defaultValue={filters.isActive}
            onChange={(value) => this.handleSearch('isActive', value)}
            style={{ width: '100%' }}>
            {this.renderOptions(activeStatus)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_FROM_TO_DATE')}</label>
          <RangePicker
            className="w-100"
            format={dateFormat}
            onChange={(value) => this.handleSearch('dateFromTo', value)}
            placeholder={rangePickerPlaceholder()}
          />
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.announcement.page) ? (
      <>
        <Collapse
          defaultActiveKey={['0']}
          ghost
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
          <Collapse.Panel className="overview-collapse" header={<strong>{L('OVERVIEW')}</strong>} key="1">
            <OverViewAnnouncement
              data={this.props.announcementStore.announcementOverview}
              handleClickItem={() => {
                throw new Error('Not implement')
              }}
            />
          </Collapse.Panel>
        </Collapse>

        <DataTable
          extraFilterComponent={filterComponent}
          title={this.L('ANNOUNCEMENT_LIST')}
          onCreate={this.gotoDetail}
          onRefresh={this.getAll}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: pagedResult === undefined ? 0 : pagedResult.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.announcement.create}
          actionGroups={this.renderActionGroups}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id || 0}
            columns={columns}
            pagination={false}
            loading={this.props.announcementStore.isLoading}
            dataSource={pagedResult === undefined ? [] : pagedResult.items}
            scroll={{ x: 1000, y: 550, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(Announcements)
