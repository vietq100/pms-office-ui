import { Col, Modal, Row, Table, Dropdown, Menu, DatePicker, Select, Input } from 'antd'
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
import ManagementFeeStore from '@stores/paymentRequest/managementFeeStore'
import packageFeeService from '@services/fee/packageFeeService'
const { RangePicker } = DatePicker

export interface IProps {
  navigate: any
  sessionStore: SessionStore
  managementFeeStore: ManagementFeeStore
}

export interface IState {
  filters: any
  packageOptions: any[]
}

const confirm = Modal.confirm

@inject(Stores.SessionStore, Stores.ManagementFeeStore)
@observer
class ManagementFees extends AppComponentListBase<IProps, IState> {
  state = {
    packageOptions: [] as any,
    filters: {
      isActive: 'true'
    }
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
    await this.props.managementFeeStore.getList({
      ...this.state.filters
    })
  }

  deleteItem = async (id: number) => {
    const self = this
    confirm({
      title: LNotification('DO_YOU_WANT_TO_DELETE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.managementFeeStore.delete(id)
      }
    })
  }

  updateSearch = debounce((name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value } })
  }, 100)

  handleSearch = (name, value) => {
    const { filters } = this.state
    if (name === 'dateFromTo') {
      this.setState({ filters: convertFilterDate(filters, value) }, async () => {
        await this.getAll()
      })
    } else {
      this.setState({ filters: { ...filters, [name]: value } }, async () => {
        await this.getAll()
      })
    }
  }

  gotoDetail = (id?) => {
    const { navigate } = this.props
    id
      ? window.open(portalLayouts.managementFeeDetail.path.replace(':id', id), '_blank')
      : navigate(portalLayouts.managementFeeCreate.path)
  }

  public render() {
    const {
      managementFeeStore: { dataTable }
    } = this.props
    const columns = getColumns({
      title: L('RECORDED_DATE'),
      dataIndex: 'dateOfCreation',
      key: 'dateOfCreation',
      ellipsis: true,
      width: '14%',
      render: (dateOfCreation: any, item: any) =>
        !item.children ? (
          <Row style={{ justifyContent: 'space-between' }}>
            <Col sm={{ span: 21, offset: 0 }} className="col-info">
              <div className="text-link-to-detail">
                <a
                  onClick={() => this.isGranted(appPermissions.PaymentRequest.detail) && this.gotoDetail(item.id)}
                  className="link-text-table">
                  {dateOfCreation ? renderDate(dateOfCreation) : null}
                </a>
              </div>
            </Col>
            <Col sm={{ span: 3, offset: 0 }}>
              {isGrantedAny(appPermissions.PaymentRequest.delete) && (
                <Dropdown
                  trigger={['click']}
                  overlay={
                    <Menu>
                      {this.isGranted(appPermissions.PaymentRequest.delete) && (
                        <Menu.Item onClick={() => this.deleteItem(item.id)}>{L('BTN_DELETE')}</Menu.Item>
                      )}
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
        ) : (
          item.year
        )
    })

    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Input.Search
            maxLength={200}
            placeholder={L('ID')}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>
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
          createPermission={appPermissions.PaymentRequest.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record?.id}
            columns={columns}
            pagination={false}
            loading={false}
            dataSource={dataTable === undefined ? [] : dataTable}
            scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(ManagementFees)
