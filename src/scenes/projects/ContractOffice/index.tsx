import { Col, Input, Modal, Row, Table, Select, Dropdown, Menu } from 'antd'
import { AppComponentListBase } from '../../../components/AppComponentBase'
import DataTable from '../../../components/DataTable'
import { L, LNotification, isGrantedAny } from '../../../lib/abpUtility'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppConst, { appPermissions } from '../../../lib/appconst'
import { portalLayouts } from '../../../components/Layout/Router/router.config'
import { EllipsisOutlined } from '@ant-design/icons'
import NoRole from '@components/ComponentNoRole'
import ContractOfficeStore from '@stores/project/contractOfficeStore'
import SessionStore from '@stores/sessionStore'
import { debounce } from 'lodash'
import getColumns from './columns'
import withRouter from '@components/Layout/Router/withRouter'

const { activeStatus } = AppConst

type NewType = SessionStore

export interface IContractProps {
  navigate: any
  contractOfficeStore: ContractOfficeStore
  sessionStore: NewType
}

export interface IContractState {
  maxResultCount: number
  skipCount: number
  filters: any
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.SessionStore, Stores.ContractOfficeStore)
@observer
class Contract extends AppComponentListBase<IContractProps, IContractState> {
  state = {
    maxResultCount: 10,
    skipCount: 0,
    listStatus: [],
    filters: {
      isActive: 'true'
    }
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.LeaseAgreement.page) &&
      (await Promise.all([this.getAll(), this.props.contractOfficeStore.getListLAStatus('')]))
  }

  getAll = async () => {
    await this.props.contractOfficeStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
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
        await self.props.contractOfficeStore.activateOrDeactivate(id, isActive)
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
    this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => {
      await this.getAll()
    })
  }

  gotoDetail = (id?) => {
    const { navigate } = this.props
    id
      ? navigate(portalLayouts.officeCompanyContractDetail.path.replace(':id', id))
      : navigate(portalLayouts.officeContractCreate.path)
  }

  public render() {
    const { filters } = this.state
    const columns = getColumns({
      title: L('CONTRACT_NUMBER'),
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      ellipsis: true,
      width: 120,
      render: (referenceNumber: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <div className="text-link-to-detail">
              <a
                onClick={() => this.isGranted(appPermissions.LeaseAgreement.detail) && this.gotoDetail(item.id)}
                className="link-text-table">
                <strong>{referenceNumber}</strong>
                <br />
                {item.parentId && (
                  <label>
                    {L('REF_FROM')}: {item.parent?.referenceNumber}
                  </label>
                )}
              </a>
            </div>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            {isGrantedAny(appPermissions.LeaseAgreement.delete) && (
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {this.isGranted(appPermissions.LeaseAgreement.delete) && (
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
          </Col>
        </Row>
      )
    })
    const keywordPlaceholder = ` ${this.L('CONTRACT_NAME')}`
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

        <Col sm={{ span: 4, offset: 0 }}>
          <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
          <Select
            style={{ width: '100%' }}
            defaultValue={filters.isActive}
            onChange={(value) => this.handleSearch('isActive', value)}>
            {this.renderOptions(activeStatus)}
          </Select>
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.LeaseAgreement.page) ? (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          title={this.L('CONTRACT_LIST')}
          onCreate={this.gotoDetail}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total:
              this.props.contractOfficeStore.contractOffices === undefined
                ? 0
                : this.props.contractOfficeStore.contractOffices.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.companyContract.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={this.props.contractOfficeStore.isLoading}
            dataSource={
              this.props.contractOfficeStore.contractOffices === undefined
                ? []
                : this.props.contractOfficeStore.contractOffices.items
            }
            scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(Contract)
