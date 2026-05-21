import React from 'react'
import AppComponentBase from '@components/AppComponentBase'
import DataTable from '@components/DataTable'
import { Button, Col, Dropdown, Form, Input, Menu, Modal, Row, Select, Table } from 'antd'
import { convertFilterDate, notifySuccess } from '@lib/helper'
// import Filter from '@components/Filter'
import ReceiptStore from '@stores/fee/receiptStore'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import debounce from 'lodash/debounce'
import ProjectStore from '@stores/project/projectStore'
import '@scenes/feeStatement/receipt/components/receipt.less'
import UnitStore from '@stores/project/unitStore'
import { L, LNotification } from '@lib/abpUtility'
import { EllipsisOutlined, RollbackOutlined } from '@ant-design/icons/lib'
import { FormInstance } from 'antd/es/form'
import AppConst, { appPermissions, dateFormat } from '@lib/appconst'
import DatePicker from 'antd/lib/date-picker'
import unitService from '@services/project/unitService'
import FeeStore from '@stores/fee/feeStore'
import PackageFeeStore from '@stores/fee/packageFeeStore'
import { portalLayouts } from '@components/Layout/Router/router.config'
import getColumns from './columns'
import withRouter from '@components/Layout/Router/withRouter'
import OverViewFee from '@components/DataTable/OverViewFee'
import buildingService from '@services/project/buildingService'
import staffService from '@services/member/staff/staffService'
import { IFeeRefundModel } from '@models/fee'
import FeeRefundModalFrReceipt from '../fee-refund/FeeRefundModalFrReceipt'
import VoucherStore from '@stores/fee/voucherStore'
import { ExcelIcon } from '@components/Icon'

const { activeStatus, activeRefundable } = AppConst
const { RangePicker } = DatePicker
const { confirm } = Modal
interface State {
  skipCount: number
  selectedRecord: any
  openDeleteDialog: boolean
  filters: any
  units: any[]
  buildings: any[]
  users: any[]
  record: any
  refundModalVisible: boolean
}

interface Props {
  navigate: any
  projectStore: ProjectStore
  feeStore: FeeStore
  receiptStore: ReceiptStore
  unitStore: UnitStore
  packageFeeStore: PackageFeeStore
  voucherStore: VoucherStore
}

@inject(
  Stores.FeeStore,
  Stores.ReceiptStore,
  Stores.ProjectStore,
  Stores.UnitStore,
  Stores.PackageFeeStore,
  Stores.VoucherStore
)
@observer
class FeeReceipt extends AppComponentBase<Props, State> {
  maxResultCount = 10
  deleteFrom = React.createRef<FormInstance>()
  state = {
    skipCount: 0,
    openDeleteDialog: false,
    selectedRecord: null,
    units: [],
    buildings: [],
    refundModalVisible: false,
    users: [],
    record: [],
    filters: {
      keyword: '',
      projectId: undefined,
      unitId: undefined,
      isActive: true,
      buildingIds: undefined,
      creatorUserId: undefined,
      dateFromTo: undefined
    }
  }
  async componentDidMount() {
    await Promise.all([
      this.getAll(),
      this.props.unitStore.getAll({}),
      this.handleUnitSearch(''),
      this.handBuidlingsSearch(''),
      this.hanStaffsSearch(''),
      this.handlePackageFeeSearch(''),
      this.props.feeStore.getPaymentChannels()
    ])
  }

  handleSearch = (name, value) => {
    const { filters } = this.state
    if (name === 'dateFromTo') {
      this.setState({ filters: convertFilterDate(filters, value) }, async () => {
        if (name === 'projectId') {
          this.handleUnitSearch('')
        }
        await this.getAll()
      })
    } else {
      this.setState({ filters: { ...filters, [name]: value } }, async () => {
        if (name === 'projectId') {
          this.handleUnitSearch('')
        }
        await this.getAll()
      })
    }
  }

  getAll = async () => {
    await this.props.receiptStore.getAll({
      maxResultCount: this.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
    await this.props.receiptStore.getOverview(this.state.filters)
  }

  handlePackageFeeSearch = debounce(async (keyword) => {
    await this.props.packageFeeStore?.filterOption({ keyword })
  }, 100)

  handlePagingChange = ({ current }) => {
    this.setState({ skipCount: --current * this.maxResultCount }, this.getAll)
  }

  handleUnitSearch = debounce(async (keyword) => {
    const data = await unitService.getAll({ keyword, isActive: true })
    this.setState({ units: data.items || [] })
  }, 100)

  handBuidlingsSearch = debounce(async (keyword) => {
    const data = await buildingService.getAll({ keyword, isActive: true })
    this.setState({ buildings: data.items || [] })
  }, 100)
  hanStaffsSearch = debounce(async (keyword) => {
    const data = await staffService.getAll({ keyword, isActive: true })
    this.setState({ users: data.items || [] })
  }, 100)

  handleDelete = (selectedRecord) => () => {
    this.setState({ selectedRecord, openDeleteDialog: true })
  }

  handleCloseRefundModal = () => this.setState({ refundModalVisible: false })

  handleRefundFee = async (data: IFeeRefundModel) => {
    await this.props.feeStore?.refundReceipt(data)
    confirm({
      title: LNotification('DO_YOU_WANT_TO_GO_VOUCHER_DETAIL {0}', this.props.feeStore.voucherDetail.id),

      content: LNotification('FEE_REFUND_DESCRIPTION_NOTIFICATION'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),

      onOk: async () => {
        await this.props.feeStore?.getDetailVoucher(this.props.feeStore.voucherDetail.id)
        const dataVoucherDetailFull = this.props.feeStore.voucherDetailFull

        this.props.voucherStore.voucherDetail = dataVoucherDetailFull

        this.props.navigate(portalLayouts.feeVoucherDetail.path)
      }
    })
    this.handleCloseRefundModal()
  }
  closeDeleteDialog = () => this.setState({ openDeleteDialog: false })

  handleOpenRefundModal = (record) => () => {
    this.setState({ record: record })
    this.setState({ refundModalVisible: true })
  }
  handleConfirmDelete = async () => {
    const deleteFormData = this.deleteFrom.current?.getFieldsValue() || {}
    const { reasonCancel = '' } = deleteFormData
    await this.props.receiptStore.delete({
      id: (this.state.selectedRecord as any).id || 0,
      reasonCancel
    })
    notifySuccess(LNotification('SUCCESS'), LNotification(this.L('ITEM_DELETE_SUCCEED')))
    this.closeDeleteDialog()
  }
  handleViewReceipt = (record) => () => {
    if (this.isGranted(appPermissions.feeReceipt.read)) {
      const { navigate, receiptStore } = this.props
      receiptStore.receiptDetail = record
      navigate(portalLayouts.feeReceiptDetail.path.replace(':id', record.id))
    }
  }
  handleDownloadReceipt = () => {
    this.props.receiptStore.downloadReceipt(this.state.filters)
  }

  gotoCreateReceipt = () => {
    const { navigate } = this.props
    navigate(portalLayouts.feeCreateReceiptV1.path)
  }

  renderActionGroups = () => {
    return (
      <span className="mr-2">
        {this.isGranted(appPermissions.workOrder.export) && (
          <Button
            shape="circle"
            type="primary"
            className="pt-1 mx-2"
            onClick={this.handleDownloadReceipt}
            icon={
              // <span className="btn-icon">
              <ExcelIcon />
              // </span>
            }>
            {/* {L('EXPORT_EXCEL')} */}
          </Button>
        )}
      </span>
    )
  }

  render() {
    const { paymentChannels } = this.props.feeStore
    const { packageOptions } = this.props.packageFeeStore
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col md={{ span: 6 }} sm={{ span: 24 }}>
          <span>{this.L('FILTER_KEYWORD')}</span>
          <Input.Search
            onSearch={(value) => this.handleSearch('keyword', value)}
            placeholder={`${this.L('FEE_RECEIPT_NUMBER')}, ${this.L('FEE_RECEIPT_UNIT')}`}
          />
        </Col>
        <Col md={{ span: 6 }} sm={{ span: 24 }} style={{ width: '100%' }}>
          <span>{this.L('FEE_BUILDING')}</span>
          <Select
            showSearch
            allowClear
            filterOption={false}
            className="full-width"
            onChange={(value) => this.handleSearch('buildingIds', value)}
            onSearch={this.handBuidlingsSearch}
            value={this.state.filters?.buildingIds}>
            {(this.state.buildings || []).map((option: any, index) => {
              return (
                <Select.Option key={index} value={option.id}>
                  {option.name}
                </Select.Option>
              )
            })}
          </Select>
        </Col>
        <Col md={{ span: 6 }} sm={{ span: 24 }} style={{ width: '100%' }}>
          <span>{this.L('PROJECT_BUILDING_UNIT')}</span>
          <Select
            showSearch
            allowClear
            filterOption={false}
            className="full-width"
            onChange={(value) => this.handleSearch('unitId', value)}
            onSearch={this.handleUnitSearch}
            value={this.state.filters?.unitId}>
            {(this.state.units || []).map((option: any, index) => {
              return (
                <Select.Option key={index} value={option.id}>
                  {option.fullUnitCode}
                </Select.Option>
              )
            })}
          </Select>
        </Col>
        <Col sm={{ span: 24 }} md={{ span: 6 }}>
          <span>{this.L('FILTER_FEE_PACKAGE')}</span>
          <Select
            allowClear
            showSearch
            filterOption={false}
            style={{ width: '100%' }}
            onChange={(value) => this.handleSearch('packageId', value)}
            onSearch={this.handlePackageFeeSearch}>
            {(packageOptions || []).map((item, index) => (
              <Select.Option value={`${item.id}`} key={index}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Col>

        <Col sm={{ span: 24 }} md={{ span: 6 }}>
          <span>{this.L('FILTER_PAYMENT_CHANNEL')}</span>
          <Select
            allowClear
            style={{ width: '100%' }}
            onChange={(value) => this.handleSearch('paymentChanelId', value)}>
            {(paymentChannels || []).map((item, index) => (
              <Select.Option value={item.id} key={index}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col sm={{ span: 12 }} md={{ span: 3 }}>
          <span>{this.L('FILTER_ACTIVE_STATUS')}</span>
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
        <Col sm={{ span: 12 }} md={{ span: 3 }}>
          <span>{this.L('FILTER_REFUND')}</span>
          <Select
            allowClear
            style={{ width: '100%' }}
            // defaultValue={this.L('REFUND_YES')}
            onChange={(value) => this.handleSearch('isRefundable', value)}>
            {activeRefundable.map((Refundable) => (
              <Select.Option value={Refundable.value} key={Refundable.value}>
                {Refundable.label}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col md={{ span: 6 }} sm={{ span: 24 }} style={{ width: '100%' }}>
          <span>{this.L('CREATE_USER')}</span>
          <Select
            showSearch
            allowClear
            filterOption={false}
            className="full-width"
            onChange={(value) => this.handleSearch('creatorUserId', value)}
            onSearch={this.hanStaffsSearch}
            value={this.state.filters?.creatorUserId}>
            {(this.state.users || []).map((option: any, index) => {
              return (
                <Select.Option key={index} value={option.id}>
                  {option.displayName}
                </Select.Option>
              )
            })}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{L('FILTER_FROM_TO_DATE')}</label>
          <RangePicker
            format={dateFormat}
            onChange={(value) => this.handleSearch('dateFromTo', value)}
            style={{ width: '100%' }}
          />
        </Col>
        {/* </Select>
            <FormSelect
              name="assignUserId"
              label={L('ASSIGNED_USER')}
              options={assignedUser}
              selectProps={{
                onSearch: debounce(searchAssignedUser, 300)
              }}
              optionModal={(item, index) => (
                <Select.Option key={index} value={item?.id}>
                  <div>{item.displayName}</div>
                  <div className="text-muted">{item.emailAddress}</div>
                </Select.Option>
              )}
            />
          </Col> */}
      </Row>
    )
    return (
      <>
        <OverViewFee
          data={this.props.receiptStore.receiptOverview}
          handleClickItem={() => {
            return
          }}
        />
        <div className={'fee-receipt-container'}>
          <DataTable
            extraFilterComponent={filterComponent}
            onRefresh={this.getAll}
            title={this.L('FEE_RECEIPT_LIST')}
            onCreate={this.gotoCreateReceipt}
            pagination={{
              pageSize: this.maxResultCount,
              total: this.props.receiptStore.pagedResult.totalCount,
              onChange: this.handlePagingChange
            }}
            createPermission={appPermissions.feeReceipt.create}
            actionGroups={this.renderActionGroups}>
            <Table
              size={'middle'}
              columns={this.columns}
              loading={this.props.receiptStore.isLoading}
              dataSource={this.props.receiptStore.pagedResult.items}
              scroll={{ x: 1024, scrollToFirstRowOnChange: true }}
              className="custom-ant-table custom-ant-row"
              pagination={false}
              rowKey={(record: any) => record.id}
            />
          </DataTable>
          <FeeRefundModalFrReceipt
            record={this.state.record}
            navigate={this.props.navigate}
            feeStore={this.props.feeStore}
            onOk={this.handleRefundFee}
            visible={this.state.refundModalVisible}
            onClose={this.handleCloseRefundModal}
          />
          <Modal
            visible={this.state.openDeleteDialog}
            onOk={this.handleConfirmDelete}
            cancelText={this.L('BTN_CANCEL')}
            onCancel={this.closeDeleteDialog}>
            <Form ref={this.deleteFrom} layout="vertical" className={'mt-2'} size="middle">
              <Form.Item label={this.L('REASON_TO_DELETE')} name={'reasonCancel'}>
                <Input.TextArea maxLength={255} />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </>
    )
  }

  columns = getColumns({
    title: L('FEE_RECEIPT_NUMBER'),
    dataIndex: 'receiptNumber',

    key: 'receiptNumber',
    width: '15%',
    render: (receiptNumber: string, item: any) => (
      <Row>
        <Col sm={{ span: 21, offset: 0 }}>
          <div className="full-name text-truncate text-link-to-detail" onClick={this.handleViewReceipt(item)}>
            <a className="link-text-table">
              {item.isRefundable === true ? <RollbackOutlined /> : ''}
              {L(' ')}
              {receiptNumber}
            </a>
          </div>
        </Col>
        <Col sm={{ span: 3, offset: 0 }}>
          <Dropdown
            trigger={['click']}
            overlay={
              <Menu>
                {this.isGranted(appPermissions.feeReceipt.create) && item.isRefundable === true && (
                  <Menu.Item onClick={this.handleOpenRefundModal(item)}>{L('REFUND_MONEY')}</Menu.Item>
                )}

                {this.isGranted(appPermissions.feedback.delete) && item.isActive === true && (
                  <Menu.Item onClick={this.handleDelete(item)}>{L('BTN_RECEIPT_DELETE')}</Menu.Item>
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
}

export default withRouter(FeeReceipt)
