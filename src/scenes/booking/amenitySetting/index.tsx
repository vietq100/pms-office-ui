import React from 'react'

import { Card, Tabs } from 'antd'

import withRouter from '@components/Layout/Router/withRouter'
import { inject, observer } from 'mobx-react'
import AppComponentBase from '@components/AppComponentBase'
import { L } from '@lib/abpUtility'
import Amenities from '../amenity'
import AmenityGroups from '../amenityGroup'
import NoRole from '@components/ComponentNoRole'
import { appPermissions } from '@lib/appconst'
const tabKeys = {
  tabAmenityGroup: 'AMENITY_GROUP',
  tabAmenity: 'AMENITY'
}

export interface IAmenitySettingProps {
  navigate: any
  params: any
  location: any
}

@inject()
@observer
class AmenitySetting extends AppComponentBase<IAmenitySettingProps> {
  formRef: any = React.createRef()
  state = {
    tabActiveKey: tabKeys.tabAmenityGroup
  }
  async componentDidMount() {
    this.props.location.search === '?amenityGroup'
      ? this.setState({ tabActiveKey: tabKeys.tabAmenityGroup })
      : this.setState({ tabActiveKey: tabKeys.tabAmenity })
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
  }

  render() {
    return this.isGranted(appPermissions.amenityGroup.page) ? (
      <Tabs activeKey={this.state.tabActiveKey} onTabClick={this.changeTab} type="card">
        <Tabs.TabPane
          tab={L(tabKeys.tabAmenity)}
          key={tabKeys.tabAmenity}
          disabled={!this.isGranted(appPermissions.amenity.page)}>
          <Card bordered={false} style={{ minHeight: 800 }}>
            <Amenities />
          </Card>
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={L(tabKeys.tabAmenityGroup)}
          key={tabKeys.tabAmenityGroup}
          disabled={!this.isGranted(appPermissions.amenityGroup.page)}>
          <Card bordered={false} style={{ minHeight: 800 }}>
            <AmenityGroups />
          </Card>
        </Tabs.TabPane>
      </Tabs>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(AmenitySetting)
