import * as React from 'react'

import { Col, Input, Modal, Row, Table, Select, DatePicker, Button, Dropdown, Menu } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'
import AppConst, { dateFormat } from '../../../lib/appconst'
import withRouter from '@components/Layout/Router/withRouter'
import { portalLayouts, routers } from '@components/Layout/Router/router.config'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import { AppComponentListBase } from '@components/AppComponentBase'
import { L, LNotification } from '@lib/abpUtility'
import { appPermissions } from '@lib/appconst'
import DataTable from '@components/DataTable'
import { getContractorColumns } from './columns'
import ContractorStore from '@stores/contractor/contractorStore'
import { convertDate } from '@lib/helper'
import { ExcelIcon } from '@components/Icon'
import NoRole from '@components/ComponentNoRole'

const { activeStatus, pageSize } = AppConst
export interface IContractListProps {
  navigate: any
  params: any
  contractorStore: ContractorStore
}

export interface IContractListState {
  maxResultCount: number
  skipCount: number
  filters: any
  visible: boolean
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.ContractorStore)
@observer
class ContractorList extends AppComponentListBase<IContractListProps, IContractListState> {
  formRef: any = React.createRef()

  state = {
    maxResultCount: pageSize.pageSize_10,
    skipCount: 0,
    filters: {
      isActive: 'true',
      status: undefined
    },
    visible: false
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.contractorWO.page) &&
      (await Promise.all([this.getAll(), this.props.contractorStore.getListStatus()]))
  }

  getAll = async () => {
    await this.props.contractorStore.getAllContractorActivity({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  activateOrDeactivate = async (id: number, isActive) => {
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await this.props.contractorStore.activateOrDeactivateContractorActivity(id, isActive)
        this.handleTableChange({ current: 1 })
      }
    })
  }

  handleSearch = (name, value) => {
    const { filters } = this.state
    if (name === 'ActivityDateTime') {
      this.setState({ filters: convertDate(filters, value), skipCount: 0 }, async () => {
        await this.getAll()
      })
    } else {
      this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => {
        await this.getAll()
      })
    }
  }

  gotoDetail = async (id?) => {
    if (this.isGranted(appPermissions.contractorWO.delete)) {
      const { navigate } = this.props
      if (id) {
        navigate(portalLayouts.ContractorWorkOrderDetail.path.replace(':id', id))
      } else {
        navigate(portalLayouts.ContractorWorkOrderCreate.path)
      }
      this.setState({ visible: true })
    }
  }
  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }
  handleExportWorkOrder = async () => {
    const { contractorStore } = this.props
    await contractorStore.exportWorkOrders(this.state.filters)
  }

  renderActionGroups = () => {
    const {
      contractorStore: { contractors }
    } = this.props
    const isMyWorkOder = this.props.params['*'] === routers.communicationMyWorkOrder.path.slice(1)
    return (
      <span>
        {this.isGranted(appPermissions.contractorWO.export) && !isMyWorkOder && (
          <Button
            shape="circle"
            type="primary"
            className="mr-1"
            onClick={this.handleExportWorkOrder}
            icon={<ExcelIcon />}
            disabled={!contractors || !contractors.totalCount}
          />
        )}
      </span>
    )
  }

  public render() {
    const { filters } = this.state
    const {
      contractorStore: { listContractorWO }
    } = this.props
    const columns = getContractorColumns({
      title: L('CONTRACTOR_WO_NAME'),
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
      width: '20%',
      render: (subject: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 20, offset: 0 }} className="col-info">
            <div className="info ml-2">
              <div
                className="full-name text-truncate text-link-to-detail"
                onClick={() => {
                  this.isGranted(appPermissions.contractorWO.detail) && this.gotoDetail(item.id)
                }}>
                <a className="link-text-table"> {subject}</a>
              </div>
            </div>
          </Col>
          <Col sm={{ span: 4, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {this.isGranted(appPermissions.contractorWO.delete) && (
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
          </Col>
        </Row>
      )
    })

    const keywordPlaceHolder = `${this.L('CONTRACTOR_KEYWORD_SEARCH')}`
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            maxLength={200}
            placeholder={keywordPlaceHolder}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>

        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_CONTRACTOR_STATUS')}</label>
          <Select allowClear style={{ width: '100%' }} onChange={(value) => this.handleSearch('statusId', value)}>
            {this.renderOptions(this.props.contractorStore.listStatus || [])}
          </Select>
        </Col>

        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_WO_DATE')}</label>
          <DatePicker
            className="full-width"
            format={dateFormat}
            placeholder={L('SELECT_DATE')}
            onChange={(value) => this.handleSearch('ActivityDateTime', value)}
          />
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_CONTRACTOR_ISACTIVE')}</label>
          <Select
            allowClear
            style={{ width: '100%' }}
            defaultValue={filters.isActive}
            onChange={(value) => this.handleSearch('isActive', value)}>
            {this.renderOptions(activeStatus)}
          </Select>
        </Col>
      </Row>
    )

    return this.isGranted(appPermissions.contractorWO.page) ? (
      <>
        {/* <Filter title={this.L('FILTER')} handleRefresh={this.getAll}>
          <Row gutter={[16, 8]}>
            <Col sm={{ span: 6, offset: 0 }}>
              <label>{this.L('FILTER_KEYWORD')}</label>
              <Search placeholder={keywordPlaceHolder} />
            </Col>

            <Col sm={{ span: 6, offset: 0 }}>
              <label>{this.L('FILTER_CONTRACTOR_STATUS')}</label>
              <Select allowClear style={{ width: '100%' }}>
                {this.renderOptions(
                  this.props.contractorStore.listStatus || []
                )}
              </Select>
            </Col>
            <Col sm={{ span: 6, offset: 0 }}>
              <label>{this.L('FILTER_CONTRACTOR_ACTIVITY')}</label>
              <Select
                allowClear
                defaultValue={filters.isActive}
                style={{ width: '100%' }}>
                {this.renderOptions(activeStatus)}
              </Select>
            </Col>
          </Row>
        </Filter> */}
        <DataTable
          actionGroups={this.renderActionGroups}
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          onCreate={this.gotoDetail}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: listContractorWO === undefined ? 0 : listContractorWO.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.contractorWO.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={false}
            dataSource={listContractorWO?.items || []}
            scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(ContractorList)
