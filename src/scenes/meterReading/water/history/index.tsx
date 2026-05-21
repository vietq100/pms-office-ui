import React from 'react'
import AppComponentBase from '@components/AppComponentBase'
import DataTable from '@components/DataTable'
import { Button, Col, Input, Row, Select, Table } from 'antd'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import '@scenes/feeStatement/receipt/components/receipt.less'
import { FormInstance } from 'antd/es/form'
import AppConst, { appPermissions } from '@lib/appconst'
import getColumns from './columns'
import withRouter from '@components/Layout/Router/withRouter'
import { ExcelIcon } from '@components/Icon'
import MeterReadingStore from '@stores/meterReading/meterReadingStore'
import handoverService from '@services/handover/handoverService'
import { debounce } from 'lodash'
import packageFeeService from '@services/fee/packageFeeService'

import { PlusOutlined } from '@ant-design/icons'
import MeterImportModal from '../overview/components/MeterImportModal'

const { pageSize } = AppConst

interface State {
  skipCount: number
  maxResultCount: number
  filters: any
  buildingOptions: any[]
  floorOptions: any[]
  packageOptions: any[]
  visibleModelExport: boolean
}

interface Props {
  navigate: any
  meterReadingStore: MeterReadingStore
}

@inject(Stores.MeterReadingStore)
@observer
class MeterReadingWaterHistory extends AppComponentBase<Props, State> {
  maxResultCount = pageSize.pageSize_10
  deleteFrom = React.createRef<FormInstance>()
  state = {
    skipCount: 0,
    maxResultCount: pageSize.pageSize_10,
    filters: { isActive: 'true' },
    buildingOptions: [] as any,
    floorOptions: [] as any,
    packageOptions: [] as any,
    visibleModelExport: false
  }
  async componentDidMount() {
    await Promise.all([this.getAll(), this.getBuildingOption(''), this.handlePackageSearch('')])
  }
  getAll = async () => {
    await this.props.meterReadingStore.getAllMeterWaterLogs({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }
  getBuildingOption = async (keyword) => {
    const res = await handoverService.getListBuilding({ keyword })
    this.setState({ buildingOptions: res })
  }
  handleSearch = (name, value) => {
    const { filters } = this.state

    this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => {
      await this.getAll()
    })
  }
  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }
  handlePackageSearch = debounce(async (value) => {
    const packages = await packageFeeService.filter({
      keyword: value
    })
    this.setState({ packageOptions: packages })
  }, 300)
  handleSetFilterFloor = async (vallue) => {
    const res = await handoverService.getListFloor({ BuildingId: vallue })
    this.setState({ floorOptions: res })
  }

  toggleModal = () =>
    this.setState((prevState) => ({
      visibleModelExport: !prevState.visibleModelExport
    }))
  handleImportFee = async (file) => {
    await this.props.meterReadingStore?.importFee(file)
    await this.getAll()
    this.toggleModal()
  }

  renderActionGroups = () => {
    return (
      <span>
        <React.Fragment>
          {/* {this.isGranted(appPermissions.MeterWater.import) && (
            <Popover trigger="hover" content={L('DOWNLOAD_TEMPLATE')}>
              <Button
                shape="round"
                type="primary"
                className="mr-1"
                onClick={this.props.meterReadingStore?.downloadTemplate}
                icon={<DownloadOutlined />}
              />
            </Popover>
          )} */}
          {this.isGranted(appPermissions.MeterWater.import) && (
            <Button type="primary" shape="round" onClick={this.toggleModal} className="mr-1">
              <PlusOutlined />
              {this.L('BTN_IMPORT')}
            </Button>
          )}
        </React.Fragment>

        {this.isGranted(appPermissions.MeterWater.export) && (
          <Button
            shape="circle"
            type="primary"
            className="mr-1"
            // onClick={this.handleDownloadReceipt}
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
    const {
      meterReadingStore: { meterLogs }
    } = this.props
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
        <Col sm={{ span: 6 }} md={{ span: 6 }}>
          <span>{this.L('METER_READING_PACKAGE')}</span>
          <Select
            filterOption={false}
            showSearch
            allowClear
            style={{ width: '100%' }}
            onChange={(value) => this.handleSearch('PackageId', value)}
            onSearch={this.handlePackageSearch}>
            {this.state.packageOptions.map((item, index) => (
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
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          title={this.L('METER_WATWER_HISTORY_LIST')}
          pagination={{
            pageSize: this.maxResultCount,
            total: this.props.meterReadingStore.meterLogs.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.feeReceipt.create}
          actionGroups={this.renderActionGroups}>
          <Table
            size={'middle'}
            columns={this.columns}
            loading={this.props.meterReadingStore.isLoading}
            dataSource={meterLogs.items}
            scroll={{ x: 1024, scrollToFirstRowOnChange: true }}
            className="custom-ant-table custom-ant-row"
            pagination={false}
            rowKey={(record: any) => record.id}
          />
        </DataTable>

        <MeterImportModal
          currentPackage={this.props.meterReadingStore?.currentPackage?.name}
          visible={this.state.visibleModelExport}
          onOk={this.handleImportFee}
          onClose={this.toggleModal}
          meterReadingStore={this.props.meterReadingStore}
        />
      </>
    )
  }

  columns = getColumns()
}

export default withRouter(MeterReadingWaterHistory)
