import AppComponentBase from '@components/AppComponentBase'
import DataTable from '@components/DataTable'
import { Col, Row, Select, Table } from 'antd'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import AppConst, { appPermissions, listStatisticFeeNotice } from '@lib/appconst'
import withRouter from '@components/Layout/Router/withRouter'
import getColumns from './column'
import FeeNoticeStore from '@stores/fee/feeNoticeStore'
import PackageFeeStore from '@stores/fee/packageFeeStore'
import { debounce } from 'lodash'
import UnitStore from '@stores/project/unitStore'

const { pageSize } = AppConst

interface State {
  skipCount: number
  maxResultCount: number
  filters: any
  isLoading: boolean
}

interface Props {
  navigate: any
  feeNoticeStore: FeeNoticeStore
  packageFeeStore: PackageFeeStore
  unitStore: UnitStore
}

@inject(Stores.FeeNoticeStore, Stores.PackageFeeStore, Stores.UnitStore)
@observer
class StatisticFeeUnit extends AppComponentBase<Props, State> {
  maxResultCount = pageSize.pageSize_20
  state = {
    skipCount: 0,
    maxResultCount: pageSize.pageSize_20,
    filters: { FeePackageId: 42 },
    isLoading: false
  }
  async componentDidMount() {
    await Promise.all([this.getAll(), this.findUnits('')])
  }
  getAll = async () => {
    await this.props.feeNoticeStore.getAllOverview({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  findUnits = debounce(async (keyword) => {
    await this.props.unitStore.getAll({ keyword })
  }, 300)

  handlePackageFeeSearch = debounce(async (keyword) => {
    await this.props.packageFeeStore?.filterOption({ keyword })
  }, 100)

  handleSearch = (name, value) => {
    const { filters } = this.state

    this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => {
      await this.getAll()
    })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  render() {
    const { packageOptions } = this.props.packageFeeStore
    const { units } = this.props.unitStore
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('PERIOD')}</label>
          <Select
            allowClear
            showSearch
            filterOption={false}
            onChange={(value) => this.handleSearch('FeePackageId', value)}
            onSearch={this.handlePackageFeeSearch}
            style={{ width: '100%' }}>
            {(packageOptions || []).map((item, index) => (
              <Select.Option value={`${item.id}`} key={index}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_UNIT')}</label>
          <Select
            showSearch
            allowClear
            filterOption={false}
            onSearch={this.findUnits}
            onChange={(value) => this.handleSearch('unitId', value)}
            style={{ width: '100%' }}>
            {units?.items.map((pfStore) => (
              <Select.Option value={`${pfStore.id}`} key={pfStore.id}>
                {pfStore.fullUnitCode} <span className="text-muted small">({pfStore.name})</span>
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col sm={{ span: 7, offset: 0 }}>
          <label>{this.L('FILTER_TYPE_STATISTIC_NOTICE')}</label>
          <Select
            showSearch
            allowClear
            filterOption={false}
            onSearch={this.findUnits}
            onChange={(value) => this.handleSearch('filterType', value)}
            style={{ width: '100%' }}>
            {listStatisticFeeNotice.map((type) => (
              <Select.Option value={type.id} key={type.id}>
                <span className="small">{this.L(type.name)}</span>
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
            total: this.props.feeNoticeStore.pagedResultStatistic.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.feeReceipt.create}>
          <Table
            size={'middle'}
            columns={this.columns}
            loading={this.props.feeNoticeStore.isLoading}
            dataSource={this.props.feeNoticeStore.pagedResultStatistic.items}
            scroll={{ x: 1024, scrollToFirstRowOnChange: true }}
            className="custom-ant-table custom-ant-row"
            pagination={false}
            rowKey={(record: any) => record.id}
          />
        </DataTable>
      </>
    )
  }

  columns = getColumns()
}

export default withRouter(StatisticFeeUnit)
