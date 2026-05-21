import * as React from 'react'

import { Button, Col, Dropdown, Input, Menu, Modal, Row, Table } from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import { inject, observer } from 'mobx-react'

import AppComponentBase from '../../../components/AppComponentBase'
import CreateOrUpdateTenant from './components/createOrUpdateTenant'
import { EntityDto } from '../../../services/dto/entityDto'
import { L, LNotification } from '../../../lib/abpUtility'
import Stores from '../../../stores/storeIdentifier'
import TenantStore from '../../../stores/administrator/tenantStore'
import DataTable from '../../../components/DataTable'
import Filter from '../../../components/Filter'
import AppConst from '../../../lib/appconst'
import debounce from 'lodash/debounce'
import getColumns from './columns'

const { align } = AppConst

export interface ITenantProps {
  tenantStore: TenantStore
}

export interface ITenantState {
  modalVisible: boolean
  maxResultCount: number
  skipCount: number
  tenantId: number
  filter: string
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.TenantStore)
@observer
class Tenant extends AppComponentBase<ITenantProps, ITenantState> {
  formRef: any = React.createRef()

  state = {
    modalVisible: false,
    maxResultCount: 10,
    skipCount: 0,
    tenantId: 0,
    filter: ''
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    await this.getAll()
  }

  async getAll() {
    await this.props.tenantStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      keyword: this.state.filter
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

  createOrUpdateModalOpen = async (entityDto: EntityDto) => {
    if (entityDto.id === 0) {
      this.props.tenantStore.createTenant()
    } else {
      await this.props.tenantStore.get(entityDto)
    }

    this.setState({ tenantId: entityDto.id })
    this.Modal()

    if (entityDto.id !== 0) {
      this.formRef.current.setFieldsValue({
        ...this.props.tenantStore.tenantModel
      })
    } else {
      this.formRef.current.resetFields()
    }
  }

  delete(input: EntityDto) {
    const self = this
    confirm({
      title: LNotification('DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk() {
        self.props.tenantStore.delete(input)
      }
    })
  }

  handleCreate = () => {
    const form = this.formRef.current
    form.validateFields(async (err: any, values: any) => {
      if (err) {
        return
      } else {
        if (this.state.tenantId === 0) {
          await this.props.tenantStore.create(values)
        } else {
          await this.props.tenantStore.update({
            id: this.state.tenantId,
            ...values
          })
        }
      }

      await this.getAll()
      this.setState({ modalVisible: false })
      form.resetFields()
    })
  }

  updateSearch = debounce((event) => {
    this.setState({ filter: event.target?.value })
  }, 100)

  handleSearch = (value: string) => {
    this.setState({ filter: value, skipCount: 0 }, async () => await this.getAll())
  }

  public render() {
    const { tenants } = this.props.tenantStore
    const columns = getColumns({
      title: L('ACTIONS'),
      width: 150,
      align: align.right,
      render: (text: string, item: any) => (
        <div>
          <Dropdown
            trigger={['click']}
            overlay={
              <Menu>
                <Menu.Item onClick={() => this.createOrUpdateModalOpen({ id: item.id })}>{L('BTN_EDIT')}</Menu.Item>
                <Menu.Item onClick={() => this.delete({ id: item.id })}>{L('BTN_DELETE')}</Menu.Item>
              </Menu>
            }
            placement="bottomLeft">
            <Button type="primary" icon={<MoreOutlined />} shape="round">
              {L('ACTIONS')}
            </Button>
          </Dropdown>
        </div>
      )
    })

    const keywordPlaceHolder = `${this.L('TENANCY_NAME')}`
    return (
      <>
        <Filter title={this.L('Tenants')}>
          <Row>
            <Col sm={{ span: 10, offset: 0 }}>
              <Search placeholder={keywordPlaceHolder} onChange={this.updateSearch} onSearch={this.handleSearch} />
            </Col>
          </Row>
        </Filter>
        <DataTable
          title={this.L('TenantList')}
          onCreate={() => this.createOrUpdateModalOpen({ id: 0 })}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: tenants === undefined ? 0 : tenants.totalCount,
            onChange: this.handleTableChange
          }}>
          <Table
            size="middle"
            className="custom-ant-table"
            rowKey="id"
            pagination={false}
            columns={columns}
            loading={this.props.tenantStore.isLoading}
            dataSource={tenants === undefined ? [] : tenants.items}
          />
        </DataTable>
        <CreateOrUpdateTenant
          formRef={this.formRef}
          visible={this.state.modalVisible}
          onCancel={() =>
            this.setState({
              modalVisible: false
            })
          }
          modalType={this.state.tenantId === 0 ? 'edit' : 'create'}
          onCreate={this.handleCreate}
        />
      </>
    )
  }
}

export default Tenant
