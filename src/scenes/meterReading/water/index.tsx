import React from 'react'

import { Tabs } from 'antd'

import withRouter from '@components/Layout/Router/withRouter'
import { inject, observer } from 'mobx-react'
import AppComponentBase from '@components/AppComponentBase'
import { L } from '@lib/abpUtility'
import MeterReadingWaterOverview from './overview'
import MeterReadingWaterHistory from './history'
import NoRole from '@components/ComponentNoRole'
import { appPermissions } from '@lib/appconst'
const tabKeys = {
  tabWaterOverview: 'TAB_WATER_OVERVIEW',
  tabWaterHistory: 'TAB_WATER_HISTORY'
}

export interface IMeterReadingWaterProps {
  navigate: any
  params: any
  location: any
}

@inject()
@observer
class MeterReadingWater extends AppComponentBase<IMeterReadingWaterProps> {
  formRef: any = React.createRef()
  state = {
    tabActiveKey: tabKeys.tabWaterOverview
  }
  async componentDidMount() {
    this.props.location.search === '?tabWaterHistory' && this.setState({ tabActiveKey: tabKeys.tabWaterHistory })
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
  }

  render() {
    return this.isGranted(appPermissions.MeterWater.page) ? (
      <Tabs activeKey={this.state.tabActiveKey} onTabClick={this.changeTab} type="card">
        <Tabs.TabPane tab={L(tabKeys.tabWaterOverview)} key={tabKeys.tabWaterOverview}>
          <MeterReadingWaterOverview />
        </Tabs.TabPane>

        <Tabs.TabPane tab={L(tabKeys.tabWaterHistory)} key={tabKeys.tabWaterHistory}>
          <MeterReadingWaterHistory />
        </Tabs.TabPane>
      </Tabs>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(MeterReadingWater)
