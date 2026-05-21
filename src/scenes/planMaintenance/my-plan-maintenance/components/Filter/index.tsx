import find from 'lodash/find'
import debounce from 'lodash/debounce'
import AppComponentBase from '@components/AppComponentBase'
import { Col, Input, Row, Select, DatePicker } from 'antd'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import AppConst, { dateFormat, moduleIds } from '@lib/appconst'
import { TEAM_TARGET } from '@lib/enum'
import { styles } from '@lib/formLayout'
import TeamStore from '@stores/team/teamStore'
import SessionStore from '@stores/sessionStore'
import AssetStore from '@stores/facility/assetStore'
import PlanMaintenanceStore from '@stores/planMaintenance/planMaintenanceStore'
import { filterOptions } from '@lib/helper'

const defaultStatus = find(AppConst.activeStatus, { value: 'true' }) || ({} as any)

interface IProps {
  teamStore?: TeamStore
  sessionStore?: SessionStore
  planMaintenanceStore?: PlanMaintenanceStore
  assetStore?: AssetStore
  className?: string
}

@inject(Stores.SessionStore, Stores.TeamStore, Stores.PlanMaintenanceStore, Stores.AssetStore)
@observer
export default class PlanMaintenanceFilter extends AppComponentBase<IProps, any> {
  state = {
    selectedPackage: null,
    assets: []
  }

  async componentDidMount() {
    const { planMaintenanceStore, sessionStore } = this.props
    const moduleId = moduleIds.planMaintenance
    await planMaintenanceStore?.setFilter('isActive', defaultStatus.value)
    await Promise.all([
      this.props.teamStore?.filterOptions({
        target: TEAM_TARGET.PLAN_MAINTENANCE
      }),
      this.getAll(),
      planMaintenanceStore?.getPriorityOptions({ moduleId, culture: 'en' }),
      planMaintenanceStore?.getStatusOptions({ moduleId, culture: 'en' }),

      this.handleSearchAsset('')
    ]).then(async () => {
      await planMaintenanceStore?.setFilter('projectId', sessionStore?.projectId)
      await this.getAll()
    })
  }

  handleSearch = async (field, value) => {
    this.props.planMaintenanceStore?.setFilter(field, value)

    if (field === 'projectId') {
      await this.handleSearchAsset('')
    }
    await this.getAll()
  }

  getAll = async () => {
    const { planMaintenanceStore } = this.props
    await Promise.all([planMaintenanceStore?.getAllMyPlan(), planMaintenanceStore?.getCountStatus({ isOwner: true })])
  }

  onChangeAsset = (assetId, option) => {
    this.setState({
      assets: [...this.state.assets, { label: option.children[0], value: option.value }]
    })
  }

  handleSearchAsset = debounce(
    async (keyWord: string) =>
      await this.props.assetStore?.filterOptions({
        keyWord,
        projectId: this.props.planMaintenanceStore?.filterObject.projectId
      }),
    300
  )

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
            <label>{this.L('FILTER_ASSETS')}</label>
            <Select
              allowClear
              showSearch
              placeholder={this.L('SELECT_ASSET')}
              filterOption={false}
              onChange={(value) => this.handleSearch('assetIds', value)}
              style={styles.width100}
              value={this.props.assetStore?.filterObject.assetTypeIds as any}
              onSearch={(value) => this.handleSearchAsset(value)}>
              {this.renderOptions(this.props.assetStore?.assetOptions)}
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
        </Row>
      </div>
    )
  }
}
