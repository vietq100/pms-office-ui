import AppComponentBase from '@components/AppComponentBase'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import { FeeImportList } from './components/FeeImportList'
import FeeStore from '@stores/fee/feeStore'
import PackageFeeStore from '@stores/fee/packageFeeStore'
import { Button, Modal, Select } from 'antd'
import { CheckOutlined, CloseOutlined, DollarOutlined, FilterFilled, PlusOutlined } from '@ant-design/icons/lib'
import FeeImportModal from '@scenes/feeStatement/fee-import/components/FeeImportModal'
import DataTable from '@components/DataTable'
import { IFee, IFeeRefundModel } from '@models/fee'
import { notifyInfo, notifySuccess } from '@lib/helper'
import { L, LNotification } from '@lib/abpUtility'
import EditImportFeeModal from './components/EditImportFeeModal'
import AppConsts, { appPermissions, listFeePaymentStatus } from '@lib/appconst'
import { portalLayouts } from '@components/Layout/Router/router.config'
import FeeGroupStore from '@stores/fee/feeGroupStore'
import FeeRefundModal from '@scenes/feeStatement/fee-refund/FeeRefundModal'
import ActionFooter from '@components/ActionFooter'
import { ExcelIcon } from '@components/Icon'
import withRouter from '@components/Layout/Router/withRouter'
import CreateFeeModal from './components/CreateFeeModal'

const { pageSize } = AppConsts

export interface IFeesProps {
  navigate?: any
  feeStore?: FeeStore
  packageFeeStore?: PackageFeeStore
  feeGroupStore?: FeeGroupStore
  changIsShow?: () => void
}

export interface IFeesState {
  visible: boolean
  refundModalVisible: boolean
  selectedFee: any
  editVisible: boolean
  currentPage: number
  selectedFeeIds: any
  createFeeModalVisible: boolean
  isShowChangeStatus: boolean
  statusChangeFee: number | undefined
}

@inject(Stores.FeeStore, Stores.PackageFeeStore)
@observer
class FeeImport extends AppComponentBase<IFeesProps, IFeesState> {
  state = {
    visible: false,
    createFeeModalVisible: false,
    refundModalVisible: false,
    selectedFee: null,
    editVisible: false,
    currentPage: 1,
    selectedFeeIds: [] as any,
    isShowChangeStatus: false,
    statusChangeFee: undefined
  }

  componentDidMount() {
    return this.getAll()
  }

  updateSelectedFees = (selectedFeeIds) => {
    this.setState({ selectedFeeIds })
  }

  getAll = async () => {
    await this.props.feeStore?.getAll({})
  }

  handleExportFees = async () => {
    const { feeStore } = this.props
    await feeStore?.exportFees({})
  }

  handleImportFee = async (file, packageId, description) => {
    await this.props.feeStore?.importFee(file, packageId, description)
    await this.getAll()
    this.toggleModal()
  }

  toggleModal = () => this.setState((prevState) => ({ visible: !prevState.visible }))

  handlePagingChange = async (paging) => {
    const { feeStore } = this.props
    const skipCount = Number((paging.current - 1) * (feeStore?.filterFee.maxResultCount || pageSize.pageSize_10))
    feeStore?.setFilter('skipCount', skipCount)
    feeStore?.setCurrentPage(paging.current)
    await feeStore?.getAll({ skipCount })
    this.setState({ currentPage: paging.current })
  }

  handleShowHideToResident = async (record: IFee) => {
    await this.props.feeStore?.showHideToResident(record)
    await this.getAll()
    notifySuccess(LNotification('SUCCESS'), LNotification(this.L('ITEM_UPDATE_SUCCEED')))
  }

  handleCollectDeposit = async (record: IFee) => {
    const { navigate } = this.props
    navigate(
      portalLayouts.feeCreateReceiptV1.path,
      JSON.stringify({
        unitId: record.unitId,
        selectedFeeId: record.id,
        residentUnitId: this.props.feeGroupStore?.residentUnitId
      })
    )
  }

  handleChangeStatus = async (record: IFee) => {
    await this.props.feeStore?.activate(record.id || 0, !record.isActive)
    await this.getAll()
    notifySuccess(LNotification('SUCCESS'), LNotification(this.L('ITEM_UPDATE_SUCCEED')))
  }

  handleOpenEditModal = (record) => {
    this.setState({ selectedFee: record, editVisible: true })
  }

  handleEditFee = async (updatedOne) => {
    await this.props.feeStore?.update(updatedOne)
    await this.getAll()
  }

  handleCloseEditModal = () => this.setState({ selectedFee: null, editVisible: false })

  handleActivateOrDeactivate = (isActive) => {
    Modal.confirm({
      title: LNotification('DO_YOU_WANT_TO_UPDATE_THESE_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await this.props.feeStore?.updateStatus(isActive, this.state.selectedFeeIds)
        await this.handlePagingChange({ current: 1 })
        this.updateSelectedFees([])
      }
    })
  }

  showDropDownChangeStatus = () => {
    this.setState({ isShowChangeStatus: true })
  }

  // Refund fee
  handleOpenRefundModal = (feeDetail) => {
    this.props.feeStore?.setRefundDepositModel(feeDetail)
    this.setState({ refundModalVisible: true })
  }

  handleCloseRefundModal = () => this.setState({ refundModalVisible: false })

  handleRefundFee = async (data: IFeeRefundModel) => {
    await this.props.feeStore?.refundDepositFee(data)
    this.getAll()
    this.handleCloseRefundModal()
  }

  //TODO: chua handle
  handleCreateFee = () => {
    console.log('null')
  }

  handleChangeStatusFee = async () => {
    if (!this.state.statusChangeFee) {
      notifyInfo(LNotification('WARNING'), LNotification('PLEASE_SELECT_STATUS'))
      return
    }

    await this.props.feeStore?.changeStatusFee({
      feeIds: this.state.selectedFeeIds,
      feePaymentStatus: this.state.statusChangeFee
    })
    this.setState({ isShowChangeStatus: false, statusChangeFee: undefined })
    this.getAll()
  }

  public renderActions = () => {
    // const groupName = this.props.feeStore?.filterFee?.groupName || ''
    const { fee } = this.props.feeStore || {}
    return (
      <span>
        <Button
          shape="circle"
          type="primary"
          className="mr-1"
          onClick={this.props.changIsShow}
          icon={<FilterFilled />}
        />
        {this.isGranted(appPermissions.feeStatement.create) && (
          <Button
            type="primary"
            shape="circle"
            className="mr-1"
            onClick={() => this.setState({ createFeeModalVisible: true })}
            icon={<PlusOutlined />}
          />
        )}
        {/* {this.isGranted(appPermissions.feeStatement.export) && groupName === feeSourceGroup.feeManagement && (
          <React.Fragment>
            <Button
              shape="round"
              type="primary"
              className="ml-1"
              onClick={this.props.feeStore?.downloadTemplate}
              icon={<DownloadOutlined />}>
              {L('BTN_DOWNLOAD_TEMPLATE')}
            </Button>

            <Button type="primary" shape="round" onClick={this.toggleModal} className="ml-1">
              <ImportOutlined /> {this.L('BTN_IMPORT')}
            </Button>

            <Button
              type="primary"
              shape="circle"
              className="ml-1"
              onClick={() => this.setState({ createFeeModalVisible: true })}
              icon={<PlusOutlined />}
            />
          </React.Fragment>
        )} */}
        {this.isGranted(appPermissions.feeStatement.export) && (
          <Button
            shape="circle"
            type="primary"
            className="mr-1"
            onClick={this.handleExportFees}
            icon={<ExcelIcon />}
            disabled={!fee || !fee.totalCount}
          />
        )}
      </span>
    )
  }

  public render() {
    const { feeStore } = this.props
    const { fee } = feeStore || {}
    const { visible, selectedFeeIds } = this.state
    return (
      <div className="fee-container">
        <DataTable
          onRefresh={this.getAll}
          title={this.L('FEE_IMPORT_LIST')}
          actionGroups={this.renderActions}
          pagination={{
            onChange: this.handlePagingChange,
            currentPage: this.state.currentPage,
            current: this.props.feeStore?.currentPage,
            total: this.props.feeStore?.fee?.totalCount,
            pageSize: this.props.feeStore?.filterFee.maxResultCount
          }}
          showChangePageSize={true}>
          <FeeImportList
            feeGroup={feeStore?.filterFee?.groupName}
            loading={feeStore?.isLoading}
            dataSource={fee?.items}
            selectedFeeIds={selectedFeeIds || []}
            handleEdit={this.handleOpenEditModal}
            onChangeStatus={this.handleChangeStatus}
            showHideToResident={this.handleShowHideToResident}
            updateSelectedFees={this.updateSelectedFees}
            collectDeposit={this.handleCollectDeposit}
            refundDeposit={this.handleOpenRefundModal}
          />
        </DataTable>
        <FeeImportModal visible={visible} onOk={this.handleImportFee} onClose={this.toggleModal} />
        <EditImportFeeModal
          onOk={this.handleEditFee}
          data={this.state.selectedFee}
          visible={this.state.editVisible}
          onClose={this.handleCloseEditModal}
        />
        <FeeRefundModal
          navigate={this.props.navigate}
          feeStore={this.props.feeStore}
          onOk={this.handleRefundFee}
          visible={this.state.refundModalVisible}
          onClose={this.handleCloseRefundModal}
        />
        <CreateFeeModal
          feeStore={this.props.feeStore}
          visible={this.state.createFeeModalVisible}
          onClose={() => {
            this.setState({ createFeeModalVisible: false })
            this.getAll()
          }}
        />
        <ActionFooter show={this.isGranted(appPermissions.feeStatement.update) && selectedFeeIds.length > 0}>
          <Button
            shape="round"
            className="mr-1 primary btn-icon-customize"
            type="primary"
            onClick={() => this.handleActivateOrDeactivate(true)}
            icon={<CheckOutlined className="color-success" />}
            disabled={!fee || !fee.totalCount}>
            {L('BTN_ACTIVATE')}
          </Button>
          <Button
            shape="round"
            className="mr-1 primary btn-icon-customize"
            type="primary"
            onClick={() => this.handleActivateOrDeactivate(false)}
            icon={<CloseOutlined className="color-error" />}
            disabled={!fee || !fee.totalCount}>
            {L('BTN_DEACTIVATE')}
          </Button>

          <Button
            shape="round"
            className="mr-1 primary btn-icon-customize"
            type="primary"
            onClick={this.showDropDownChangeStatus}
            icon={<DollarOutlined />}
            disabled={!fee || !fee.totalCount}>
            {L('BTN_CHANGE_STATUS')}
          </Button>
        </ActionFooter>

        <Modal
          open={this.state.isShowChangeStatus}
          onCancel={() => this.setState({ isShowChangeStatus: false, statusChangeFee: undefined })}
          onOk={this.handleChangeStatusFee}>
          <label>{L('CHANGE_STATUS_FEE')}</label>
          <Select
            allowClear
            style={{ width: '100%' }}
            value={this.state.statusChangeFee}
            onChange={(value) => this.setState({ statusChangeFee: value })}>
            {listFeePaymentStatus
              .filter((item) => item?.value !== '')
              .map((status) => (
                <Select.Option value={status.value} key={status.value}>
                  {status.label}
                </Select.Option>
              ))}
          </Select>
        </Modal>
      </div>
    )
  }
}

export default withRouter(FeeImport)
