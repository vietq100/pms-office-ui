import React from 'react'
import AppComponentBase from '@components/AppComponentBase'
import DataTable from '@components/DataTable'
import { Button, Col, Input, Modal, Row, Select, Table } from 'antd'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import '@scenes/feeStatement/receipt/components/receipt.less'

import AppConst, { appPermissions } from '@lib/appconst'
import getColumns from './columns'
import withRouter from '@components/Layout/Router/withRouter'
import { ExcelIcon } from '@components/Icon'
import MeterReadingStore from '@stores/meterReading/meterReadingStore'

import { debounce } from 'lodash'
import handoverService from '@services/handover/handoverService'
import { L, LNotification, isGranted, isGrantedAny } from '@lib/abpUtility'
import packageFeeService from '@services/fee/packageFeeService'
import { EditOutlined, PushpinOutlined } from '@ant-design/icons'
import SetUpPeriodModal from './components/SetUpPeriodModal'
import SetUpCurrentPeriodModal from './components/SetUpCurrentPeriodModal'

const { pageSize } = AppConst
const confirm = Modal.confirm
interface State {
  skipCount: number
  maxResultCount: number
  filters: any
  buildingOptions: any[]
  floorOptions: any[]
  feePackages: any
  showSetUpPeriod: boolean
  isEditCurrentPeriod: boolean
}

interface Props {
  navigate: any
  meterReadingStore: MeterReadingStore
}

@inject(Stores.MeterReadingStore)
@observer
class MeterReadingWaterOverview extends AppComponentBase<Props, State> {
  formPeriod: any = React.createRef()
  formCurrentPeriod: any = React.createRef()
  state = {
    skipCount: 0,
    maxResultCount: pageSize.pageSize_10,
    filters: { isActive: 'true' },
    buildingOptions: [] as any,
    floorOptions: [] as any,
    feePackages: [] as any,
    showSetUpPeriod: false,
    isEditCurrentPeriod: false
  }
  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    await Promise.all([
      this.getAll(),
      this.getBuildingOption(''),
      this.props.meterReadingStore?.getCurrentPackage(),
      this.showCurrentPeriod()
    ])
  }
  getAll = async () => {
    await this.props.meterReadingStore.getOverviewMeterWater({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  getBuildingOption = async (keyword) => {
    const res = await handoverService.getListBuilding({ keyword })
    this.setState({ buildingOptions: res })
  }

  getfeePackageOption = async (keyword) => {
    const res = await packageFeeService.filter({ keyword })
    this.setState({ feePackages: res })
  }

  handleSearch = (name, value) => {
    const { filters } = this.state

    this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => {
      await this.getAll()
    })
  }
  handleSetFilterFloor = async (vallue) => {
    const res = await handoverService.getListFloor({ BuildingId: vallue })
    this.setState({ floorOptions: res })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  onDowmLoadTemplate = () => {
    const self = this
    confirm({
      title: LNotification('METER_WATER_DOWMLOAD_NOTIFICATION'),
      content: LNotification('METER_WATER_DOWMLOAD_CONTENT'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await this.props.meterReadingStore.exportMeterOverview(this.state.filters)

        self.handleTableChange({ current: 1 })
      }
    })
  }

  handleSetUpPeriod = async () => {
    const form = this.formPeriod.current
    form.validateFields().then(async (values: any) => {
      await this.props.meterReadingStore.completeWaterMeterPeriod({
        currentPackageId: this.props.meterReadingStore?.currentPackage.id,
        nextPackageId: values.nextPackageId
      })
    })
    this.setState({ showSetUpPeriod: false })
    await this.props.meterReadingStore.getCurrentPackage()
  }
  handleSetUpCurrentPeriod = async () => {
    const form = this.formCurrentPeriod.current
    form.validateFields().then(async (values: any) => {
      await this.props.meterReadingStore.updateCurrentPackage({
        currentPackageId: values.currentPackageId
      })
    })
    this.setState({ isEditCurrentPeriod: false })
  }

  showCurrentPeriod = async () => {
    await this.props.meterReadingStore.getCurrentPackage()
  }

  onShowSetUpPeriod = () => {
    this.setState({ showSetUpPeriod: true })
  }

  renderActionGroups = () => {
    return (
      <span>
        {isGrantedAny(appPermissions.MeterWater.create, appPermissions.MeterWater.update) && (
          <Button
            disabled={this.props.meterReadingStore?.currentPackage?.name ? false : true}
            shape="circle"
            type="primary"
            className="mr-1"
            onClick={this.onShowSetUpPeriod}
            icon={<PushpinOutlined />}
          />
        )}
        {this.isGranted(appPermissions.MeterWater.export) && (
          <Button
            shape="circle"
            type="primary"
            className="mr-1"
            onClick={this.onDowmLoadTemplate}
            icon={<ExcelIcon />}
          />
        )}
      </span>
    )
  }

  render() {
    const {
      meterReadingStore: { meters }
    } = this.props
    const actionAfterTitle = (
      <Row gutter={[16, 8]}>
        {isGranted(appPermissions.MeterWater.update) && (
          <Col span={3}>
            <EditOutlined style={{ fontSize: '150%' }} onClick={() => this.setState({ isEditCurrentPeriod: true })} />
          </Col>
        )}
      </Row>
    )

    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col md={{ span: 6 }} sm={{ span: 24 }}>
          <span>{this.L('FILTER_KEYWORD')}</span>
          <Input.Search
            maxLength={200}
            onSearch={(value) => this.handleSearch('keyword', value)}
            placeholder={`${this.L('UNIT')}, ${this.L('CLOCK_CODE')}`}
          />
        </Col>

        <Col sm={{ span: 6 }} md={{ span: 6 }}>
          <span>{this.L('METER_READING_BUILDING')}</span>
          <Select
            allowClear
            style={{ width: '100%' }}
            onChange={(value) => {
              this.handleSearch('BuildingId', value), this.handleSetFilterFloor(value)
            }}
            onSearch={debounce(this.getBuildingOption, 300)}>
            {this.state.buildingOptions.map((item, index) => (
              <Select.Option value={item.id} key={index}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col sm={{ span: 6 }} md={{ span: 6 }}>
          <span>{this.L('METER_READING_FLOOR')}</span>
          <Select allowClear style={{ width: '100%' }} onChange={(value) => this.handleSearch('FloorId', value)}>
            {this.state.floorOptions.map((item, index) => (
              <Select.Option value={item.id} key={index}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
    )
    return (
      <>
        <DataTable
          showTableTitle={true}
          actionAfterTitle={actionAfterTitle}
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          title={
            L('METER_WATER_TITLE') +
            ' ' +
            (this.props.meterReadingStore.currentPackage?.name
              ? this.props.meterReadingStore.currentPackage?.name
              : L('UNDEFIND_CURRENT_PERIOD'))
          }
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: meters === undefined ? 0 : meters.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.MeterWater.create}
          actionGroups={this.renderActionGroups}>
          <Table
            size={'middle'}
            columns={this.columns}
            loading={this.props.meterReadingStore.isLoading}
            dataSource={meters.items}
            scroll={{ x: 1024, scrollToFirstRowOnChange: true }}
            className="custom-ant-table custom-ant-row"
            pagination={false}
            rowKey={(record: any) => record.id}
          />
        </DataTable>

        <SetUpPeriodModal
          visible={this.state.showSetUpPeriod}
          formPeriod={this.formPeriod}
          onClose={() => this.setState({ showSetUpPeriod: false })}
          onOk={this.handleSetUpPeriod}
          currentPackage={this.props.meterReadingStore?.currentPackage?.name}
        />

        <SetUpCurrentPeriodModal
          formCurrentPeriod={this.formCurrentPeriod}
          visible={this.state.isEditCurrentPeriod}
          onClose={() => this.setState({ isEditCurrentPeriod: false })}
          onOk={this.handleSetUpCurrentPeriod}
        />
      </>
    )
  }

  columns = getColumns()
}

export default withRouter(MeterReadingWaterOverview)
