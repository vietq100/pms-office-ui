import * as React from 'react'
import { Row, Col, Button, Select } from 'antd'

import WorkOrderEmployee from './components/WorkOrderEmployee'
import WorkOrderProject from './components/WorkOrderProject'
import WorkOrderStatus from './components/WorkOrderStatus'
import WorkOrderType from '@scenes/common/Dashboard/components/WorkOrderType'
import Tabs from 'antd/lib/tabs'
import { L } from '@lib/abpUtility'
import AppComponentBase from '@components/AppComponentBase'
import { dateFormat, moduleIds } from '@lib/appconst'
import FeeStatementReport from '@scenes/common/Dashboard/components/FeeStatementReport'
import Filter from '@components/Filter'
import DatePicker from 'antd/lib/date-picker'
import { filterOptions } from '@lib/helper'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import ProjectStore from '@stores/project/projectStore'
import WorkflowStore from '@stores/workflow/workflowStore'
import staffService from '@services/member/staff/staffService'
import debounce from 'lodash/debounce'
import WorkOrderRatingEmployee from '@scenes/common/Dashboard/components/WorkOrderRatingEmployee'
import { FilterIcon } from '@components/Icon'
import ReportOverview from './components/ReportOverview'

const { RangePicker } = DatePicker
const { Option } = Select
const tabKeys = {
  tabWorkOrder: 'REPORT_WORK_ORDER',
  tabFee: 'REPORT_FEE_STATEMENT',
  tabOverview: 'REPORT_OVERVIEW'
}

export interface IDashboardProps {
  projectStore: ProjectStore
  workflowStore: WorkflowStore
}

@inject(Stores.ProjectStore, Stores.WorkflowStore)
@observer
export class Dashboard extends AppComponentBase<IDashboardProps, any> {
  constructor(props) {
    super(props)
    this.state = {
      showFilter: false,
      cardLoading: false,
      lineChartLoading: false,
      barChartLoading: false,
      pieChartLoading: false,
      filters: {} as any,
      filterFees: {} as any,
      listStatus: [],
      listTracker: [],
      employees: []
    }

    this.updateFilter = debounce(this.updateFilter, 300)
  }

  componentDidMount = async () => {
    await Promise.all([
      this.props.workflowStore.getListWfStatus(null, moduleIds.workOrder),
      this.props.workflowStore.getListWfTracker(moduleIds.workOrder),
      this.findEmployees('')
    ])
    this.setState({
      listStatus: this.props.workflowStore.wfStatus,
      listTracker: this.props.workflowStore.wfTrackers
    })
    //this.findEmployees = debounce(this.findEmployees, 300)
  }

  updateFilter = (name, value, type?) => {
    switch (type) {
      case 'date': {
        const newFilter = value
          ? {
              ...this.state.filters,
              fromDate: value[0].toISOString(),
              toDate: value[1].toISOString()
            }
          : { ...this.state.filters, fromDate: null, toDate: null }

        this.setState({
          filters: newFilter
        })
        break
      }
      case tabKeys.tabFee: {
        this.setState({
          filterFees: { ...this.state.filterFees, [name]: value }
        })
        break
      }
      default: {
        this.setState({ filters: { ...this.state.filters, [name]: value } })
      }
    }
  }

  hideOrShowFilterPanel = () => {
    this.setState({ showFilter: !this.state.showFilter })
  }

  findEmployees = async (keyword) => {
    const employees = await staffService.filterOptions({ keyword })
    this.setState({ employees })
  }

  groupActions = (
    <>
      <Button
        shape="round"
        className="btn-primary-outlined btn-icon-right"
        icon={<FilterIcon />}
        onClick={this.hideOrShowFilterPanel}>
        {L('FILTER_ADVANCED')}
      </Button>
    </>
  )

  render() {
    const { showFilter, listStatus, listTracker, employees } = this.state
    const {
      projectStore: { projectOptions }
    } = this.props
    const items = [
      {
        label: L(tabKeys.tabWorkOrder),
        key: tabKeys.tabWorkOrder,
        children: (
          <>
            {showFilter && (
              <div className="mb-3">
                <Filter title={this.L('FILTER')} showHeader={false}>
                  <Row gutter={[16, 8]}>
                    <Col sm={{ span: 6, offset: 0 }}>
                      <label>{this.L('PROJECT')}</label>
                      <Select
                        mode="multiple"
                        showSearch
                        showArrow
                        allowClear
                        className="full-width"
                        filterOption={filterOptions}
                        onChange={(value) => {
                          this.updateFilter('projectIds', value)
                        }}>
                        {this.renderOptions(projectOptions)}
                      </Select>
                    </Col>
                    <Col sm={{ span: 6, offset: 0 }}>
                      <label>{L('FILTER_FROM_TO_DATE')}</label>
                      <RangePicker
                        format={dateFormat}
                        onChange={(value) => this.updateFilter('dateFromTo', value, 'date')}
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col sm={{ span: 6, offset: 0 }}>
                      <label>{this.L('FILTER_STATUS')}</label>
                      <Select
                        mode="multiple"
                        showArrow
                        showSearch
                        allowClear
                        onChange={(value) => this.updateFilter('statusIds', value)}
                        style={{ width: '100%' }}>
                        {(listStatus || []).map((status: any, index) => (
                          <Option key={index} value={status.id}>
                            {status.name}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col sm={{ span: 6, offset: 0 }}>
                      <label>{this.L('FILTER_EMPLOYEE')}</label>
                      <Select
                        showSearch
                        showArrow
                        className="full-width"
                        onSearch={this.findEmployees}
                        filterOption={false}
                        mode="multiple"
                        onChange={(value) => this.updateFilter('assignedIds', value)}>
                        {(employees || []).map((item: any, index) => (
                          <Option key={index} value={item.id}>
                            {item.displayName}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col sm={{ span: 6, offset: 0 }}>
                      <label>{this.L('FILTER_WO_CATEGORY')}</label>
                      <Select
                        showSearch
                        showArrow
                        className="full-width"
                        filterOption={false}
                        mode="multiple"
                        onChange={(value) => this.updateFilter('trackerIds', value)}>
                        {(listTracker || []).map((item: any, index) => (
                          <Option key={index} value={item.id}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                  </Row>
                </Filter>
              </div>
            )}

            <Row>
              <Col sm={{ span: 24 }}>
                <WorkOrderProject filters={this.state.filters} />
              </Col>
            </Row>

            <Row gutter={[16, 16]} className="mt-3">
              <Col sm={{ span: 12 }}>
                <WorkOrderType filters={this.state.filters} />
              </Col>
              <Col sm={{ span: 12 }}>
                <WorkOrderStatus filters={this.state.filters} />
              </Col>
              <Col sm={{ span: 24 }}>
                <WorkOrderEmployee filters={this.state.filters} />
              </Col>
              <Col sm={{ span: 24 }}>
                <WorkOrderRatingEmployee filters={this.state.filters} />
              </Col>
            </Row>
          </>
        )
      },
      {
        label: L(tabKeys.tabFee),
        key: tabKeys.tabFee,
        children: (
          <>
            {showFilter && (
              <div className="mb-3">
                <Filter title={this.L('FILTER')} showHeader={false}>
                  <Row gutter={[16, 8]}>
                    <Col sm={{ span: 24, offset: 0 }}>
                      <label>{this.L('PROJECT')}</label>
                      <Select
                        mode="multiple"
                        showSearch
                        showArrow
                        allowClear
                        className="full-width"
                        filterOption={filterOptions}
                        onChange={(value) => {
                          this.updateFilter('project', value, tabKeys.tabFee)
                        }}>
                        {this.renderOptions(projectOptions)}
                      </Select>
                    </Col>
                  </Row>
                </Filter>
              </div>
            )}

            <FeeStatementReport filters={{ ...this.state.filterFees }} />
          </>
        )
      },
      {
        label: L(tabKeys.tabOverview),
        key: tabKeys.tabOverview,
        children: (
          <>
            {showFilter && (
              <div className="mb-3">
                <Filter title={this.L('FILTER')} showHeader={false}>
                  <Row gutter={[16, 8]}>
                    <Col sm={{ span: 6, offset: 0 }}>
                      <label>{this.L('PROJECT')}</label>
                      <Select
                        mode="multiple"
                        showSearch
                        showArrow
                        allowClear
                        className="full-width"
                        filterOption={filterOptions}
                        onChange={(value) => {
                          this.updateFilter('projectIds', value)
                        }}>
                        {this.renderOptions(projectOptions)}
                      </Select>
                    </Col>
                    <Col sm={{ span: 6, offset: 0 }}>
                      <label>{L('FILTER_FROM_TO_DATE')}</label>
                      <RangePicker
                        format={dateFormat}
                        onChange={(value) => this.updateFilter('dateFromTo', value, 'date')}
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col sm={{ span: 6, offset: 0 }}>
                      <label>{this.L('FILTER_STATUS')}</label>
                      <Select
                        mode="multiple"
                        showArrow
                        showSearch
                        allowClear
                        onChange={(value) => this.updateFilter('statusIds', value)}
                        style={{ width: '100%' }}>
                        {(listStatus || []).map((status: any, index) => (
                          <Option key={index} value={status.id}>
                            {status.name}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col sm={{ span: 6, offset: 0 }}>
                      <label>{this.L('FILTER_EMPLOYEE')}</label>
                      <Select
                        showSearch
                        showArrow
                        className="full-width"
                        onSearch={this.findEmployees}
                        filterOption={false}
                        mode="multiple"
                        onChange={(value) => this.updateFilter('assignedIds', value)}>
                        {(employees || []).map((item: any, index) => (
                          <Option key={index} value={item.id}>
                            {item.displayName}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col sm={{ span: 6, offset: 0 }}>
                      <label>{this.L('FILTER_WO_CATEGORY')}</label>
                      <Select
                        showSearch
                        showArrow
                        className="full-width"
                        filterOption={false}
                        mode="multiple"
                        onChange={(value) => this.updateFilter('trackerIds', value)}>
                        {(listTracker || []).map((item: any, index) => (
                          <Option key={index} value={item.id}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                  </Row>
                </Filter>
              </div>
            )}
            <div className="mb-3">
              <ReportOverview filters={this.state.filters} />
            </div>
          </>
        )
      }
    ].filter((tab) => {
      if (!this.isGranted('appPermissions.dashboard.workOrder') && tab.key === tabKeys.tabWorkOrder) {
        return false
      } else if (!this.isGranted('appPermissions.dashboard.fee') && tab.key === tabKeys.tabFee) {
        return false
      } else {
        return true
      }
    })
    return (
      <React.Fragment>
        <Tabs defaultActiveKey={tabKeys.tabWorkOrder} tabBarExtraContent={this.groupActions} items={items} />
      </React.Fragment>
    )
  }
}

export default Dashboard
