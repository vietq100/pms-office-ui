import * as React from 'react'
import { Col, Input, Row, Table, Select, Modal, Dropdown, Menu, Button } from 'antd'
import { AppComponentListBase } from '../../../components/AppComponentBase'
import DataTable from '../../../components/DataTable'
import { L, LNotification } from '../../../lib/abpUtility'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppConst from '../../../lib/appconst'
import { portalLayouts } from '../../../components/Layout/Router/router.config'
import debounce from 'lodash/debounce'
import withRouter from '@components/Layout/Router/withRouter'
import getColumns, { columnData4Tenant } from './columns'
import SessionStore from '@stores/sessionStore'
import OvertimeTicketStore from '@stores/ticketRequestStore/overtimeTicketStore'
import { EllipsisOutlined } from '@ant-design/icons'
import packageFeeService from '@services/fee/packageFeeService'
import { convertFilterDate, filterOptions } from '@lib/helper'
import renovationService from '@services/ticketRequest/renovationService'
import cardbuidingService from '@services/cardbuilding/cardbuidingService'
import { ExcelIcon } from '@components/Icon'

const { airConditionerStatus, listTicketRequestStatus, typeAccount, ticketRequestStatusEnum } = AppConst

export interface Props {
  navigate: any
  params: any
  overtimeTicketStore: OvertimeTicketStore
  sessionStore: SessionStore
}

export interface State {
  maxResultCount: number
  skipCount: number
  filters: any
  packageOptions: any[]
  listZone: any[]
  listCompany: any[]
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.OvertimeTicketStore, Stores.SessionStore)
@observer
class OvertimeTicketPage extends AppComponentListBase<Props, State> {
  formRef: any = React.createRef()

  isStaff =
    this.props.sessionStore.userAccountType === typeAccount.Develop ||
    this.props.sessionStore.userAccountType === typeAccount.Resident
      ? false
      : true

  state = {
    maxResultCount: 10,
    skipCount: 0,
    packageOptions: [] as any,
    listZone: [] as any,
    listCompany: [] as any,

    filters: { status: [], feePackageId: undefined }
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.getAll()
    this.handlePackageSearch('')
    this.getListZone()
    this.getListCompany()
  }

  getListZone = async () => {
    const listZone = await renovationService.getListZone()

    this.setState({ listZone })
  }
  getListCompany = async () => {
    const listCompany = await cardbuidingService.getListCompany()
    this.setState({ listCompany })
  }
  handlePackageSearch = debounce(async (value) => {
    const packages = await packageFeeService.getList({
      keyword: value
    })
    this.setState({ packageOptions: packages })
  }, 300)

  getAll = async () => {
    switch (this.props.sessionStore.userAccountType) {
      case typeAccount.Resident:
        await this.props.overtimeTicketStore.getAll4User({
          maxResultCount: this.state.maxResultCount,
          skipCount: this.state.skipCount,

          ...this.state.filters
        })
        break
      case typeAccount.Develop:
        await this.props.overtimeTicketStore.getAll4User({
          maxResultCount: this.state.maxResultCount,
          skipCount: this.state.skipCount,
          ...this.state.filters
        })
        break

      default:
        await this.props.overtimeTicketStore.getAll4Staff({
          maxResultCount: this.state.maxResultCount,
          skipCount: this.state.skipCount,
          ...this.state.filters
        })
    }
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  deleteTicketRequest = async (id: number) => {
    const self = this
    confirm({
      title: LNotification('DO_YOU_WANT_TO_DELETE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.overtimeTicketStore.deleteTicketRequest(id)
        self.handleTableChange({ current: 1 })
      }
    })
  }

  updateSearch = debounce((name, value) => {
    const { filters } = this.state
    this.setState(
      { filters: name === 'date' ? convertFilterDate(filters, value) : { ...filters, [name]: value }, skipCount: 0 },
      async () => {
        await this.getAll()
      }
    )
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
      ? window.open(portalLayouts.ticketRequestOvertimeDetail.path.replace(':id', id), '_blank')
      : navigate(portalLayouts.ticketRequestOvertimeCreate.path)
  }

  exportOvertimeTicket = async () => {
    await this.props.overtimeTicketStore.exportOvertimeTicket(this.state.filters)
  }

  renderActionsGroups = () => {
    return (
      this.state.filters?.feePackageId && (
        <Button
          shape="circle"
          type="primary"
          className="mr-1"
          onClick={this.exportOvertimeTicket}
          icon={<ExcelIcon />}
        />
      )
    )
  }

  public render() {
    const {
      overtimeTicketStore: { overtimesRequest, isLoading }
    } = this.props

    const columns = getColumns({
      title: L('REPRESENTATIVE'),
      dataIndex: 'company',
      key: 'company',
      ellipsis: true,
      width: '20%',
      render: (company, item: any) => (
        <Row style={{ justifyContent: 'space-between', marginLeft: '5px' }}>
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <a className="link-text-table" onClick={() => this.gotoDetail(item.id)}>
              {company?.companyName}
            </a>
            <br />
            <span>{company?.representative}</span>
            <br />
            <span>
              {company?.contactPhone} - {company?.contactEmail}
            </span>
          </Col>
          {/* <Col sm={{ span: 3, offset: 0 }}>
            {isGrantedAny(appPermissions.company.delete) && (
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {this.isGranted(appPermissions.company.delete) && (
                      <Menu.Item onClick={() => this.activateOrDeactivate(item.id, !item.isActive)}>
                        {L(item.isActive ? 'BTN_DEACTIVATE' : 'BTN_ACTIVATE')}
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
          </Col> */}
        </Row>
      )
    })

    const columnDataTenant = columnData4Tenant({
      title: L('TRANSER_USER_CREATE'),
      dataIndex: 'creatorUser',
      key: 'creatorUser',
      ellipsis: true,
      width: '20%',
      render: (creatorUser, item: any) => (
        <Row style={{ justifyContent: 'space-between', marginLeft: '5px' }}>
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <a className="link-text-table" onClick={() => this.gotoDetail(item.id)}>
              {creatorUser?.displayName}
            </a>
          </Col>
          {item?.statusId === ticketRequestStatusEnum.Draft && (
            <Col sm={{ span: 3, offset: 0 }}>
              {/* {isGrantedAny(appPermissions.company.delete) && ( */}
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {/* {this.isGranted(appPermissions.company.delete) && ( */}
                    <Menu.Item onClick={() => this.deleteTicketRequest(item.id)}>{L('BTN_DELETE_TICKET')}</Menu.Item>
                    {/* )} */}
                  </Menu>
                }
                placement="bottomLeft">
                <button className="button-action-hiden-table-cell">
                  <EllipsisOutlined />
                </button>
              </Dropdown>
              {/* )} */}
            </Col>
          )}
        </Row>
      )
    })

    const keywordPlaceholder = ` ${this.L('CONTRUCTION_REQUEDT_KEYWORD_SEARCH')}`
    const filterComponent = (
      <Row gutter={[4, 4]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            maxLength={200}
            placeholder={keywordPlaceholder}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            onSearch={(value) => this.handleSearch('keyword', value)}
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
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
          <Select
            mode="multiple"
            placeholder={this.L('FILTER_ACTIVE_STATUS')}
            style={{ width: '100%' }}
            filterOption={filterOptions}
            onChange={(value) => this.handleSearch('status', value)}>
            {this.renderOptions(listTicketRequestStatus)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('OVERTIME_ZONE_USE')}</label>
          <Select
            mode="multiple"
            placeholder={this.L('OVERTIME_ZONE_USE')}
            style={{ width: '100%' }}
            filterOption={filterOptions}
            onChange={(value) => this.handleSearch('zoneIds', value)}>
            {this.renderOptions(this.state.listZone?.map((item) => ({ id: item?.id, name: item?.zoneName })))}
          </Select>
        </Col>
        {/* {<Col sm={{ span: 6, offset: 0 }}>
          <label>{L('FILTER_CONTRUCTION_TIME')}</label>
          <DatePicker.RangePicker
            className="w-100"
            format={dateFormat}
            onChange={(dates) => this.handleSearch('date', dates)}
          />
        </Col>} */}
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_COMPANY')}</label>
          <Select
            mode="multiple"
            placeholder={this.L('FILTER_COMPANY')}
            style={{ width: '100%' }}
            filterOption={filterOptions}
            onChange={(value) => this.handleSearch('companyIds', value)}>
            {this.renderOptions(this.state.listCompany)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_AIR_CONDITIONER')}</label>
          <Select
            placeholder={this.L('FILTER_AIR_CONDITIONER')}
            style={{ width: '100%' }}
            onChange={(value) => this.handleSearch('isUseAirConditioner', value)}>
            {this.renderOptions(airConditionerStatus)}
          </Select>
        </Col>
      </Row>
    )
    return (
      <>
        <DataTable
          onRefresh={this.getAll}
          extraFilterComponent={filterComponent}
          actionGroups={this.renderActionsGroups}
          title={this.L('COMPANY_LIST')}
          onCreate={this.isStaff ? undefined : this.gotoDetail}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: overtimesRequest === undefined ? 0 : overtimesRequest.totalCount,
            onChange: this.handleTableChange
          }}
          // createPermission={appPermissions.company.create}
        >
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={this.isStaff ? columns : columnDataTenant}
            pagination={false}
            loading={isLoading}
            dataSource={overtimesRequest === undefined ? [] : overtimesRequest.items}
            scroll={{ x: 1000, y: 500, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
      </>
    )
  }
}

export default withRouter(OvertimeTicketPage)
