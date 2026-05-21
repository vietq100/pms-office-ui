import * as React from 'react'

import { Col, Input, Modal, Row, Table, Select, Dropdown, Menu } from 'antd'

import { AppComponentListBase } from '../../components/AppComponentBase'
import DataTable from '../../components/DataTable'
import { L, LNotification } from '../../lib/abpUtility'
import NotificationTemplateStore from '../../stores/notificationTemplate/notificationTemplateStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../stores/storeIdentifier'
import AppConst, { announcementTypeOptions, appPermissions } from '../../lib/appconst'
import ProjectStore from '../../stores/project/projectStore'
import { portalLayouts } from '../../components/Layout/Router/router.config'
import { CheckOutlined, EllipsisOutlined } from '@ant-design/icons/lib'
import debounce from 'lodash/debounce'
import withRouter from '@components/Layout/Router/withRouter'
import { filterOptions, renderDotActive } from '@lib/helper'
import NoRole from '@components/ComponentNoRole'

const { align, activeStatus } = AppConst

export interface INotificationTemplatesProps {
  navigate: any
  notificationTemplateStore: NotificationTemplateStore
  projectStore: ProjectStore
}

export interface INotificationTemplatesState {
  maxResultCount: number
  skipCount: number
  listStatus: any[]
  filters: any
  employees: any[]
  listTracker: any[]
  listNotificationType: any[]
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.NotificationTemplateStore, Stores.ProjectStore)
@observer
class NotificationTemplates extends AppComponentListBase<INotificationTemplatesProps, INotificationTemplatesState> {
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
    },
    employees: [],
    listTracker: [],
    listNotificationType: []
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.notificationTemplate.page) &&
      (await Promise.all([
        this.getAll(),
        this.props.notificationTemplateStore.getListModules(),
        this.searchNotificationType('')
      ]))
  }

  getAll = async () => {
    await this.props.notificationTemplateStore.getAll({
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
        await self.props.notificationTemplateStore.activateOrDeactivate(id, isActive)
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
  searchNotificationType = async (keyword) => {
    await this.props.notificationTemplateStore.getNotificationTypes({ keyword })
    this.setState({
      listNotificationType: this.props.notificationTemplateStore.notificationTypes
    })
  }
  gotoDetail = (id?) => {
    const { navigate } = this.props
    id
      ? navigate(portalLayouts.notificationTemplateDetail.path.replace(':id', id))
      : navigate(portalLayouts.notificationTemplateCreate.path)
  }

  public render() {
    const {
      notificationTemplateStore: { pagedResult }
    } = this.props
    const { filters } = this.state
    const columns: any[] = [
      {
        title: '',
        dataIndex: 'isActive',
        key: 'isActive',
        width: '2%',
        align: align.center,
        render: renderDotActive
      },
      {
        title: L('NOTIFICATION_TEMPLATE_TYPE'),
        dataIndex: 'notificationType',
        key: 'notificationType',
        width: '25%',
        ellipsis: true,
        render: (notificationType, item: any) => (
          <Row style={{ justifyContent: 'space-between' }}>
            <Col sm={{ span: 21, offset: 0 }} className="col-info">
              <a
                onClick={() => this.isGranted(appPermissions.notificationTemplate.detail) && this.gotoDetail(item.id)}
                className="link-text-table">
                <div>{notificationType?.notificationName}</div>
              </a>
            </Col>
            <Col sm={{ span: 2, offset: 0 }}>
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {this.isGranted(appPermissions.notificationTemplate.delete) && (
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
            </Col>
          </Row>
        )
      },

      {
        title: L('MODULE'),
        dataIndex: 'notificationType',
        key: 'notificationType',
        width: '10%',
        render: (notificationType) => <>{notificationType?.module?.name}</>
      },
      {
        title: L('NOTIFICATION_TEMPLATE_METHOD'),
        dataIndex: 'method',
        key: 'method',
        width: '10%',
        render: (method) => <>{L(method)}</>
      }
    ]

    ;(abp.localization.languages || []).map((item) => {
      return columns.push({
        title: item.name,
        dataIndex: item.name,
        key: item.name,
        width: '10%',
        align: align.center,
        render: (language) => <>{language?.hasValue ? <CheckOutlined /> : ''}</>
      })
    })

    const keywordPlaceholder = ` ${this.L('NOTIFICATION_TEMPLATE_TYPE')}`
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
          <label>{this.L('FILTER_NOTIFICATION_TYPE')}</label>
          <Select
            allowClear
            showSearch
            showArrow
            filterOption={filterOptions}
            onSearch={debounce(this.searchNotificationType, 300)}
            onChange={(value) => this.handleSearch('NotificationTypeId', value)}
            style={{ width: '100%' }}>
            {this.renderOptions(this.state.listNotificationType)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_MODULE')}</label>
          <Select
            showSearch
            filterOption={filterOptions}
            allowClear
            onChange={(value) => this.handleSearch('ModuleId', value)}
            style={{ width: '100%' }}>
            {this.renderOptions(this.props.notificationTemplateStore.listModules)}
          </Select>
        </Col>

        <Col sm={{ span: 3, offset: 0 }}>
          <label>{this.L('FILTER_NOTIFICATION_METHOD')}</label>
          <Select
            allowClear
            onChange={(value) => this.handleSearch('notificationMethod', value)}
            style={{ width: '100%' }}>
            {this.renderOptions(announcementTypeOptions)}
          </Select>
        </Col>
        <Col sm={{ span: 3, offset: 0 }}>
          <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
          <Select
            allowClear
            defaultValue={filters.isActive}
            onChange={(value) => this.handleSearch('isActive', value)}
            style={{ width: '100%' }}>
            {this.renderOptions(activeStatus)}
          </Select>
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.notificationTemplate.page) ? (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={() => this.handleSearch('', '')}
          title={this.L('NOTIFICATION_TEMPLATE_LIST')}
          onCreate={this.gotoDetail}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: pagedResult === undefined ? 0 : pagedResult.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.notificationTemplate.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id || 0}
            columns={columns}
            pagination={false}
            loading={this.props.notificationTemplateStore.isLoading}
            dataSource={pagedResult === undefined ? [] : pagedResult.items}
          />
        </DataTable>
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(NotificationTemplates)
