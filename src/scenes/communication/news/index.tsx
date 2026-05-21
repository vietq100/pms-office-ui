import { Col, Input, Row, Select } from 'antd'
import { inject, observer } from 'mobx-react'
import * as React from 'react'
import { AppComponentListBase } from '@components/AppComponentBase'
import { portalLayouts } from '@components/Layout/Router/router.config'
import { L } from '@lib/abpUtility'
import AppConst, { appPermissions } from '@lib/appconst'
import NewsCategoryStore from '@stores/communication/newsCategoryStore'
import NewsStore from '@stores/communication/newsStore'
import ProjectStore from '@stores/project/projectStore'
import Stores from '@stores/storeIdentifier'
import NewsListView from './components/NewsListView'
import filter from 'lodash/filter'
import find from 'lodash/find'
import { newsCategoryFilterParams, projectFilterParams } from '@scenes/communication/news/filter.cf'
import debounce from 'lodash/debounce'
import DataTable from '@components/DataTable'
import { filterOptions } from '@lib/helper'
import withRouter from '@components/Layout/Router/withRouter'

const { activeStatus } = AppConst
const newsSendToTargets = [
  { label: 'ALL', value: '' },
  { label: 'SENT_TO_PROJECT', value: 1 },
  { label: 'SENT_TO_UNIT', value: 2 }
]

export interface INewsProps {
  navigate: any
  params: any
  newsStore: NewsStore
  projectStore: ProjectStore
  newsCategoryStore: NewsCategoryStore
}

export interface INewsState {
  maxResultCount: number
  skipCount: number
  newsId?: number
  filter: string
  loading: boolean
  selectedStatus?: string
  projectIds?: Array<number>
  categoryId?: number | string
  currentPage: number
  type: any
}

const Search = Input.Search

@inject(Stores.NewsStore, Stores.NewsCategoryStore, Stores.ProjectStore)
@observer
class News extends AppComponentListBase<INewsProps, INewsState> {
  constructor(props) {
    super(props)
    const defaultStatus = find(activeStatus, { value: 'true' }) || ({} as any)
    this.state = {
      type: '',
      maxResultCount: 10,
      skipCount: 0,
      newsId: 0,
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
    const { projectStore, newsCategoryStore } = this.props
    Promise.all([
      this.getAll(),
      projectStore.filterOptions(projectFilterParams),
      newsCategoryStore.getAll(newsCategoryFilterParams)
    ]).then(() => this.setState({ loading: false }))
  }

  getAll = async () => {
    await this.props.newsStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      keyword: this.state.filter,
      isActive: this.state.selectedStatus,
      categoryId: this.state.categoryId,
      projectIds: this.state.projectIds,
      type: this.state.type
    })
  }

  onFilterChange = (name, value) => {
    this.setState({ ...this.state, [name]: value, skipCount: 0, currentPage: 1 }, this.getAll)
  }

  updateSearch = debounce((event) => {
    this.setState({ filter: event.target?.value })
  }, 100)

  handleSearch = (value: string) => {
    this.setState({ filter: value, skipCount: 0, currentPage: 1 }, this.getAll)
  }

  onSelectStatus = (value: string) => {
    this.setState({ selectedStatus: value, skipCount: 0, currentPage: 1 }, this.getAll)
  }

  onCreate = () => {
    this.props.navigate(portalLayouts.newsCreate.path)
  }

  onDelete = (id: number, isActive: boolean) => {
    this.props.newsStore.delete(id, isActive).then(this.getAll)
  }
  onNotify = (id: number) => {
    return this.props.newsStore.notify(id)
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
    this.props.newsCategoryStore.getAll({
      ...newsCategoryFilterParams,
      keyword
    })
  }

  public render() {
    const { newsStore, projectStore, newsCategoryStore } = this.props
    const { selectedStatus, projectIds, categoryId } = this.state
    const keywordPlaceholder = `${this.L('NEWS_SUBJECT')}`
    const filterNews = filter(newsStore.news, (_new) => {
      if (!selectedStatus?.trim()) return true
      return `${_new.isActive}` === selectedStatus
    })
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search placeholder={keywordPlaceholder} onChange={this.updateSearch} onSearch={this.handleSearch} />
        </Col>
        <Col sm={{ span: 6, offset: 0 }} style={{ width: '100%' }}>
          <label>{this.L('NEWS_FILTER_PROJECT')}</label>
          <Select
            mode="multiple"
            showArrow
            filterOption={filterOptions}
            onChange={this.onSelectProject}
            style={{ width: '100%' }}
            value={projectIds}>
            {projectStore.projectOptions?.map((proj) => (
              <Select.Option key={proj.value} value={proj.value}>
                {proj.label}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }} style={{ width: '100%' }}>
          <label>{this.L('NEWS_FILTER_SEND_TO')}</label>
          <Select
            showArrow
            filterOption={filterOptions}
            onSelect={(value) => this.onFilterChange('type', value)}
            style={{ width: '100%' }}>
            {(newsSendToTargets || []).map((item) => (
              <Select.Option key={item.value} value={item.value}>
                {L(item.label)}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }} style={{ width: '100%' }}>
          <label>{this.L('NEWS_FILTER_CATEGORY')}</label>
          <Select
            showSearch
            placeholder={L('NEWS_SELECT_CATEGORY')}
            filterOption={false}
            onChange={this.onSelectCategory}
            style={{ width: '100%' }}
            value={categoryId as any}
            onSearch={debounce(this.handleSearchCategory, 200)}>
            {newsCategoryStore.pageResult?.items?.map((category, index) => (
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
          title={this.L('NEWS_LIST')}
          textAddNew={''}
          onCreate={this.onCreate}
          createPermission={appPermissions.news.create}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: newsStore.pageResult.totalCount,
            onChange: this.onPageChange
          }}>
          <NewsListView
            loading={this.props.newsStore.isLoading}
            news={filterNews}
            onDelete={this.onDelete}
            onNotify={this.onNotify}
          />
        </DataTable>
      </React.Fragment>
    )
  }
}

export default withRouter(News)
