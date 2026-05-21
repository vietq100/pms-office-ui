import { Col, Dropdown, Menu, Modal, Row, Select, Table } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'
import { AppComponentListBase } from '@components/AppComponentBase'
import DataTable from '@components/DataTable'
import { L, LNotification } from '@lib/abpUtility'
import EFormStore from '@stores/eForm/eFormStore'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import { appPermissions, moduleIds } from '@lib/appconst'
import { FormTemplateModel, IFormTemplateModel } from '@models/eForm/EFormModel'
import getColumns from './columns'
import { portalLayouts } from '@components/Layout/Router/router.config'
import withRouter from '@components/Layout/Router/withRouter'
import getMenuItem from '@components/MenuItem'
import UnitStore from '@stores/project/unitStore'
import NoRole from '@components/ComponentNoRole'

export interface IEFormResponseProps {
  navigate: any
  params?: any
  location: any
  eFormStore: EFormStore
  unitStore: UnitStore
  formId?: number
}

export interface IEFormResponseState {
  maxResultCount: number
  skipCount: number
  visible: boolean
  selectedItem: IFormTemplateModel
}

const confirm = Modal.confirm

@inject(Stores.EFormStore, Stores.UnitStore)
@observer
class EFormResponseList extends AppComponentListBase<IEFormResponseProps, IEFormResponseState> {
  state = {
    maxResultCount: 10,
    skipCount: 0,
    visible: false,
    selectedItem: new FormTemplateModel()
  }

  get currentPage() {
    return Math.floor(this.props.eFormStore.filters.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    await this.checkKeepFilter()
    this.isGranted(appPermissions.eFormAnswer.page) &&
      (await Promise.all([
        this.findUnits(''),
        this.findForms(''),
        this.getAll(),
        this.props.eFormStore.getResponseStatus(moduleIds.handover)
      ]))
  }

  checkKeepFilter = () => {
    this.props.location.search !== '?keep-filter' && this.props.eFormStore.resetFilers()
  }

  getMenuItems = (id, responseStatus) => {
    // Keep component is cause of error message from development mode
    const label = (status) => (
      <span key={status.id} onClick={() => this.updateResponseStatus(id, status)}>
        <span>{status.name}</span>
      </span>
    )
    return (responseStatus || []).map((item) => getMenuItem(label(item), item.id))
  }

  getAll = async () => {
    await this.props.eFormStore.filterFromResponse({
      maxResultCount: this.state.maxResultCount,
      ...this.props.eFormStore.filters,
      formId: this.props.formId
    })
  }

  handleTableChange = async (pagination: any) => {
    await this.props.eFormStore.setFilers({
      ...this.props.eFormStore.filters,
      skipCount: (pagination.current - 1) * this.state.maxResultCount!
    })
    await this.getAll()
  }

  gotoDetail = async (id?) => {
    if (!id) {
      return
    }
    const { navigate } = this.props
    navigate(portalLayouts.eFormResponseDetail.path.replace(':id', id))
  }

  onCancelAddEditModal = () => {
    this.setState({
      visible: false,
      selectedItem: {} as IFormTemplateModel
    })
  }

  findUnits = async (keyword) => {
    await this.props.unitStore.getAll({ keyword })
  }

  findForms = async (keyword) => {
    await this.props.eFormStore.getAll({
      keyword,
      maxResultCount: 10,
      skipCount: 0
    })
  }

  activateOrDeactivate = async (id: number, isActive) => {
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await this.props.eFormStore.activateOrDeactivate(id, isActive)
        await this.getAll()
      }
    })
  }

  handleSearch = async (name, value) => {
    const { filters } = this.props.eFormStore
    await this.props.eFormStore.setFilers({ ...filters, [name]: value, skipCount: 0 })
    await this.getAll()
  }

  onCreateOrUpdate = async (EForm: any) => {
    const { eFormStore } = this.props
    const { editEForm } = eFormStore
    if (EForm.id) {
      await eFormStore.update({
        ...editEForm,
        ...EForm
      })
    } else {
      await eFormStore.create(EForm)
    }

    await this.getAll()
  }

  updateResponseStatus = async (id, status) => {
    confirm({
      title: LNotification('DO_YOU_WANT_TO_UPPDATE_THIS_ITEM_TO_{0}', status.name),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await this.props.eFormStore.updateResponseStatus(id, status.code)
        await this.getAll()
      }
    })
  }

  public render() {
    const {
      formId,
      eFormStore: { pagedResponseData, responseStatus, pagedData, filters },
      unitStore: { units }
    } = this.props

    const columns = getColumns({
      title: L('FULL_UNIT_CODE'),
      dataIndex: 'fullUnitCode',
      key: 'fullUnitCode',
      ellipsis: true,
      width: '19%',
      render: (fullUnitCode: string, item: any) => (
        <Row style={{ justifyContent: 'space-between', paddingRight: 4 }}>
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <div
              className="full-name text-truncate text-link-to-detail"
              onClick={this.isGranted(appPermissions.eFormAnswer.detail) ? () => this.gotoDetail(item.id) : undefined}>
              <a className="link-text-table"> {fullUnitCode}</a>
              <div className="text-muted">{item.creatorUserName}</div>
            </div>
          </Col>
          <Col sm={{ span: 3, offset: 0 }} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu items={item.submitStatus?.isIssueClosed ? [] : this.getMenuItems(item.id, responseStatus)}>
                  {this.isGranted(appPermissions.eFormAnswer.delete) && (
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
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_UNIT')}</label>
          <Select
            showSearch
            defaultValue={filters.unitId}
            allowClear
            filterOption={false}
            onSearch={this.findUnits}
            onChange={(value) => this.handleSearch('unitId', value)}
            style={{ width: '100%' }}
            value={filters.unitIds}>
            {units?.items.map((pfStore) => (
              <Select.Option value={`${pfStore.id}`} key={pfStore.id}>
                {pfStore.fullUnitCode} <span className="text-muted small">({pfStore.name})</span>
              </Select.Option>
            ))}
          </Select>
        </Col>
        {!formId && (
          <Col sm={{ span: 6, offset: 0 }}>
            <label>{this.L('FILTER_FORM')}</label>
            <Select
              showSearch
              allowClear
              filterOption={false}
              defaultValue={filters.formId}
              onSearch={this.findForms}
              onChange={(value) => this.handleSearch('formId', value)}
              style={{ width: '100%' }}
              value={filters.formId}>
              {pagedData?.items.map((formItem) => (
                <Select.Option value={`${formItem.id}`} key={formItem.id}>
                  {formItem.formName}
                </Select.Option>
              ))}
            </Select>
          </Col>
        )}
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
          <Select
            allowClear
            defaultValue={filters.Status}
            style={{ width: '100%' }}
            onChange={(value) => this.handleSearch('Status', value)}>
            {this.renderOptions(this.props.eFormStore.responseStatus)}
          </Select>
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.eFormAnswer.page) ? (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          title={this.L('EFORM_RESPONSE_LIST')}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: pagedResponseData?.totalCount || 0,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.eFormAnswer.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={this.props.eFormStore.isLoading}
            dataSource={pagedResponseData?.items || []}
            scroll={{ x: 768, y: 550, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(EFormResponseList)
