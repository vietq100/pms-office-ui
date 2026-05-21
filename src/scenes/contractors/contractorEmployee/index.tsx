import { Col, Dropdown, Input, Menu, Modal, Row, Table } from 'antd'

import withRouter from '@components/Layout/Router/withRouter'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import { AppComponentListBase } from '@components/AppComponentBase'
import { L, LNotification } from '@lib/abpUtility'
import { appPermissions } from '@lib/appconst'

import DataTable from '@components/DataTable'
import ContractorStore from '@stores/contractor/contractorStore'
import getEmployeeColumn from './columns'
import CreateUserContractorModal from './createUserContractorModal'
import ContactModal from './contactModal'
import React from 'react'
import { EllipsisOutlined } from '@ant-design/icons'
import AppConst from '../../../lib/appconst'
const { pageSize } = AppConst
export interface IContactProps {
  navigate: any
  params: any
  listEmployee: any
  contractorStore: ContractorStore
}

export interface IContactState {
  maxResultCount: number
  skipCount: number
  unitId?: number
  filters: any
  visibleDetail: boolean
  visibleCreateUser: boolean
  contact: any
  employees: any
  dataContact: any
  isLoading: boolean
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.ContractorStore)
@observer
class ContractorEmployeeList extends AppComponentListBase<IContactProps, IContactState> {
  state = {
    maxResultCount: pageSize.pageSize_10,
    skipCount: 0,
    unitId: 0,
    filters: { isActive: 'true' },
    visibleDetail: false,
    visibleCreateUser: false,
    contact: undefined,
    employees: {},
    dataContact: {},
    isLoading: false
  }
  formRef: any = React.createRef()
  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    await Promise.all([this.getAll()])
  }

  getAll = async () => {
    await this.props.contractorStore.getContactByContractor({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters,
      contractorId: this.props.params?.id
    })
  }

  handleCreate = async () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      this.setState({ isLoading: true })
      if (this.props.contractorStore.editContact.id) {
        await this.props.contractorStore.updateContact({
          ...values,
          id: this.props.contractorStore.editContact.id,
          contractorId: this.props.params.id
        })
      } else {
        await this.props.contractorStore.updateContact({
          ...values,
          contractorId: this.props.params.id
        })
      }
      this.setState({ isLoading: false })
      await this.getAll()
      this.onClose()
      form.resetFields()
    })
  }

  onClose = () => {
    this.setState({ visibleDetail: false })
  }
  onCloseCreateUser = () => {
    this.setState({ visibleCreateUser: false })
  }

  createOrUpdateModalOpen = async (id?: number) => {
    if (this.isGranted(appPermissions.contractor.update)) {
      if (!id) {
        await this.props.contractorStore.createContact(this.props.params.id)
      } else {
        await this.props.contractorStore.getContact(id)
      }
      this.setState({ visibleDetail: true })
      this.formRef.current.setFieldsValue(this.props.contractorStore.editContact)
    }
  }

  gotoCreateUser = async (items?) => {
    if (this.isGranted(appPermissions.contractor.update)) {
      this.setState({ visibleCreateUser: true })
      if (items) {
        this.setState({ dataContact: items })
      }
    }
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  handleSearch = (name, value) => {
    const { filters } = this.state

    this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => {
      await this.getAll()
    })
  }
  deleteContractorContact = async (id: number) => {
    confirm({
      title: LNotification('DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await this.props.contractorStore.deleteContractorContact(id)
        this.handleTableChange({ current: 1 })
      }
    })
  }
  public render() {
    const {
      contractorStore: { listContactByContractor }
    } = this.props
    const columns = getEmployeeColumn({
      title: L('CONTACT_NAME'),
      dataIndex: 'contactName',
      key: 'contactName',
      ellipsis: true,
      width: '20%',
      render: (contactName: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <div className="info ml-2">
              <div
                className="full-name text-truncate text-link-to-detail"
                onClick={() => this.createOrUpdateModalOpen(item.id)}>
                <a className="link-text-table"> {contactName}</a>
              </div>
            </div>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {this.isGranted(appPermissions.contractor.update) &&
                    (!item.userId ? (
                      <Menu.Item onClick={() => this.gotoCreateUser(item)}>{L('BTN_CREATE_USER')}</Menu.Item>
                    ) : (
                      <></>
                    ))}

                  {this.isGranted(appPermissions.contractor.delete) && (
                    <Menu.Item onClick={() => this.deleteContractorContact(item.id)}>
                      {L('CONTRACTOR_EMPLOYEE_DELETE_CONTACT')}
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
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search placeholder={L('CONTACT_NAME')} onSearch={(value) => this.handleSearch('keyword', value)}></Search>
        </Col>
      </Row>
    )
    return (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          onCreate={this.createOrUpdateModalOpen}
          createPermission={appPermissions.contractor.update}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: listContactByContractor === undefined ? 0 : listContactByContractor.totalCount
          }}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey="id"
            columns={columns}
            pagination={false}
            loading={this.props.contractorStore.isLoading}
            dataSource={listContactByContractor?.items || []}
            scroll={{ x: 1000, y: 500, scrollToFirstRowOnChange: true }}
          />
        </DataTable>

        <ContactModal
          contractorStore={this.props.contractorStore}
          visibleDetail={this.state.visibleDetail}
          formRef={this.formRef}
          isUpdateForm={true}
          onCancel={this.onClose}
          onCreate={this.handleCreate}
          isLoading={this.state.isLoading}
        />
        <CreateUserContractorModal
          contractorStore={this.props.contractorStore}
          visibleCreateUser={this.state.visibleCreateUser}
          dataContact={this.state.dataContact}
          onClose={this.onCloseCreateUser}
        />
      </>
    )
  }
}

export default withRouter(ContractorEmployeeList)
