import * as React from 'react'
import Row from 'antd/es/row'
import Col from 'antd/es/col'
import Input from 'antd/es/input'
import Modal from 'antd/es/modal'
import Table from 'antd/es/table'
import Select from 'antd/es/select'
import Button from 'antd/es/button'
import DatePicker from 'antd/es/date-picker'
import { AppComponentListBase } from '../../../components/AppComponentBase'
import ReservationAdditionalFeeModal from './components/ReservationAdditionalFeeModal'
// import Filter from '../../../components/Filter'
import DataTable from '../../../components/DataTable'
import { L, LNotification, isGrantedAny } from '../../../lib/abpUtility'
import ReservationStore from '../../../stores/booking/reservationStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppConst, { appPermissions, dateFormat } from '../../../lib/appconst'
import ProjectStore from '../../../stores/project/projectStore'
import { portalLayouts } from '../../../components/Layout/Router/router.config'
import AmenityGroupStore from '../../../stores/booking/amenityGroupStore'
import debounce from 'lodash/debounce'
import AmenityStore from '@stores/booking/amenityStore'
import { RowReservationModel } from '@models/Booking/reservationModel'
import { ExcelIcon } from '@components/Icon'
import UnitStore from '@stores/project/unitStore'
import getColumns from './columns'
import OverViewBar from '@components/DataTable/OverViewBar'
import withRouter from '@components/Layout/Router/withRouter'
import { convertFilterDate, renderAvatar } from '@lib/helper'
import { Dropdown, Menu } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'
import NoRole from '@components/ComponentNoRole'

const { RangePicker } = DatePicker
const { reservationStatus } = AppConst
const { Option } = Select

export interface IReservationsProps {
  navigate: any
  routedata?: any
  reservationStore: ReservationStore
  projectStore: ProjectStore
  amenityGroupStore: AmenityGroupStore
  amenityStore: AmenityStore
  unitStore: UnitStore
}

export interface IReservationsState {
  maxResultCount: number
  skipCount: number
  listStatus: any[]
  filters: any
  employees: any[]
  listTracker: any[]
  selectedReservation?: RowReservationModel
  visible: boolean
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.ReservationStore, Stores.ProjectStore, Stores.AmenityGroupStore, Stores.AmenityStore, Stores.UnitStore)
@observer
class Reservations extends AppComponentListBase<IReservationsProps, IReservationsState> {
  formRef: any = React.createRef()

  state = {
    maxResultCount: 10,
    skipCount: 0,
    listStatus: [],
    filters: {
      projectIds: undefined,
      buildingId: undefined,
      unitId: undefined,
      isActive: 'true'
    },
    employees: [],
    listTracker: [],
    selectedReservation: {} as RowReservationModel,
    visible: false
  }

  async componentDidMount() {
    this.isGranted(appPermissions.reservation.page) &&
      (await Promise.all([
        this.props.amenityGroupStore.getLists({}),
        this.props.reservationStore.getReservationStatus(),
        this.props.reservationStore.getReservationPaymentStatus(),
        this.props.amenityGroupStore.getAmenities(''),
        this.findUnits(''),
        this.findBuildings(''),
        this.getAll()
      ]))
  }

  getAll = async () => {
    await this.props.reservationStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
    await this.props.reservationStore.getOverview({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  findBuildings = async (keyword) => {
    await this.props.projectStore.filterBuildingOptions({ keyword })
  }

  findUnits = async (keyword) => {
    const {
      filters: { buildingId }
    } = this.state
    if (!buildingId) {
      this.setState({ filters: { ...this.state.filters, unitId: undefined } })
    }

    await this.props.unitStore.getAll({ keyword, buildingId: buildingId })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  activateOrDeactivate = async (id: number, isActive) => {
    const self = this
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.reservationStore.activateOrDeactivate(id, isActive)
        self.handleTableChange({ current: 1 })
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

  handleExportReservation = async () => {
    const { reservationStore } = this.props
    await reservationStore.exportReservations(this.state.filters)
  }

  gotoDetail = (id?) => {
    const { navigate } = this.props
    id
      ? navigate(portalLayouts.reservationDetail.path.replace(':id', id))
      : navigate(portalLayouts.reservationCreate.path)
  }

  hideOrShowReservationAdditionalFeeModal = (selectedReservation?) => {
    this.setState({ visible: !this.state.visible, selectedReservation })
  }

  handleCreateAdditionalServiceUsageFeeSuccess = () => {
    this.getAll()
    this.setState({ visible: !this.state.visible })
  }

  renderActionGroups = () => {
    const {
      reservationStore: { pagedData }
    } = this.props
    return (
      <span>
        {this.isGranted(appPermissions.reservation.export) && (
          <Button
            shape="circle"
            type="primary"
            className="mr-1"
            onClick={this.handleExportReservation}
            icon={<ExcelIcon />}
            disabled={!pagedData || !pagedData.totalCount}
          />
        )}
      </span>
    )
  }

  public render() {
    const {
      reservationStore: { pagedData, listStatus, listPaymentStatus },
      amenityGroupStore: { amenityGroups, amenities },
      projectStore: { buildingOptions },
      unitStore: { units }
    } = this.props
    const { filters } = this.state
    const columns = getColumns({
      title: L('RESERVATION_RESIDENT'),
      dataIndex: 'displayName',
      key: 'displayName',
      width: '15%',
      ellipsis: true,
      render: (displayName: string, item: any) => {
        const statusCode = item.status?.statusCode || ''
        return (
          <Row style={{ justifyContent: 'space-between' }}>
            <Col sm={{ span: 20, offset: 0 }} className="col-info">
              <a
                onClick={() => this.isGranted(appPermissions.reservation.detail) && this.gotoDetail(item.id)}
                className="link-text-table">
                {renderAvatar(displayName, item, true, item.fullUnitCode, false)}
              </a>
            </Col>
            <Col sm={{ span: 4, offset: 0 }}>
              {isGrantedAny(appPermissions.reservation.delete) &&
                (statusCode === reservationStatus.requested || statusCode === reservationStatus.approved) && (
                  <Dropdown
                    trigger={['click']}
                    overlay={
                      <Menu>
                        {this.isGranted(appPermissions.reservation.update) &&
                          (statusCode === reservationStatus.requested || statusCode === reservationStatus.approved) && (
                            <Menu.Item onClick={() => this.hideOrShowReservationAdditionalFeeModal(item)}>
                              {L('HIDE_OR_SHOW_RESERVATION_ADDITIONAL_FEE')}
                            </Menu.Item>
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
        )
      }
    })
    const keywordPlaceholder = ` ${this.L('SEARCH_WO_ID')}, ${this.L('RESIDENT_PHONE')}, ${this.L('RESIDENT_USERNAME')}`
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            maxLength={200}
            placeholder={keywordPlaceholder}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_AMENITY_GROUP')}</label>
          <Select
            showSearch
            allowClear
            filterOption={false}
            className="full-width"
            onChange={(amenityGroupId) => {
              this.handleSearch('amenityGroupId', amenityGroupId)
              this.props.amenityGroupStore.getAmenities({ amenityGroupId })
            }}>
            {this.renderOptions(amenityGroups)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_AMENITY')}</label>
          <Select
            showSearch
            allowClear
            filterOption={false}
            className="full-width"
            onSearch={(keyword) =>
              this.props.amenityGroupStore.getAmenities({
                keyword,
                isActive: true
              })
            }
            onChange={(value) => this.handleSearch('amenityId', value)}>
            {this.renderOptions(amenities)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_FROM_TO_DATE')}</label>
          <RangePicker
            format={dateFormat}
            className="full-width"
            onChange={(value) => this.handleSearch('dateFromTo', value)}
          />
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_STATUS')}</label>
          <Select
            showSearch
            showArrow
            allowClear
            onChange={(value) => this.handleSearch('statusId', value)}
            style={{ width: '100%' }}>
            {(listStatus || []).map((status: any, index) => (
              <Option key={index} value={status.id}>
                {status.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_PAYMENT_STATUS')}</label>
          <Select
            showSearch
            showArrow
            allowClear
            onChange={(value) => this.handleSearch('paymentStatusId', value)}
            style={{ width: '100%' }}>
            {(listPaymentStatus || []).map((status: any, index) => (
              <Option key={index} value={status.id}>
                {status.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_BUILDING')}</label>
          <Select
            showSearch
            allowClear
            filterOption={false}
            className="full-width"
            onSearch={this.findBuildings}
            value={filters.buildingId}
            onChange={(value) => this.handleSearch('buildingId', value)}>
            {this.renderOptions(buildingOptions)}
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
            style={{ width: '100%' }}
            value={filters.unitId}>
            {units?.items.map((pfStore) => (
              <Select.Option value={`${pfStore.id}`} key={pfStore.id}>
                {pfStore.fullUnitCode} <span className="text-muted small">({pfStore.name})</span>
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.reservation.page) ? (
      <>
        <OverViewBar
          data={this.props.reservationStore.reservationOverview}
          handleClickItem={() => {
            return
          }}
        />
        {/* <Filter title={this.L('FILTER')} handleRefresh={this.getAll}>
          <Row gutter={[16, 8]}>
            <Col sm={{ span: 6, offset: 0 }}>
              <label>{this.L('FILTER_KEYWORD')}</label>
              <Search
                placeholder={keywordPlaceholder}
                onChange={(value) =>
                  this.updateSearch('keyword', value.target?.value)
                }
                onSearch={(value) => this.handleSearch('keyword', value)}
              />
            </Col>
            <Col sm={{ span: 6, offset: 0 }}>
              <label>{this.L('FILTER_AMENITY_GROUP')}</label>
              <Select
                showSearch
                allowClear
                filterOption={false}
                className="full-width"
                onChange={(amenityGroupId) => {
                  this.handleSearch('amenityGroupId', amenityGroupId)
                  this.props.amenityGroupStore.getAmenities({ amenityGroupId })
                }}>
                {this.renderOptions(amenityGroups)}
              </Select>
            </Col>
            <Col sm={{ span: 6, offset: 0 }}>
              <label>{this.L('FILTER_AMENITY')}</label>
              <Select
                showSearch
                allowClear
                filterOption={false}
                className="full-width"
                onSearch={(keyword) =>
                  this.props.amenityGroupStore.getAmenities({
                    keyword,
                    isActive: true
                  })
                }
                onChange={(value) => this.handleSearch('amenityId', value)}>
                {this.renderOptions(amenities)}
              </Select>
            </Col>
            <Col sm={{ span: 6, offset: 0 }}>
              <label>{this.L('FILTER_FROM_TO_DATE')}</label>
              <RangePicker
                format={dateFormat}
                className="full-width"
                onChange={(value) => this.handleSearch('dateFromTo', value)}
              />
            </Col>
            <Col sm={{ span: 6, offset: 0 }}>
              <label>{this.L('FILTER_STATUS')}</label>
              <Select
                showSearch
                showArrow
                allowClear
                onChange={(value) => this.handleSearch('statusId', value)}
                style={{ width: '100%' }}>
                {(listStatus || []).map((status: any, index) => (
                  <Option key={index} value={status.id}>
                    {status.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col sm={{ span: 6, offset: 0 }}>
              <label>{this.L('FILTER_PAYMENT_STATUS')}</label>
              <Select
                showSearch
                showArrow
                allowClear
                onChange={(value) =>
                  this.handleSearch('paymentStatusId', value)
                }
                style={{ width: '100%' }}>
                {(listPaymentStatus || []).map((status: any, index) => (
                  <Option key={index} value={status.id}>
                    {status.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col sm={{ span: 6, offset: 0 }}>
              <label>{this.L('FILTER_BUILDING')}</label>
              <Select
                showSearch
                allowClear
                filterOption={false}
                className="full-width"
                onSearch={this.findBuildings}
                value={filters.buildingId}
                onChange={(value) => this.handleSearch('buildingId', value)}>
                {this.renderOptions(buildingOptions)}
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
                style={{ width: '100%' }}
                value={filters.unitId}>
                {units?.items.map((pfStore) => (
                  <Select.Option value={`${pfStore.id}`} key={pfStore.id}>
                    {pfStore.fullUnitCode}{' '}
                    <span className="text-muted small">({pfStore.name})</span>
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Filter> */}
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          title={this.L('RESERVATION_LIST')}
          onCreate={this.gotoDetail}
          pagination={{
            pageSize: this.state.maxResultCount,
            total: pagedData === undefined ? 0 : pagedData.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.reservation.create}
          actionGroups={this.renderActionGroups}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={this.props.reservationStore.isLoading}
            dataSource={pagedData === undefined ? [] : pagedData.items}
            scroll={{ x: 1000, y: 500, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
        <ReservationAdditionalFeeModal
          visible={this.state.visible}
          reservation={this.state.selectedReservation}
          reservationStore={this.props.reservationStore}
          amenityStore={this.props.amenityStore}
          onCancel={this.hideOrShowReservationAdditionalFeeModal}
          onCreate={this.handleCreateAdditionalServiceUsageFeeSuccess}></ReservationAdditionalFeeModal>
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(Reservations)
