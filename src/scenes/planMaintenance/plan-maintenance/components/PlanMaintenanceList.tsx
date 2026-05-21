import filter from 'lodash/filter'
import { inject, observer } from 'mobx-react'
import { AppComponentListBase } from '@components/AppComponentBase'
import Stores from '@stores/storeIdentifier'
import { Button, Col, Dropdown, Menu, Modal, Row, Table } from 'antd'
import { EllipsisOutlined, ImportOutlined } from '@ant-design/icons/lib'
import DataTable from '@components/DataTable'
import { L, LNotification } from '@lib/abpUtility'
import { appPermissions } from '@lib/appconst'
import getColumns from './columns'
import { portalLayouts } from '@components/Layout/Router/router.config'
import PlanMaintenanceStore from '@stores/planMaintenance/planMaintenanceStore'
import { ExcelIcon } from '@components/Icon'
import { notifySuccess } from '@lib/helper'
import PlanMaintenanceImportModal from './PlanMaintenanceImportModal'

export interface IPlanMaintenanceListProps {
  navigate?: any
  planMaintenanceStore?: PlanMaintenanceStore
  extraFilterComponent: any
  onRefresh: () => void
}

export interface IPlanMaintenanceListState {
  visible: boolean
  currentPage: number
}

@inject(Stores.PlanMaintenanceStore)
@observer
export default class PlanMaintenanceList extends AppComponentListBase<
  IPlanMaintenanceListProps,
  IPlanMaintenanceListState
> {
  state = {
    visible: false,
    currentPage: 1
  }

  componentDidMount() {
    return this.getAll()
  }

  getAll = async () => {
    await this.props.planMaintenanceStore?.getAll({})
  }

  handleImportFee = async (file) => {
    await this.props.planMaintenanceStore?.importPlanmaintenace(file)
    await this.getAll()
    this.toggleModal()
  }

  toggleModal = () => this.setState((prevState) => ({ visible: !prevState.visible }))

  handlePagingChange = async (paging) => {
    const { planMaintenanceStore } = this.props
    const skipCount = (paging.current - 1) * (planMaintenanceStore?.filterObject.maxResultCount || 10)
    planMaintenanceStore?.setFilter('skipCount', skipCount)
    planMaintenanceStore?.setCurrentPage(paging.current)
    await planMaintenanceStore?.getAll({ skipCount })
    this.setState({ currentPage: paging.current })
  }

  handleActivateOrDeactivate = (id, isActive) => {
    Modal.confirm({
      title: !isActive
        ? LNotification('DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM')
        : LNotification('DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await this.props.planMaintenanceStore?.activateOrDeactivate(id, isActive)
        notifySuccess(L('SUCCESSFULLY'), L('DEACTIVATE_SUCCESSFULLY'))
        await this.handlePagingChange({ current: 1 })
      }
    })
  }

  public renderActions = () => {
    return (
      <span>
        {this.isGranted(appPermissions.planMaintenance.import) && (
          <Button type="primary" size={'small'} shape="round" onClick={this.toggleModal} className="mr-1">
            <ImportOutlined /> {this.L('BTN_IMPORT')}
          </Button>
        )}
      </span>
    )
  }

  handleExportPlanMaintenancess = async () => {
    await this.props.planMaintenanceStore?.exportPlanmaintenace({})
  }

  gotoDetail = (id?) => {
    const { navigate } = this.props
    id
      ? navigate(portalLayouts.planMaintenanceEdit.path.replace(':id', id))
      : navigate(portalLayouts.planMaintenanceCreate.path)
  }

  renderActionGroups = () => {
    const { planMaintenanceStore } = this.props

    return (
      <span>
        <>
          {this.isGranted(appPermissions.planMaintenance.import) && (
            <>
              {/* <Button type="primary" shape="round" onClick={this.props.planMaintenanceStore?.downloadTemplate}>
                <DownloadOutlined /> {this.L('BTN_DOWNLOAD_TEMPLATE')}
              </Button> */}
              <Button type="primary" shape="round" onClick={this.toggleModal} className="mr-1">
                <ImportOutlined /> {this.L('BTN_IMPORT')}
              </Button>
            </>
          )}
          {this.isGranted(appPermissions.planMaintenance.export) && (
            <Button
              shape="circle"
              type="primary"
              className="mr-1"
              onClick={this.handleExportPlanMaintenancess}
              icon={<ExcelIcon />}
              disabled={!planMaintenanceStore?.pagedResult || !planMaintenanceStore?.pagedResult.totalCount}
            />
          )}
        </>
      </span>
    )
  }

  render() {
    const { visible } = this.state
    const { planMaintenanceStore } = this.props
    const columns = getColumns({
      title: `${L('PLANED_MAINTENANCE_NAME')}/${L('PLANED_MAINTENANCE_ASSETS')}`,
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      ellipsis: true,
      render: (text: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <div
              className="full-name text-truncate text-link-to-detail"
              onClick={() => {
                this.isGranted(appPermissions.planMaintenance.detail) && this.gotoDetail(item.id)
              }}>
              <strong>
                {' '}
                <a className="link-text-table"> {text}</a>
              </strong>
              <div>
                {item.assets.map((item, index) => (
                  <div key={index}>{item?.assetName}</div>
                ))}
              </div>
            </div>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {this.isGranted(appPermissions.planMaintenance.delete) && (
                    <Menu.Item onClick={() => this.handleActivateOrDeactivate(item.id, !item.isActive)}>
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
    const filterItems = filter(planMaintenanceStore?.pagedResult.items, (_item) => {
      return (
        `${planMaintenanceStore?.filterObject?.isActive}`.trim() === '' ||
        `${planMaintenanceStore?.filterObject?.isActive}` === `${_item.isActive}`
      )
    }).map((item) => ({ ...item, key: item.id }))

    return (
      <div className="plan-maintenance-container">
        <DataTable
          onRefresh={this.props.onRefresh}
          extraFilterComponent={this.props.extraFilterComponent}
          title={this.L('PLAN_MAINTENANCE_LIST')}
          onCreate={this.gotoDetail}
          pagination={{
            onChange: this.handlePagingChange,
            current: planMaintenanceStore?.currentPage,
            total: planMaintenanceStore?.pagedResult.totalCount,
            pageSize: planMaintenanceStore?.filterObject.maxResultCount
          }}
          createPermission={appPermissions.planMaintenance.create}
          actionGroups={this.renderActionGroups}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={planMaintenanceStore?.isLoading}
            dataSource={filterItems}
            scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
          />
        </DataTable>

        <PlanMaintenanceImportModal visible={visible} onClose={this.toggleModal} onOk={this.handleImportFee} />
      </div>
    )
  }
}
