import * as React from 'react'
import { Col, Modal, Row, Table, Select, DatePicker, Input } from 'antd'
import { AppComponentListBase } from '@components/AppComponentBase'
import DataTable from '@components/DataTable'
import { L, LNotification } from '@lib/abpUtility'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import { appPermissions, dateFormat } from '@lib/appconst'
import { portalLayouts } from '@components/Layout/Router/router.config'
import getColumns from './columns'
import withRouter from '@components/Layout/Router/withRouter'
import UnitStore from '@stores/project/unitStore'
import AppConsts from '@lib/appconst'
import RequestCardbuidingStore from '@stores/cardBuilding/requestCardBuildingStore'
import SessionStore from '@stores/sessionStore'
import companyService from '@services/project/companyService'
import { convertFilterDate, filterOptions } from '@lib/helper'
import CardbuidingStore from '@stores/cardBuilding/cardbuidingStore'
import { debounce } from 'lodash'

const { pageSize, typeAccount, listCardRequestStatus, listCardRequestType } = AppConsts
export interface IProps {
  navigate: any
  unitStore: UnitStore
  requestCardbuidingStore: RequestCardbuidingStore
  sessionStore: SessionStore
  cardbuidingStore: CardbuidingStore
}

export interface IState {
  maxResultCount: number
  skipCount: number
  listCompany: any[]
  filters: any
}

const confirm = Modal.confirm

@inject(Stores.RequestCardbuidingStore, Stores.SessionStore, Stores.CardbuidingStore)
@observer
class RequestBuildingCard extends AppComponentListBase<IProps, IState> {
  formRef: any = React.createRef()

  state = {
    maxResultCount: pageSize.pageSize_10,
    listCompany: [] as any,
    skipCount: 0,
    filters: {} as any
  }

  isStaff = this.props.sessionStore.userAccountType === typeAccount.Resident ? false : true

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    await Promise.all([this.getAll(), this.props.cardbuidingStore.getListCompany()])
  }

  getAll = async () => {
    if (this.isStaff) {
      await this.props.requestCardbuidingStore.getAll({
        maxResultCount: this.state.maxResultCount,
        skipCount: this.state.skipCount,
        ...this.state.filters
      })
    } else {
      await this.props.requestCardbuidingStore.getAllByCompany({
        maxResultCount: this.state.maxResultCount,
        skipCount: this.state.skipCount,
        ...this.state.filters
      })
    }
  }
  getListCompany = async (keyword: string) => {
    const filter = {
      keyword,
      skipCount: 0,
      maxResultCount: 20,
      isActive: true
    }
    const result = await companyService.getAll(filter)
    this.setState({ listCompany: result.items })
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
        await self.props.requestCardbuidingStore.activateOrDeactivate(id, isActive)
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

    this.setState(
      { filters: name === 'date' ? convertFilterDate(filters, value) : { ...filters, [name]: value }, skipCount: 0 },
      async () => {
        await this.getAll()
      }
    )
  }
  gotoDetail = (id?) => {
    const { navigate } = this.props
    id
      ? window.open(portalLayouts.RequestBuildingCardDetail.path.replace(':id', id), '_blank')
      : navigate(portalLayouts.RequestBuildingCardCreate.path)
  }

  public render() {
    const {
      requestCardbuidingStore: { requestCardBuildings, isLoading }
    } = this.props
    const columns = getColumns({
      title: L('BUILDING_CARD_COMPANY'),
      dataIndex: 'company',
      key: 'company',
      width: '20%',
      render: (company, item: any) => (
        <Row>
          <Col sm={{ span: 21, offset: 0 }}>
            <a
              onClick={appPermissions.updateCardRequest.update ? () => this.gotoDetail(item.id) : undefined}
              className="link-text-table ml-1">
              {company?.companyName ?? '--'}
            </a>
          </Col>
        </Row>
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
        {this.isStaff && (
          <Col sm={{ span: 6, offset: 0 }}>
            <label>{this.L('FILTER_COMPANY')}</label>
            <Select
              placeholder={L('FILTER_COMPANY')}
              allowClear
              onChange={(value) => this.handleSearch('companyIds', value)}
              showArrow
              mode="multiple"
              filterOption={filterOptions}
              style={{ width: '100%' }}>
              {this.renderOptions(this.props.cardbuidingStore.listCompany)}
            </Select>
          </Col>
        )}
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_REQUEST_TYPE')}</label>
          <Select
            mode="multiple"
            filterOption={filterOptions}
            onChange={(value) => this.handleSearch('cardRequestTypes', value)}
            style={{ width: '100%' }}>
            {listCardRequestType.map((item: any) => (
              <Select.Option key={item?.value} value={item?.value}>
                {L(item?.name)}
              </Select.Option>
            ))}
          </Select>
        </Col>

        <Col sm={{ span: 6, offset: 0 }}>
          <label>{L('FILTER_REQUEST_CREATION_TIME')}</label>
          <DatePicker.RangePicker
            className="w-100"
            format={dateFormat}
            onChange={(dates) => this.handleSearch('date', dates)}
          />
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_REQUEST_STATUS')}</label>
          <Select
            mode="multiple"
            onChange={(value) => this.handleSearch('statuses', value)}
            style={{ width: '100%' }}
            filterOption={filterOptions}>
            {listCardRequestStatus.map((item: any) => (
              <Select.Option key={item?.id} value={item?.id}>
                {L(item?.name)}
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
          title={this.L('DELIVERY_LIST')}
          onCreate={!this.isStaff ? this.gotoDetail : undefined}
          createPermission={appPermissions.updateCardRequest.create}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: requestCardBuildings === undefined ? 0 : requestCardBuildings.totalCount,
            onChange: this.handleTableChange
          }}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            columns={columns}
            scroll={{ x: 1000, y: 550, scrollToFirstRowOnChange: true }}
            pagination={false}
            loading={isLoading}
            dataSource={requestCardBuildings === undefined ? [] : requestCardBuildings.items}
          />
        </DataTable>
      </>
    )
  }
}

export default withRouter(RequestBuildingCard)
