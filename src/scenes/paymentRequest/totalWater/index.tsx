import { Col, Modal, Row, Table, Dropdown, Menu, DatePicker, Select } from 'antd'
import { AppComponentListBase } from '../../../components/AppComponentBase'
import DataTable from '../../../components/DataTable'
import { L, LNotification, isGrantedAny } from '../../../lib/abpUtility'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import { appPermissions, dateFormat } from '../../../lib/appconst'
import { portalLayouts } from '../../../components/Layout/Router/router.config'
import { EllipsisOutlined } from '@ant-design/icons'
import NoRole from '@components/ComponentNoRole'
import SessionStore from '@stores/sessionStore'
import { debounce } from 'lodash'
import getColumns from './columns'
import withRouter from '@components/Layout/Router/withRouter'
import { convertFilterDate, renderDate } from '@lib/helper'
import TotalWaterMeterStore from '@stores/paymentRequest/totalWaterMeterStore'
import packageFeeService from '@services/fee/packageFeeService'
const { RangePicker } = DatePicker

export interface IProps {
  navigate: any
  sessionStore: SessionStore
  totalWaterMeterStore: TotalWaterMeterStore
}

export interface IState {
  maxResultCount: number
  skipCount: number
  filters: any
  packageOptions: any[]
}

const confirm = Modal.confirm

@inject(Stores.SessionStore, Stores.TotalWaterMeterStore)
@observer
class TotalWaterMeter extends AppComponentListBase<IProps, IState> {
  state = {
    maxResultCount: 10,
    skipCount: 0,
    listStatus: [],
    packageOptions: [] as any,
    filters: {
      isActive: 'true'
    }
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.PaymentRequest.page) &&
      (await Promise.all([this.getAll(), this.handlePackageSearch('')]))
  }

  handlePackageSearch = debounce(async (value) => {
    const packages = await packageFeeService.getList({
      keyword: value
    })
    this.setState({ packageOptions: packages })
  }, 300)

  getAll = async () => {
    await this.props.totalWaterMeterStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  deleteItem = async (id: number) => {
    const self = this
    confirm({
      title: LNotification('DO_YOU_WANT_TO_DELETE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.totalWaterMeterStore.delete(id)

        self.handleTableChange({ current: 1 })
      }
    })
  }

  copyItem = (id: number) => {
    this.props.navigate(portalLayouts.totalWaterMeterCreate.path, { state: { copyId: id } })
  }

  updateSearch = debounce((name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value } })
  }, 100)
  handleSearch = (name, value) => {
    const { filters } = this.state
    if (name === 'dateFromTo') {
      this.setState({ filters: convertFilterDate(filters, value), skipCount: 0 }, async () => {
        await this.getAll()
      })
    } else {
      this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => {
        await this.getAll()
      })
    }
  }

  gotoDetail = (id?) => {
    const { navigate } = this.props
    id
      ? window.open(portalLayouts.totalWaterMeterDetail.path.replace(':id', id), '_blank')
      : navigate(portalLayouts.totalWaterMeterCreate.path)
  }

  public render() {
    const {
      totalWaterMeterStore: { dataTable }
    } = this.props

    const columns = getColumns({
      title: L('RECORDED_DATE'),
      dataIndex: 'dateOfRecording',
      key: 'dateOfRecording',
      ellipsis: true,
      width: '17%',
      render: (dateOfRecording: any, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 20, offset: 0 }} className="col-info">
            <div className="text-link-to-detail">
              <a
                onClick={() => this.isGranted(appPermissions.PaymentRequest.detail) && this.gotoDetail(item.id)}
                className="link-text-table">
                {dateOfRecording ? renderDate(dateOfRecording) : null}
              </a>
            </div>
          </Col>
          <Col sm={{ span: 4, offset: 0 }}>
            {isGrantedAny(appPermissions.PaymentRequest.delete) && (
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {this.isGranted(appPermissions.PaymentRequest.delete) && (
                      <Menu.Item onClick={() => this.deleteItem(item.id)}>{L('BTN_DELETE')}</Menu.Item>
                    )}
                    <Menu.Item onClick={() => this.copyItem(item.id)}>{L('COPY')}</Menu.Item>
                  </Menu>
                }
                placement="bottomLeft">
                <button className="button-action-hiden-table-cell">
                  <EllipsisOutlined />
                </button>
              </Dropdown>
            )}
          </Col>
        </Row>
      )
    })

    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{L('CREATE_DATE')}</label>
          <RangePicker
            format={dateFormat}
            onChange={(value) => this.handleSearch('dateFromTo', value)}
            className="full-width"
          />
        </Col>
        <Col sm={{ span: 6 }} md={{ span: 6 }}>
          <label>{this.L('METER_READING_PACKAGE')}</label>
          <Select
            placeholder={L('METER_READING_PACKAGE')}
            filterOption={false}
            showSearch
            allowClear
            style={{ width: '100%' }}
            onChange={(value) => this.handleSearch('feePackageId', value)}
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
    return this.isGranted(appPermissions.PaymentRequest.page) ? (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          title={this.L('CONTRACT_LIST')}
          onCreate={this.gotoDetail}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: dataTable === undefined ? 0 : dataTable.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.companyContract.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            // rowKey={(record) => record?.id}
            columns={columns}
            pagination={false}
            loading={false}
            dataSource={dataTable === undefined ? [] : dataTable.items}
            scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(TotalWaterMeter)
