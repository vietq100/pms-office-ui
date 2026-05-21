import * as React from 'react'
import { Col, Input, Row, Table, Select, Modal, Dropdown, Menu, DatePicker } from 'antd'
import { AppComponentListBase } from '../../../components/AppComponentBase'
import DataTable from '../../../components/DataTable'
import { L, LNotification } from '../../../lib/abpUtility'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppConst, { dateFormat } from '../../../lib/appconst'
import { portalLayouts } from '../../../components/Layout/Router/router.config'
import debounce from 'lodash/debounce'
import withRouter from '@components/Layout/Router/withRouter'
import getColumns, { columns4Tenant } from './columns'
import SessionStore from '@stores/sessionStore'
import TicketRequestStore from '@stores/ticketRequestStore/ticketRequestStore'
import { EllipsisOutlined } from '@ant-design/icons'
import { convertFilterDate, filterOptions } from '@lib/helper'

const { listTicketRequestStatus, typeAccount, formInOutType, ticketRequestStatusEnum } = AppConst

export interface Props {
  navigate: any
  params: any
  ticketRequestStore: TicketRequestStore
  sessionStore: SessionStore
}

export interface State {
  maxResultCount: number
  skipCount: number
  filters: any
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.TicketRequestStore, Stores.SessionStore)
@observer
class TransportInOutPage extends AppComponentListBase<Props, State> {
  formRef: any = React.createRef()

  isStaff =
    this.props.sessionStore.userAccountType === typeAccount.Develop ||
    this.props.sessionStore.userAccountType === typeAccount.Resident
      ? false
      : true

  isTranspostIn = window.location.pathname === '/ticket-request-transport-in' ? true : false

  state = {
    maxResultCount: 10,
    skipCount: 0,

    filters: { status: [] }
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.getAll()
  }

  getAll = async () => {
    switch (this.props.sessionStore.userAccountType) {
      case typeAccount.Resident:
        await this.props.ticketRequestStore.getAll4User({
          typeId: this.isTranspostIn ? formInOutType.In : formInOutType.Out,
          maxResultCount: this.state.maxResultCount,
          skipCount: this.state.skipCount,

          ...this.state.filters
        })
        break
      case typeAccount.Develop:
        await this.props.ticketRequestStore.getAll4User({
          typeId: this.isTranspostIn ? formInOutType.In : formInOutType.Out,
          maxResultCount: this.state.maxResultCount,
          skipCount: this.state.skipCount,
          ...this.state.filters
        })
        break

      default:
        await this.props.ticketRequestStore.getAll4Staff({
          typeId: this.isTranspostIn ? formInOutType.In : formInOutType.Out,
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
        await self.props.ticketRequestStore.deleteTicketRequest(id)
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
      ? window.open(portalLayouts.transportInOutDetail.path.replace(':id', id), '_blank')
      : this.isTranspostIn
      ? navigate(portalLayouts.ticketRequestTransportInCreate.path)
      : navigate(portalLayouts.ticketRequestTransportOutCreate.path)
  }

  public render() {
    const {
      ticketRequestStore: { ticketsRequest, isLoading }
    } = this.props

    const columns = getColumns({
      title: L('REPRESENTATIVE'),
      dataIndex: 'company',
      key: 'company',
      ellipsis: true,
      width: '25%',
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
              {company?.contactPhone ?? '--'} - {company?.contactEmail ?? '--'}
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

    const column4Tenant = columns4Tenant({
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
          <label>{L('FILTER_TRANSPORT_DATE')}</label>
          <DatePicker.RangePicker
            className="w-100"
            format={dateFormat}
            onChange={(dates) => this.handleSearch('date', dates)}
          />
        </Col>
      </Row>
    )
    return (
      <>
        <DataTable
          onRefresh={this.getAll}
          extraFilterComponent={filterComponent}
          title={this.L('COMPANY_LIST')}
          onCreate={this.isStaff ? undefined : this.gotoDetail}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: ticketsRequest === undefined ? 0 : ticketsRequest.totalCount,
            onChange: this.handleTableChange
          }}
          // createPermission={appPermissions.company.create}
        >
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={this.isStaff ? columns : column4Tenant}
            pagination={false}
            loading={isLoading}
            dataSource={ticketsRequest === undefined ? [] : ticketsRequest.items}
            scroll={{ x: 1000, y: 500, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
      </>
    )
  }
}

export default withRouter(TransportInOutPage)
