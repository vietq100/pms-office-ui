import * as React from 'react'

import { Col, Input, Modal, Row, Select, Dropdown, Menu, Table, Tabs, Tooltip } from 'antd'

import { AppComponentListBase } from '@components/AppComponentBase'
import { L, LNotification, isGrantedAny } from '@lib/abpUtility'
import { inject, observer } from 'mobx-react'
import { EllipsisOutlined } from '@ant-design/icons/lib'
import getColumns from './columns'
import debounce from 'lodash/debounce'
import withRouter from '@components/Layout/Router/withRouter'
import FeeNoticeStore from '@stores/fee/feeNoticeStore'
import AppConst, { appPermissions } from '@lib/appconst'
import FeeNoticeCreateModal from './components/FeeNoticeCreateModal'
import DataTable from '@components/DataTable'
import Stores from '@stores/storeIdentifier'
import PackageFeeStore from '@stores/fee/packageFeeStore'
import { portalLayouts } from '@components/Layout/Router/router.config'
import NoRole from '@components/ComponentNoRole'
import ViewFeeNoticeModal from './components/ViewFeeNoticeModal'
import ConfirmPopup from '@components/Modals/ConfirmPopup'

const { pageSize, activeStatus, statusFeeNoticeKey } = AppConst

const TAB_KEY = {
  FEE_NOTICE: 'FEE_NOTICE',
  STATISTIC: 'STATISTIC'
}
export interface IFeeNoticeProps {
  navigate: any
  feeNoticeStore: FeeNoticeStore
  packageFeeStore: PackageFeeStore
}

export interface IFeeNoticeState {
  maxResultCount: number
  skipCount: number
  visible: boolean
  filters: any
  idDetail: any
  showPopupCreate: boolean
  dataView: any
  visibleView: boolean
  idNeedConfirm: any
  visiblePopupConfirm: boolean
  tabActiveKey: any
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.FeeNoticeStore, Stores.PackageFeeStore)
@observer
class ChargeFees extends AppComponentListBase<IFeeNoticeProps, IFeeNoticeState> {
  formRef: any = React.createRef()

  state = {
    maxResultCount: pageSize.pageSize_20,
    skipCount: 0,
    visible: false,
    idDetail: '',
    filters: {
      status: undefined,
      unitIds: undefined,
      types: undefined,
      isActive: 'true'
    },
    showPopupCreate: false,
    dataView: {} as any,
    visibleView: false,
    idNeedConfirm: undefined,
    visiblePopupConfirm: false,
    tabActiveKey: TAB_KEY.FEE_NOTICE
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }
  async componentDidMount() {
    this.isGranted(appPermissions.feeNotice.page) &&
      (await Promise.all([this.handlePackageFeeSearch(''), this.getAll()]))
  }

  getAll = async () => {
    await this.props.feeNoticeStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  handlePackageFeeSearch = debounce(async (keyword) => {
    await this.props.packageFeeStore?.filterOption({ keyword })
  }, 100)
  handleNoticeTypeSearch = debounce(async (keyword) => {
    await this.props.feeNoticeStore?.getTemplatesll({ keyword })
  }, 100)

  activateOrDeactivate = async (id: number) => {
    const self = this
    confirm({
      title: LNotification('DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.feeNoticeStore.deative(id)
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
    if (id) {
      this.setState({ visible: true })
      this.setState({ idDetail: id })
    } else {
      this.setState({ visible: true })
    }
  }
  gotoHisory = (item?) => {
    if (item?.id) {
      this.props.feeNoticeStore.setStatusConfirm(item.statusId)
      this.props.navigate(portalLayouts.feeNoticeProcess.path.replace(':id', item.id))
    }
  }
  toggleViewModal = (record) => {
    this.setState({ dataView: record })
    this.setState((prevState) => ({
      visibleView: !prevState.visibleView
    }))
  }

  refreshFeeNotice = async (id) => {
    await this.props.feeNoticeStore.refreshFeeNotice(id)
    this.getAll()
  }
  cofirmFeeNotice = async (id: number) => {
    this.setState({ idNeedConfirm: id })
    this.setState({ visiblePopupConfirm: true })
  }

  handleConfirm = async (isAllowConfirm) => {
    const self = this
    if (isAllowConfirm) {
      await this.props.feeNoticeStore.cofirm(this.state.idNeedConfirm)
      this.setState({ visiblePopupConfirm: false, idNeedConfirm: undefined })
      self.handleTableChange({ current: 1 })
    }
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
  }

  public render() {
    const {
      feeNoticeStore: { pagedResult }
    } = this.props
    const { packageOptions } = this.props.packageFeeStore

    const columns = getColumns({
      title: L('FEE_NOTICE_NOTICE_TYPE'),
      dataIndex: 'feeNotificationType',
      key: 'feeNotificationType',
      width: '25%',
      render: (feeNotificationType, item: any) => (
        <Row className="justify-content-between">
          <Col sm={{ span: 21, offset: 0 }}>
            <div
              className="full-name text-link-to-detail text-truncate-2 link-text-table text-small"
              onClick={() => this.isGranted(appPermissions.feeNotice.detail) && this.gotoHisory(item)}>
              <Tooltip title={feeNotificationType?.notificationName} trigger="contextMenu">
                <a className="link-text-table text-small">{feeNotificationType?.notificationName}</a>
              </Tooltip>
            </div>
          </Col>
          <Col sm={{ span: 3, offset: 0 }} className="d-flex justify-content-end text-center">
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {isGrantedAny(appPermissions.feeGenerate.create, appPermissions.feeGenerate.update) &&
                    item.statusId === statusFeeNoticeKey.inProgress && (
                      <Menu.Item key={4} onClick={() => this.refreshFeeNotice(item.id)}>
                        {L('BTN_REFRESH_FEE_GEN')}
                      </Menu.Item>
                    )}
                  {isGrantedAny(appPermissions.feeGenerate.create, appPermissions.feeGenerate.update) && (
                    <Menu.Item key={1} onClick={() => this.toggleViewModal(item)}>
                      {L('BTN_VIEW_FEE_GEN')}
                    </Menu.Item>
                  )}
                  {this.isGranted(appPermissions.feeNotice.delete) && item.isActive === true && (
                    <Menu.Item key={2} onClick={() => this.activateOrDeactivate(item.id)}>
                      {L(item.isActive ? 'BTN_DEACTIVATE' : 'BTN_ACTIVATE')}
                    </Menu.Item>
                  )}
                  {this.isGranted(appPermissions.feeNotice.confirm) &&
                    item.statusId === statusFeeNoticeKey.readyToSend && (
                      <Menu.Item key={3} onClick={() => this.cofirmFeeNotice(item.id)}>
                        {L('BTN_CONFIRM')}
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
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            maxLength={200}
            placeholder={`${this.L('FEE_NOTICE_PLACEHODER')}`}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>

        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('PERIOD')}</label>
          <Select
            allowClear
            showSearch
            filterOption={false}
            onChange={(value) => this.handleSearch('FeePackageId', value)}
            // value={filters.types}
            onSearch={this.handlePackageFeeSearch}
            style={{ width: '100%' }}>
            {(packageOptions || []).map((item, index) => (
              <Select.Option value={`${item.id}`} key={index}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Col>

        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('IS_ACTIVE')}</label>
          <Select
            allowClear
            style={{ width: '100%' }}
            defaultValue={this.L('ACTIVE')}
            onChange={(value) => this.handleSearch('isActive', value)}>
            {activeStatus.map((status) => (
              <Select.Option value={status.value} key={status.value}>
                {status.label}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.feeNotice.page) ? (
      <>
        <Tabs activeKey={this.state.tabActiveKey} onTabClick={this.changeTab} type="card">
          <Tabs.TabPane tab={L(TAB_KEY.FEE_NOTICE)} key={TAB_KEY.FEE_NOTICE}>
            <DataTable
              extraFilterComponent={filterComponent}
              onRefresh={this.getAll}
              title={this.L('GEN_FEE_LIST')}
              onCreate={
                this.isGranted(appPermissions.feeNotice.create)
                  ? () => {
                      this.setState({ visible: true }), this.setState({ idDetail: null })
                    }
                  : undefined
              }
              pagination={{
                pageSize: this.state.maxResultCount,
                current: this.currentPage,
                total: pagedResult === undefined ? 0 : pagedResult.totalCount,
                onChange: this.handleTableChange
              }}
              createPermission={appPermissions.feeNotice.create}>
              <Table
                size="middle"
                rowKey={(record) => record.id}
                className="custom-ant-table custom-ant-row"
                columns={columns}
                scroll={{ x: 1000, y: 800, scrollToFirstRowOnChange: true }}
                pagination={false}
                loading={this.props.feeNoticeStore.isLoading}
                dataSource={pagedResult.items || []}
              />
            </DataTable>
            <FeeNoticeCreateModal
              visible={this.state.visible}
              onCancel={() => {
                this.setState({ visible: false })
              }}
              onCancelAndRefresh={() => {
                this.setState({ visible: false }), this.getAll()
              }}
            />

            <ViewFeeNoticeModal
              visible={this.state.visibleView}
              onCancel={() => this.toggleViewModal(undefined)}
              dataView={this.state.dataView}
            />

            <ConfirmPopup
              title="DO_YOU_WANT_TO_CONFIRM_THIS_ITEM"
              confirmMessage="FEESTATEMENT_NOTICE_CONFIRM_ITEM_TO_DO"
              hintConfirm="PLEASE_INPUT_CONFIRM"
              onCancel={() => this.setState({ visiblePopupConfirm: false })}
              onOk={(value) => this.handleConfirm(value)}
              idNeedConfirm={this.state.idNeedConfirm}
              visible={this.state.visiblePopupConfirm}
            />
          </Tabs.TabPane>

          {/* <Tabs.TabPane tab={L(TAB_KEY.STATISTIC)} key={TAB_KEY.STATISTIC}>
            <StatisticFeeUnit />
          </Tabs.TabPane> */}
        </Tabs>
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(ChargeFees)
