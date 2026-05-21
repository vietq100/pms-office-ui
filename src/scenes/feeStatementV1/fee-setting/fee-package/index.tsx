import AppComponentBase from '@components/AppComponentBase'

import DataTable from '@components/DataTable'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import { Button, Col, Input, InputNumber, Modal, Row } from 'antd'
import PackageFeeStore from '@stores/fee/packageFeeStore'
import { PackageFeeList } from './components/PackageFeeList'
import { IPackageFee } from '@models/fee'
import PackageFeeModal from './components/PackageFeeModal'
import { toJS } from 'mobx'
import { L, LNotification } from '@lib/abpUtility'
import debounce from 'lodash/debounce'
import ProjectStore from '@stores/project/projectStore'
import { notifySuccess } from '@lib/helper'
import { appPermissions } from '@lib/appconst'
import PackageFeeBulkModal from '@scenes/feeStatement/fee-package/components/PackageFeeBulkModal'
import { AppstoreAddOutlined } from '@ant-design/icons/lib'
import { portalLayouts } from '@components/Layout/Router/router.config'
import SessionStore from '@stores/sessionStore'
import withRouter from '@components/Layout/Router/withRouter'

const confirm = Modal.confirm
export interface PackageFeeProps {
  navigate: any
  packageFeeStore: PackageFeeStore
  projectStore: ProjectStore
  sessionStore: SessionStore
}

export interface PackageFeeState {
  skipCount: number
  maxResultCount: number
  keyword: string
  visible: boolean
  visibleBulkModal: boolean
  projectId: number | undefined
  selectedItem: IPackageFee | null
  period?: number
  requiredCreate?: boolean
}

@inject(Stores.PackageFeeStore, Stores.ProjectStore, Stores.SessionStore)
@observer
class PackageFee extends AppComponentBase<PackageFeeProps, PackageFeeState> {
  constructor(props) {
    super(props)
    this.state = {
      maxResultCount: 24,
      skipCount: 0,
      keyword: '',
      projectId: undefined,
      period: undefined,
      visible: false,
      visibleBulkModal: false,
      selectedItem: null,
      requiredCreate: false
    }
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    await Promise.all([this.getAll(), this.props.projectStore.filterOptions({})])

    if (this.props.sessionStore!.appSettingConfiguration?.isReminderCreateFeePackage) {
      this.setState({ requiredCreate: true }, this.handleCreateBulkClick)
    }
  }

  getAll = (params = {}) =>
    this.props.packageFeeStore.getAll({
      skipCount: this.state.skipCount,
      maxResultCount: this.state.maxResultCount,
      keyword: this.state.keyword,
      projectId: this.state.projectId,
      period: this.state.period,
      ...params
    })

  handleTableChange = (paging) => {
    this.setState({ skipCount: --paging.current * (this.state.maxResultCount || 24) }, this.getAll)
  }

  handlePeriodSearch = (value) => {
    this.setState({ period: value, skipCount: 0 }, this.getAll)
  }

  delete = (id: number | undefined) => {
    if (id) {
      const { packageFeeStore } = this.props
      confirm({
        title: LNotification('PACKAGE_FEE_CONFIRM_DELETE_TITLE'),
        okText: L('BTN_YES'),
        cancelText: L('BTN_NO'),
        onOk: async () => {
          await packageFeeStore.delete(id)
          this.handleTableChange({ current: 1 })
          notifySuccess(LNotification('SUCCESS'), LNotification(this.L('ITEM_DELETE_SUCCEED')))
        }
      })
    }
  }
  onClose = (id: number | undefined, isClosed: boolean) => {
    if (id) {
      const { packageFeeStore } = this.props
      confirm({
        title: LNotification('PACKAGE_FEE_CONFIRM_CLOSE_TITLE'),
        okText: L('BTN_YES'),
        cancelText: L('BTN_NO'),
        onOk: async () => {
          await packageFeeStore.close(id, !isClosed)

          this.handleTableChange({ current: 1 })
          notifySuccess(LNotification('SUCCESS'), LNotification(this.L('ITEM_CLOSE_SUCCED')))
        }
      })
    }
  }

  deleteYear = (year: number | undefined) => {
    if (year) {
      const { packageFeeStore } = this.props
      confirm({
        title: LNotification('PACKAGE_FEE_CONFIRM_DELETE_TITLE'),
        okText: L('BTN_YES'),
        cancelText: L('BTN_NO'),
        onOk: async () => {
          await packageFeeStore.deleteYear(year)
          this.handleTableChange({ current: 1 })
          notifySuccess(LNotification('SUCCESS'), LNotification(this.L('ITEM_DELETE_SUCCEED')))
        }
      })
    }
  }

  handleSearch = (value: string) => {
    this.setState({ keyword: value, skipCount: 0 }, this.getAll)
  }

  onSelectItemFromList = (selectedItem) => this.setState({ selectedItem: toJS(selectedItem), visible: true })

  handleCreateClick = () => this.setState({ selectedItem: null, visible: true })

  handleCreateBulkClick = () => this.setState({ visibleBulkModal: true })

  closeModal = () => this.setState({ visible: false })

  closeBulkModal = () => this.setState({ visibleBulkModal: false })

  onCreateOrUpdate = async (pf: IPackageFee) => {
    const { selectedItem } = this.state
    if (selectedItem) {
      await this.props.packageFeeStore.update(Object.assign({}, selectedItem, pf))
      this.setState({ selectedItem: null, visible: false })
    } else {
      this.setState({ selectedItem: null, visible: false })
      await this.props.packageFeeStore.create(pf)
    }

    this.handleSearch('')
  }

  onCreateBulk = async (feePackages: IPackageFee[]) => {
    this.setState({ visibleBulkModal: false })
    await this.props.packageFeeStore.createBulk(feePackages)

    if (this.state.requiredCreate) {
      const { navigate } = this.props
      navigate(portalLayouts.feePackage.path)
      return
    }
    this.handleSearch('')
  }

  handleSearchProjects = (keyword) => this.props.projectStore.filterOptions({ keyword })

  handleProjectChange = (projectId: number) => {
    this.setState({ projectId, skipCount: 0 }, this.getAll)
  }

  renderActionGroups = () => {
    return (
      <span className="mr-2">
        {this.isGranted(appPermissions.feePackage.create) && (
          <Button
            shape="circle"
            size={'large'}
            className="mr-1"
            onClick={this.handleCreateBulkClick}
            icon={<AppstoreAddOutlined />}></Button>
        )}
      </span>
    )
  }

  public render() {
    const { visible, visibleBulkModal, selectedItem } = this.state
    const { packageFeeStore } = this.props
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Input.Search maxLength={200} onSearch={this.handleSearch} placeholder={this.L('PACKAGE_FEE_NAME')} />
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_PERIOD')}</label>
          <InputNumber style={{ width: '100%' }} onChange={debounce(this.handlePeriodSearch, 300)} />
        </Col>
      </Row>
    )
    return (
      <div className="fee-period-container">
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={() => this.handleSearch(this.state.keyword)}
          title={this.L('PACKAGE_FEE_LIST')}
          onCreate={this.handleCreateClick}
          actionGroups={this.renderActionGroups}
          pagination={{
            pageSize: 24,
            current: this.currentPage,
            total: packageFeeStore.pagedResult.totalCount,
            onChange: this.handleTableChange,
            defaultCurrent: 1
          }}
          createPermission={appPermissions.feePackage.create}>
          <PackageFeeList
            onEdit={this.onSelectItemFromList}
            onDelete={this.delete}
            onClose={(id, isClosed) => this.onClose(id, isClosed)}
            onDeleteYear={this.deleteYear}
            loading={this.props.packageFeeStore.isLoading}
            data={packageFeeStore.pagedResult.items}
            total={packageFeeStore.pagedResult.totalCount}
            onPageChange={this.handleTableChange}
          />
        </DataTable>
        <PackageFeeModal
          visible={visible}
          packageFee={selectedItem}
          callback={this.onCreateOrUpdate}
          handleCancel={this.closeModal}
          onSearchProject={this.handleSearchProjects}
          projects={this.props.projectStore.projectOptions}
        />
        <PackageFeeBulkModal
          visible={visibleBulkModal}
          requiredCreate={this.state.requiredCreate}
          callback={this.onCreateBulk}
          handleCancel={this.closeBulkModal}
        />
      </div>
    )
  }
}

export default withRouter(PackageFee)
