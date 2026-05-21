import React from 'react'

import { Tabs } from 'antd'

import withRouter from '@components/Layout/Router/withRouter'
import { inject, observer } from 'mobx-react'
import AppComponentBase from '@components/AppComponentBase'
import { L } from '@lib/abpUtility'
import NoRole from '@components/ComponentNoRole'
import { appPermissions } from '@lib/appconst'
import CashAdvanceListScreen from './cash-advance/index'
import CashAdvanceTransctions from './cash-list-transaction/index'

const tabKeys = {
  cashAdvanceList: 'CASH_ADVANCE_LIST',
  cashAdvancesTransaction: 'CASH_ADVANCE_TRANSACTION'
}

export interface IReceiptAndVoucherProps {
  navigate: any
  params: any
  location: any
}

@inject()
@observer
class CashAdvanceScreen extends AppComponentBase<IReceiptAndVoucherProps> {
  formRef: any = React.createRef()
  state = {
    tabActiveKey: tabKeys.cashAdvanceList
  }
  async componentDidMount() {
    this.props.location.search === '?cashAdvancesTransaction' &&
      this.setState({ tabActiveKey: tabKeys.cashAdvancesTransaction })
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
  }

  render() {
    return this.isGranted(appPermissions.CashAdvance.page) ? (
      <Tabs activeKey={this.state.tabActiveKey} onTabClick={this.changeTab} type="card">
        <Tabs.TabPane tab={L(tabKeys.cashAdvanceList)} key={tabKeys.cashAdvanceList}>
          <CashAdvanceListScreen />
        </Tabs.TabPane>

        <Tabs.TabPane tab={L(tabKeys.cashAdvancesTransaction)} key={tabKeys.cashAdvancesTransaction}>
          <CashAdvanceTransctions />
        </Tabs.TabPane>
      </Tabs>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(CashAdvanceScreen)
