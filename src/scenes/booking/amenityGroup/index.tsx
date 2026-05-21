import * as React from 'react'

import Col from 'antd/es/col'
import Input from 'antd/es/input'
import Modal from 'antd/es/modal'
import Row from 'antd/es/row'
import Table from 'antd/es/table'
import Select from 'antd/es/select'
import { AppComponentListBase } from '@components/AppComponentBase'

import DataTable from '../../../components/DataTable'
import { L, LNotification, isGrantedAny } from '@lib/abpUtility'
import AmenityGroupStore from '../../../stores/booking/amenityGroupStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppConst, { appPermissions } from '../../../lib/appconst'
import ProjectStore from '../../../stores/project/projectStore'
import { portalLayouts } from '@components/Layout/Router/router.config'
import debounce from 'lodash/debounce'
import getColumns from './columns'
import withRouter from '@components/Layout/Router/withRouter'
import { Dropdown, Menu } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'

const { activeStatus } = AppConst

export interface IAmenityGroupProps {
  navigate: any
  amenityGroupStore: AmenityGroupStore
  projectStore: ProjectStore
}

export interface IAmenityGroupState {
  maxResultCount: number
  skipCount: number
  listStatus: any[]
  filters: any
  employees: any[]
  listTracker: any[]
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.AmenityGroupStore, Stores.ProjectStore)
@observer
class AmenityGroups extends AppComponentListBase<IAmenityGroupProps, IAmenityGroupState> {
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
    listTracker: []
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    await Promise.all([this.getAll()])
  }

  getAll = async () => {
    await this.props.amenityGroupStore.getAll({
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
        await self.props.amenityGroupStore.activateOrDeactivate(id, isActive)
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
      ? navigate(portalLayouts.amenityGroupDetail.path.replace(':id', id))
      : navigate(portalLayouts.amenityGroupCreate.path)
  }

  public render() {
    const {
      amenityGroupStore: { pagedResult }
    } = this.props
    const { filters } = this.state
    const columns: any[] = getColumns({
      title: L('AMENITY_GROUP_NAME'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: '15%',
      render: (name: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 20, offset: 0 }} className="col-info">
            <a
              onClick={() => this.isGranted(appPermissions.amenityGroup.detail) && this.gotoDetail(item.id)}
              className="link-text-table">
              {name}
            </a>
          </Col>
          <Col sm={{ span: 4, offset: 0 }}>
            {isGrantedAny(appPermissions.amenityGroup.delete) && (
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {this.isGranted(appPermissions.amenityGroup.delete) && (
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

    const keywordPlaceholder = ` ${this.L('AMENITY_GROUP_NAME')}`
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
      </Row>
    )
    return (
      <>
        {/* <Filter title={this.L('FILTER')} handleRefresh={this.getAll}>
          <Row gutter={[16, 8]}>
            <Col sm={{ span: 6, offset: 0 }}>
              <label>{this.L('FILTER_KEYWORD')}</label>
              <Search
                placeholder={keywordPlaceholder}
                onChange={(value) =>
                  this.updateSearch('keyword', value.target?.value)
                }
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
          </Row>
        </Filter> */}
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          title={this.L('AMENITY_GROUP_LIST')}
          onCreate={this.gotoDetail}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: pagedResult === undefined ? 0 : pagedResult.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.amenityGroup.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id || 0}
            columns={columns}
            pagination={false}
            loading={this.props.amenityGroupStore.isLoading}
            dataSource={pagedResult === undefined ? [] : pagedResult.items}
          />
        </DataTable>
      </>
    )
  }
}

export default withRouter(AmenityGroups)
