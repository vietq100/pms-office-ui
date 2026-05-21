import { AppstoreOutlined, CaretRightOutlined, UnorderedListOutlined } from '@ant-design/icons/lib'
import AppComponentBase from '@components/AppComponentBase'
import FeeImport from '@scenes/feeStatementV1/fee-import'
import { Card, Col, Collapse, Row, Tabs, Tooltip } from 'antd'
import React from 'react'
import FeeGroup from '../fee-group'
import FeeGroupFilter from '../fee-group/components/Filter'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import FeeStore from '@stores/fee/feeStore'
import FeeGroupStore from '@stores/fee/feeGroupStore'
import Summary from '@scenes/feeStatement/summary'
import appConsts, { appPermissions } from '@lib/appconst'
import withRouter from '@components/Layout/Router/withRouter'
import { L } from '@lib/abpUtility'
import DataTable from '@components/DataTable'
import NoRole from '@components/ComponentNoRole'

const { feeSourceGroup } = appConsts

interface State {
  key: string
  filterObject: any
  isShowFilter: boolean
}

interface Props {
  navigate: any
  params: any
  feeStore: FeeStore
  feeGroupStore: FeeGroupStore
}

const tabs = {
  importFeeTab: 'FEE_IMPORT_TAB',
  groupFeeTab: 'FEE_GROUP_TAB'
}

@inject(Stores.FeeStore, Stores.FeeGroupStore)
@observer
class FeeStatement extends AppComponentBase<Props, State> {
  state = {
    key: tabs.groupFeeTab,
    filterObject: {} as any,
    isShowFilter: true
  }

  componentDidMount(): void {
    const feeGroup = this.props.params['*'].slice(14)
    if (feeGroup) {
      this.setFeeGroup(feeSourceGroup[feeGroup])
    }
  }

  setFeeGroup(feeGroup) {
    const { filterObject } = this.state
    filterObject.groupName = feeGroup
    this.props.feeGroupStore.setFilter('groupName', feeGroup)
    this.props.feeStore.setFilter('groupName', feeGroup)
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
    <span className="fee-menu right-content center-items mr-3" style={{ marginTop: 5 }}>
      <span className={this.state.key === tabs.groupFeeTab ? 'active' : ''}>
        <Tooltip title={this.L('FEE_PACKAGE_UNIT_LIST')} placement="bottomRight">
          <AppstoreOutlined
            style={{ fontSize: 25, cursor: 'pointer' }}
            onClick={() => this.handleChange(tabs.groupFeeTab)}
          />
        </Tooltip>
      </span>
      <span className={this.state.key === tabs.importFeeTab ? 'active' : ''} style={{ marginLeft: 5 }}>
        <Tooltip title={this.L('FEE_IMPORT_LIST')} placement="bottomRight">
          <UnorderedListOutlined
            style={{ fontSize: 25, cursor: 'pointer' }}
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
    const { key } = this.state

    return this.isGranted(appPermissions.feeStatement.page) ? (
      <div className="fee-statement-container">
        <Row gutter={[16, 8]}>
          <Col span={24}>
            <Collapse
              defaultActiveKey={['0']}
              ghost
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
              <Collapse.Panel className="overview-collapse" header={<strong>{L('OVERVIEW')}</strong>} key="1">
                <Summary
                  isFeeGroup={key === tabs.groupFeeTab}
                  filterObject={this.props.feeGroupStore.filterObject}
                  package={this.props.feeStore.selectedPackage}
                />
              </Collapse.Panel>
            </Collapse>
          </Col>
        </Row>
        {this.state.isShowFilter && (
          <Card className="my-2">
            <FeeGroupFilter // filter use feeimport and feegroup
              feeStore={this.props.feeStore}
              params={this.props.params}
              isFeeGroup={key === tabs.groupFeeTab}
            />
          </Card>
        )}
        <DataTable actionGroups={this.renderActions} />
        <Tabs activeKey={this.state.key} animated={false}>
          <Tabs.TabPane key={tabs.importFeeTab}>
            <FeeImport
              navigate={this.props.navigate || {}}
              changIsShow={() => this.setState({ isShowFilter: !this.state.isShowFilter })}
            />
          </Tabs.TabPane>
          <Tabs.TabPane key={tabs.groupFeeTab}>
            <FeeGroup changIsShow={() => this.setState({ isShowFilter: !this.state.isShowFilter })} />
          </Tabs.TabPane>
        </Tabs>
      </div>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(FeeStatement)
