import * as React from 'react'

import { Button, Col, Input, Modal, Row, Select, Table } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { inject, observer } from 'mobx-react'

import { AppComponentListBase } from '../../../components/AppComponentBase'
import FeeTypeFormModal from './components/feeTypeFormModal'
import { L, LNotification } from '@lib/abpUtility'
import Stores from '../../../stores/storeIdentifier'
import FeeTypeStore from '../../../stores/fee/feeTypeStore'
import DataTable from '../../../components/DataTable'
import AppConsts, { appPermissions } from '../../../lib/appconst'
import { CheckOutlined, EditOutlined } from '@ant-design/icons/lib'
import debounce from 'lodash/debounce'
import getColumns from './columns'

const { align, activeStatus } = AppConsts

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
class FeeTypes extends AppComponentListBase<IFeeTypeProps, IFeeTypeState> {
  formRef: any = React.createRef()

  state = {
    modalVisible: false,
    maxResultCount: 10,
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

  createOrUpdateModalOpen = async (id?) => {
    if (!id) {
      await this.props.feeTypeStore.createFeeType()
    } else {
      await this.props.feeTypeStore.get(id)
    }

    this.setState({ feeTypeId: id })
    this.Modal()

    this.formRef.current.setFieldsValue({
      ...this.props.feeTypeStore.editFeeType
    })
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
      title: L('ACTIONS'),
      width: 90,
      fixed: align.right,
      align: align.right,
      render: (text: string, item: any) => (
        <div>
          {this.isGranted(appPermissions.feeType.update) && (
            <Button
              size="small"
              className="ml-1"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => this.createOrUpdateModalOpen(item.id)}
            />
          )}
          {this.isGranted(appPermissions.feeType.delete) && (
            <Button
              size="small"
              className="ml-1"
              shape="circle"
              icon={item.isActive ? <CloseOutlined /> : <CheckOutlined />}
              onClick={() => this.activateOrDeactivate(item.id, !item.isActive)}
            />
          )}
        </div>
      )
    })
    const keywordPlaceHolder = `${this.L('FEE_TYPE_NAME')}`
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
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
      </Row>
    )
    return (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={() => this.handleSearch('', '')}
          title={this.L('FEE_TYPE_LIST')}
          onCreate={() => this.createOrUpdateModalOpen()}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: pagedResult === undefined ? 0 : pagedResult.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.feeType.create}>
          <Table
            size="middle"
            className="custom-ant-table"
            rowKey={(record) => record.id || 0}
            columns={columns}
            pagination={false}
            loading={this.props.feeTypeStore.isLoading}
            dataSource={pagedResult === undefined ? [] : pagedResult.items}
            onChange={this.handleTableChange}
            scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
        <FeeTypeFormModal
          formRef={this.formRef}
          visible={this.state.modalVisible}
          onCancel={() =>
            this.setState({
              modalVisible: false
            })
          }
          modalType={this.state.feeTypeId === 0 ? 'edit' : 'create'}
          onCreate={this.handleCreate}
        />
      </>
    )
  }
}

export default FeeTypes
