import * as React from 'react'

import { Col, Dropdown, Input, Menu, Modal, Row, Table, Select } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'

import { AppComponentListBase } from '../../../components/AppComponentBase'

import DataTable from '../../../components/DataTable'
import { L, LNotification } from '@lib/abpUtility'
import MasterDataStore from '../../../stores/administrator/masterDataStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppConst, { appPermissions } from '../../../lib/appconst'
import ProjectStore from '../../../stores/project/projectStore'
import { portalLayouts } from '@components/Layout/Router/router.config'
import { filterOptions, renderDotActive } from '@lib/helper'
import debounce from 'lodash/debounce'
import withRouter from '@components/Layout/Router/withRouter'

import SystemColumn from '@components/DataTable/columns'
import NoRole from '@components/ComponentNoRole'
const { align, activeStatus } = AppConst

export interface IMasterDataProps {
  navigate: any
  masterDataStore: MasterDataStore
  projectStore: ProjectStore
  projectId?: number
}

export interface IMasterDataState {
  modalVisible: boolean
  maxResultCount: number
  skipCount: number
  buildingId?: number
  filters: any
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.MasterDataStore)
@inject(Stores.ProjectStore)
@observer
class MasterDataComponent extends AppComponentListBase<IMasterDataProps, IMasterDataState> {
  formRef: any = React.createRef()

  state = {
    modalVisible: false,
    maxResultCount: 10,
    skipCount: 0,
    filters: { isActive: 'true' }
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    await Promise.all([this.getAll(), this.props.masterDataStore.getTargetOptions({})])
  }

  getAll = async () => {
    await this.props.masterDataStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  findProjects = async (keyword) => {
    await this.props.projectStore.filterOptions({ keyword })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  Modal = () => {
    this.setState({ modalVisible: !this.state.modalVisible })
  }

  activateOrDeactivate = async (id: number, isActive) => {
    const self = this
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.masterDataStore.activateOrDeactivate(id, isActive)
        self.handleTableChange({ current: 1 })
      }
    })
  }

  handleCreate = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (this.props.masterDataStore.editMasterData?.id) {
        await this.props.masterDataStore.update({
          ...this.props.masterDataStore.editMasterData,
          ...values
        })
      } else {
        await this.props.masterDataStore.create(values)
      }

      await this.getAll()
      this.setState({ modalVisible: false })
      form.resetFields()
    })
  }

  updateSearch = debounce((name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value } })
  }, 100)

  handleSearch = (name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => await this.getAll())
  }

  gotoDetail = (id?) => {
    const { navigate } = this.props
    id
      ? navigate(portalLayouts.adminMasterDataDetail.path.replace(':id', id))
      : navigate(portalLayouts.adminMasterDataCreate.path)
  }

  public render() {
    const {
      masterDataStore: { masterDatas, targetOptions }
    } = this.props
    const { filters } = this.state
    const columns = [
      {
        title: '',
        dataIndex: 'isActive',
        key: 'isActive',
        width: '2%',
        align: align.center,
        render: renderDotActive
      },
      {
        title: L('NAME'),
        dataIndex: 'name',
        key: 'name',
        width: '15%',
        ellipsis: true,
        render: (name: string, item: any) => (
          <Row style={{ justifyContent: 'space-between' }}>
            <Col sm={{ span: 21, offset: 0 }} className="col-info">
              <a
                style={{ color: item.colorCode }}
                onClick={() => this.isGranted(appPermissions.adminMasterData.detail) && this.gotoDetail(item.id)}
                className="link-text-table">
                {name}
              </a>
            </Col>
            <Col sm={{ span: 3, offset: 0 }}>
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {this.isGranted(appPermissions.adminMasterData.delete) && (
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
        title: L('TARGET'),
        dataIndex: 'target',
        key: 'target',
        ellipsis: true,
        width: '10%',
        render: (text: string) => <>{text}</>
      },

      {
        title: L('CODE'),
        dataIndex: 'code',
        key: 'code',
        width: '10%',
        render: (text: string) => <div>{text}</div>
      },
      SystemColumn
    ]

    const keywordPlaceHolder = `${this.L('NAME')}, ${this.L('CODE')}`
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            maxLength={200}
            placeholder={keywordPlaceHolder}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_TARGET')}</label>
          <Select
            showSearch
            allowClear
            className="full-width"
            filterOption={filterOptions}
            onChange={(value) => this.handleSearch('target', value)}>
            {this.renderOptions(targetOptions)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
          <Select
            defaultValue={filters.isActive}
            onChange={(value) => this.handleSearch('isActive', value)}
            style={{ width: '100%' }}>
            {this.renderOptions(activeStatus)}
          </Select>
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.adminMasterData.page) ? (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={() => this.getAll()}
          title={this.L('MASTER_DATA_LIST')}
          onCreate={this.gotoDetail}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: masterDatas === undefined ? 0 : masterDatas.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.adminMasterData.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            loading={this.props.masterDataStore.isLoading}
            dataSource={masterDatas === undefined ? [] : masterDatas.items}
            pagination={false}
            scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(MasterDataComponent)
