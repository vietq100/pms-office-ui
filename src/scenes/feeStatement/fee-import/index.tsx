import React from 'react'
import AppComponentBase from '@components/AppComponentBase'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import { FeeImportList } from './components/FeeImportList'
import './fee-import.less'
import FeeStore from '@stores/fee/feeStore'
import PackageFeeStore from '@stores/fee/packageFeeStore'
import { Button, Modal } from 'antd'
import { CheckOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons/lib'
import FeeImportModal from '@scenes/feeStatement/fee-import/components/FeeImportModal'
import DataTable from '@components/DataTable'
import { IFee, IFeeRefundModel } from '@models/fee'
import { notifySuccess } from '@lib/helper'
import { L, LNotification } from '@lib/abpUtility'
import EditImportFeeModal from './components/EditImportFeeModal'
import { appPermissions } from '@lib/appconst'
import { portalLayouts } from '@components/Layout/Router/router.config'
import FeeGroupStore from '@stores/fee/feeGroupStore'
import FeeRefundModal from '@scenes/feeStatement/fee-refund/FeeRefundModal'
import ActionFooter from '@components/ActionFooter'
import { ExcelIcon } from '@components/Icon'
import withRouter from '@components/Layout/Router/withRouter'
import CreateFeeModal from './components/CreateFeeModal'

export interface IFeesProps {
  navigate?: any
  feeStore?: FeeStore
  packageFeeStore?: PackageFeeStore
  feeGroupStore?: FeeGroupStore
}

export interface IFeesState {
  visible: boolean
  refundModalVisible: boolean
  selectedFee: any
  editVisible: boolean
  currentPage: number
  selectedFeeIds: any
  createFeeModalVisible: boolean
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
    selectedFeeIds: [] as any
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
    const skipCount = Number((paging.current - 1) * (feeStore?.filterFee.maxResultCount || 10))
    feeStore?.setFilter('skipCount', skipCount)
    feeStore?.setCurrentPage(paging.current)
    await feeStore?.getAll({ skipCount })
    this.setState({ currentPage: 1 })
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

  public renderActions = () => {
    const { fee } = this.props.feeStore || {}
    return (
      <div className="flex center-items right-content action-menu">
        {this.isGranted(appPermissions.feeStatement.create) && (
          <React.Fragment>
            <Button
              type="primary"
              shape="circle"
              className="ml-1"
              onClick={() => this.setState({ createFeeModalVisible: true })}
              icon={<PlusOutlined />}
            />
          </React.Fragment>
        )}
        <Button
          shape="circle"
          type="primary"
          className="ml-1 mx-2"
          onClick={this.handleExportFees}
          icon={<ExcelIcon />}
          disabled={!fee || !fee.totalCount}
        />
      </div>
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
          }}>
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
          onClose={() => this.setState({ createFeeModalVisible: false })}
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
        </ActionFooter>
      </div>
    )
  }
}

export default withRouter(FeeImport)
