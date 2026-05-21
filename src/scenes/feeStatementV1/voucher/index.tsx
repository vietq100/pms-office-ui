import React from 'react'
import AppComponentBase from '@components/AppComponentBase'
import DataTable from '@components/DataTable'
import { Button, Col, Dropdown, Form, Input, Menu, Modal, Row, Select, Table, Tooltip } from 'antd'
import { convertFilterDate, notifySuccess } from '@lib/helper'
// import Filter from '@components/Filter'
import VoucherStore from '@stores/fee/voucherStore'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import UnitStore from '@stores/project/unitStore'
import { L, LNotification } from '@lib/abpUtility'
import { FormInstance } from 'antd/es/form'
import AppConst, { appPermissions, dateFormat } from '@lib/appconst'
import DatePicker from 'antd/lib/date-picker'
import FeeStore from '@stores/fee/feeStore'
import packageFeeService from '@services/fee/packageFeeService'
import debounce from 'lodash/debounce'
import unitService from '@services/project/unitService'
import getColumns from './columns'
import { portalLayouts } from '@components/Layout/Router/router.config'
import withRouter from '@components/Layout/Router/withRouter'
import OverViewFee from '@components/DataTable/OverViewFee'
import buildingService from '@services/project/buildingService'
import staffService from '@services/member/staff/staffService'
import VoucherDetailModal from './VoucherDetailModal'
import { EllipsisOutlined } from '@ant-design/icons'
import { validateMessages } from '@lib/validation'
import { ExcelIcon } from '@components/Icon'
import feeTypeService from '@services/fee/feeTypeService'

const { activeStatus, pageSize } = AppConst
const { RangePicker } = DatePicker
const confirm = Modal.confirm
interface State {
  skipCount: number
  maxResultCount: number
  selectedRecord: any
  openDeleteDialog: boolean
  filters: any
  buildings: any[]
  units: any[]
  packages: any[]
  users: any[]
  visibleModalVoucher: boolean
  dataSend: any
  listFeeType: any[]
}

interface Props {
  keyword: string
  navigate: any
  feeStore: FeeStore
  feeGroupStore: FeeStore
  voucherStore: VoucherStore
  unitStore: UnitStore
}

@inject(Stores.FeeStore, Stores.VoucherStore, Stores.ProjectStore, Stores.UnitStore, Stores.PackageFeeStore)
@observer
class VoucherList extends AppComponentBase<Props, State> {
  deleteFrom = React.createRef<FormInstance>()
  state = {
    skipCount: 0,
    maxResultCount: pageSize.pageSize_10,
    openDeleteDialog: false,
    selectedRecord: null as any,
    units: [],
    buildings: [],
    users: [],
    packages: [],
    filters: {
      keyword: '',
      creatorUserId: undefined,
      projectId: undefined,
      buildingIds: undefined,
      unitId: undefined,
      paymentChannelId: undefined,
      isActive: true,
      feeTypeIds: [] as any
    },
    visibleModalVoucher: false,
    dataSend: undefined,
    listFeeType: [] as any
  }
  printRef = null
  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    if (this.props.keyword === '?tabVoucher') {
      this.setState({ filters: this.props.voucherStore.filters }, this.getAll)
    } else {
      this.setState({ filters: this.state.filters }, this.getAll)
    }
    await Promise.all([
      this.props.unitStore.getAll({}),
      this.hanStaffsSearch(''),
      this.handBuidlingsSearch(''),
      this.handlePackageFeeSearch(''),
      this.handleUnitSearch(''),
      this.getListFeeType(''),
      this.props.feeStore.getPaymentChannels()
    ])
  }

  getListFeeType = async (keyword) => {
    const feeTypes = await feeTypeService.getList({ keyword, isActice: true })
    this.setState({ listFeeType: feeTypes })
  }

  hanStaffsSearch = debounce(async (keyword) => {
    const data = await staffService.getAll({ keyword, isActive: true })
    this.setState({ users: data.items || [] })
  }, 100)
  handlePackageFeeSearch = debounce(async (keyword) => {
    const res = await packageFeeService.getAll({ keyword })
    this.setState({ packages: res.items })
  }, 200)

  handleUnitSearch = debounce(async (keyword) => {
    const data = await unitService.getAll({ keyword, isActive: true })
    this.setState({ units: data.items || [] })
  }, 200)

  handleSearch = (name, value) => {
    const { filters } = this.state
    if (name === 'dateFromTo') {
      this.props.voucherStore.setFilterDate(value)
      this.setState({ filters: convertFilterDate(filters, value) }, async () => {
        await this.getAll()
      })
    } else {
      this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => {
        await this.getAll()
      })
    }
  }

  getAll = async () => {
    await this.props.voucherStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
    await this.props.voucherStore.getOverview(this.state.filters)
  }

  handlePagingChange = ({ current }) => {
    this.setState({ skipCount: --current * this.state.maxResultCount }, this.getAll)
  }
  handBuidlingsSearch = debounce(async (keyword) => {
    const data = await buildingService.getAll({ keyword, isActive: true })
    this.setState({ buildings: data.items || [] })
  }, 100)

  handleDelete = (selectedRecord) => {
    this.setState({ selectedRecord, openDeleteDialog: true })
  }

  closeDeleteDialog = () => {
    this.deleteFrom.current?.resetFields()
    this.setState({ openDeleteDialog: false })
  }
  updateSearch = debounce((name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value } })
  }, 100)
  handleConfirmDelete = async () => {
    const self = this
    confirm({
      title: LNotification('DO_YOU_WANT_TO_DELETE_THIS_VOUCHER'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      async onOk() {
        await self.deleteFrom.current?.validateFields().then(async (values: any) => {
          await self.props.voucherStore.delete({
            id: (self.state.selectedRecord as any) || 0,
            ...values
          })
        })
        notifySuccess(LNotification('SUCCESS'), LNotification(self.L('ITEM_DELETE_SUCCEED')))
        self.closeDeleteDialog()
      }
    })
  }

  handlePrint = (selectedRecord) => {
    this.setState({ selectedRecord }, () => {
      this.props.voucherStore.voucherDetail = selectedRecord
      this.props.voucherStore.setFilter(this.state.filters)
      this.props.navigate(portalLayouts.feeVoucherDetailV1.path)
    })
  }

  openModalVoucher = (item) => {
    if (item) {
      this.setState({ dataSend: item })
    } else {
      this.setState({ dataSend: undefined })
    }
    this.setState({ visibleModalVoucher: true })
  }

  onCannelAndRefresh = () => {
    this.setState({ dataSend: undefined })

    this.setState({ visibleModalVoucher: false }, this.getAll)
  }
  handleDownloadReceipt = () => {
    this.props.voucherStore.exportExpenseMandates(this.state.filters)
  }
  renderActionGroups = () => {
    return (
      <span>
        {this.isGranted(appPermissions.feeVoucher.export) && (
          <Button
            shape="circle"
            type="primary"
            className="mr-1"
            onClick={this.handleDownloadReceipt}
            icon={<ExcelIcon />}
          />
        )}
      </span>
    )
  }
  render() {
    const { paymentChannels } = this.props.feeStore
    const { packages, units } = this.state
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col md={{ span: 6 }} sm={{ span: 24 }}>
          <span>{this.L('FILTER_KEYWORD')}</span>
          <Input.Search
            defaultValue={this.props.keyword ? this.props.voucherStore.filters?.keyword : undefined}
            maxLength={200}
            onSearch={(value) => this.handleSearch('keyword', value)}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            placeholder={`${this.L('FEE_VOUCHER_NUMBER')}, ${this.L('FEE_VOUCHER_UNIT')}`}
          />
        </Col>
        <Col sm={{ span: 24 }} md={{ span: 6 }}>
          <span>{this.L('FILTER_ACTIVE_STATUS')}</span>
          <Select
            allowClear
            style={{ width: '100%' }}
            defaultValue={this.props.keyword ? this.props.voucherStore.filters?.isActive : this.L('ACTIVE')}
            onChange={(value) => this.handleSearch('isActive', value)}>
            {activeStatus.map((status) => (
              <Select.Option value={status.value} key={status.value}>
                {status.label}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col sm={{ span: 24 }} md={{ span: 6 }}>
          <span>{this.L('FILTER_PAYMENT_CHANNEL')}</span>
          <Select
            defaultValue={this.props.keyword ? this.props.voucherStore.filters?.paymentChannelId : undefined}
            allowClear
            style={{ width: '100%' }}
            onChange={(value) => this.handleSearch('paymentChannelId', value)}>
            {(paymentChannels || []).map((item, index) => (
              <Select.Option value={item.id} key={index}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{L('FILTER_FROM_TO_DATE')}</label>
          <RangePicker
            defaultValue={this.props.keyword ? this.props.voucherStore.filterDate : []}
            format={dateFormat}
            onChange={(value) => this.handleSearch('dateFromTo', value)}
            style={{ width: '100%' }}
          />
        </Col>
        <Col sm={{ span: 24 }} md={{ span: 6 }}>
          <span>{this.L('FEE_FILTER_PACKAGE')}</span>
          <Select
            showArrow
            showSearch
            allowClear
            filterOption={false}
            style={{ width: '100%' }}
            defaultValue={this.props.keyword ? this.props.voucherStore.filters?.packageId : undefined}
            onChange={(value) => this.handleSearch('packageId', value)}
            onSearch={this.handlePackageFeeSearch}>
            {(packages || []).map((pfStore: any) => (
              <Select.Option value={`${pfStore.id}`} key={pfStore.guid}>
                {pfStore.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col sm={{ span: 24 }} md={{ span: 3 }}>
          <span>{this.L('FILTER_UNIT')}</span>
          <Select
            showSearch
            allowClear
            filterOption={false}
            className="full-width"
            defaultValue={this.props.keyword ? this.props.voucherStore.filters?.unitId : undefined}
            onChange={(value) => this.handleSearch('unitId', value)}
            onSearch={this.handleUnitSearch}>
            {(units || []).map((unit: any, index) => {
              return (
                <Select.Option key={index} value={unit.id}>
                  {unit.fullUnitCode}
                </Select.Option>
              )
            })}
          </Select>
        </Col>
        <Col md={{ span: 3 }} sm={{ span: 24 }} style={{ width: '100%' }}>
          <span>{this.L('FEE_BUILDING')}</span>
          <Select
            showSearch
            allowClear
            filterOption={false}
            className="full-width"
            defaultValue={this.props.keyword ? this.props.voucherStore.filters?.buildingIds : undefined}
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
          <span>{this.L('CREATE_USER')}</span>
          <Select
            showSearch
            allowClear
            filterOption={false}
            className="full-width"
            defaultValue={this.props.keyword ? this.props.voucherStore.filters?.creatorUserId : undefined}
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
        <Col sm={{ span: 24 }} md={{ span: 6 }}>
          <span>{this.L('FEE_TYPE')}</span>
          <Select
            allowClear
            showSearch
            filterOption={false}
            mode="multiple"
            className="full-width"
            defaultValue={this.props.keyword ? this.props.voucherStore.filters?.feeTypeIds : undefined}
            onSearch={(value) => this.getListFeeType(value)}
            onChange={(value) => this.handleSearch('feeTypeIds', value)}>
            {(this.state.listFeeType || []).map((item, index) => (
              <Select.Option value={`${item.id}`} key={index}>
                <Tooltip trigger="contextMenu" title={item.name}>
                  {item.name}
                </Tooltip>
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
    )

    return (
      <>
        <OverViewFee
          data={this.props.voucherStore.voucherOverview}
          handleClickItem={() => {
            return
          }}
        />
        <div className={'fee-voucher-container'}>
          <DataTable
            onRefresh={this.getAll}
            extraFilterComponent={filterComponent}
            title={this.L('FEE_VOUCHER_LIST')}
            pagination={{
              pageSize: this.state.maxResultCount,
              current: this.currentPage,
              total: this.props.voucherStore.pagedResult.totalCount,
              onChange: this.handlePagingChange
            }}
            actionGroups={this.renderActionGroups}>
            <Table
              size={'middle'}
              columns={this.columns}
              loading={this.props.voucherStore.isLoading}
              dataSource={this.props.voucherStore.pagedResult.items}
              scroll={{ x: 1024, y: '70vh', scrollToFirstRowOnChange: true }}
              className="custom-ant-table custom-ant-row"
              pagination={false}
              rowKey={(record: any) => record.id}
            />
          </DataTable>
          <Modal
            open={this.state.openDeleteDialog}
            onOk={this.handleConfirmDelete}
            cancelText={this.L('BTN_CANCEL')}
            onCancel={this.closeDeleteDialog}>
            <Form
              ref={this.deleteFrom}
              layout="vertical"
              className={'mt-2'}
              size="middle"
              validateMessages={validateMessages}>
              <Form.Item label={this.L('REASON_TO_DELETE')} name="reason" rules={[{ required: true, max: 500 }]}>
                <Input.TextArea />
              </Form.Item>
            </Form>
          </Modal>
        </div>

        <VoucherDetailModal
          voucherStore={this.props.voucherStore}
          dataSend={this.state.dataSend}
          visible={this.state.visibleModalVoucher}
          onCancel={() => this.setState({ visibleModalVoucher: false })}
          onCancelAndRefresh={this.onCannelAndRefresh}
        />
      </>
    )
  }

  columns = getColumns({
    title: () => (
      <>
        {L('FEE_VOUCHER_UNIT')}/ <br /> {L('FEE_VOUCHER_NUMBER')}
      </>
    ),
    ellipsis: true,
    dataIndex: 'receiptNumber',
    key: 'receiptNumber',
    width: '16%',
    render: (receiptNumber: string, item: any) => (
      <Row style={{ justifyContent: 'space-between' }}>
        <Col sm={{ span: 20, offset: 0 }} className="col-info">
          <div className="full-name text-truncate text-link-to-detail">
            <a
              className="link-text-table"
              onClick={() => this.isGranted(appPermissions.feeVoucher.detail) && this.handlePrint(item)}>
              <label className="ml-2">{item.unit?.fullUnitCode}/</label> <br />
              <label className="ml-2"> {receiptNumber}</label>
            </a>
          </div>
        </Col>
        <Col sm={{ span: 4, offset: 0 }} className="custom-menu-select">
          <Dropdown
            trigger={['click']}
            overlay={
              <Menu>
                {this.isGranted(appPermissions.feeVoucher.delete) && item.isActive === true && (
                  <Menu.Item onClick={() => this.handleDelete(item.id)}>{L('DELETE_VOUCHER')}</Menu.Item>
                )}
                {this.isGranted(appPermissions.feeVoucher.update) && item.isActive === true && (
                  <Menu.Item onClick={() => this.openModalVoucher(item)}>{L('EDIT_VOUCHER')}</Menu.Item>
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
export default withRouter(VoucherList)
