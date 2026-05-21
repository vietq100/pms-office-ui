import { AppstoreOutlined, CaretRightOutlined, UnorderedListOutlined } from '@ant-design/icons/lib'
import AppComponentBase from '@components/AppComponentBase'
import FeeImport from '@scenes/feeStatement/fee-import'
import { Collapse, Tabs, Tooltip } from 'antd'
import React from 'react'
import FeeGroup from '../fee-group'
import FeeImportFilter from '../fee-import/components/Filter'
import FeeGroupFilter from '../fee-group/components/Filter'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import FeeStore from '@stores/fee/feeStore'
import FeeGroupStore from '@stores/fee/feeGroupStore'
import Summary from '@scenes/feeStatement/summary'
import appConsts from '@lib/appconst'
import FeeTypeStore from '@stores/fee/feeTypeStore'
import withRouter from '@components/Layout/Router/withRouter'
import { L } from '@lib/abpUtility'
import DataTable from '@components/DataTable'

const { feeSourceGroup } = appConsts

interface State {
  key: string
  filterObject: any
}

interface Props {
  navigate: any
  params: any
  feeStore: FeeStore
  feeGroupStore: FeeGroupStore
  feeTypeStore: FeeTypeStore
}

const tabs = {
  importFeeTab: 'FEE_TAB',
  groupFeeTab: 'FEE_GROUP_TAB'
}

@inject(Stores.FeeStore, Stores.FeeGroupStore, Stores.FeeTypeStore)
@observer
class FeeStatement extends AppComponentBase<Props, State> {
  state = {
    key: tabs.groupFeeTab,
    filterObject: {} as any
  }

  componentDidMount(): void {
    const feeGroup = this.props.params['*'].slice(14)
    if (feeGroup) {
      this.setFeeGroup(feeSourceGroup[feeGroup])
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.params.feeGroup && newProps.params.feeGroup !== this.props.params.feeGroup) {
      this.setFeeGroup(feeSourceGroup[newProps.params.feeGroup])
      this.state.key === tabs.groupFeeTab ? this.refreshFeeUnitStore() : this.refreshFeeStore()
    }
  }

  setFeeGroup(feeGroup) {
    const { filterObject } = this.state
    filterObject.groupName = feeGroup
    this.props.feeGroupStore.setFilter('groupName', feeGroup)
    this.props.feeStore.setFilter('groupName', feeGroup)
    this.props.feeTypeStore.setFilter('groupName', feeGroup)
    this.setState({ filterObject })
  }

  handleChange = (key: string) => {
    this.setState({ key })
  }

  refreshFeeStore = () => {
    const { feeStore } = this.props

    // Request by Independent: Set state to trigger refresh summary
    this.setState({ filterObject: { ...feeStore.filterFee } })
    this.props.feeStore.getAll({})
  }

  refreshFeeUnitStore = () => {
    this.props.feeGroupStore.getAll({})

    // Request by Independent: Set state to trigger refresh summary
    const { feeGroupStore } = this.props
    this.setState({
      filterObject: {
        ...feeGroupStore.filterObject,
        projectId: feeGroupStore.selectedProjectId
      }
    })
  }

  renderActions = () => (
    <span className="fee-menu right-content center-items mr-3">
      <span className={this.state.key === tabs.groupFeeTab ? 'active' : ''}>
        <Tooltip title={this.L('FEE_PACKAGE_UNIT_LIST')} placement="bottomRight">
          <AppstoreOutlined
            style={{ fontSize: 18, cursor: 'pointer' }}
            onClick={() => this.handleChange(tabs.groupFeeTab)}
          />
        </Tooltip>
      </span>
      <span className={this.state.key === tabs.importFeeTab ? 'active' : ''}>
        <Tooltip title={this.L('FEE_IMPORT_LIST')} placement="bottomRight">
          <UnorderedListOutlined
            style={{ fontSize: 18, cursor: 'pointer' }}
            onClick={() => this.handleChange(tabs.importFeeTab)}
          />
        </Tooltip>
      </span>
    </span>
  )
  componentWillUnmount() {
    this.props.feeGroupStore.resetFilter()
    this.props.feeStore.resetFilter()
  }

  render(): React.ReactNode {
    const { key, filterObject } = this.state
    const filterComponent = (
      <>
        <FeeImportFilter params={this.props.params} className={key === tabs.importFeeTab ? 'show' : 'hide'} />
        <FeeGroupFilter params={this.props.params} className={key === tabs.groupFeeTab ? 'show' : 'hide'} />
      </>
    )
    return (
      <div className="fee-statement-container">
        <Collapse
          defaultActiveKey={['0']}
          ghost
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
          <Collapse.Panel className="overview-collapse" header={<strong>{L('OVERVIEW')}</strong>} key="1">
            <Summary
              isFeeGroup={key === tabs.groupFeeTab}
              filterObject={this.state.filterObject}
              package={this.props.feeStore.selectedPackage}
              feeGroup={filterObject.groupName}
            />
          </Collapse.Panel>
        </Collapse>

        <DataTable extraFilterComponent={filterComponent} actionGroups={this.renderActions} />
        <Tabs activeKey={this.state.key} animated={false}>
          <Tabs.TabPane key={tabs.importFeeTab}>
            <FeeImport navigate={this.props.navigate || {}} />
          </Tabs.TabPane>
          <Tabs.TabPane key={tabs.groupFeeTab}>
            <FeeGroup />
          </Tabs.TabPane>
        </Tabs>
      </div>
    )
  }
}

export default withRouter(FeeStatement)
