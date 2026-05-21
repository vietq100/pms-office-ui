import {
  CloseOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CheckOutlined,
  EllipsisOutlined
} from '@ant-design/icons/lib'
import AppComponentBase from '@components/AppComponentBase'
import DataTable from '@components/DataTable'
import { L, LNotification } from '@lib/abpUtility'
import { appPermissions } from '@lib/appconst'
import { notifySuccess } from '@lib/helper'
import { IFeeGroup } from '@models/fee'
import FeeGroupStore from '@stores/fee/feeGroupStore'
import Stores from '@stores/storeIdentifier'
import { Button, Checkbox, Col, Dropdown, Menu, Modal, Row, Table } from 'antd'
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

interface Props {
  navigate: any
  feeGroupStore?: FeeGroupStore
}

type CheckedRecord = { [key: string]: IFeeGroup }

interface State {
  isCheckAll: boolean
  selectedRecords: CheckedRecord
  markSubTableUpdate: string
  maxResultCount: any
}

@inject(Stores.FeeGroupStore)
@observer
class FeeGroup extends AppComponentBase<Props, State> {
  state = {
    isCheckAll: false,
    selectedRecords: {} as any,
    markSubTableUpdate: uuid(),
    maxResultCount: 10
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
        unitId: record.unitId,
        isActive: this.props.feeGroupStore?.filterObject?.isActive
      }}
    />
  )

  handleMarkGroupStatus = () => {
    this.submit(false, this.props.feeGroupStore?.markGroupStatus)
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
          self.setState({ markSubTableUpdate: uuid() }, () =>
            notifySuccess(LNotification('SUCCESS'), LNotification(L('ITEM_UPDATE_SUCCEED')))
          )
        })
      }
    })
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
      <div className="flex center-items right-content action-menu">
        {/* <Button
          shape="round"
          ghost
          size={'large'}
          className="mr-1 primary btn-icon-customize"
          type="primary"
          className="mx-2"
          onClick={this.props.feeGroupStore?.download}
          icon={
            // <span className="btn-icon">
            <ExcelIcon />
            // </span>
          }
          disabled={!pagedResult || pagedResult?.totalCount === 0 || isLoading}>
          {L('EXPORT_EXCEL')}
        </Button> */}
        <Button
          shape="circle"
          type="primary"
          className="pt-1 mx-2"
          onClick={this.props.feeGroupStore?.download}
          icon={<ExcelIcon />}
          disabled={!pagedResult || pagedResult?.totalCount === 0 || isLoading}
        />
      </div>
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
        unitId: record.unitId
      }))
    }
  }

  render(): React.ReactNode {
    const { feeGroupStore } = this.props
    const { pagedResult, isLoading } = feeGroupStore || {}
    const { selectedRecords } = this.state
    // const showNotifyToResident =
    //   filterObject?.groupName === feeSourceGroup.feeManagement
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
        title: `${L('PROJECT')}/ ${L('FEE_CUSTOMER_CODE')}`,
        width: '15%',
        render: (_, record) => {
          return (
            <Row>
              <Col sm={{ span: 21, offset: 0 }}>
                <div className="full-name text-truncate text-link-to-detail">{record.fullUnitCode}</div>
              </Col>
              <Col sm={{ span: 3, offset: 0 }}>
                <Dropdown
                  trigger={['click']}
                  overlay={
                    <Menu>
                      <Menu.Item disabled={record.debitAmount <= 0} onClick={() => this.createReceipt(record)}>
                        {this.L('FEE_RECEIPT_CREATE')}
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
        }
      }
    )
    return (
      <div className="fee-unit-container">
        <DataTable
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
          {/* {showNotifyToResident && (
            <Button
              className="mr-1"
              shape="round"
              onClick={() =>
                this.handleSendNotification(notificationTypes.email)
              }
              disabled={
                (isEmpty(selectedRecords) &&
                  (!projectId ||
                    !filterObject.packageId ||
                    pagedResult?.items?.length === 0)) ||
                isLoading
              }
              icon={<MailOutlined />}>
              {L('BTN_NOTIFY_EMAIL')}
            </Button>
          )}

          {showNotifyToResident &&
            isGranted(appPermissions.feeStatement.update) && (
              <Button
                className="mr-1"
                shape="round"
                onClick={() =>
                  this.handleSendNotification(notificationTypes.inApp)
                }
                disabled={
                  (isEmpty(selectedRecords) &&
                    (!projectId ||
                      !filterObject.packageId ||
                      pagedResult?.items?.length === 0)) ||
                  isLoading
                }
                icon={<NotificationOutlined />}>
                {L('BTN_NOTIFY_APP')}
              </Button>
            )} */}
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
            </>
          )}
          <Button
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
          </Button>
        </ActionFooter>
      </div>
    )
  }

  getRowKey = (record: IFeeGroup) => {
    return `${get(record, 'package.id')}${get(record, 'package.period')}${get(record, 'fullUnitCode')}${get(
      record,
      'package.name'
    )}${get(record, 'package.creationTime')}${get(record, 'feeTypeId', '')}${get(record, 'id', '')}${get(
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
      portalLayouts.feeCreateReceiptV1.path.replace(
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
