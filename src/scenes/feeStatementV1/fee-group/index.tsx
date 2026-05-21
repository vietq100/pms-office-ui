import {
  CloseOutlined,
  MailOutlined,
  NotificationOutlined,
  CheckOutlined,
  PlusOutlined,
  FilterFilled,
  DollarOutlined
} from '@ant-design/icons/lib'
import AppComponentBase from '@components/AppComponentBase'
import DataTable from '@components/DataTable'
import { isGranted, L, LNotification } from '@lib/abpUtility'
import AppConsts, { appPermissions, listFeePaymentStatus } from '@lib/appconst'
import { notifyInfo, notifySuccess } from '@lib/helper'
import { IFeeGroup } from '@models/fee'
import FeeGroupStore from '@stores/fee/feeGroupStore'
import Stores from '@stores/storeIdentifier'
import { Button, Checkbox, Col, Modal, Row, Select, Table } from 'antd'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import { inject, observer } from 'mobx-react'
import React from 'react'
import GroupFeeTableExpanded from './components/GroupTableExpanded'
import withRouter from '@components/Layout/Router/withRouter'
import uniqBy from 'lodash/uniqBy'
import { v4 as uuid } from 'uuid'
import { portalLayouts } from '@components/Layout/Router/router.config'
import ActionFooter from '@components/ActionFooter'
import getColumns from './columns'
import { ExcelIcon } from '@components/Icon'
import CreateFeeModal from '../fee-import/components/CreateFeeModal'
import FeeStore from '@stores/fee/feeStore'

const { notificationTypes, feeSourceGroup, pageSize } = AppConsts

interface Props {
  navigate: any
  feeGroupStore?: FeeGroupStore
  feeStore?: FeeStore
  changIsShow?: () => void
}

type CheckedRecord = { [key: string]: IFeeGroup }

interface State {
  isCheckAll: boolean
  selectedRecords: CheckedRecord
  markSubTableUpdate: string
  maxResultCount: any
  createFeeModalVisible: boolean
  isShowChangeStatus: boolean
  statusChangeFee: number | undefined
}

@inject(Stores.FeeGroupStore)
@observer
class FeeGroup extends AppComponentBase<Props, State> {
  state = {
    isCheckAll: false,
    selectedRecords: {} as any,
    markSubTableUpdate: uuid(),
    maxResultCount: pageSize.pageSize_10,
    createFeeModalVisible: false,
    isShowChangeStatus: false,
    statusChangeFee: undefined
  }

  componentWillReceiveProps(nextProps: Readonly<Props>) {
    const selectedProjectChanges = Object.keys(this.state.selectedRecords)
    if (selectedProjectChanges.length) {
      const projectId = get(this.state.selectedRecords[selectedProjectChanges[0]], 'project.id')
      if (projectId !== nextProps.feeGroupStore?.projectId) {
        this.setState({
          selectedRecords: {},
          isCheckAll: false
        })
      }
    }
  }

  componentWillUnmount() {
    this.props.feeGroupStore?.resetFilter()
  }

  handleCheckAll = (e) => {
    const { feeGroupStore } = this.props
    const checked = e.target.checked
    if (checked) {
      const selectedRecords = feeGroupStore?.pagedResult.items.reduce((result, current: IFeeGroup) => {
        result[this.getRowKey(current)] = current
        return result
      }, {}) as any

      this.setState({ selectedRecords, isCheckAll: checked })
    } else this.setState({ selectedRecords: {}, isCheckAll: checked })
  }

  getAll = async () => {
    await this.props.feeGroupStore?.getAll({})
  }

  handleCheckOnItem = (record: IFeeGroup) => (e) => {
    const isChecked = e.target.checked
    const newSelectedRecords = { ...this.state.selectedRecords }
    if (isChecked) {
      newSelectedRecords[this.getRowKey(record)] = record
    } else {
      delete newSelectedRecords[this.getRowKey(record)]
    }
    const isCheckAll = Object.keys(newSelectedRecords).length === this.props.feeGroupStore?.pagedResult.items.length
    this.setState({
      selectedRecords: newSelectedRecords,
      isCheckAll
    })
  }

  handlePagingChange = (paging) => {
    const skipCount = --paging.current * paging.pageSize
    const maxResultCount = paging.pageSize
    this.setState({ maxResultCount })
    this.props.feeGroupStore?.getAll({
      maxResultCount,
      skipCount
    })
  }

  expandedRowRender = (record) => (
    <GroupFeeTableExpanded
      key={this.getRowKey(record)}
      markUpdate={this.state.markSubTableUpdate}
      data={{
        feeTypeId: this.props.feeGroupStore?.filterObject?.feeTypeId,
        packageId: record.package.id,
        feeStatusId: this.props.feeGroupStore?.filterObject?.feeStatusId,
        groupName: this.props.feeGroupStore?.filterObject?.groupName,
        companyId: record.companyId,
        isActive: this.props.feeGroupStore?.filterObject?.isActive
      }}
    />
  )

  handleMarkGroupStatus = () => {
    this.submit(false, this.props.feeGroupStore?.markGroupStatus)
  }

  onShowChangStatusFee = () => {
    this.setState({ isShowChangeStatus: true })
  }

  handleMarkGroupStatusActive = () => {
    this.submit(true, this.props.feeGroupStore?.markGroupStatus)
  }
  handleMarkGroupShowResidents = () => {
    this.submit(true, this.props.feeGroupStore?.markGroupShowToResidents)
  }
  handleMarkGroupHideResidents = () => {
    this.submit(false, this.props.feeGroupStore?.markGroupShowToResidents)
  }

  submit = (action, callback) => {
    const self = this
    Modal.confirm({
      title: LNotification(self.L('DO_YOU_WANT_TO_UPDATE_THESE_ITEM')),
      okText: self.L('BTN_YES'),
      cancelText: self.L('BTN_NO'),
      onOk() {
        const payload = self.createPayload(action)
        return callback(payload).then(() => {
          self.setState({ markSubTableUpdate: uuid() }, async () => {
            notifySuccess(LNotification('SUCCESS'), LNotification(L('ITEM_UPDATE_SUCCEED')))
            await self.getAll()
          })
        })
      }
    })
  }

  handleChangeStatusFee = async () => {
    if (!this.state.statusChangeFee) {
      notifyInfo(LNotification('WARNING'), LNotification('PLEASE_SELECT_STATUS'))
      return
    }

    const payload = this.createPayloadChangeStatusFee()

    await this.props.feeGroupStore?.changeStatusFeeGroup(payload)
    this.setState({ markSubTableUpdate: uuid() }, () =>
      notifySuccess(LNotification('SUCCESS'), LNotification(L('ITEM_UPDATE_SUCCEED')))
    )

    this.setState({ isShowChangeStatus: false, statusChangeFee: undefined })
  }

  showDropDownChangeStatus = () => {
    this.setState({ isShowChangeStatus: true })
  }

  handleSendNotification = (notificationMethod) => {
    const self = this
    Modal.confirm({
      title: LNotification(self.L('DO_YOU_WANT_TO_SEND_THESE_ITEM_TO_RESIDENT')),
      okText: self.L('BTN_YES'),
      cancelText: self.L('BTN_NO'),
      onOk() {
        const payload: any = self.createPayload(true)
        payload.notificationMethod = notificationMethod
        delete payload['action']
        const { feeGroupStore } = self.props
        if (feeGroupStore?.filterObject.packageId) {
          payload.projectId = feeGroupStore.projectId
          payload.packageId = Number(feeGroupStore!.filterObject.packageId)
        } else {
          const selectedRecords = Object.keys(self.state.selectedRecords)
          const firstRecord = self.state.selectedRecords[selectedRecords[0]]
          payload.projectId = get(firstRecord, 'project.id')
        }

        self.props.feeGroupStore?.notify(payload)
      }
    })
  }

  renderActions = () => {
    const { pagedResult, isLoading } = this.props.feeGroupStore || {}
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
          <React.Fragment>
            <Button
              type="primary"
              shape="circle"
              className="mr-1"
              onClick={() => this.setState({ createFeeModalVisible: true })}
              icon={<PlusOutlined />}
            />
          </React.Fragment>
        )}
        {this.isGranted(appPermissions.feeStatement.export) && (
          <Button
            shape="circle"
            type="primary"
            className="mr-1"
            onClick={this.props.feeGroupStore?.download}
            icon={<ExcelIcon />}
            disabled={!pagedResult || pagedResult?.totalCount === 0 || isLoading}
          />
        )}
      </span>
    )
  }

  createPayload = (action: boolean) => {
    const { selectedRecords } = this.state
    const { feeGroupStore } = this.props

    const values: IFeeGroup[] = Object.values(selectedRecords)
    return {
      projectId: feeGroupStore?.projectId,
      action,
      packageCompanies: values.map((record) => ({
        packageId: record.package.id,
        companyId: record.companyId
      }))
    }
  }

  createPayloadChangeStatusFee = () => {
    const { selectedRecords } = this.state
    const { feeGroupStore } = this.props
    const values: IFeeGroup[] = Object.values(selectedRecords)

    return {
      projectId: feeGroupStore?.projectId,
      feePaymentStatus: this.state.statusChangeFee,
      packageCompanies: values.map((record) => ({
        packageId: record?.package?.id,
        companyId: record.companyId
      }))
    }
  }

  render(): React.ReactNode {
    const { feeGroupStore } = this.props
    const { filterObject = {} as any, projectId, pagedResult, isLoading } = feeGroupStore || {}
    const { selectedRecords } = this.state
    const showNotifyToResident = filterObject?.groupName === feeSourceGroup.feeManagement
    const columns = getColumns(
      {
        title: (
          <Checkbox
            onChange={this.handleCheckAll}
            checked={this.state.isCheckAll}
            disabled={uniqBy(this.props.feeGroupStore?.pagedResult.items, 'project.id').length > 1}
          />
        ),
        render: (_, record) => {
          const checked = this.state.selectedRecords[this.getRowKey(record)] !== undefined
          return (
            <Checkbox
              onChange={this.handleCheckOnItem(record)}
              checked={checked}
              disabled={this.validateRowChecked(this.state, record)}
            />
          )
        },
        width: '3%'
      },
      {
        title: `${L('COMPANY')}`,
        width: '15%',
        render: (_, record) => {
          return (
            <Row>
              <Col sm={{ span: 24, offset: 0 }}>
                <div className="full-name text-truncate text-link-to-detail">{record.company?.companyName}</div>
              </Col>
            </Row>
          )
        }
      }
    )
    return (
      <>
        <div className="fee-unit-container">
          <DataTable
            onRefresh={this.getAll}
            title={this.L('FEE_PACKAGE_UNIT_LIST')}
            actionGroups={this.renderActions}
            pagination={{
              pageSize: this.state.maxResultCount,
              total: feeGroupStore?.pagedResult?.totalCount,
              onChange: this.handlePagingChange,
              current: feeGroupStore!.filterObject.skipCount / 10 + 1
            }}
            showChangePageSize={true}>
            <Table
              size={'middle'}
              pagination={false}
              className="custom-ant-table custom-ant-row"
              loading={isLoading}
              columns={columns}
              dataSource={pagedResult?.items}
              expandable={{ expandedRowRender: this.expandedRowRender }}
              scroll={{ x: 1000, y: 500, scrollToFirstRowOnChange: true }}
              rowKey={(record: any) => this.getRowKey(record)}
            />
          </DataTable>

          <ActionFooter show={!isEmpty(selectedRecords)}>
            {showNotifyToResident && (
              <Button
                className="mr-1"
                shape="round"
                onClick={() => this.handleSendNotification(notificationTypes.email)}
                disabled={
                  (isEmpty(selectedRecords) &&
                    (!projectId || !filterObject.packageId || pagedResult?.items?.length === 0)) ||
                  isLoading
                }
                icon={<MailOutlined />}>
                {L('BTN_NOTIFY_EMAIL')}
              </Button>
            )}

            {showNotifyToResident && isGranted(appPermissions.feeStatement.update) && (
              <Button
                className="mr-1"
                shape="round"
                onClick={() => this.handleSendNotification(notificationTypes.inApp)}
                disabled={
                  (isEmpty(selectedRecords) &&
                    (!projectId || !filterObject.packageId || pagedResult?.items?.length === 0)) ||
                  isLoading
                }
                icon={<NotificationOutlined />}>
                {L('BTN_NOTIFY_APP')}
              </Button>
            )}
            {this.isGranted(appPermissions.feeStatement.update) && (
              <>
                <Button
                  shape="round"
                  className="mr-1 primary btn-icon-customize"
                  type="primary"
                  onClick={() => this.handleMarkGroupStatusActive()}
                  icon={<CheckOutlined className="text-success" />}
                  disabled={isEmpty(selectedRecords)}>
                  {L('BTN_ACTIVATE')}
                </Button>
                <Button
                  shape="round"
                  className="mr-1 primary btn-icon-customize"
                  type="primary"
                  onClick={() => this.handleMarkGroupStatus()}
                  icon={<CloseOutlined className="color-error" />}
                  disabled={isEmpty(selectedRecords)}>
                  {L('BTN_DEACTIVATE')}
                </Button>

                <Button
                  shape="round"
                  className="mr-1 primary btn-icon-customize"
                  type="primary"
                  onClick={this.onShowChangStatusFee}
                  icon={<DollarOutlined />}
                  disabled={isEmpty(selectedRecords)}>
                  {L('BTN_CHANGE_STATUS')}
                </Button>
              </>
            )}
            {/* <Button
              type="primary"
              shape="round"
              className="mr-1"
              onClick={() => {
                this.handleMarkGroupShowResidents()
              }}
              disabled={isEmpty(selectedRecords)}
              icon={<EyeOutlined />}>
              {this.L('BTN_SHOW_RESIDENTS')}
            </Button>
            <Button
              type="primary"
              shape="round"
              className="mr-1"
              onClick={() => {
                this.handleMarkGroupHideResidents()
              }}
              disabled={isEmpty(selectedRecords)}
              icon={<EyeInvisibleOutlined />}>
              {this.L('BTN_HIDE_RESIDENTS')}
            </Button> */}
          </ActionFooter>
        </div>
        <CreateFeeModal
          feeStore={this.props.feeStore}
          visible={this.state.createFeeModalVisible}
          onClose={() => {
            this.getAll()
            this.setState({ createFeeModalVisible: false })
          }}
        />

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
      </>
    )
  }

  getRowKey = (record: IFeeGroup) => {
    return `${get(record, 'package.id')}${get(record, 'package.period')}${get(record, 'fullUnitCode')}${get(
      record,
      'package.name'
    )}${get(record, 'package.creationTime')}${get(record, 'feeTypeId', '')}${get(record, 'companyId', '')}${get(
      record,
      'billNumber',
      ''
    )}`
  }

  validateRowChecked = (state: State, rowRecord) => {
    const selectedRecords = Object.keys(state.selectedRecords)
    if (!selectedRecords.length) return false
    const firstRecord = state.selectedRecords[selectedRecords[0]]

    return !(get(firstRecord, 'project.id') === get(rowRecord, 'project.id'))
  }

  createReceipt = (record) => {
    const { navigate } = this.props
    navigate(
      portalLayouts.feeCreateReceiptV2.path.replace(
        ':id',
        JSON.stringify({
          ...record,
          residentUnitId: this.props.feeGroupStore?.residentUnitId,
          groupName: this.props.feeGroupStore?.filterObject?.groupName || ''
        })
      )
    )
  }
}

export default withRouter(FeeGroup)
