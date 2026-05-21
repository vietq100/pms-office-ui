import React from 'react'
import { inject, observer } from 'mobx-react'
import { AppComponentListBase } from '@components/AppComponentBase'
import Stores from '@stores/storeIdentifier'
import { Button, Modal, Table } from 'antd'
import { ImportOutlined } from '@ant-design/icons/lib'
import DataTable from '@components/DataTable'
import { L, LNotification } from '@lib/abpUtility'
import { appPermissions } from '@lib/appconst'
import getColumns from './columns'
import { portalLayouts } from '@components/Layout/Router/router.config'
import PlanMaintenanceStore from '@stores/planMaintenance/planMaintenanceStore'
import PlanMaintenanceTaskStore from '@stores/planMaintenance/planMaintenanceTaskStore'
import { ExcelIcon } from '@components/Icon'
import withRouter from '@components/Layout/Router/withRouter'

export interface IPlanMaintenanceListProps {
  planMaintenanceId?: number
  navigate?: any
  planMaintenanceStore?: PlanMaintenanceStore
  planMaintenanceTaskStore?: PlanMaintenanceTaskStore
}

export interface IPlanMaintenanceListState {
  visible: boolean
  currentPage: number
  selectedFeeIds: any
}

@inject(Stores.PlanMaintenanceStore, Stores.PlanMaintenanceTaskStore)
@observer
class PlanMaintenanceTaskList extends AppComponentListBase<IPlanMaintenanceListProps, IPlanMaintenanceListState> {
  async componentDidMount() {
    this.props.planMaintenanceTaskStore?.setFilter('planMaintenanceId', this.props.planMaintenanceId)
    await this.getAll()
  }

  async componentWillReceiveProps(nextProps) {
    if (this.props.planMaintenanceId !== nextProps.planMaintenanceId && nextProps.planMaintenanceId) {
      this.props.planMaintenanceTaskStore?.setFilter('planMaintenanceId', nextProps.planMaintenanceId)
      await this.getAll()
    }
  }

  componentWillUnmount() {
    this.props.planMaintenanceTaskStore?.resetFilter()
  }

  updateSelectedFees = (selectedFeeIds) => {
    this.setState({ selectedFeeIds })
  }

  getAll = async () => {
    await this.props.planMaintenanceTaskStore?.getAll({})
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

  // handleChangeStatus = async (record: IFee) => {
  //   await this.props.feeStore?.activate(record.id || 0, !record.isActive)
  //   await this.getAll()
  //   notifySuccess(LNotification('SUCCESS'), LNotification(this.L('ITEM_UPDATE_SUCCEED')))
  // }

  handleActivateOrDeactivate = () => {
    Modal.confirm({
      title: LNotification('DO_YOU_WANT_TO_UPDATE_THESE_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        //await this.props.planMaintenanceStore?.updateStatus(isActive, this.state.selectedFeeIds)
        await this.handlePagingChange({ current: 1 })
        this.updateSelectedFees([])
      }
    })
  }

  public renderActions = () => {
    return (
      <div className="flex center-items right-content action-menu">
        {this.isGranted(appPermissions.planMaintenance.create) && (
          <React.Fragment>
            {/* <Button
              type="primary"
              size={'small'}
              shape="round"
              onClick={this.props.planMaintenanceStore?.downloadTemplate}
            >
              <DownloadOutlined /> {this.L('BTN_DOWNLOAD_TEMPLATE')}
            </Button> */}
            <Button type="primary" size={'small'} shape="round" onClick={this.toggleModal} className="ml-1">
              <ImportOutlined /> {this.L('BTN_IMPORT')}
            </Button>
            {/* {this.isGranted(appPermissions.planMaintenance.update) &&
              <>
                <Button size={'small'} shape="round"
                        onClick={() => this.handleActivateOrDeactivate(true)}
                        disabled={isEmpty(this.state.selectedFeeIds)}
                        className="ml-1 success">
                  <CheckOutlined /> {this.L('BTN_ACTIVATE')}
                </Button>
                <Button size={'small'} shape="round"
                        onClick={() => this.handleActivateOrDeactivate(false)}
                        disabled={isEmpty(this.state.selectedFeeIds)}
                        className="ml-1" danger>
                  <CloseOutlined /> {this.L('BTN_DEACTIVATE')}
                </Button>
              </>
            } */}
          </React.Fragment>
        )}
      </div>
    )
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
      <span className="mr-1">
        {this.isGranted(appPermissions.planMaintenance.export) && (
          // <Button
          //   shape="round"
          //   ghost
          //   size={'large'}
          //   className="mr-1 primary btn-icon-customize"
          //   type="primary"
          //   icon={
          //     <span className="btn-icon">
          //       <ExcelIcon />
          //     </span>
          //   }
          //   disabled={
          //     !planMaintenanceStore?.pagedResult ||
          //     !planMaintenanceStore?.pagedResult.totalCount
          //   }>
          //   {L('EXPORT_EXCEL')}
          // </Button>
          <Button
            shape="circle"
            type="primary"
            className="pt-1 mx-1"
            // onClick={this.handleExportResidents}
            icon={<ExcelIcon />}
            disabled={!planMaintenanceStore?.pagedResult || !planMaintenanceStore?.pagedResult.totalCount}
          />
        )}
      </span>
    )
  }

  render() {
    const { planMaintenanceTaskStore } = this.props
    const columns = getColumns(this)
    return (
      <div className="plan-maintenance-container">
        <DataTable
          title={this.L('PLAN_MAINTENANCE_LIST')}
          onCreate={this.gotoDetail}
          pagination={{
            onChange: this.handlePagingChange,
            current: planMaintenanceTaskStore?.currentPage,
            total: planMaintenanceTaskStore?.pagedResult.totalCount,
            pageSize: planMaintenanceTaskStore?.filterObject.maxResultCount
          }}
          createPermission={appPermissions.planMaintenance.create}
          actionGroups={this.renderActionGroups}>
          <Table
            size="middle"
            className="custom-ant-table"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={planMaintenanceTaskStore?.isLoading}
            dataSource={planMaintenanceTaskStore?.pagedResult.items}
            scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
      </div>
    )
  }
}

export default withRouter(PlanMaintenanceTaskList)
