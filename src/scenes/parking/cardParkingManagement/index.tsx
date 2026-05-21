import { AppComponentListBase } from '@components/AppComponentBase'
import { L } from '@lib/abpUtility'
import AppConsts, { appPermissions } from '../../../lib/appconst'
import React from 'react'
import getVehicleColumns from './columns'
import { Button, Card, Col, Input, Row, Select, Table } from 'antd'
import DataTable from '@components/DataTable'
import ParkingStore from '@stores/parking/parkingStore'
import withRouter from '@components/Layout/Router/withRouter'
import { portalLayouts } from '@components/Layout/Router/router.config'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import { debounce } from 'lodash'
import { convertDate, filterOptions } from '@lib/helper'
import SessionStore from '@stores/sessionStore'
import { ExcelIcon } from '@components/Icon'
import CardbuidingStore from '@stores/cardBuilding/cardbuidingStore'

const Search = Input.Search
const { typeAccount, listCardType } = AppConsts
export interface IParkingProps {
  navigate: any
  params: any
  parkingStore: ParkingStore
  sessionStore: SessionStore
  cardbuidingStore: CardbuidingStore
}

export interface IParkingState {
  filters: any
  skipCount: number
  maxResultCount: number
}

@inject(Stores.ParkingStore, Stores.SessionStore, Stores.CardbuidingStore)
@observer
class CardParkingManagement extends AppComponentListBase<IParkingProps, IParkingState> {
  formRef: any = React.createRef()

  state = {
    maxResultCount: 10,
    skipCount: 0,
    modalVisible: false,
    listTypes: [],
    filters: {
      vehicleTypeId: undefined,
      vehicleStatusId: undefined,
      companyId: undefined,
      parkingId: undefined,
      isGranted: undefined,
      cardTypes: undefined,
      isActive: 'true'
    }
  }

  isStaff =
    this.props.sessionStore.userAccountType === typeAccount.Develop ||
    this.props.sessionStore.userAccountType === typeAccount.Resident
      ? false
      : true

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }
  async componentDidMount() {
    await Promise.all([
      this.props.parkingStore.getType(),
      this.props.parkingStore.getStatus(),
      this.props.cardbuidingStore.getListParking(),
      this.props.cardbuidingStore.getListCompany()
    ])
    await this.getAll()
  }

  getAll = async () => {
    if (this.isStaff) {
      await this.props.parkingStore.getAllVehicleResident({
        maxResultCount: this.state.maxResultCount,
        skipCount: this.state.skipCount,
        ...this.state.filters
      })
    } else {
      await this.props.parkingStore.getAllRegistedVehicles({
        maxResultCount: this.state.maxResultCount,
        skipCount: this.state.skipCount,
        ...this.state.filters
      })
    }
  }

  gotoDetail = (id?) => {
    const { navigate } = this.props
    id
      ? navigate(portalLayouts.cardParkingManagementDetail.path.replace(':id', id))
      : navigate(portalLayouts.cardParkingManagementCreate.path)
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  updateSearch = debounce((name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value } })
  }, 100)

  handleSearch = (name, value) => {
    const { filters } = this.state
    if (name === 'registerDate') {
      this.setState({ filters: convertDate(filters, value, 'registerDate'), skipCount: 0 }, async () => {
        await this.getAll()
      })
    } else {
      this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => {
        await this.getAll()
      })
    }
  }

  handleExportParking = async () => {
    const { parkingStore } = this.props
    await parkingStore.exportParkingCard(this.state.filters)
  }
  renderActionGroups = () => {
    return (
      <span>
        {this.isGranted(appPermissions.parking.export) && (
          <Button
            shape="circle"
            type="primary"
            className="mr-1"
            onClick={this.handleExportParking}
            icon={<ExcelIcon />}
          />
        )}
      </span>
    )
  }
  public render() {
    const { filters } = this.state
    const {
      parkingStore: { parkingCard, vehicleTypes, vehicleStatus, grantedStatus },
      cardbuidingStore: { listCompany, listParking }
    } = this.props
    const columns = getVehicleColumns({
      title: L('PARKING_CARD_NAME'),
      dataIndex: 'tenantName',
      key: 'tenantName',
      width: 180,
      render: (tenantName: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 24, offset: 0 }} className="col-info pl-2">
            <div
              className="full-name text-truncate text-link-to-detail"
              onClick={() => {
                if (this.isGranted(appPermissions.parking.detail)) {
                  this.gotoDetail(item?.vehicleId)
                }
              }}>
              <a className="link-text-table"> {tenantName}</a>
            </div>
          </Col>
        </Row>
      )
    })
    const keywordPlaceHolder = `${this.L('SEARCH_BY_SERIAL_NUMBER')}`
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            maxLength={200}
            placeholder={keywordPlaceHolder}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>

        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_VEHICLE_TYPE')}</label>
          <Select
            placeholder={L('FILTER_VEHICLE_TYPE')}
            allowClear
            onChange={(value) => this.handleSearch('vehicleTypeId', value)}
            value={filters.vehicleTypeId}
            showArrow
            style={{ width: '100%' }}>
            {this.renderOptions(vehicleTypes)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_VEHICLE_STATUS')}</label>
          <Select
            placeholder={L('FILTER_VEHICLE_STATUS')}
            allowClear
            onChange={(value) => this.handleSearch('vehicleStatusId', value)}
            value={filters.vehicleStatusId}
            showArrow
            style={{ width: '100%' }}>
            {this.renderOptions(vehicleStatus)}
          </Select>
        </Col>
        {this.isStaff && (
          <Col sm={{ span: 6, offset: 0 }}>
            <label>{this.L('FILTER_COMPANY')}</label>
            <Select
              allowClear
              showSearch
              showArrow
              placeholder={L('FILTER_COMPANY')}
              filterOption={filterOptions}
              onChange={(value) => this.handleSearch('companyId', value)}
              value={filters.companyId}
              style={{ width: '100%' }}>
              {this.renderOptions(listCompany)}
            </Select>
          </Col>
        )}
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_PARKING')}</label>
          <Select
            placeholder={L('FILTER_PARKING')}
            allowClear
            onChange={(value) => this.handleSearch('parkingId', value)}
            value={filters.parkingId}
            showArrow
            style={{ width: '100%' }}>
            {this.renderOptions(listParking)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_PARKING_CARD_TYPE')}</label>
          <Select
            placeholder={L('FILTER_PARKING_CARD_TYPE')}
            allowClear
            mode="multiple"
            onChange={(value) => this.handleSearch('cardTypes', value)}
            value={filters.cardTypes}
            showArrow
            style={{ width: '100%' }}>
            {this.renderOptions(listCardType)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_GRANTED_STATUS')}</label>
          <Select
            placeholder={L('FILTER_GRANTED_STATUS')}
            allowClear
            onChange={(value) => this.handleSearch('isGranted', value)}
            value={filters.isGranted}
            showArrow
            style={{ width: '100%' }}>
            {this.renderOptions(grantedStatus)}
          </Select>
        </Col>
      </Row>
    )
    return (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          title={this.L('DELIVERY_LIST')}
          actionGroups={this.renderActionGroups}
          onCreate={() => {
            this.gotoDetail()
          }}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: parkingCard.totalCount ?? 0,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.parking.create}>
          <Card bordered={false} style={{ minHeight: 500 }}>
            <Table
              size="middle"
              className="custom-ant-table custom-ant-row"
              columns={columns}
              scroll={{ x: 1000, y: 450 }}
              pagination={false}
              loading={this.props.parkingStore.isLoading}
              dataSource={parkingCard.items ?? []}
            />
          </Card>
        </DataTable>
      </>
    )
  }
}

export default withRouter(CardParkingManagement)
