import React from 'react'

import { Card, Tabs } from 'antd'

import withRouter from '@components/Layout/Router/withRouter'
import { inject, observer } from 'mobx-react'
import AppComponentBase from '@components/AppComponentBase'
import { L } from '@lib/abpUtility'
import FeeReceipt from '../receipt'
import NoRole from '@components/ComponentNoRole'
import { appPermissions } from '@lib/appconst'

const tabKeys = {
  tabReceipt: 'RECEIPT_AND_VOUCHER_RECEIPT',
  tabVoucher: 'RECEIPT_AND_VOUCHER_VOUCHER'
}

export interface IReceiptAndVoucherProps {
  navigate: any
  params: any
  location: any
}

@inject()
@observer
class ReceiptAndVoucher extends AppComponentBase<IReceiptAndVoucherProps> {
  formRef: any = React.createRef()
  state = {
    tabActiveKey: tabKeys.tabReceipt
  }
  async componentDidMount() {
    this.props.location.search === '?tabVoucher' && this.setState({ tabActiveKey: tabKeys.tabVoucher })
    this.props.location.search === '?tabReceipt' && this.setState({ tabActiveKey: tabKeys.tabReceipt })
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
  }

  render() {
    return this.isGranted(appPermissions.feeReceipt.page) ? (
      <Tabs activeKey={this.state.tabActiveKey} onTabClick={this.changeTab} type="card">
        <Tabs.TabPane tab={L(tabKeys.tabReceipt)} key={tabKeys.tabReceipt}>
          <Card bordered={false} style={{ minHeight: 800 }}>
            <FeeReceipt keyword={this.props.location.search} />
          </Card>
        </Tabs.TabPane>

        {/* <Tabs.TabPane tab={L(tabKeys.tabVoucher)} key={tabKeys.tabVoucher}>
          <Card bordered={false} style={{ minHeight: 800 }}>
            <VoucherList keyword={this.props.location.search} />
          </Card>
        </Tabs.TabPane> */}
      </Tabs>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(ReceiptAndVoucher)
