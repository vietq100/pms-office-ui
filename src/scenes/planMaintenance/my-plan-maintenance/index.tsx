import * as React from 'react'

import { inject, observer } from 'mobx-react'
import Row from 'antd/es/row'
import Col from 'antd/es/col'
import { Collapse, Tabs } from 'antd'
import { AppComponentListBase } from '@components/AppComponentBase'
// import Filter from '@components/Filter'
import Stores from '@stores/storeIdentifier'
import ProjectStore from '@stores/project/projectStore'
import PlanMaintenanceStore from '@stores/planMaintenance/planMaintenanceStore'
import TeamStore from '@stores/team/teamStore'
import PlanMaintenanceFilter from './components/Filter'
import PlanMaintenanceList from './components/PlanMaintenanceList'

import { StatisticItem } from '@components/Statisitc/StatisticItem'
import withRouter from '@components/Layout/Router/withRouter'

import { CaretRightOutlined } from '@ant-design/icons'
import NoRole from '@components/ComponentNoRole'
import { appPermissions } from '@lib/appconst'

enum tabs {
  planMaintenanceTab = 'PLAN_MAINTENANCE_TAB',
  planMaintenanceTaskTab = 'PLAN_MAINTENANCE_TASK_TAB'
}

export interface IPlanMaintenancesProps {
  navigate: any
  routedata?: any
  projectStore: ProjectStore
  teamStore: TeamStore
  planMaintenanceStore: PlanMaintenanceStore
}

export interface IPlanMaintenancesState {
  activeTabKey: tabs
}

@inject(Stores.ProjectStore, Stores.TeamStore, Stores.PlanMaintenanceStore)
@observer
class PlanMaintenance extends AppComponentListBase<IPlanMaintenancesProps, IPlanMaintenancesState> {
  formRef: any = React.createRef()

  state = {
    activeTabKey: tabs.planMaintenanceTab
  }

  getAll = async () => {
    await this.props.planMaintenanceStore.getAllMyPlan()
  }

  componentWillUnmount() {
    this.props.planMaintenanceStore.resetFilter()
  }

  public render() {
    const { activeTabKey } = this.state
    const filterComponent = (
      <PlanMaintenanceFilter className={activeTabKey === tabs.planMaintenanceTab ? 'show' : 'hide'} />
    )
    return this.isGranted(appPermissions.planMaintenance.page) ? (
      <div className="plan-maintenance-container">
        <Collapse
          defaultActiveKey={['0']}
          ghost
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
          <Collapse.Panel className="overview-collapse" header={<strong>{this.L('OVERVIEW')}</strong>} key="1">
            <Row gutter={[16, 8]} className="mb-3">
              {this.props.planMaintenanceStore.overviewStatus.map((item, index) => (
                <Col span={6} key={index}>
                  <StatisticItem description={item.name} value={item.count} color={item.colorCode} />
                </Col>
              ))}
            </Row>
          </Collapse.Panel>
        </Collapse>

        {/* 
        <Filter title={this.L('FILTER')} handleRefresh={this.getAll}>
          <PlanMaintenanceFilter
            className={
              activeTabKey === tabs.planMaintenanceTab ? 'show' : 'hide'
            }
          />
        </Filter> */}

        <Tabs activeKey={activeTabKey} animated={false}>
          <Tabs.TabPane key={tabs.planMaintenanceTab} tab={<div></div>}>
            <PlanMaintenanceList
              extraFilterComponent={filterComponent}
              onRefresh={this.getAll}
              navigate={this.props.navigate}
              planMaintenanceStore={this.props.planMaintenanceStore}
            />
          </Tabs.TabPane>
        </Tabs>
      </div>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(PlanMaintenance)
