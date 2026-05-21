import * as React from 'react'
import { Col, Modal, Row, Table, Select, Dropdown, Menu } from 'antd'
import { AppComponentListBase } from '../../../components/AppComponentBase'
import DataTable from '../../../components/DataTable'
import { L, LNotification, isGrantedAny } from '../../../lib/abpUtility'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppConst, { appPermissions } from '../../../lib/appconst'
import debounce from 'lodash/debounce'
import withRouter from '@components/Layout/Router/withRouter'
import { EllipsisOutlined } from '@ant-design/icons'
import NoRole from '@components/ComponentNoRole'
import getColumns from './columns'
import PositionApprovalStore from '@stores/approvalWorkflow/positionApproval/positionApprovalStore'
import PositionApprovalModal from './components/PositionApprovalModal'
import './style.less'
import CompanyStore from '@stores/project/companyStore'

const { activeStatus, listPositionType } = AppConst

export interface Props {
  navigate: any
  params: any
  positionApprovalStore: PositionApprovalStore
  companyStore: CompanyStore
}

export interface State {
  maxResultCount: number
  skipCount: number
  filters: any
  isShowModal: boolean
  idDetail: number | undefined
}

const confirm = Modal.confirm

@inject(Stores.PositionApprovalStore, Stores.CompanyStore)
@observer
class PositionApprovalPage extends AppComponentListBase<Props, State> {
  formRef: any = React.createRef()

  state = {
    maxResultCount: 10,
    skipCount: 0,
    isShowModal: false,
    idDetail: undefined,
    filters: { isActive: 'true' }
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.company.page) && (await Promise.all([this.getAll(), this.findCompany('')]))
  }

  findCompany = async (keyword) => {
    this.props.companyStore.getAll({ keyword })
  }

  getAll = async () => {
    await this.props.positionApprovalStore.getAll({
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
        await self.props.positionApprovalStore.activateOrDeactivate(id, isActive)
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
    if (id) {
      this.setState({ idDetail: id })
    } else {
      this.setState({ idDetail: undefined })
    }
    this.setState({ isShowModal: true })
  }

  onCloseModal = () => {
    this.setState({ idDetail: undefined })
    this.setState({ isShowModal: false })
    this.getAll()
  }

  public render() {
    const {
      positionApprovalStore: { positionApprovals }
    } = this.props

    const columns = getColumns({
      title: L('POSITION_APPROVAL_POSITION'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: '18%',
      render: (name: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }} className="ml-1">
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <div
              className="link-text-table custom-text"
              onClick={() => this.isGranted(appPermissions.company.detail) && this.gotoDetail(item.id)}>
              {name}
            </div>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
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
          </Col>
        </Row>
      )
    })

    const filterComponent = (
      <Row gutter={[4, 4]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <Select
            allowClear
            placeholder={this.L('POSITION_APPROVAL_OBJECT')}
            style={{ width: '100%' }}
            onChange={(value) => this.handleSearch('typeId', value)}>
            {this.renderOptions(listPositionType)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <Select
            showSearch
            placeholder={this.L('FILTER_COMPANY')}
            allowClear
            filterOption={false}
            onSearch={debounce(this.findCompany, 400)}
            onChange={(value) => this.handleSearch('companyId', value)}
            style={{ width: '100%' }}>
            {this.props.companyStore.companies?.items.map((company, index) => (
              <Select.Option value={`${company.id}`} key={index}>
                {company.companyName} <div className="text-muted small">({company.companyLegalName})</div>
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <Select
            placeholder={this.L('FILTER_ACTIVE_STATUS')}
            style={{ width: '100%' }}
            defaultValue={this.state.filters.isActive}
            onChange={(value) => this.handleSearch('isActive', value)}>
            {this.renderOptions(activeStatus)}
          </Select>
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.company.page) ? (
      <>
        <DataTable
          onRefresh={this.getAll}
          extraFilterComponent={filterComponent}
          title={this.L('COMPANY_LIST')}
          onCreate={this.gotoDetail}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: positionApprovals === undefined ? 0 : positionApprovals.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.company.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={this.props.positionApprovalStore.isLoading}
            dataSource={positionApprovals === undefined ? [] : positionApprovals.items}
            scroll={{ x: 1000, y: 500, scrollToFirstRowOnChange: true }}
          />
        </DataTable>

        <PositionApprovalModal
          visible={this.state.isShowModal}
          positionApprovalStore={this.props.positionApprovalStore}
          idDetail={this.state.idDetail}
          onCancel={this.onCloseModal}
        />
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(PositionApprovalPage)
