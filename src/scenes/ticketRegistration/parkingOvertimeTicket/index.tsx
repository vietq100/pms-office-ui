import { AppComponentListBase } from '@components/AppComponentBase'
import withRouter from '@components/Layout/Router/withRouter'
import AppConsts from '@lib/appconst'
import SessionStore from '@stores/sessionStore'
import Stores from '@stores/storeIdentifier'
import ParkingOvertimeTicketStore from '@stores/ticketRequestStore/parkingOvertimeTicketStore'
import { inject, observer } from 'mobx-react'
import { columns4Staff, columns4Tenant } from './columns'
import { Col, Dropdown, Input, Menu, Modal, Row, Table } from 'antd'
import { L, LNotification } from '@lib/abpUtility'
import { portalLayouts } from '@components/Layout/Router/router.config'
import { EllipsisOutlined } from '@ant-design/icons'
import Select from 'antd/lib/select'
import DataTable from '@components/DataTable'
import { filterOptions } from '@lib/helper'

export interface Props {
  navigate: any
  params: any
  parkingOvertimeTicketStore: ParkingOvertimeTicketStore
  sessionStore: SessionStore
}

export interface State {
  maxResultCount: number
  skipCount: number
  filters: any
}

const { listTicketRequestStatus, typeAccount, ticketRequestStatusEnum } = AppConsts

@inject(Stores.SessionStore, Stores.ParkingOvertimeTicketStore)
@observer
class ParkingOvertimeTicket extends AppComponentListBase<Props, State> {
  isStaff =
    this.props.sessionStore.userAccountType === typeAccount.Develop ||
    this.props.sessionStore.userAccountType === typeAccount.Resident
      ? false
      : true

  state = {
    maxResultCount: 10,
    skipCount: 0,
    filters: { status: [] }
  }

  async componentDidMount() {
    this.getAll()
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  handleSearch = (name, value) => {
    this.setState({ filters: { ...this.state.filters, [name]: value }, skipCount: 0 }, async () => {
      await this.getAll()
    })
  }

  getAll = async () => {
    switch (this.props.sessionStore.userAccountType) {
      case typeAccount.Resident:
        await this.props.parkingOvertimeTicketStore.getAll4User({
          maxResultCount: this.state.maxResultCount,
          skipCount: this.state.skipCount,
          ...this.state.filters
        })
        break
      case typeAccount.Develop:
        await this.props.parkingOvertimeTicketStore.getAll4User({
          maxResultCount: this.state.maxResultCount,
          skipCount: this.state.skipCount,
          ...this.state.filters
        })
        break
      default:
        await this.props.parkingOvertimeTicketStore.getAll4Staff({
          maxResultCount: this.state.maxResultCount,
          skipCount: this.state.skipCount,
          ...this.state.filters
        })
        break
    }
  }

  goToDetail = (id?: number | undefined) => {
    const { navigate } = this.props
    id
      ? window.open(portalLayouts.ticketParkingOvertimeDetail.path.replace(':id', id), '_blank')
      : navigate(portalLayouts.ticketParkingOvertimeCreate.path)
  }

  delete = async (id: number) => {
    Modal.confirm({
      title: LNotification('DO_YOU_WANT_TO_DELETE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await this.props.parkingOvertimeTicketStore.delete(id)
        this.handleTableChange({ current: 1 })
      }
    })
  }

  public render() {
    const col4Staff = columns4Staff({
      title: L('REPRESENTATIVE'),
      dataIndex: 'company',
      key: 'company',
      ellipsis: true,
      width: '20%',
      render: (company, item: any) => (
        <Row style={{ justifyContent: 'space-between', marginLeft: '5px' }}>
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <a className="link-text-table" onClick={() => this.goToDetail(item.id)}>
              {company?.companyName}
            </a>
            <br />
            <span>{company?.representative}</span>
            <br />
            <span>
              {company?.contactPhone} - {company?.contactEmail}
            </span>
          </Col>
        </Row>
      )
    })
    const col4Tenant = columns4Tenant({
      title: L('TRANSER_USER_CREATE'),
      dataIndex: 'creatorUser',
      key: 'creatorUser',
      ellipsis: true,
      width: '20%',
      render: (creatorUser, item: any) => (
        <Row style={{ justifyContent: 'space-between', marginLeft: '5px' }}>
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <a className="link-text-table" onClick={() => this.goToDetail(item.id)}>
              {creatorUser?.displayName}
            </a>
          </Col>
          {item?.statusId === ticketRequestStatusEnum.Draft && (
            <Col sm={{ span: 3, offset: 0 }}>
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    <Menu.Item onClick={() => this.delete(item.id)}>{L('BTN_DELETE_TICKET')}</Menu.Item>
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
    const filterComponent = (
      <Row gutter={[4, 4]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{L('FILTER_KEYWORD')}</label>
          <Input.Search
            maxLength={200}
            placeholder={L('CONTRUCTION_REQUEDT_KEYWORD_SEARCH')}
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
      </Row>
    )

    return (
      <DataTable
        onRefresh={this.getAll}
        extraFilterComponent={filterComponent}
        title={this.L('COMPANY_LIST')}
        onCreate={this.isStaff ? undefined : this.goToDetail}
        pagination={{
          pageSize: this.state.maxResultCount,
          current: this.currentPage,
          total:
            this.props.parkingOvertimeTicketStore.tableData === undefined
              ? 0
              : this.props.parkingOvertimeTicketStore.tableData?.totalCount,
          onChange: this.handleTableChange
        }}>
        <Table
          size="middle"
          className="custom-ant-table custom-ant-row"
          rowKey={(record) => record.id}
          columns={this.isStaff ? col4Staff : col4Tenant}
          pagination={false}
          loading={this.props.parkingOvertimeTicketStore.isLoading}
          dataSource={
            this.props.parkingOvertimeTicketStore.tableData === undefined
              ? []
              : this.props.parkingOvertimeTicketStore.tableData?.items
          }
          scroll={{ x: 1000, y: 500, scrollToFirstRowOnChange: true }}
        />
      </DataTable>
    )
  }
}

export default withRouter(ParkingOvertimeTicket)
