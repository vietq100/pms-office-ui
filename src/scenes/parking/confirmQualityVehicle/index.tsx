import AppComponentBase from '@components/AppComponentBase'
import DataTable from '@components/DataTable'
import { Col, Dropdown, Input, Menu, Modal, Row, Select, Table } from 'antd'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import AppConst, { appPermissions } from '@lib/appconst'
import getColumns, { columnData4Tenant } from './column'
import withRouter from '@components/Layout/Router/withRouter'
import { L, LNotification } from '@lib/abpUtility'
import { portalLayouts } from '@components/Layout/Router/router.config'
import { debounce } from 'lodash'
import packageFeeService from '@services/fee/packageFeeService'
import SessionStore from '@stores/sessionStore'
import VehicleRegistrationFormStore from '@stores/parking/VehicleRegistrationFormStore'
import ModalCreateRequest from './components/ModalCreate'
import { EllipsisOutlined } from '@ant-design/icons'
const { pageSize, typeAccount } = AppConst

interface State {
  skipCount: number
  maxResultCount: number
  filters: any
  packageOptions: any[]
  openModalCreate: boolean
}

interface Props {
  navigate: any
  sessionStore: SessionStore
  vehicleRegistrationFormStore: VehicleRegistrationFormStore
}

const confirm = Modal.confirm

@inject(Stores.SessionStore, Stores.VehicleRegistrationFormStore)
@observer
class ConfirmQualityVehicle extends AppComponentBase<Props, State> {
  state = {
    skipCount: 0,
    maxResultCount: pageSize.pageSize_10,
    filters: { isActive: 'true' },
    packageOptions: [] as any,
    openModalCreate: false
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  isStaff =
    this.props.sessionStore.userAccountType === typeAccount.Develop ||
    this.props.sessionStore.userAccountType === typeAccount.Resident
      ? false
      : true

  async componentDidMount() {
    await Promise.all([this.getAll(), this.handlePackageSearch('')])
  }
  getAll = async () => {
    switch (this.props.sessionStore.userAccountType) {
      case typeAccount.Resident:
        await this.props.vehicleRegistrationFormStore.getAllByResident({
          maxResultCount: this.state.maxResultCount,
          skipCount: this.state.skipCount,
          ...this.state.filters
        })
        break

      case typeAccount.Develop:
        break

      default:
        await this.props.vehicleRegistrationFormStore.getAll({
          maxResultCount: this.state.maxResultCount,
          skipCount: this.state.skipCount,
          ...this.state.filters
        })
    }
  }

  handlePackageSearch = debounce(async (value) => {
    const packages = await packageFeeService.getList({
      keyword: value
    })
    this.setState({ packageOptions: packages })
  }, 300)

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
    if (id) {
      window.open(portalLayouts.confirmQualityVehicleDetail.path.replace(':id', id), '_blank')
    } else {
      this.setState({ openModalCreate: true })
    }
  }

  onCloseModal = (isReload: boolean) => {
    this.setState({ openModalCreate: false })
    if (isReload) {
      this.getAll()
    }
  }

  delete = async (id: number) => {
    confirm({
      title: LNotification('DO_YOU_WANT_TO_DELETE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await this.props.vehicleRegistrationFormStore.delete(id).then(() => {
          this.getAll()
        })
      }
    })
  }

  render() {
    const {
      vehicleRegistrationFormStore: { listConfirm, isLoading }
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
              <a
                onClick={() =>
                  this.isGranted(appPermissions.vehicleRegistration.detail) ? this.gotoDetail(item.id) : undefined
                }
                className="link-text-table pl-1">
                {company?.companyName}
              </a>
            </div>
          </Col>
          {item?.statusId === 0 && this.isGranted(appPermissions.vehicleRegistration.delete) && (
            <Col sm={{ span: 3, offset: 0 }}>
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    <Menu.Item onClick={() => this.delete(item.id)}>{L('BTN_DELETE')}</Menu.Item>
                  </Menu>
                }
                placement="bottomLeft">
                <button className="button-action-hiden-table-cell">
                  <EllipsisOutlined />
                </button>
              </Dropdown>
            </Col>
          )}
        </Row>
      )
    })

    const columnDataTenant = columnData4Tenant({
      title: L('METER_ELLECTRIC_PERIOD'),
      dataIndex: 'feePackage',
      key: 'feePackage',
      ellipsis: true,
      width: '20%',
      render: (feePackage, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 24, offset: 0 }} className="col-info">
            <div className="full-name text-truncate text-link-to-detail">
              <a onClick={() => this.gotoDetail(item.id)} className="link-text-table pl-1">
                {feePackage?.name}
              </a>
            </div>
          </Col>
        </Row>
      )
    })

    const filterComponent = (
      <Row gutter={[16, 8]}>
        {this.isStaff && (
          <Col md={{ span: 6 }} sm={{ span: 24 }}>
            <label>{this.L('FILTER_KEYWORD')}</label>
            <Input.Search
              maxLength={200}
              onSearch={(value) => this.handleSearch('keyword', value)}
              placeholder={`${this.L('FILTER_KEYWORD_COMPANY')}`}
            />
          </Col>
        )}
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
    return this.isGranted(appPermissions.vehicleRegistration.page) ? (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: listConfirm === undefined ? 0 : listConfirm.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.vehicleRegistration.create}
          onCreate={this.isStaff ? () => this.gotoDetail() : undefined}>
          <Table
            size={'middle'}
            columns={this.isStaff ? columns : columnDataTenant}
            loading={isLoading}
            dataSource={listConfirm.items}
            scroll={{ x: 1024, scrollToFirstRowOnChange: true }}
            className="custom-ant-table custom-ant-row"
            pagination={false}
            rowKey={(record: any) => record.id}
          />
        </DataTable>

        <ModalCreateRequest
          visible={this.state.openModalCreate}
          onRefresh={this.getAll}
          onCancel={(isReload) => this.onCloseModal(isReload)}
          vehicleRegistrationFormStore={this.props.vehicleRegistrationFormStore}
        />
      </>
    ) : (
      <></>
    )
  }
}

export default withRouter(ConfirmQualityVehicle)
