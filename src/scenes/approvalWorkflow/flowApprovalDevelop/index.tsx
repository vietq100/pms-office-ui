import * as React from 'react'
import { Col, Modal, Row, Table, Select, Dropdown, Menu } from 'antd'
import { AppComponentListBase } from '../../../components/AppComponentBase'
import DataTable from '../../../components/DataTable'
import { L, LNotification, isGrantedAny } from '../../../lib/abpUtility'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppConst, { appPermissions, typeFlowOperator2Object } from '../../../lib/appconst'
import debounce from 'lodash/debounce'
import withRouter from '@components/Layout/Router/withRouter'
import { EllipsisOutlined } from '@ant-design/icons'
import NoRole from '@components/ComponentNoRole'
import getColumns from './columns'
import FlowApprovalOfficeStore from '@stores/approvalWorkflow/flowApprovalOffice/flowApprovalOfficeStore'

import FlowOperator2DeveloperModal from './components/FlowOperator2DeveloperModal'

const { activeStatus, positionTypeEnum } = AppConst

export interface Props {
  navigate: any
  params: any
  flowApprovalOfficeStore: FlowApprovalOfficeStore
}

export interface State {
  maxResultCount: number
  skipCount: number
  filters: any
  isShowModalDevelop: boolean
  isShowModalBQL: boolean
  idDetail: number | undefined
}

const confirm = Modal.confirm

@inject(Stores.FlowApprovalOfficeStore)
@observer
class FlowOperator2DevelopPage extends AppComponentListBase<Props, State> {
  formRef: any = React.createRef()

  state = {
    maxResultCount: 10,
    skipCount: 0,
    isShowModalDevelop: false,
    isShowModalBQL: false,
    idDetail: undefined,
    filters: { type: typeFlowOperator2Object.Operator2Develop, isActive: 'true' }
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.company.page) && this.getAll()
  }

  getAll = async () => {
    await this.props.flowApprovalOfficeStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  generateRequestConfig = async () => {
    await this.props.flowApprovalOfficeStore
      .generateRequestConfig({ typeId: positionTypeEnum.Operator })
      .then(() => this.getAll())
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
        await self.props.flowApprovalOfficeStore.activateOrDeactivate(id, isActive)
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

  gotoDetail = (record) => {
    if (record?.id) {
      this.setState({ idDetail: record?.id })
    } else {
      this.setState({ idDetail: undefined })
    }
    if (record?.approvalOrder === positionTypeEnum.Developer) {
      this.setState({ isShowModalDevelop: true })
    } else {
      this.setState({ isShowModalBQL: true })
    }
  }

  onCloseModal = () => {
    this.setState({ idDetail: undefined })
    this.setState({ isShowModalDevelop: false })
    this.setState({ isShowModalBQL: false })
  }

  public render() {
    const {
      flowApprovalOfficeStore: { oprator2Object }
    } = this.props

    const columns = getColumns({
      title: L('REQUEST_NAME'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: '18%',
      render: (name: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }} className="ml-1">
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <div
              className=" custom-text"
              onClick={() => this.isGranted(appPermissions.company.detail) && this.gotoDetail(item)}>
              {name ?? '--'}
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
          onRefresh={this.generateRequestConfig}
          extraFilterComponent={filterComponent}
          title={this.L('OPRATOR2TENANT')}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: oprator2Object === undefined ? 0 : oprator2Object.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.company.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={this.props.flowApprovalOfficeStore.isLoading}
            dataSource={oprator2Object === undefined ? [] : oprator2Object.items}
            scroll={{ x: 1000, y: 500, scrollToFirstRowOnChange: true }}
          />
        </DataTable>

        <FlowOperator2DeveloperModal
          visible={this.state.isShowModalBQL}
          idDetail={this.state.idDetail}
          FlowApprovalOfficeStore={this.props.flowApprovalOfficeStore}
          onCancel={this.onCloseModal}
        />
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(FlowOperator2DevelopPage)
