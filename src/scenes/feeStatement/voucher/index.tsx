import React from 'react'
import AppComponentBase from '@components/AppComponentBase'
import DataTable from '@components/DataTable'
import { Col, Form, Input, Modal, Row, Select, Table } from 'antd'
import { convertFilterDate, notifySuccess } from '@lib/helper'
// import Filter from '@components/Filter'
import VoucherStore from '@stores/fee/voucherStore'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import UnitStore from '@stores/project/unitStore'
import { L, LNotification } from '@lib/abpUtility'
import { FormInstance } from 'antd/es/form'
import AppConst, { dateFormat } from '@lib/appconst'
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

const { activeStatus } = AppConst
const { RangePicker } = DatePicker

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
}

interface Props {
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
    maxResultCount: 10,
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
      isActive: true
    }
  }
  printRef = null
  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    await Promise.all([
      this.getAll(),
      this.props.unitStore.getAll({}),
      this.hanStaffsSearch(''),
      this.handBuidlingsSearch(''),
      this.props.feeStore.getPaymentChannels()
    ])
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

  handleDelete = (selectedRecord) => () => {
    this.setState({ selectedRecord, openDeleteDialog: true })
  }

  closeDeleteDialog = () => this.setState({ openDeleteDialog: false })

  handleConfirmDelete = async () => {
    const deleteFormData = this.deleteFrom.current?.getFieldsValue() || {}
    const { reasonCancel = '' } = deleteFormData
    await this.props.voucherStore.delete({
      id: (this.state.selectedRecord as any).id || 0,
      reasonCancel
    })
    notifySuccess(LNotification('SUCCESS'), LNotification(this.L('ITEM_DELETE_SUCCEED')))
    this.closeDeleteDialog()
  }
  handlePrint = (selectedRecord) => () => {
    this.setState({ selectedRecord }, () => {
      this.props.voucherStore.voucherDetail = selectedRecord

      this.props.navigate(portalLayouts.feeVoucherDetail.path)
    })
  }

  render() {
    const { paymentChannels } = this.props.feeStore
    const { packages, units } = this.state
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col md={{ span: 6 }} sm={{ span: 24 }}>
          <span>{this.L('FILTER_KEYWORD')}</span>
          <Input.Search
            onSearch={(value) => this.handleSearch('keyword', value)}
            placeholder={`${this.L('FEE_VOUCHER_NUMBER')}, ${this.L('FEE_VOUCHER_UNIT')}`}
          />
        </Col>
        <Col sm={{ span: 24 }} md={{ span: 6 }}>
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
        <Col sm={{ span: 24 }} md={{ span: 6 }}>
          <span>{this.L('FILTER_PAYMENT_CHANNEL')}</span>
          <Select
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
            onChange={(value) => this.handleSearch('packageId', value)}
            onSearch={this.handlePackageFeeSearch}>
            {(packages || []).map((pfStore: any) => (
              <Select.Option value={`${pfStore.id}`} key={pfStore.guid}>
                {pfStore.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col sm={{ span: 24 }} md={{ span: 6 }}>
          <span>{this.L('FILTER_UNIT')}</span>
          <Select
            showSearch
            allowClear
            filterOption={false}
            className="full-width"
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
          {/* <Filter title={this.L('FILTER')} handleRefresh={this.getAll}>
            <Row gutter={[16, 8]}>
              <Col md={{ span: 6 }} sm={{ span: 24 }}>
                <span>{this.L('FILTER_KEYWORD')}</span>
                <Input.Search
                  onSearch={(value) => this.handleSearch('keyword', value)}
                  placeholder={`${this.L('FEE_VOUCHER_NUMBER')}, ${this.L(
                    'FEE_VOUCHER_UNIT'
                  )}`}
                />
              </Col>
              <Col sm={{ span: 24 }} md={{ span: 6 }}>
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
              <Col sm={{ span: 24 }} md={{ span: 6 }}>
                <span>{this.L('FILTER_PAYMENT_CHANNEL')}</span>
                <Select
                  allowClear
                  style={{ width: '100%' }}
                  onChange={(value) =>
                    this.handleSearch('paymentChannelId', value)
                  }>
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
                  onChange={(value) => this.handleSearch('packageId', value)}
                  onSearch={this.handlePackageFeeSearch}>
                  {(packages || []).map((pfStore: any) => (
                    <Select.Option value={`${pfStore.id}`} key={pfStore.guid}>
                      {pfStore.name}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
              <Col sm={{ span: 24 }} md={{ span: 6 }}>
                <span>{this.L('FILTER_UNIT')}</span>
                <Select
                  showSearch
                  allowClear
                  filterOption={false}
                  className="full-width"
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
                <span>{this.L('CREATE_USER')}</span>
                <Select
                  showSearch
                  allowClear
                  filterOption={false}
                  className="full-width"
                  onChange={(value) =>
                    this.handleSearch('creatorUserId', value)
                  }
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
            </Row>
          </Filter> */}
          <DataTable
            onRefresh={this.getAll}
            extraFilterComponent={filterComponent}
            title={this.L('FEE_VOUCHER_LIST')}
            pagination={{
              pageSize: this.state.maxResultCount,
              current: this.currentPage,
              total: this.props.voucherStore.pagedResult.totalCount,
              onChange: this.handlePagingChange
            }}>
            <Table
              size={'middle'}
              columns={this.columns}
              loading={this.props.voucherStore.isLoading}
              dataSource={this.props.voucherStore.pagedResult.items}
              scroll={{ x: 1024, scrollToFirstRowOnChange: true }}
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
    title: () => (
      <>
        {L('FEE_VOUCHER_UNIT')}/ <br /> {L('FEE_VOUCHER_NUMBER')}
      </>
    ),
    dataIndex: 'receiptNumber',
    key: 'receiptNumber',
    width: '15%',
    render: (receiptNumber: string, item: any) => (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <div className="full-name text-truncate text-link-to-detail" onClick={this.handlePrint(item)}>
            <a className="link-text-table">
              {' '}
              {item.unit?.fullUnitCode}/ <br /> {receiptNumber}
            </a>
          </div>
        </Col>
      </Row>
    )
  })
}
export default withRouter(VoucherList)
