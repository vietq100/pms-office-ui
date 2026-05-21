import { Col, Input, Row, Select } from 'antd'
import { inject, observer } from 'mobx-react'
import * as React from 'react'
import { AppComponentListBase } from '@components/AppComponentBase'
import { portalLayouts } from '@components/Layout/Router/router.config'
import { L } from '@lib/abpUtility'
import AppConst, { appPermissions } from '@lib/appconst'
import EventCategoryStore from '@stores/communication/eventCategoryStore'
import EventStore from '@stores/communication/eventStore'
import ProjectStore from '@stores/project/projectStore'
import Stores from '@stores/storeIdentifier'
import EventListView from './components/EventListView'
import './events.less'
import filter from 'lodash/filter'
import find from 'lodash/find'
import { eventCategoryFilterParams, projectFilterParams } from '@scenes/communication/events/filter.cf'
import debounce from 'lodash/debounce'
import DataTable from '@components/DataTable'
import withRouter from '@components/Layout/Router/withRouter'

const { activeStatus } = AppConst

export interface IEventProps {
  navigate: any
  eventStore: EventStore
  projectStore: ProjectStore
  eventCategoryStore: EventCategoryStore
}

export interface IEventState {
  maxResultCount: number
  skipCount: number
  eventId?: number
  filter: string
  loading: boolean
  selectedStatus?: string
  projectIds?: Array<number>
  categoryId?: number | string
  currentPage: number
  type: any
}

const Search = Input.Search

@inject(Stores.EventStore, Stores.EventCategoryStore, Stores.ProjectStore)
@observer
class Event extends AppComponentListBase<IEventProps, IEventState> {
  constructor(props) {
    super(props)
    const defaultStatus = find(activeStatus, { value: 'true' }) || ({} as any)
    this.state = {
      type: '',
      maxResultCount: 10,
      skipCount: 0,
      eventId: 0,
      filter: '',
      loading: false,
      selectedStatus: defaultStatus.value,
      currentPage: 1,
      projectIds: [],
      categoryId: ''
    }
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  componentDidMount() {
    this.setState({ loading: true })
    const { projectStore, eventCategoryStore } = this.props
    Promise.all([
      this.getAll(),
      projectStore.filterOptions(projectFilterParams),
      eventCategoryStore.getAll(eventCategoryFilterParams)
    ]).then(() => this.setState({ loading: false }))
  }

  getAll = async () => {
    await this.props.eventStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      keyword: this.state.filter,
      isActive: this.state.selectedStatus,
      categoryId: this.state.categoryId,
      projectIds: this.state.projectIds,
      type: this.state.type
    })
  }
  updateSearch = debounce((event) => {
    this.setState({ filter: event.target?.value })
  }, 100)

  onFilterChange = (name, value) => {
    this.setState({ ...this.state, [name]: value, skipCount: 0, currentPage: 1 }, this.getAll)
  }

  handleSearch = (value: string) => {
    this.setState({ filter: value, skipCount: 0, currentPage: 1 }, this.getAll)
  }

  onSelectStatus = (value: string) => {
    this.setState({ selectedStatus: value, skipCount: 0, currentPage: 1 }, this.getAll)
  }

  onCreate = () => {
    this.props.navigate(portalLayouts.eventCreate.path)
  }

  onDelete = (id: number, isActive: boolean) => {
    this.props.eventStore.delete(id, isActive).then(this.getAll)
  }
  onNotify = (id: number) => {
    return this.props.eventStore.notify(id)
  }

  onPageChange = (page) => {
    this.setState(
      {
        currentPage: page.current,
        skipCount: --page.current * this.state.maxResultCount
      },
      this.getAll
    )
  }

  onSelectProject = (projectIds: number[]) => {
    this.setState({ projectIds, skipCount: 0, currentPage: 1 }, this.getAll)
  }
  onSelectCategory = (categoryId: number) => {
    this.setState({ categoryId, skipCount: 0, currentPage: 1 }, this.getAll)
  }

  handleSearchCategory = (keyword) => {
    this.props.eventCategoryStore.getAll({
      ...eventCategoryFilterParams,
      keyword
    })
  }

  public render() {
    const { eventStore, eventCategoryStore } = this.props
    const { selectedStatus, categoryId } = this.state
    const keywordPlaceholder = `${this.L('EVENT_SUBJECT')}`
    const filterEvent = filter(eventStore.pageResult?.items, (_event) => {
      if (!selectedStatus?.trim()) return true
      return `${_event.isActive}` === selectedStatus
    })
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search placeholder={keywordPlaceholder} onChange={this.updateSearch} onSearch={this.handleSearch} />
        </Col>
        <Col sm={{ span: 6, offset: 0 }} style={{ width: '100%' }}>
          <label>{this.L('EVENT_FILTER_CATEGORY')}</label>
          <Select
            showSearch
            placeholder={L('EVENTS_SELECT_CATEGORY')}
            filterOption={false}
            allowClear
            onChange={this.onSelectCategory}
            style={{ width: '100%' }}
            value={categoryId as any}
            onSearch={debounce(this.handleSearchCategory, 200)}>
            {eventCategoryStore.pageResult?.items?.map((category, index) => (
              <Select.Option key={index} value={category.id}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
          <Select onChange={this.onSelectStatus} style={{ width: '100%' }} value={selectedStatus}>
            {activeStatus.map((status, index) => (
              <Select.Option key={index} value={status.value}>
                {status.label}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
    )
    return (
      <React.Fragment>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          title={this.L('EVENTS_LIST')}
          textAddNew={''}
          onCreate={this.onCreate}
          createPermission={appPermissions.event.create}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: eventStore.pageResult.totalCount,
            onChange: this.onPageChange
          }}>
          <EventListView
            loading={this.props.eventStore.isLoading}
            events={filterEvent}
            onDelete={this.onDelete}
            onNotify={this.onNotify}
          />
        </DataTable>
      </React.Fragment>
    )
  }
}

export default withRouter(Event)
