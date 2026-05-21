import { Col, Dropdown, Menu, Modal, Row, Table } from 'antd'
import { inject, observer } from 'mobx-react'

import { AppComponentListBase } from '@components/AppComponentBase'
import BannerWelcomeFormModal from './components/BannerWelcomeFormModal'
import { L, LNotification } from '@lib/abpUtility'
import Stores from '../../../stores/storeIdentifier'
import BannerStore from '@stores/communication/bannerStore'
import DataTable from '../../../components/DataTable'
import AppConsts, { appPermissions } from '../../../lib/appconst'
import debounce from 'lodash/debounce'
import getColumns from './columns'
import FileStore from '@stores/common/fileStore'
import withRouter from '@components/Layout/Router/withRouter'
import Search from 'antd/lib/input/Search'
import Select from 'antd/lib/select'
import { renderDate, renderOptions } from '@lib/helper'
import { EllipsisOutlined } from '@ant-design/icons'
import NoRole from '@components/ComponentNoRole'

const { activeStatus, mobileApplicationTypeById, pageSize } = AppConsts
export interface IBannerProps {
  navigate: any
  bannerStore: BannerStore
  fileStore: FileStore
}

export interface IBannerState {
  visible: boolean
  visibleExpenseMandateModal: boolean
  maxResultCount: number
  skipCount: number
  bannerId: number
  selectedIds: number[]
  filters: any
}

@inject(Stores.BannerStore, Stores.FileStore)
@observer
class BannerWelcomeScreen extends AppComponentListBase<IBannerProps, IBannerState> {
  state = {
    visible: false,
    visibleExpenseMandateModal: false,

    maxResultCount: pageSize.pageSize_10,
    skipCount: 0,
    bannerId: 0,
    selectedIds: [],
    filters: { isActive: 'true', keyword: '', typeId: undefined } as any
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.announcement.page) && (await Promise.all([this.getAll()]))
  }

  async getAll() {
    await this.props.bannerStore.filter({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  handleFilterChange = (filters) => {
    this.setState({ filters: { ...this.state.filters, ...filters } }, this.getAll)
  }

  openOrCloseModal = async (id?) => {
    if (!id) {
      await this.props.bannerStore.createBannerWelcome()
    } else {
      await this.props.bannerStore.get(id)
    }

    this.setState({ bannerId: id, visible: !this.state.visible })
  }

  activateOrDeactivate = (ids, isActive: boolean) => {
    const { bannerStore } = this.props
    Modal.confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: this.L('BTN_YES'),
      cancelText: this.L('BTN_NO'),
      onOk: async () => {
        await bannerStore.activateOrDeactivate(ids, isActive)
        await this.handleSearch('keyword', this.state.filters.keyword)
        this.setState({ selectedIds: [] })
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

  public render() {
    const { pagedData } = this.props.bannerStore

    const columns = getColumns({
      title: L('BANNER_WELCOME_SUBJECT'),
      dataIndex: 'subject',
      ellipsis: true,
      key: 'subject',
      width: '25%',
      render: (subject: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <div
              className="full-name text-truncate text-link-to-detail"
              onClick={() => {
                this.isGranted(appPermissions.banner.detail) && this.openOrCloseModal(item.id)
              }}>
              <a className="link-text-table"> {subject}</a>
              <br />
              <small className={`text-muted ${!item.isExpired ? 'color-success' : ''}`}>
                {L(mobileApplicationTypeById[item.forClient])} (
                {`${item.startDate ? renderDate(item.startDate) : 'N/A'} - ${
                  item.endDate ? renderDate(item.endDate) : 'N/A'
                }`}
                )
              </small>
            </div>
          </Col>
          <Col sm={{ span: 2, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  <Menu.Item
                    onClick={() => {
                      this.isGranted(appPermissions.banner.delete) && this.activateOrDeactivate(item.id, !item.isActive)
                    }}>
                    {L(item.isActive ? 'BTN_DEACTIVATE' : 'BTN_ACTIVATE')}
                  </Menu.Item>
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
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{L('FILTER_KEYWORD')}</label>
          <Search
            maxLength={200}
            placeholder={L('KEYWORD_SEARCH_BANNER')}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>

        <Col md={{ span: 6, offset: 0 }}>
          <label>{L('IS_ACTIVE')}</label>
          <Select
            showArrow
            allowClear
            value={this.state.filters.isActive}
            onChange={(value) => this.handleSearch('isActive', value)}
            style={{ width: '100%' }}
            placeholder={L('IS_ACTIVE')}>
            {renderOptions(activeStatus)}
          </Select>
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.banner.page) ? (
      <>
        <DataTable
          onRefresh={() => this.getAll()}
          extraFilterComponent={filterComponent}
          title={this.L('BANNER_WELCOME_LIST')}
          onCreate={() => {
            this.openOrCloseModal()
          }}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: pagedData === undefined ? 0 : pagedData.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.banner.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id || 0}
            columns={columns}
            pagination={false}
            loading={this.props.bannerStore.isLoading}
            dataSource={pagedData === undefined ? [] : pagedData.items}
          />
        </DataTable>

        <BannerWelcomeFormModal
          visible={this.state.visible}
          bannerStore={this.props.bannerStore}
          fileStore={this.props.fileStore}
          handleOK={this.handleSearch}
          handleCancel={this.openOrCloseModal}
          data={this.props.bannerStore.editBannerWelcome}
        />
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(BannerWelcomeScreen)
