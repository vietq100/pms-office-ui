import * as React from 'react'

import { inject, observer } from 'mobx-react'
import { Row, Col, DatePicker, Select, Collapse } from 'antd'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { AppComponentListBase } from '@components/AppComponentBase'
// import Filter from '@components/Filter'
import { appPermissions, dateFormat, moduleIds } from '@lib/appconst'
import Stores from '@stores/storeIdentifier'
import { IPlanMaintenanceCalendarProps } from './interfaces'
import { PipelineContainer } from './components/PipelineContainer'
import { portalLayouts } from '@components/Layout/Router/router.config'
import { StatisticItem } from '@components/Statisitc/StatisticItem'
import staffService from '@services/member/staff/staffService'
import debounce from 'lodash/debounce'
import Spin from 'antd/es/spin'
import DataTable from '@components/DataTable'
import { CaretRightOutlined } from '@ant-design/icons'
import NoRole from '@components/ComponentNoRole'

@inject(
  Stores.ReservationStore,
  Stores.SessionStore,
  Stores.AmenityGroupStore,
  Stores.TeamStore,
  Stores.PlanMaintenanceStore,
  Stores.PlanMaintenancePipelineStore
)
@observer
class PlanMaintenancePipelineView extends AppComponentListBase<IPlanMaintenanceCalendarProps, any> {
  formRef: any = React.createRef()
  state = {
    isLoading: false,
    assignedUsers: []
  }
  async componentDidMount() {
    this.isGranted(appPermissions.planMaintenance.page) &&
      (await this.props.planMaintenancePipelineStore.setFilter('projectId', this.props.sessionStore.projectId))
    this.isGranted(appPermissions.planMaintenance.page) &&
      (await Promise.all([this.getAll(), this.handleSearchAssigner('')]))
  }

  getAll = async () => {
    this.setState({ isLoading: true })
    const { planMaintenancePipelineStore } = this.props
    await Promise.all([planMaintenancePipelineStore.getOverview({}), planMaintenancePipelineStore.getAllByStatus({})])
    this.setState({ isLoading: false })
  }

  componentWillUnmount() {
    this.props.planMaintenancePipelineStore.resetFilter()
  }

  handleSearch = async (field, value) => {
    const { planMaintenancePipelineStore } = this.props
    switch (field) {
      case 'teamIds':
        this.props.teamStore.filterUsersInTeamOptions({ teamId: value })
        break
    }
    await planMaintenancePipelineStore.setFilter(field, value)
    await this.getAll()
  }

  navigateToDetail = (pm: any) => () => {
    window.open(portalLayouts.planMaintenanceEdit.path.replace(':id', pm.id), '_blank')
  }

  onFinishedDrop = async (planId: number, statusId: number) => {
    {
      this.isGranted(appPermissions.planMaintenance.update) &&
        (await this.props.planMaintenancePipelineStore.updatePlanStatus(planId, statusId))
    }
  }
  handleSearchAssigner = async (keyword) => {
    const res = await staffService.filterWfAssigner({
      keyword,
      moduleId: moduleIds.planMaintenance
    })
    this.setState({ assignedUsers: res })
  }
  render() {
    const {
      planMaintenancePipelineStore: { overview, listStatus, listPlanMaintenance }
    } = this.props
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_FROM_TO_DATE')}</label>
          <DatePicker.RangePicker
            format={dateFormat}
            className="full-width"
            onChange={(value) => this.handleSearch('dateFromTo', value)}
          />
        </Col>
        {/* <Col sm={{ span: 6, offset: 0 }}>
        <label>{this.L('FILTER_TEAM_MANAGEMENT')}</label>
        <Select
          showSearch
          allowClear
          className="full-width"
          filterOption={false}
          onChange={(value) => this.handleSearch('teamIds', value)}>
          {this.renderOptions(teamOptions)}
        </Select>
      </Col> */}
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_ASSIGNED_TO')}</label>
          <Select
            showSearch
            allowClear
            mode="multiple"
            filterOption={false}
            className="full-width"
            onSearch={debounce(this.handleSearchAssigner, 350)}
            onChange={(value) => this.handleSearch('employeeIds', value)}>
            {this.renderOptions(this.state.assignedUsers)}
          </Select>
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.planMaintenance.page) ? (
      <>
        <div style={{ position: 'relative', height: 'cacl(100% - 880px)' }}>
          <Collapse
            defaultActiveKey={['0']}
            ghost
            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
            <Collapse.Panel className="overview-collapse" header={<strong>{this.L('OVERVIEW')}</strong>} key="1">
              <Row gutter={[16, 8]} className="mb-3">
                <Col span={8}>
                  <StatisticItem
                    description={this.L('PIPELINE_OVERDUE_TODAY')}
                    value={overview.today}
                    color="#62d1f3"
                  />
                </Col>
                <Col span={8}>
                  <StatisticItem description={this.L('PIPELINE_DUE_DAY')} value={overview.dueDay} color="#93be52" />
                </Col>
                <Col span={8}>
                  <StatisticItem description={this.L('PIPELINE_OVER_DUE')} value={overview.overdue} color="#fc6180" />
                </Col>
              </Row>
            </Collapse.Panel>
          </Collapse>

          <div className="wrap-pipeline-screen">
            <Spin spinning={this.state.isLoading} className="w-100 h-100"></Spin>
            <DataTable extraFilterComponent={filterComponent} onRefresh={this.getAll}></DataTable>
            <Row gutter={[16, 10]} className="mt-3 wrap-pipeline-flex">
              <Col sm={{ span: 24, offset: 0 }} className="pipeline-view-wrapper">
                <DndProvider backend={HTML5Backend}>
                  {listStatus.map((status, index) => (
                    <PipelineContainer
                      index={index}
                      key={index}
                      status={status}
                      listPlanMaintenance={listPlanMaintenance[status.id]}
                      navigateToDetail={this.navigateToDetail}
                      onFinishedDrop={this.onFinishedDrop}
                      planMaintenancePipelineStore={this.props.planMaintenancePipelineStore}
                    />
                  ))}
                </DndProvider>
              </Col>
            </Row>
          </div>
        </div>
      </>
    ) : (
      <NoRole />
    )
  }
}

export default PlanMaintenancePipelineView
