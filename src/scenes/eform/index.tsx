import { Col, Dropdown, Input, Menu, Modal, Row, Select, Table } from 'antd'

import { AppComponentListBase } from '../../components/AppComponentBase'
// import Filter from '../../components/Filter'
import DataTable from '../../components/DataTable'
import { L, LNotification } from '../../lib/abpUtility'
import EFormStore from '../../stores/eForm/eFormStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../stores/storeIdentifier'
import AppConst, { appPermissions, EFORM_PUBLISH_STATUS, moduleIds } from '../../lib/appconst'
import ProjectStore from '../../stores/project/projectStore'
import { FormTemplateModel, IFormTemplateModel } from '@models/eForm/EFormModel'
import debounce from 'lodash/debounce'
import getColumns from './columns'
import { portalLayouts } from '@components/Layout/Router/router.config'
import withRouter from '@components/Layout/Router/withRouter'
import { EllipsisOutlined } from '@ant-design/icons'
import NoRole from '@components/ComponentNoRole'

const { activeStatus } = AppConst
const colors = {
  publish: 'green',
  unpublish: '#C67484'
}
export interface IEFormProps {
  navigate: any
  routedata?: any
  eFormStore: EFormStore
  projectStore: ProjectStore
}

export interface IEFormState {
  maxResultCount: number
  skipCount: number
  filters: any
  visible: boolean
  selectedItem: IFormTemplateModel
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.EFormStore, Stores.ProjectStore)
@observer
class EFormList extends AppComponentListBase<IEFormProps, IEFormState> {
  state = {
    maxResultCount: 10,
    skipCount: 0,
    filters: { isActive: 'true' },
    visible: false,
    moduleId: moduleIds.eform,
    selectedItem: new FormTemplateModel()
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.eForm.page) && (await Promise.all([this.getAll()]))
  }

  getAll = async () => {
    await this.props.eFormStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      moduleId: moduleIds.eform,
      ...this.state.filters
    })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  gotoDetail = async (id?) => {
    const { navigate } = this.props
    id ? navigate(portalLayouts.eFormEdit.path.replace(':id', id)) : navigate(portalLayouts.eFormCreate.path)
  }

  onCancelAddEditModal = () => {
    this.setState({
      visible: false,
      selectedItem: {} as IFormTemplateModel
    })
  }

  cloneForm = async (form) => {
    confirm({
      title: LNotification('DO_YOU_WANT_TO_CLONE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await this.props.eFormStore.create({
          formName: `Copy ${form.formName}`,
          formId: form.id,
          moduleId: moduleIds.eform
        })
        this.handleTableChange({ current: 1 })
      }
    })
  }

  findProjects = async (keyword) => {
    await this.props.projectStore.filterOptions({ keyword })
  }

  activateOrDeactivate = async (id: number, isActive) => {
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await this.props.eFormStore.activateOrDeactivate(id, isActive)
        this.handleTableChange({ current: 1 })
      }
    })
  }

  publishOrUnPublish = async (id: number, isPublish) => {
    confirm({
      title: L(isPublish ? 'DO_YOU_WANT_TO_UNPUBLISH_THIS_ITEM' : 'DO_YOU_WANT_TO_PUBLISH_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await this.props.eFormStore.publishOrUnPublish(id, isPublish)
        this.handleTableChange({ current: 1 })
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

  public render() {
    const {
      eFormStore: { pagedData }
    } = this.props
    const { filters } = this.state
    const columns = getColumns({
      title: L('FORM_TITLE'),
      dataIndex: 'formName',
      key: 'formName',
      ellipsis: true,
      width: '25%',
      render: (formName: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <div
              className="full-name text-truncate text-link-to-detail"
              onClick={() => {
                this.isGranted(appPermissions.eForm.detail) && this.gotoDetail(item.id)
              }}>
              <a className="link-text-table"> {formName}</a>
            </div>
            <div className="text-muted small">
              {item.formGroupName}{' '}
              {item.status && (
                <span>
                  - {''}
                  <span
                    style={{
                      color: item.status.code === EFORM_PUBLISH_STATUS.PUBLISHED ? colors.publish : colors.unpublish
                    }}>
                    {item.status?.name}
                  </span>
                </span>
              )}
            </div>
          </Col>
          <Col sm={{ span: 2, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {this.isGranted(appPermissions.eForm.create) && (
                    <Menu.Item onClick={() => this.cloneForm(item)}>{L('CLONE_FORM')}</Menu.Item>
                  )}

                  {this.isGranted(appPermissions.eForm.update) && (
                    <Menu.Item
                      onClick={() =>
                        this.publishOrUnPublish(item.id, item.status?.code === EFORM_PUBLISH_STATUS.PUBLISHED)
                      }>
                      {item.status?.code === EFORM_PUBLISH_STATUS.PUBLISHED ? L('UNPUBLISHED') : L('PUBLISHED')}
                    </Menu.Item>
                  )}
                  {this.isGranted(appPermissions.eForm.delete) && (
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
    const keywordPlaceholder = `${this.L('EFORM_NAME')}`
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            maxLength={200}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            placeholder={keywordPlaceholder}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
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
    return this.isGranted(appPermissions.eForm.page) ? (
      <>
        {/* <Filter title={this.L('FILTER')} handleRefresh={this.getAll}>
          <Row gutter={[16, 8]}>
            <Col sm={{ span: 6, offset: 0 }}>
              <label>{this.L('FILTER_KEYWORD')}</label>
              <Search
                onChange={(value) =>
                  this.updateSearch('keyword', value.target?.value)
                }
                placeholder={keywordPlaceholder}
                onSearch={(value) => this.handleSearch('keyword', value)}
              />
            </Col>
            <Col sm={{ span: 6, offset: 0 }}>
              <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
              <Select
                style={{ width: '100%' }}
                defaultValue={filters.isActive}
                onChange={(value) => this.handleSearch('isActive', value)}>
                {this.renderOptions(activeStatus)}
              </Select>
            </Col>
          </Row>
        </Filter> */}
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          title={this.L('EFORM_LIST')}
          onCreate={this.gotoDetail}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: pagedData === undefined ? 0 : pagedData.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.eForm.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={this.props.eFormStore.isLoading}
            dataSource={pagedData === undefined ? [] : pagedData.items}
            scroll={{ x: 768, y: 550, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(EFormList)
