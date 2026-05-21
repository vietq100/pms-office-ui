import find from 'lodash/find'
import filter from 'lodash/filter'
import { AppComponentListBase } from '@components/AppComponentBase'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import { Col, Input, Row, Select, DatePicker, Modal, Table, Dropdown, Menu, Button } from 'antd'
import { appPermissions, dateFormat, rangePickerPlaceholder } from '@lib/appconst'
import { L, LNotification } from '@lib/abpUtility'
import AppConst from '@lib/appconst'
import { styles } from '@lib/formLayout'
import debounce from 'lodash/debounce'
import DataTable from '@components/DataTable'
import { portalLayouts } from '@components/Layout/Router/router.config'
import { IAssetProps, tabKeys, IAssetManagementState } from './asset.d'
import AssetQRCode from './components/AssetQRCode'
import withRouter from '@components/Layout/Router/withRouter'
import { EllipsisOutlined } from '@ant-design/icons'
import getColumns from './columns'
import ActionFooter from '@components/ActionFooter'
import NoRole from '@components/ComponentNoRole'

const defaultStatus = find(AppConst.activeStatus, { value: 'true' }) || ({} as any)

@inject(Stores.AssetStore, Stores.AssetTypeStore, Stores.CompanyStore, Stores.FileStore, Stores.SessionStore)
@observer
class Assets extends AppComponentListBase<IAssetProps, IAssetManagementState> {
  constructor(props) {
    super(props)
    this.state = {
      tabActiveKey: tabKeys.tabAssetList,
      selectAssetId: [],
      showAction: false,
      showPopupQRCode: false
    }
  }

  async componentDidMount() {
    const { assetStore } = this.props
    assetStore.itemsToQRCode = []
    await assetStore.setFilter('projectId', this.props.sessionStore.project.id)
    await assetStore.setFilter('isActive', defaultStatus.value)
    await Promise.all([assetStore.getAll(), this.handleSearchAssetType('')])
  }

  changeTab = (tabActiveKey) => this.setState({ tabActiveKey })

  handleSearch = debounce(async (key, value) => {
    const { assetStore } = this.props
    if (key === 'projectId') {
      const project = this.props.sessionStore.ownProjects.find((item) => item.value == value)
      await this.props.sessionStore.changeProject(project)
    }
    await assetStore.setFilter(key, value)
    await assetStore.getAll({})
  }, 300)

  handleSearchAssetType = debounce(
    async (keyWord: string) =>
      await this.props.assetTypeStore.filterOptions({
        keyWord,
        isActive: true
      }),
    300
  )

  goToDetail = (asset?: any) => {
    const { navigate } = this.props
    if (asset && asset.code) {
      navigate(portalLayouts.assetDetail.path.replace(':code', asset.code))
      return
    }
    navigate(portalLayouts.assetCreate.path)
  }

  activateOrDeactivate = (id: number, isActive: boolean) => {
    const { assetStore } = this.props
    Modal.confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: this.L('BTN_YES'),
      cancelText: this.L('BTN_NO'),
      onOk: async () => {
        await assetStore.setFilter('keyword', this.props.assetStore.filterObject.keyword)
        await assetStore.activateOrDeactivate(id, isActive)
        await assetStore.getAll()
      }
    })
  }

  onSelectChange = async (itemsToQRCode) => {
    await this.props.assetStore.storeItemsToQRCode(itemsToQRCode)
    itemsToQRCode.length > 0 ? this.setState({ showAction: true }) : this.setState({ showAction: false })
  }

  handleTableChange = async (pagination) => {
    const { assetStore } = this.props
    await assetStore.setFilter('skipCount', (pagination.current - 1) * assetStore.filterObject.maxResultCount!)
    await assetStore.setCurrentPage(pagination.current)
    await assetStore.getAll()
  }

  handleRowSelect = (selectAssetId) => {
    this.setState({ selectAssetId })
  }

  renderAssetList = () => {
    const { assetStore, assetTypeStore } = this.props
    const filterAssets = filter(assetStore.pageResult.items, (_item) => {
      if (!assetStore.filterObject?.isActive?.trim()) return true
      return `${_item.isActive}` === assetStore?.filterObject?.isActive
    }).map((item) => ({ ...item, key: item.id }))
    const columns = getColumns({
      title: L('ASSET_NAME_AND_ASSET_TYPE'),
      dataIndex: 'assetName',
      key: 'assetName',
      width: '30%',
      ellipsis: true,
      render: (assetName: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <div
              className="full-name text-truncate text-link-to-detail"
              onClick={() => {
                this.isGranted(appPermissions.asset.detail) && this.goToDetail(item)
              }}>
              <a className="link-text-table"> {assetName}</a>
            </div>
            <div>
              <div className="text-muted small">{item.assetType && item.assetType.assetTypeName}</div>
            </div>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {this.isGranted(appPermissions.asset.delete) && (
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
    })

    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Input.Search
            maxLength={200}
            placeholder={this.L('ASSET_NAME')}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>
        <Col sm={{ span: 6, offset: 0 }} style={styles.width100}>
          <label>{this.L('ASSET_PURCHASED_DATE')}</label>
          <DatePicker.RangePicker
            onChange={(value) => this.handleSearch('purchasedDateFromTo', value)}
            style={styles.width100}
            format={dateFormat}
            placeholder={rangePickerPlaceholder()}
          />
        </Col>
        <Col sm={{ span: 6, offset: 0 }} style={styles.width100}>
          <label>{this.L('ASSET_WARRANTY_DATE')}</label>
          <DatePicker.RangePicker
            onChange={(value) => this.handleSearch('warrantyDateFromTo', value)}
            style={styles.width100}
            format={dateFormat}
            placeholder={rangePickerPlaceholder()}
          />
        </Col>
        <Col sm={{ span: 6, offset: 0 }} style={styles.width100}>
          <label>{this.L('ASSET_TYPE')}</label>
          <Select
            allowClear
            showSearch
            placeholder={this.L('SELECT_ASSET_TYPE')}
            filterOption={false}
            onChange={(value) => this.handleSearch('assetTypeIds', value)}
            style={styles.width100}
            value={assetStore.filterObject.assetTypeIds as any}
            onSearch={(value) => this.handleSearchAssetType(value)}>
            {this.renderOptions(assetTypeStore.assetTypeOptions)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
          <Select
            onChange={(value) => this.handleSearch('isActive', value)}
            style={styles.width100}
            value={assetStore.filterObject.isActive}>
            {this.renderOptions(AppConst.activeStatus)}
          </Select>
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.asset.page) ? (
      <>
        <DataTable
          onRefresh={() => this.props.assetStore.getAll()}
          extraFilterComponent={filterComponent}
          title={this.L('ASSET_LIST')}
          onCreate={this.goToDetail}
          createPermission={appPermissions.asset.create}
          pagination={{
            onChange: this.handleTableChange,
            pageSize: assetStore.filterObject.maxResultCount,
            current: assetStore.currentPage,
            total: assetStore.pageResult.totalCount
          }}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={assetStore.isLoading}
            dataSource={filterAssets}
            scroll={{ x: 1000, y: 560, scrollToFirstRowOnChange: true }}
            rowSelection={{
              selectedRowKeys: assetStore.itemsToQRCode,
              onChange: this.onSelectChange
            }}
          />
        </DataTable>
        <AssetQRCode
          visible={this.state.showPopupQRCode}
          assetStore={assetStore}
          onCancel={() => this.setState({ showPopupQRCode: false })}
        />
        <ActionFooter show={this.state.showAction}>
          <Button className="mr-1" shape="round" onClick={() => this.setState({ showPopupQRCode: true })}>
            {L('BTN_SHOW_QR_CODE')}
          </Button>
        </ActionFooter>
      </>
    ) : (
      <NoRole />
    )
  }

  public render() {
    return this.renderAssetList()
  }
}

export default withRouter(Assets)
