import React from 'react'

import { Card, Tabs } from 'antd'

import withRouter from '@components/Layout/Router/withRouter'
import { inject, observer } from 'mobx-react'
import AppComponentBase from '@components/AppComponentBase'
import { L } from '@lib/abpUtility'

import FeeTypesV2 from './fee-typeV2'
import PackageFee from './fee-package'
import { appPermissions } from '@lib/appconst'
import NoRole from '@components/ComponentNoRole'

const tabKeys = {
  tabFeeTypes: 'FEE_SETTING_FEE_TYPES',
  tabFeePeriod: 'FEE_SETTING_FEE_PERIOD'
}

export interface IFeeSettingProps {
  navigate: any
  params: any
  location: any
}

@inject()
@observer
class FeeSetting extends AppComponentBase<IFeeSettingProps> {
  formRef: any = React.createRef()
  state = {
    tabActiveKey: tabKeys.tabFeeTypes
  }
  async componentDidMount() {
    this.props.location.search === '?tabFeePeriod' && this.setState({ tabActiveKey: tabKeys.tabFeePeriod })
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
  }

  render() {
    return this.isGranted(appPermissions.feePackage.page) ? (
      <Tabs activeKey={this.state.tabActiveKey} onTabClick={this.changeTab} type="card">
        {this.isGranted(appPermissions.feeType.read) && (
          <Tabs.TabPane tab={L(tabKeys.tabFeeTypes)} key={tabKeys.tabFeeTypes}>
            <Card bordered={false} style={{ minHeight: 800 }}>
              <FeeTypesV2 />
            </Card>
          </Tabs.TabPane>
        )}
        {this.isGranted(appPermissions.feePackage.read) && (
          <Tabs.TabPane tab={L(tabKeys.tabFeePeriod)} key={tabKeys.tabFeePeriod}>
            <Card bordered={false} style={{ minHeight: 800 }}>
              <PackageFee />
            </Card>
          </Tabs.TabPane>
        )}
      </Tabs>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(FeeSetting)
