import React from 'react'

import { Card, Tabs } from 'antd'

import withRouter from '@components/Layout/Router/withRouter'
import { inject, observer } from 'mobx-react'
import AppComponentBase from '@components/AppComponentBase'
import { L } from '@lib/abpUtility'
import PaymentMethodManagement from './payment-method'
import PaymentOnline from './payment-momo'
import PaymentNotificationTemplates from './payment-templateNoti'
import ProjectStore from '@stores/project/projectStore'
import ProjectSetting from './payment-bankInfo'
import NoRole from '@components/ComponentNoRole'
import { appPermissions } from '@lib/appconst'
import SettingHeaderFooter from './setting-header-footer'
const tabKeys = {
  tabPaymentMethod: 'PAYMENT_METHOD',
  tabPaymentMoMo: 'PAYMENT_MOMO',
  tabBankInfo: 'PROJECT_TAB_BANK',
  tabTemplateNotify: 'TEMPLATE_NOTIFY',
  tabSettingHeaderAndFooter: 'SETTING_HEADER_AND_FOOTER'
}

export interface IPaymentSettingProps {
  navigate: any
  params: any
  location: any
  projectStore: ProjectStore
}

@inject()
@observer
class PaymentSetting extends AppComponentBase<IPaymentSettingProps> {
  formRef: any = React.createRef()
  formRefBankSetting: any = React.createRef()
  state = {
    tabActiveKey: tabKeys.tabPaymentMethod
  }
  async componentDidMount() {
    this.props.location.search === '?tabPaymentMoMo' && this.setState({ tabActiveKey: tabKeys.tabPaymentMoMo })
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
  }

  render() {
    return this.isGranted(appPermissions.paymentSetting.page) ? (
      <Tabs activeKey={this.state.tabActiveKey} onTabClick={this.changeTab} type="card">
        <Tabs.TabPane tab={L(tabKeys.tabPaymentMethod)} key={tabKeys.tabPaymentMethod}>
          <Card bordered={false} style={{ minHeight: 800 }}>
            <PaymentMethodManagement />
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab={L(tabKeys.tabPaymentMoMo)} key={tabKeys.tabPaymentMoMo}>
          <Card bordered={false} style={{ minHeight: 800 }}>
            <PaymentOnline />
          </Card>
        </Tabs.TabPane>
        <Tabs.TabPane tab={L(tabKeys.tabBankInfo)} key={tabKeys.tabBankInfo}>
          <Card bordered={false} style={{ minHeight: 800 }}>
            <ProjectSetting />
          </Card>
        </Tabs.TabPane>
        <Tabs.TabPane tab={L(tabKeys.tabTemplateNotify)} key={tabKeys.tabTemplateNotify}>
          <Card bordered={false} style={{ minHeight: 800 }}>
            <PaymentNotificationTemplates />
          </Card>
        </Tabs.TabPane>
        <Tabs.TabPane tab={L(tabKeys.tabSettingHeaderAndFooter)} key={tabKeys.tabSettingHeaderAndFooter}>
          <Card bordered={false} style={{ minHeight: 800 }}>
            <SettingHeaderFooter />
          </Card>
        </Tabs.TabPane>
      </Tabs>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(PaymentSetting)
