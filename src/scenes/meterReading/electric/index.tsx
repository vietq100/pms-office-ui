import React from 'react'

import { Tabs } from 'antd'

import withRouter from '@components/Layout/Router/withRouter'
import { inject, observer } from 'mobx-react'
import AppComponentBase from '@components/AppComponentBase'
import { L } from '@lib/abpUtility'
import MeterReadingElectricHistory from './history'
import MeterReadingElectricOverview from './overview'
const tabKeys = {
  tabElectricOverview: 'TAB_ELECTRIC_OVERVIEW',
  tabElectricHistory: 'TAB_ELECTRIC_HISTORY'
}

export interface IMeterReadingElectricProps {
  navigate: any
  params: any
  location: any
}

@inject()
@observer
class MeterReadingElectric extends AppComponentBase<IMeterReadingElectricProps> {
  formRef: any = React.createRef()
  state = {
    tabActiveKey: tabKeys.tabElectricOverview
  }
  async componentDidMount() {
    this.props.location.search === '?tabElectricHistory' && this.setState({ tabActiveKey: tabKeys.tabElectricHistory })
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
  }

  render() {
    return (
      <Tabs activeKey={this.state.tabActiveKey} onTabClick={this.changeTab} type="card">
        <Tabs.TabPane tab={L(tabKeys.tabElectricOverview)} key={tabKeys.tabElectricOverview}>
          <MeterReadingElectricOverview />
        </Tabs.TabPane>

        <Tabs.TabPane tab={L(tabKeys.tabElectricHistory)} key={tabKeys.tabElectricHistory}>
          <MeterReadingElectricHistory />
        </Tabs.TabPane>
      </Tabs>
    )
  }
}

export default withRouter(MeterReadingElectric)
