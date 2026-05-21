import React from 'react'

import { Card, Tabs } from 'antd'

import withRouter from '@components/Layout/Router/withRouter'
import { inject, observer } from 'mobx-react'
import AppComponentBase from '@components/AppComponentBase'
import { L } from '@lib/abpUtility'
import ContractorStore from '@stores/contractor/contractorStore'
import Stores from '@stores/storeIdentifier'
import InventoryCategory from '../category'
import InventoryLocation from '../location'
import InventoryBrand from '../brand'
import NoRole from '@components/ComponentNoRole'
import { appPermissions } from '@lib/appconst'
const tabKeys = {
  tabCategory: 'CATEGORY',
  tabBrand: 'BRAND',
  tabLocation: 'LOCATION'
}

export interface IIventoryManagementProps {
  navigate: any
  params: any
  contractorStore: ContractorStore
}

@inject(Stores.ContractorStore, Stores.FileStore)
@observer
class IventoryManagement extends AppComponentBase<IIventoryManagementProps> {
  formRef: any = React.createRef()
  state = {
    tabActiveKey: tabKeys.tabCategory
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
  }

  render() {
    return this.isGranted(appPermissions.inventory.page) ? (
      <Tabs activeKey={this.state.tabActiveKey} onTabClick={this.changeTab} type="card">
        <Tabs.TabPane tab={L(tabKeys.tabCategory)} key={tabKeys.tabCategory}>
          <Card bordered={false} style={{ minHeight: 800 }}>
            <InventoryCategory />
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab={L(tabKeys.tabBrand)} key={tabKeys.tabBrand}>
          <Card bordered={false} style={{ minHeight: 800 }}>
            <InventoryBrand />
          </Card>
        </Tabs.TabPane>
        <Tabs.TabPane tab={L(tabKeys.tabLocation)} key={tabKeys.tabLocation}>
          <Card bordered={false} style={{ minHeight: 800 }}>
            <InventoryLocation />
          </Card>
        </Tabs.TabPane>
      </Tabs>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(IventoryManagement)
