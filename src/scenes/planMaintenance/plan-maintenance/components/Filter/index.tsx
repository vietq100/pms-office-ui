import find from 'lodash/find'
import debounce from 'lodash/debounce'
import AppComponentBase from '@components/AppComponentBase'
import { Col, Input, Row, Select, DatePicker } from 'antd'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import AppConst, { dateFormat, moduleIds } from '@lib/appconst'
import { TEAM_TARGET } from '@lib/enum'
import TeamStore from '@stores/team/teamStore'
import SessionStore from '@stores/sessionStore'
import ProjectStore from '@stores/project/projectStore'
import AssetStore from '@stores/facility/assetStore'
import PlanMaintenanceStore from '@stores/planMaintenance/planMaintenanceStore'
import { styles } from '@lib/formLayout'
import staffService from '@services/member/staff/staffService'
import { filterOptions } from '@lib/helper'

const defaultStatus = find(AppConst.activeStatus, { value: 'true' }) || ({} as any)
interface IProps {
  teamStore?: TeamStore
  sessionStore?: SessionStore
  projectStore?: ProjectStore
  planMaintenanceStore?: PlanMaintenanceStore
  assetStore?: AssetStore
  className?: string
}

@inject(Stores.ProjectStore, Stores.TeamStore, Stores.PlanMaintenanceStore, Stores.AssetStore, Stores.SessionStore)
@observer
export default class PlanMaintenanceFilter extends AppComponentBase<IProps, any> {
  state = {
    selectedPackage: null,
    assets: [],
    assignedUser: null,
    assignedUsers: []
  }

  async componentDidMount() {
    const { planMaintenanceStore, sessionStore } = this.props
    const moduleId = moduleIds.planMaintenance
    await planMaintenanceStore?.setFilter('isActive', defaultStatus.value)
    await Promise.all([
      this.props.teamStore?.filterOptions({
        target: TEAM_TARGET.PLAN_MAINTENANCE
      }),
      this.handleSearchAssigner(''),
      planMaintenanceStore?.getPriorityOptions({ moduleId, culture: 'en' }),
      planMaintenanceStore?.getStatusOptions({ moduleId, culture: 'en' }),
      this.handleSearchAsset('')
    ]).then(async () => {
      planMaintenanceStore?.setFilter('projectId', sessionStore!.projectId)
      await this.getAll()
    })
  }

  handleSearch = async (field, value) => {
    const { sessionStore } = this.props
    if (field === 'teamIds') {
      this.setState({ assignedUser: null })
      await this.props.teamStore?.filterUsersInTeamOptions({ teamId: value })
    }
    if (field === 'projectId' && value !== sessionStore?.project.id) {
      const project = sessionStore?.ownProjects.find((item) => item.value === value)
      await this.handleSearchAsset('')
      sessionStore?.changeProject(project)
    }
    this.props.planMaintenanceStore?.setFilter(field, value)
    await this.getAll()
  }

  getAll = async () => {
    const { planMaintenanceStore } = this.props
    await Promise.all([planMaintenanceStore?.getAll(), planMaintenanceStore?.getCountStatus()])
  }

  onChangeAsset = (assetId, option) => {
    this.setState({
      assets: [...this.state.assets, { label: option.children[0], value: option.value }]
    })
  }

  handleSearchAsset = debounce(
    async (keyword: string) =>
      await this.props.assetStore?.filterOptions({
        keyword,
        projectId: this.props.sessionStore?.project.id
      }),
    300
  )
  handleSearchAssigner = async (keyword) => {
    const res = await staffService.filterWfAssigner({
      keyword,
      moduleId: moduleIds.planMaintenance
    })
    this.setState({ assignedUsers: res })
  }
  render() {
    const { className, planMaintenanceStore } = this.props

    const keywordPlaceholder = `${this.L('SEARCH_PLAN_MAINTENANCE_ID')}, ${this.L('PLAN_MAINTENANCE_NAME')}`

    return (
      <div className={className}>
        <Row gutter={[16, 8]}>
          <Col sm={{ span: 6, offset: 0 }}>
            <label>{this.L('FILTER_KEYWORD')}</label>
            <Input.Search
              maxLength={200}
              placeholder={keywordPlaceholder}
              onSearch={(value) => this.handleSearch('keyword', value)}
            />
          </Col>

          <Col sm={{ span: 6, offset: 0 }}>
            <label>{this.L('FILTER_ASSIGNED_TO')}</label>
            <Select
              showSearch
              allowClear
              filterOption={false}
              value={this.state.assignedUser}
              className="full-width"
              onSearch={debounce(this.handleSearchAssigner, 350)}
              onChange={(value) => {
                this.handleSearch('employeeIds', value)
                this.setState({ assignedUser: value })
              }}
              // disabled={!planMaintenanceStore?.filterObject?.teamIds}
            >
              {this.renderOptions(this.state.assignedUsers)}
            </Select>
          </Col>
          <Col sm={{ span: 6, offset: 0 }}>
            <label>{this.L('FILTER_FROM_TO_DATE')}</label>
            <DatePicker.RangePicker
              format={dateFormat}
              className="full-width"
              onChange={(value) => this.handleSearch('dateFromTo', value)}
            />
          </Col>
          <Col sm={{ span: 6, offset: 0 }}>
            <label>{this.L('FILTER_STATUS')}</label>
            <Select
              mode="multiple"
              showSearch
              showArrow
              allowClear
              filterOption={filterOptions}
              onChange={(value) => this.handleSearch('statusIds', value)}
              style={styles.width100}>
              {this.renderOptions(planMaintenanceStore?.statusOptions)}
            </Select>
          </Col>
          <Col sm={{ span: 6, offset: 0 }}>
            <label>{this.L('FILTER_PRIORITY')}</label>
            <Select
              showSearch
              showArrow
              allowClear
              filterOption={filterOptions}
              onChange={(value) => this.handleSearch('priorityIds', value)}
              style={styles.width100}>
              {this.renderOptions(planMaintenanceStore?.priorityOptions)}
            </Select>
          </Col>
          <Col sm={{ span: 6, offset: 0 }}>
            <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
            <Select
              onChange={(value) => this.handleSearch('isActive', value)}
              style={styles.width100}
              value={`${planMaintenanceStore?.filterObject.isActive}`}>
              {this.renderOptions(AppConst.activeStatus)}
            </Select>
          </Col>
          <Col sm={{ span: 6, offset: 0 }}>
            <label>{this.L('FILTER_ASSETS')}</label>
            <Select
              allowClear
              showSearch
              placeholder={this.L('SELECT_ASSET')}
              filterOption={false}
              onChange={(value) => this.handleSearch('assetIds', value)}
              style={styles.width100}
              value={planMaintenanceStore?.filterObject?.assetIds as any}
              onSearch={(value) => this.handleSearchAsset(value)}>
              {this.renderOptions(this.props.assetStore?.assetOptions)}
            </Select>
          </Col>
        </Row>
      </div>
    )
  }
}
