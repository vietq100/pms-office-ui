import { Col, Modal, Input, Row, Select } from 'antd'
import { inject, observer } from 'mobx-react'
import { L, LNotification } from '@lib/abpUtility'
import { appPermissions } from '@lib/appconst'
import { AppComponentListBase } from '@components/AppComponentBase'
import AppConst from '@lib/appconst'
import Stores from '@stores/storeIdentifier'
import filter from 'lodash/filter'
// import Filter from '@components/Filter'
import find from 'lodash/find'
import DataTable from '@components/DataTable'
import { IAssetTypeModel } from '@models/asset/AssetTypeModel'
import { AssetTypeList } from './components/AssetTypeList'
import { AssetTypeModal } from './components/AssetTypeModal'
import { IAssetProps, IAssetState } from './assetType'
import './assetTypes.less'
import debounce from 'lodash/debounce'
import NoRole from '@components/ComponentNoRole'

const Search = Input.Search

@inject(Stores.AssetStore, Stores.AssetTypeStore)
@observer
class Assets extends AppComponentListBase<IAssetProps, IAssetState> {
  constructor(props) {
    super(props)
    const defaultStatus = find(AppConst.activeStatus, { value: 'true' }) || ({} as any)
    this.state = {
      type: '',
      maxResultCount: 10,
      skipCount: 0,
      currentPage: 1,
      newsId: 0,
      filter: '',
      loading: false,
      selectedStatus: defaultStatus.value,
      visible: false,
      selectedItem: {} as IAssetTypeModel
    }
  }

  componentDidMount() {
    this.setState({ loading: true })
    Promise.all([this.getAll()]).then(() => this.setState({ loading: false }))
  }

  getAll = async () => {
    await this.props.assetTypeStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      keyword: this.state.filter,
      isActive: this.state.selectedStatus,
      type: this.state.type
    })
  }
  updateSearch = debounce((event) => {
    this.setState({ filter: event.target?.value })
  }, 100)

  onFilterChange = (name, value) => {
    this.setState({ ...this.state, [name]: value, skipCount: 0, currentPage: 1 }, this.getAll)
  }

  handleSearch = (value: string) => {
    this.setState({ filter: value, skipCount: 0, currentPage: 1 }, this.getAll)
  }

  onSelectStatus = (value: string) => {
    this.setState({ selectedStatus: value, skipCount: 0, currentPage: 1 }, this.getAll)
  }

  onShowAddEditModal = (newState: boolean) => () => {
    this.setState({ visible: newState, selectedItem: {} as IAssetTypeModel })
  }

  onCancelAddEditModal = () => {
    this.setState({ visible: false, selectedItem: {} as IAssetTypeModel })
  }

  onCreateOrUpdate = async (assetType: any) => {
    const { assetTypeStore } = this.props
    if (assetType.id) {
      await assetTypeStore.update(assetType)
    } else {
      await assetTypeStore.create(assetType)
    }

    this.onFilterChange('filter', '')
  }

  onActivateOrDeactivate = (id, isActive) => {
    const self = this
    Modal.confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.assetTypeStore.activateOrDeactivate(id, isActive)
        self.onPageChange({ current: 1 })
      }
    })
  }

  onEdit = (selectedItem: IAssetTypeModel) => {
    this.setState({
      visible: true,
      selectedItem
    })
  }

  onPageChange = (page) => {
    this.setState(
      {
        currentPage: page.current,
        skipCount: --page.current * this.state.maxResultCount
      },
      this.getAll
    )
  }

  public render() {
    const {
      assetTypeStore: { pageResult }
    } = this.props
    const { selectedStatus, visible } = this.state
    const filterAssetType = filter(pageResult.items, (_item) => {
      if (!selectedStatus?.trim()) return true
      return `${_item.isActive}` === selectedStatus
    })
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 12, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            maxLength={200}
            placeholder={this.L('ASSET_TYPE_NAME')}
            onChange={this.updateSearch}
            onSearch={this.handleSearch}
          />
        </Col>
        <Col sm={{ span: 8, offset: 0 }}>
          <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
          <Select onChange={this.onSelectStatus} style={{ width: '100%' }} value={selectedStatus}>
            {AppConst.activeStatus.map((status, index) => (
              <Select.Option key={index} value={status.value}>
                {status.label}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.asset.page) ? (
      <>
        <DataTable
          title={this.L('ASSET_TYPE_LIST')}
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          onCreate={this.onShowAddEditModal(true)}
          createPermission={appPermissions.asset.create}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.state.currentPage,
            total: pageResult.totalCount,
            onChange: this.onPageChange
          }}>
          <AssetTypeList
            total={pageResult.totalCount}
            loading={false}
            data={filterAssetType}
            onActivateOrDeactivate={this.onActivateOrDeactivate}
            onEdit={this.onEdit}
            renderIsActive={this.renderIsActive}
          />
        </DataTable>

        <AssetTypeModal
          visible={visible}
          handleOK={this.onCreateOrUpdate}
          onClose={this.onShowAddEditModal(false)}
          handleCancel={this.onCancelAddEditModal}
          data={this.state.selectedItem}
        />
      </>
    ) : (
      <NoRole />
    )
  }
}

export default Assets
