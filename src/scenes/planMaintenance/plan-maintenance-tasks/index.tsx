import { inject, observer } from 'mobx-react'
import { Table } from 'antd'
import { AppComponentListBase } from '@components/AppComponentBase'
import DataTable from '@components/DataTable'
import { appPermissions } from '@lib/appconst'
import Stores from '@stores/storeIdentifier'
import PlanMaintenanceStore from '@stores/planMaintenance/planMaintenanceStore'
import PlanMaintenanceTaskStore from '@stores/planMaintenance/planMaintenanceTaskStore'
import getColumns from './columns'
import withRouter from '@components/Layout/Router/withRouter'

export interface IPlanMaintenaneTaskProps {
  navigate?: any
  planMaintenanceStore: PlanMaintenanceStore
  planMaintenanceTaskStore: PlanMaintenanceTaskStore
}

export interface IPlanMaintainenceTaskState {
  visible: boolean
  selectedFee: any
  editVisible: boolean
  currentPage: number
  selectedFeeIds: any
}

@inject(Stores.PlanMaintenanceStore, Stores.PlanMaintenanceTaskStore)
@observer
class PlanMaintenanceTask extends AppComponentListBase<any, IPlanMaintainenceTaskState> {
  render() {
    const {
      planMaintenanceTaskStore: { currentPage, pagedResult, filterObject, isLoading }
    } = this.props
    const columns = getColumns(this)
    return (
      <div className="plan-maintenance-task-container">
        <DataTable
          title={this.L('PLAN_MAINTENANCE_TASK_LIST')}
          pagination={{
            current: currentPage,
            total: pagedResult.totalCount,
            pageSize: filterObject.maxResultCount
          }}
          createPermission={appPermissions.planMaintenance.create}>
          <Table
            size="middle"
            className="custom-ant-table"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={isLoading}
            dataSource={pagedResult === undefined ? [] : pagedResult.items}
            scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
      </div>
    )
  }
}

export default withRouter(PlanMaintenanceTask)
