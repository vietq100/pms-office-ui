import * as React from 'react'

import { Col, Dropdown, Input, Menu, Modal, Row, Select, Table } from 'antd'
import { inject, observer } from 'mobx-react'

import { AppComponentListBase } from '@components/AppComponentBase'
import { L, LNotification } from '@lib/abpUtility'
import Stores from '@stores/storeIdentifier'
import FeeTypeStore from '../../../../stores/fee/feeTypeStore'
import DataTable from '../../../../components/DataTable'
import AppConsts, { appPermissions } from '@lib/appconst'
import { EllipsisOutlined } from '@ant-design/icons/lib'
import debounce from 'lodash/debounce'

import { portalLayouts } from '@components/Layout/Router/router.config'
import withRouter from '@components/Layout/Router/withRouter'
import getColumns from './columns'

const { activeStatus, pageSize, isGenStatus } = AppConsts

export interface IFeeTypeProps {
  navigate: any
  feeTypeStore: FeeTypeStore
}

export interface IFeeTypeState {
  modalVisible: boolean
  maxResultCount: number
  skipCount: number
  feeTypeId: number
  filters: any
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.FeeTypeStore)
@observer
class FeeTypesV2 extends AppComponentListBase<IFeeTypeProps, IFeeTypeState> {
  formRef: any = React.createRef()

  state = {
    modalVisible: false,
    maxResultCount: pageSize.pageSize_10,
    skipCount: 0,
    feeTypeId: 0,
    filters: { isActive: 'true' }
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    await this.getAll()
  }

  async getAll() {
    await this.props.feeTypeStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  Modal = () => {
    this.setState({
      modalVisible: !this.state.modalVisible
    })
  }

  gotoDetail = (id?) => {
    const { navigate } = this.props
    id
      ? navigate(portalLayouts.feeTypesV2Detail.path.replace(':id', id))
      : navigate(portalLayouts.feeTypesV2Create.path)
  }

  activateOrDeactivate = async (id, isActive) => {
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await this.props.feeTypeStore.activateOrDeactivate(id, isActive)
        this.getAll()
      }
    })
  }

  handleCreate = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (!this.props.feeTypeStore.editFeeType?.id) {
        await this.props.feeTypeStore.create(values)
      } else {
        await this.props.feeTypeStore.update({
          ...this.props.feeTypeStore.editFeeType,
          ...values
        })
      }

      await this.getAll()
      this.setState({ modalVisible: false })
      form.resetFields()
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

  public render() {
    const { pagedResult } = this.props.feeTypeStore
    const { filters } = this.state
    const columns = getColumns({
      title: L('FEE_TYPE_NAME'),
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      ellipsis: true,
      render: (name: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 20, offset: 0 }} className="col-info">
            <div className="text-link-to-detail">
              {/* {contractName} */}
              <a onClick={() => this.gotoDetail(item.id)} className="link-text-table">
                {name}
              </a>
            </div>
          </Col>
          <Col sm={{ span: 4, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {this.isGranted(appPermissions.feeType.delete) && (
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
    const keywordPlaceHolder = `${this.L('FEE_TYPE_NAME')}`
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
          <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
          <Select
            value={filters.isActive}
            onChange={(value) => this.handleSearch('isActive', value)}
            style={{ width: '100%' }}>
            {this.renderOptions(activeStatus)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_ACTIVE_ISGEN')}</label>
          <Select onChange={(value) => this.handleSearch('isGenerate', value)} style={{ width: '100%' }}>
            {this.renderOptions(isGenStatus)}
          </Select>
        </Col>
      </Row>
    )
    return (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={() => this.handleSearch('', '')}
          title={this.L('FEE_TYPE_LIST')}
          onCreate={this.gotoDetail}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: pagedResult === undefined ? 0 : pagedResult.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.feeType.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id || 0}
            columns={columns}
            pagination={false}
            loading={this.props.feeTypeStore.isLoading}
            dataSource={pagedResult === undefined ? [] : pagedResult.items}
            onChange={this.handleTableChange}
            scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
      </>
    )
  }
}

export default withRouter(FeeTypesV2)
