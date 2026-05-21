import { Col, Input, Modal, Row, Table, Select, Dropdown, Menu, Button } from 'antd'
import { EllipsisOutlined, ImportOutlined, PhoneOutlined, ToolOutlined, UserOutlined } from '@ant-design/icons'
import AppConst from '../../../lib/appconst'
import withRouter from '@components/Layout/Router/withRouter'
import { portalLayouts } from '@components/Layout/Router/router.config'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import { AppComponentListBase } from '@components/AppComponentBase'
import { L, LNotification } from '@lib/abpUtility'
import { appPermissions } from '@lib/appconst'
import DataTable from '@components/DataTable'
import { getContractorColumns } from './columns'
import ContractorStore from '@stores/contractor/contractorStore'
import NoRole from '@components/ComponentNoRole'
import ImportContactorWOModal from '../contractorList/components/ImportModal'
import { notifySuccess } from '@lib/helper'

const { activeStatus, pageSize } = AppConst

export interface IContactProfileProps {
  navigate: any
  params: any
  contractorStore: ContractorStore
}

export interface IContractProfileState {
  maxResultCount: number
  skipCount: number
  filters: any
  visibleImportModal: boolean
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.ContractorStore)
@observer
class contractorList extends AppComponentListBase<IContactProfileProps, IContractProfileState> {
  state = {
    maxResultCount: pageSize.pageSize_10,
    skipCount: 0,
    filters: { firmId: undefined, isActive: 'true' },
    visibleImportModal: false
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.contractor.page) &&
      (await Promise.all([this.getAll(), this.props.contractorStore.getListFirm()]))
  }

  getAll = async () => {
    await this.props.contractorStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  toggleModal = (isShow) => {
    this.setState({ visibleImportModal: isShow })
  }
  handleImportFile = async (file) => {
    if (file) {
      try {
        await this.props.contractorStore?.importFromExcel(file)
        notifySuccess(
          LNotification('SUCCESS'),
          LNotification('UPLOAD_SUCCESS_WE_WILL_INFORM_YOU_ONCE_PROGRESSION_IS_DONE')
        )
      } catch {
        console.log('error')
      }
    }
    await this.toggleModal(false)
    await this.getAll()
  }

  activateOrDeactivate = async (id: number, isActive) => {
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await this.props.contractorStore.activateOrDeactivate(id, isActive)
        this.handleTableChange({ current: 1 })
      }
    })
  }

  gotoDetail = async (id?) => {
    const { navigate } = this.props
    if (id) {
      navigate(portalLayouts.contractorListDetail.path.replace(':id', id))
    } else {
      navigate(portalLayouts.contractorListCreate.path)
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

  renderActionGroups = () => {
    return (
      <span>
        {this.isGranted(appPermissions.contractor.import) && (
          <Button type="primary" shape="round" onClick={() => this.toggleModal(true)} className="mr-1">
            {this.L('BTN_IMPORT')}
            <ImportOutlined />
          </Button>
        )}
      </span>
    )
  }

  public render() {
    const { filters } = this.state
    const {
      contractorStore: { pagedResult }
    } = this.props
    const columns = getContractorColumns({
      title: L('CONTRACTOR_NAME'),
      dataIndex: 'contractorName',
      key: 'contractorName',
      width: '20%',
      ellipsis: true,
      render: (contractorName: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <div
              className="full-name text-truncate text-link-to-detail"
              onClick={() => {
                this.isGranted(appPermissions.contractor.detail) && this.gotoDetail(item.id)
              }}>
              <a className="link-text-table"> {contractorName}</a>
            </div>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {this.isGranted(appPermissions.contractor.delete) && (
                    <Menu.Item onClick={() => this.activateOrDeactivate(item.id, !item.isActive)}>
                      {L(item.isActive ? 'BTN_DEACTIVATE' : 'BTN_ACTIVATE')}
                    </Menu.Item>
                  )}
                </Menu>
              }
              placement="bottomLeft">
              <EllipsisOutlined className="button-action-hiden-table-cell" />
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
            onSearch={(value) => this.handleSearch('keyword', value)}></Search>
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
    return this.isGranted(appPermissions.contractor.page) ? (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          onCreate={this.gotoDetail}
          createPermission={appPermissions.contractor.create}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: pagedResult === undefined ? 0 : pagedResult.totalCount,
            onChange: this.handleTableChange
          }}
          actionGroups={this.renderActionGroups}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={this.props.contractorStore.isLoading}
            dataSource={this.props.contractorStore.pagedResult.items}
            scroll={{ x: 1000, y: 500, scrollToFirstRowOnChange: true }}
            expandable={{
              expandedRowRender: (record) => (
                <>
                  {record.contractorContacts.map((contact) => (
                    <Row style={{ marginLeft: 100 }} key={contact.id}>
                      <Col sm={{ span: 8, offset: 0 }}>
                        <UserOutlined className="ml-1" /> {contact?.contactName}
                        <span>({contact?.contactEmail})</span>
                      </Col>
                      <Col sm={{ span: 4, offset: 0 }}>
                        <PhoneOutlined className="ml-1" /> {contact?.contactPhone}
                      </Col>
                      <Col sm={{ span: 12, offset: 0 }}>
                        <Col>
                          <ToolOutlined className="ml-1" /> {contact?.remark}
                        </Col>
                      </Col>
                    </Row>
                  ))}
                </>
              ),
              rowExpandable: (record) => record.contractorContacts && record.contractorContacts.length > 0
            }}
          />
        </DataTable>

        <ImportContactorWOModal
          visible={this.state.visibleImportModal}
          onClose={() => this.toggleModal(false)}
          onOk={this.handleImportFile}
        />
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(contractorList)
