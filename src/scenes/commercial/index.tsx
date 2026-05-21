import * as React from 'react'

import { Col, Input, Modal, Row, Table, Select, Button, DatePicker } from 'antd'

import { AppComponentListBase } from '../../components/AppComponentBase'
import Filter from '../../components/Filter'
import DataTable from '../../components/DataTable'
import { L, LNotification } from '../../lib/abpUtility'
import AnnouncementStore from '../../stores/announcement/announcementStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../stores/storeIdentifier'
import AppConst, { appPermissions, dateFormat } from '../../lib/appconst'
import ProjectStore from '../../stores/project/projectStore'
import { portalLayouts } from '../../components/Layout/Router/router.config'
import { filterOptions } from '../../lib/helper'
import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons/lib'
import getColumns from './columns'
import debounce from 'lodash/debounce'
import withRouter from '@components/Layout/Router/withRouter'
const { RangePicker } = DatePicker
const { align, activeStatus } = AppConst

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
    await Promise.all([this.getAll()])
  }

  getAll = async () => {
    await this.props.announcementStore.getAll({
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
    this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => {
      await this.getAll()
    })
  }

  gotoDetail = (id?) => {
    const { navigate } = this.props
    id
      ? navigate(portalLayouts.announcementDetail.path.replace(':id', id))
      : navigate(portalLayouts.announcementCreate.path)
  }

  public render() {
    const {
      announcementStore: { pagedResult },
      projectStore: { projectOptions }
    } = this.props
    const { filters } = this.state
    const columns = getColumns({
      title: L('ACTIONS'),
      dataIndex: 'operation',
      key: 'operation',
      align: align.right,
      width: 90,
      render: (text: string, item: any) => (
        <div>
          {this.isGranted(appPermissions.announcement.update) && (
            <Button
              size="small"
              className="ml-1"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => this.gotoDetail(item.id)}
            />
          )}
          {this.isGranted(appPermissions.announcement.delete) && (
            <Button
              size="small"
              className="ml-1"
              shape="circle"
              icon={item.isActive ? <CloseOutlined /> : <CheckOutlined />}
              onClick={() => this.activateOrDeactivate(item.id, !item.isActive)}
            />
          )}
        </div>
      )
    })
    const keywordPlaceholder = ` ${this.L('ANNOUNCEMENT_TITLE')}`

    return (
      <>
        <Filter title={this.L('FILTER')} handleRefresh={this.getAll}>
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
              <label>{this.L('PROJECT')}</label>
              <Select
                showSearch
                allowClear
                className="full-width"
                filterOption={filterOptions}
                onChange={(value) => this.handleSearch('projectIds', value)}>
                {this.renderOptions(projectOptions)}
              </Select>
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
              <RangePicker format={dateFormat} onChange={(value) => this.handleSearch('dateFromTo', value)} />
            </Col>
          </Row>
        </Filter>
        <DataTable
          title={this.L('ANNOUNCEMENT_LIST')}
          onCreate={this.gotoDetail}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: pagedResult === undefined ? 0 : pagedResult.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.announcement.create}>
          <Table
            size="middle"
            className="custom-ant-table"
            rowKey={(record) => record.id || 0}
            columns={columns}
            pagination={false}
            loading={this.props.announcementStore.isLoading}
            dataSource={pagedResult === undefined ? [] : pagedResult.items}
          />
        </DataTable>
      </>
    )
  }
}

export default withRouter(Announcements)
