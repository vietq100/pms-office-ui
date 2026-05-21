import AppComponentBase from '@components/AppComponentBase'
import DataTable from '@components/DataTable'
import { Button, Col, Dropdown, Input, Menu, Modal, Row, Select, Table } from 'antd'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import AppConst, { appPermissions } from '@lib/appconst'
import getColumns from './column'
import withRouter from '@components/Layout/Router/withRouter'
import { ExcelIcon } from '@components/Icon'
import { L, LNotification } from '@lib/abpUtility'
import ElectricFormStore from '@stores/meterReading/electricFormStore'
import { portalLayouts } from '@components/Layout/Router/router.config'
import { EllipsisOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'
import packageFeeService from '@services/fee/packageFeeService'
const { pageSize } = AppConst
const confirm = Modal.confirm
interface State {
  skipCount: number
  maxResultCount: number
  filters: any
  packageOptions: any[]
}

interface Props {
  navigate: any
  electricFormStore: ElectricFormStore
}

@inject(Stores.ElectricFormStore)
@observer
class MeterReadingWaterOverview extends AppComponentBase<Props, State> {
  state = {
    skipCount: 0,
    maxResultCount: pageSize.pageSize_10,
    filters: { isActive: 'true' },
    packageOptions: [] as any
  }
  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    await Promise.all([this.getAll(), this.handlePackageSearch('')])
  }

  handlePackageSearch = debounce(async (value) => {
    const packages = await packageFeeService.getList({
      keyword: value
    })

    this.setState({ packageOptions: packages })
  }, 300)

  getAll = async () => {
    await this.props.electricFormStore.getAllFormDraft({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
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

  gotoDetail = (id?: number) => {
    if (!id) {
      this.props.navigate(portalLayouts.meterElectricOfficeCreate.path)
    } else {
      window.open(portalLayouts.meterElectricOfficeDetail.path.replace(':id', id), '_blank')
    }
  }

  deleteFormElectric = async (id: number) => {
    const self = this
    confirm({
      title: LNotification('DO_YOU_WANT_TO_DELETE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.electricFormStore.deleteForm(id)
        self.handleTableChange({ current: 1 })
      }
    })
  }

  copyFormElectric = (id: number) => {
    this.props.navigate(portalLayouts.meterElectricOfficeCreate.path, { state: { copyId: id } })
  }

  onDowmLoadTemplate = () => {
    const self = this
    confirm({
      title: LNotification('METER_ELECTRIC_DOWMLOAD_NOTIFICATION'),
      content: LNotification('METER_ELECTRIC_DOWMLOAD_CONTENT'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await this.props.electricFormStore.exportMeterOverview(this.state.filters)

        self.handleTableChange({ current: 1 })
      }
    })
  }

  renderActionGroups = () => {
    return (
      <span>
        <Button shape="circle" type="primary" className="mr-1" onClick={this.onDowmLoadTemplate} icon={<ExcelIcon />} />
      </span>
    )
  }

  render() {
    const {
      electricFormStore: { meters, isLoading }
    } = this.props

    const columns = getColumns({
      title: L('COMPANY_NAME'),
      dataIndex: 'company',
      key: 'company',
      ellipsis: true,
      width: '25%',
      render: (company, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <div className="full-name text-truncate text-link-to-detail">
              <a onClick={() => this.gotoDetail(item.id)} className="link-text-table ">
                {company?.companyName}
              </a>
            </div>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  <Menu.Item onClick={() => this.deleteFormElectric(item.id)}>{L('BTN_DEACTIVATE')}</Menu.Item>
                  <Menu.Item onClick={() => this.copyFormElectric(item.id)}>{L('COPY')}</Menu.Item>
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

    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col md={{ span: 6 }} sm={{ span: 24 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Input.Search
            maxLength={200}
            onSearch={(value) => this.handleSearch('keyword', value)}
            placeholder={`${this.L('COMPANY')}`}
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
    return (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: meters === undefined ? 0 : meters.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.MeterWater.create}
          onCreate={this.gotoDetail}
          actionGroups={this.renderActionGroups}>
          <Table
            size={'middle'}
            columns={columns}
            loading={isLoading}
            dataSource={meters.items}
            scroll={{ x: 1024, scrollToFirstRowOnChange: true }}
            className="custom-ant-table custom-ant-row"
            pagination={false}
            rowKey={(record: any) => record.id}
          />
        </DataTable>
      </>
    )
  }
}

export default withRouter(MeterReadingWaterOverview)
