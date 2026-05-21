import * as React from 'react'

import { inject, observer } from 'mobx-react'
import { Row, Col, DatePicker, Select, Card, Tag, Spin } from 'antd'
import AppConsts, { yearFormat, moduleIds, appPermissions } from '@lib/appconst'
import { AppComponentListBase } from '@components/AppComponentBase'
import Stores from '@stores/storeIdentifier'
import ProjectStore from '@stores/project/projectStore'
import SessionStore from '@stores/sessionStore'
import PlanMaintenanceStore from '@stores/planMaintenance/planMaintenanceStore'
import PlanMaintenanceCalendarStore from '@stores/planMaintenance/planMaintenanceCalendarStore'
import AssetTypeStore from '@stores/facility/assetTypeStore'
import TeamStore from '@stores/team/teamStore'
import { portalLayouts } from '@components/Layout/Router/router.config'
import DataTable from '@components/DataTable'
import dayjs from 'dayjs'
import { renderDateTime } from '@lib/helper'
import NoRole from '@components/ComponentNoRole'
import { debounce } from 'lodash'

const { monthNamesShort } = AppConsts

export interface IPlanMaintenanceCalendarProps {
  navigate: any
  routedata?: any
  projectStore: ProjectStore
  teamStore: TeamStore
  sessionStore: SessionStore
  assetTypeStore: AssetTypeStore
  planMaintenanceStore: PlanMaintenanceStore
  planMaintenanceCalendarStore: PlanMaintenanceCalendarStore
}

export interface IPlanMaintenancesState {
  displayMonths: Array<any>
  excludeMonths: Array<any>
  loading: boolean
}

@inject(
  Stores.ProjectStore,
  Stores.TeamStore,
  Stores.PlanMaintenanceStore,
  Stores.PlanMaintenanceCalendarStore,
  Stores.AssetTypeStore,
  Stores.SessionStore
)
@observer
class PlanMaintenanceCalendar extends AppComponentListBase<IPlanMaintenanceCalendarProps, IPlanMaintenancesState> {
  formRef: any = React.createRef()
  async componentDidMount() {
    const { planMaintenanceStore } = this.props
    const moduleId = moduleIds.planMaintenance
    this.isGranted(appPermissions.planMaintenance.page) &&
      this.props.planMaintenanceCalendarStore.setFilter('projectId', this.props.sessionStore.project.id)
    this.isGranted(appPermissions.planMaintenance.page) &&
      (await this.props.planMaintenanceCalendarStore.setFilter('year', dayjs()))
    this.isGranted(appPermissions.planMaintenance.page) &&
      (await Promise.all([
        planMaintenanceStore?.getStatusOptions({ moduleId, culture: 'en' }),
        this.getAll(),
        this.getListAssetType('')
      ]))
  }

  getListAssetType = debounce(async (keyword) => {
    this.props.assetTypeStore.filterOptions({ keyword })
  }, 400)

  getAll = async () => {
    await this.props.planMaintenanceCalendarStore.getAll()
  }

  componentWillUnmount() {
    this.props.planMaintenanceStore.resetFilter()
  }

  handleSearch = async (field, value) => {
    await this.props.planMaintenanceCalendarStore.setFilter(field, value)
    await this.getAll()
  }

  naviPlanMaintenanceDetail = (id) => {
    const url = id
      ? portalLayouts.planMaintenanceEdit.path.replace(':id', id)
      : portalLayouts.planMaintenanceCreate.path

    window.open(url)
  }

  renderPlanMaintenanceItem = (pm, indexPM) => {
    return (
      <>
        <div
          key={indexPM}
          className="plan-maintenance-item pointer popup-hide"
          onClick={() => this.naviPlanMaintenanceDetail(pm.id)}>
          <div className="title pointer">
            <span className="text-truncate mgr-10 ">
              {/* #{pm.id} */}
              <b>{pm.name}</b>
            </span>
            {this.renderTag(pm.status?.name, pm.status?.colorCode || 'black')}
          </div>
          {/* <div className="description text-muted" style={{ marginTop: '5px;' }}>
            <span>{pm.description}</span>
          </div> */}
          {/* <div className="more-info">
            <Row>
              <Col span="12">
                <span>{'START_DATE'}</span>
                <label>
                  <b>{'PLANNED'}:</b> {renderDateTime(pm.startDate)}
                </label>
                <label>
                  <b>{'ACTUAL'}:</b> {pm.actualStartDate}
                </label>
              </Col>

              <Col span="12">
                <span>{'END_DATE'}</span>
                <label>
                  <b>{'PLANNED'}:</b> {renderDateTime(pm.endDate)}
                </label>
                <label>
                  <b>{'ACTUAL'}:</b> {renderDateTime(pm.actualEndDate)}
                </label>
              </Col>
            </Row>
          </div> */}
        </div>
        <div className="popup-show">
          <div
            key={indexPM}
            className="plan-maintenance-popup pointer"
            onClick={() => this.naviPlanMaintenanceDetail(pm.id)}>
            <div className="title pointer">
              <span className="text-truncate mgr-10">
                #{pm.id}
                <b>{pm.name}</b>
              </span>
            </div>
            <div className="description text-muted" style={{ marginTop: '5px;' }}>
              descripton: <span>{pm.description}</span>
            </div>
            <div className="more-info">
              <Row>
                <Col span="12">
                  <span>{'START_DATE'}</span>
                  <label>
                    <b>{'PLANNED'}:</b> {renderDateTime(pm.startDate)}
                  </label>
                  <label>
                    <b>{'ACTUAL'}:</b> {pm.actualStartDate}
                  </label>
                </Col>

                <Col span="12">
                  <span>{'END_DATE'}</span>
                  <label>
                    <b>{'PLANNED'}:</b> {renderDateTime(pm.endDate)}
                  </label>
                  <label>
                    <b>{'ACTUAL'}:</b> {renderDateTime(pm.actualEndDate)}
                  </label>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </>
    )
  }

  renderMonthData = (data: any, index: number) => {
    return (
      <td key={index} className="col-month">
        <div className="text-truncate d-flex flex-column">
          {(data.planMaintenance || []).map((pm, index) => this.renderPlanMaintenanceItem(pm, index))}
        </div>
      </td>
    )
  }

  handleAddOrRemoveMonthToViewList = async (month, isRemove = false) => {
    const {
      planMaintenanceCalendarStore: { displayMonths, excludeMonths }
    } = this.props
    let displayMonthsFiltered: any = [],
      excludeMonthsFiltered: any = []
    if (isRemove) {
      displayMonthsFiltered = displayMonths.filter((displayMonth) => displayMonth !== month)

      excludeMonthsFiltered = monthNamesShort.filter(
        (excludeMonth) => displayMonthsFiltered.findIndex((displayMonth) => displayMonth === excludeMonth.name) === -1
      )
    } else {
      excludeMonthsFiltered = excludeMonths.filter((excludeMonth) => excludeMonth !== month)
      displayMonthsFiltered = monthNamesShort.filter(
        (displayMonth) => excludeMonthsFiltered.findIndex((exMonth) => exMonth === displayMonth.name) === -1
      )
    }
    this.props.planMaintenanceCalendarStore.setMonthFilter(displayMonthsFiltered, excludeMonthsFiltered)
    await this.props.planMaintenanceCalendarStore.prepareMonthData()
  }

  public render() {
    const {
      planMaintenanceStore: { statusOptions },
      planMaintenanceCalendarStore: { filterObject, events, displayMonths, excludeMonths },
      assetTypeStore: { assetTypeOptions }
    } = this.props
    const filterComponent = (
      <>
        <Row gutter={[16, 8]}>
          <Col sm={{ span: 6, offset: 0 }}>
            <label>{this.L('FILTER_YEAR')}</label>
            <DatePicker
              format={yearFormat}
              picker="year"
              style={{ width: '100%' }}
              value={filterObject.year}
              onChange={(value) => this.handleSearch('year', value)}
            />
          </Col>
          <Col sm={{ span: 6, offset: 0 }}>
            <label>{this.L('FILTER_STATUS')}</label>
            <Select
              showArrow
              allowClear
              onChange={(value) => this.handleSearch('statusIds', value)}
              style={{ width: '100%' }}>
              {this.renderOptions(statusOptions)}
            </Select>
          </Col>
          <Col sm={{ span: 6, offset: 0 }}>
            <label>{this.L('FILTER_ASSET_TYPE')}</label>
            <Select
              showSearch
              showArrow
              allowClear
              filterOption={false}
              onSearch={this.getListAssetType}
              onChange={(value) => this.handleSearch('assetTypeIds', value)}
              style={{ width: '100%' }}>
              {this.renderOptions(assetTypeOptions)}
            </Select>
          </Col>
        </Row>
        <Row gutter={[16, 8]}>
          <Col span="24">
            <span className="mr-2">{this.L('ADD_INTO_VIEW_LIST')}:</span>

            {excludeMonths.map((excludeMonth, index) => (
              <Tag
                key={index}
                className="cell-round pointer mr-1"
                color={'#1890ff'}
                onClick={() => this.handleAddOrRemoveMonthToViewList(excludeMonth)}>
                {this.L(excludeMonth.name)}
              </Tag>
            ))}
          </Col>
        </Row>
      </>
    )
    return this.isGranted(appPermissions.planMaintenance.page) ? (
      <div className="plan-maintenance-container">
        {/* <Filter title={this.L('FILTER')} handleRefresh={this.getAll}>
          <Row gutter={[16, 8]}>
            <Col sm={{ span: 6, offset: 0 }}>
              <label>{this.L('FILTER_YEAR')}</label>
              <DatePicker
                format={yearFormat}
                picker="year"
                style={{ width: '100%' }}
                value={filterObject.year}
                onChange={(value) => this.handleSearch('year', value)}
              />
            </Col>
            <Col sm={{ span: 6, offset: 0 }}>
              <label>{this.L('FILTER_STATUS')}</label>
              <Select
                showArrow
                allowClear
                onChange={(value) => this.handleSearch('statusIds', value)}
                style={{ width: '100%' }}>
                {this.renderOptions(statusOptions)}
              </Select>
            </Col>
            <Col sm={{ span: 6, offset: 0 }}>
              <label>{this.L('FILTER_ASSET_TYPE')}</label>
              <Select
                showSearch
                showArrow
                allowClear
                onChange={(value) => this.handleSearch('assetTypeIds', value)}
                style={{ width: '100%' }}>
                {this.renderOptions(assetTypeOptions)}
              </Select>
            </Col>
          </Row>
          <Row gutter={[16, 8]}>
            <Col span="24">
              <span className="mr-2">{this.L('ADD_INTO_VIEW_LIST')}:</span>
              {excludeMonths.map((excludeMonth, index) => (
                <Tag
                  key={index}
                  className="cell-round pointer mr-1"
                  color={'#1890ff'}
                  onClick={() =>
                    this.handleAddOrRemoveMonthToViewList(excludeMonth)
                  }>
                  {this.L(excludeMonth)}
                </Tag>
              ))}
            </Col>
          </Row>
        </Filter> */}
        <DataTable extraFilterComponent={filterComponent}></DataTable>
        <Spin spinning={this.props.planMaintenanceCalendarStore.isLoading}>
          <Row
            className="wrap-pipeline-screen"
            gutter={[16, 8]}
            style={{ paddingTop: '1rem', height: '100%', minHeight: 0 }}>
            <Col span="24">
              <Card className="calendar-view-wrapper" style={{ height: '100%' }}>
                <div className="wrap-table-scrollable">
                  <div className="wrap-table-scroll">
                    <div className="wrap-pipeline-scrollable">
                      <table className="table no-hover tableFixHead" style={{ tableLayout: 'fixed' }}>
                        <thead>
                          <tr>
                            <th className="col-order">&nbsp;</th>
                            <th className="col-asset">&nbsp;</th>
                            {displayMonths.length > 0 ? (
                              displayMonths.map((monthNameShort, index) => (
                                <th
                                  className="col-month text-center pointer"
                                  onClick={() => this.handleAddOrRemoveMonthToViewList(monthNameShort.value, true)}
                                  key={index}>
                                  {monthNameShort.name}
                                </th>
                              ))
                            ) : (
                              <th className="col-month text-center pointer">&nbsp;</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {events.map((event, index) => {
                            const months = displayMonths.map((item) => item.value)

                            return (
                              <>
                                <tr key={`asset-${index}`} className="row-sticky">
                                  <th>
                                    <span
                                      className="text-uppercase"
                                      style={{
                                        position: 'absolute',
                                        // minWidth: '50vw',
                                        whiteSpace: 'nowrap'
                                      }}>
                                      {index + 1}/{event.assetTypeName}
                                    </span>
                                  </th>
                                  <td colSpan={displayMonths.length + 1}></td>
                                </tr>
                                {event.assets.map((asset, indexAsset) => {
                                  return (
                                    <tr key={index}>
                                      <th className="text-center col-order ">{indexAsset + 1}</th>
                                      <th key={indexAsset} className="col-asset">
                                        {asset.assetName}
                                      </th>
                                      {months.length > 0 ? (
                                        asset.data.map((data, indexMonth) => {
                                          return months.includes(data.month)
                                            ? this.renderMonthData(data, indexMonth)
                                            : null
                                        })
                                      ) : (
                                        <td className="col-month">&nbsp;</td>
                                      )}
                                    </tr>
                                  )
                                })}
                              </>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Spin>
      </div>
    ) : (
      <NoRole />
    )
  }
}

export default PlanMaintenanceCalendar
