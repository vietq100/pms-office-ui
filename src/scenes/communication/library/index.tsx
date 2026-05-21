import * as React from 'react'

import { Col, Input, Modal, Row, Select, List, Card, Button, DatePicker } from 'antd'
import { FolderAddOutlined, SearchOutlined } from '@ant-design/icons'

import { AppComponentListBase } from '../../../components/AppComponentBase'

import DataTable from '../../../components/DataTable'
import LibraryFolderFormModal from './components/libraryFolderFormModal'
import DocumentFileFormModal from './components/documentFileFormModal'
import DocumentFile from './components/documentFile'
import { L, LNotification } from '../../../lib/abpUtility'
import LibraryStore from '../../../stores/communication/libraryStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppConst, { appPermissions, dateFormat } from '../../../lib/appconst'
import ProjectStore from '../../../stores/project/projectStore'
import RoleStore from '../../../stores/administrator/roleStore'
import FileStore from '../../../stores/common/fileStore'
import InfiniteScroll from 'react-infinite-scroller'
import Spin from 'antd/lib/spin'
import { FilterIcon } from '@components/Icon'
import debounce from 'lodash/debounce'
import DocumentFolderPrivate from '../libraryPrivate/components/libraryFolder'
import NoRole from '@components/ComponentNoRole'

const { activeStatus } = AppConst
const { RangePicker } = DatePicker

export interface ILibrariesProps {
  libraryStore: LibraryStore
  projectStore: ProjectStore
  roleStore: RoleStore
  fileStore: FileStore
}

export interface ILibrariesState {
  modalFolderVisible: boolean
  modalDocumentVisible: boolean
  loading: boolean
  maxResultFolderCount: number
  skipFolderCount: number
  allFolders: any[]
  maxResultCount: number
  skipCount: number
  libraryId?: number
  filters: any
  filterDocuments: any
  IsPublic: boolean
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.LibraryStore, Stores.ProjectStore, Stores.RoleStore, Stores.FileStore)
@observer
class Libraries extends AppComponentListBase<ILibrariesProps, ILibrariesState> {
  formFolderRef: any = React.createRef()
  formDocumentRef: any = React.createRef()

  state = {
    modalFolderVisible: false,
    modalDocumentVisible: false,
    loading: false,
    allFolders: [] as any,
    maxResultFolderCount: 100,
    skipFolderCount: 0,
    IsPublic: true,
    maxResultCount: 100,
    skipCount: 0,
    libraryId: 0,
    filters: {
      projectIds: undefined,
      buildingIds: undefined,
      isActive: 'true'
    },
    filterDocuments: { libraryIds: undefined, isActive: 'true', keyword: '' }
  }

  async componentDidMount() {
    this.isGranted(appPermissions.library.page) && (await Promise.all([this.getAll(true), this.getAllDocument()]))
    this.props.roleStore.getAllRoles()
  }

  getAll = async (resetSkipCount?) => {
    this.setState({ loading: true })
    await this.props.libraryStore.getAll({
      IsPublic: this.state.IsPublic,
      maxResultCount: this.state.maxResultFolderCount,
      skipCount: resetSkipCount ? 0 : this.state.skipFolderCount,
      ...this.state.filters
    })
    this.setState({
      loading: false,
      allFolders: resetSkipCount
        ? [...this.props.libraryStore.folders.items]
        : this.state.allFolders.concat(this.props.libraryStore.folders.items)
    })
  }

  getAllDocument = async () => {
    await this.props.libraryStore.getAllDocument({
      IsPublic: this.state.IsPublic,
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filterDocuments
    })
  }

  findProjects = async (keyword) => {
    await this.props.projectStore.filterOptions({ keyword })
  }

  findBuildings = async (keyword) => {
    const { filters } = this.state
    if (!filters.projectIds) {
      this.props.projectStore.filterBuildingOptions({})
      this.setState({ filters: { ...filters, buildingIds: undefined } })
      return
    }
    await this.props.projectStore.filterBuildingOptions({
      keyword,
      projectId: filters.projectIds
    })
  }

  handleTableChange = (currentPage: any) => {
    this.setState({ skipCount: currentPage * this.state.maxResultCount! }, async () => await this.getAllDocument())
  }

  hideOrShowModal = (name) => {
    this.setState({ ...this.state, [name]: !this.state[name] })
  }

  createOrUpdateFolderModalOpen = async (id?: number) => {
    const { libraryStore, projectStore } = this.props
    const { filters } = this.state
    if (!id) {
      await libraryStore.createLibrary(filters.projectIds)
    } else {
      await libraryStore.get(id)
      projectStore.buildingOptions = [...(libraryStore.editFolder?.buildings || [])] || []
    }

    this.setState({ libraryId: id })
    this.hideOrShowModal('modalFolderVisible')
    this.formFolderRef.current.setFieldsValue(libraryStore.editFolder)
  }

  createOrUpdateDocumentModalOpen = async (id?: number) => {
    const { libraryStore } = this.props
    if (!id) {
      await libraryStore.createDocumentObject(this.state.filters.projectIds)
    } else {
      await libraryStore.getDocument(id)
      libraryStore.folderOptions = [libraryStore.editDocument?.library || {}]
    }
    this.setState({ libraryId: id })
    this.hideOrShowModal('modalDocumentVisible')
    this.formDocumentRef.current.setFieldsValue(libraryStore.editDocument)
  }

  activateOrDeactivateLibrary = (id: number, isActive) => {
    const self = this
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.libraryStore.activateOrDeactivateLibrary(id, isActive)
        this.setState({
          allFolders: (this.state.allFolders = this.state.allFolders.filter((x) => x.id !== id))
        })
        this.handleSearchDocument('keyword', this.state.filterDocuments?.keyword || '')
      }
    })
  }

  activateOrDeactivateDocument = (id: number, isActive) => {
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await this.props.libraryStore.activateOrDeactivateDocument(id, isActive)
        this.getAllDocument()
      }
    })
  }

  handleCreateFolder = () => {
    const form = this.formFolderRef.current

    form.validateFields().then(async (values: any) => {
      values.isPublic = true
      if (!this.props.libraryStore.editFolder?.id) {
        await this.props.libraryStore.create(values)
      } else {
        await this.props.libraryStore.update({
          ...this.props.libraryStore.editFolder,
          ...values
        })
      }

      form.resetFields()
      await this.getAll(true)
      this.setState({ modalFolderVisible: false })
    })
  }

  handleCreateDocument = async (files) => {
    const form = this.formDocumentRef.current

    const newFiles = files.filter((item) => !item?.guid)

    form.validateFields().then(async (values: any) => {
      if (!this.props.libraryStore.editDocument?.id) {
        await this.props.libraryStore.createDocument(values, files)
      } else {
        await this.props.libraryStore.updateDocument(
          {
            ...this.props.libraryStore.editDocument,
            ...values
          },

          newFiles
        )
      }

      form.resetFields()
      await this.getAllDocument()
      this.setState({ modalDocumentVisible: false })
    })
  }

  handleLoadMoreFolder = (page) => {
    if (this.props.libraryStore.folders.totalCount <= this.state.skipFolderCount) {
      return
    }
    this.setState({ skipFolderCount: page * this.state.maxResultFolderCount! })
    this.getAll()
  }

  handleSearch = (name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value } }, async () => {
      if (name === 'projectIds') {
        this.findBuildings('')
        this.handleSearchDocument(name, value)
      }
      await this.getAll(true)
    })
  }

  folderSearch = debounce(this.handleSearch, 300)

  handleSearchDocument = (name, value) => {
    const { filterDocuments } = this.state
    this.setState({ filterDocuments: { ...filterDocuments, [name]: value } }, async () => {
      await this.getAllDocument()
    })
  }

  public render() {
    const {
      libraryStore: { folders, documents }
    } = this.props
    const { filters, filterDocuments, allFolders } = this.state
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 12, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            maxLength={200}
            placeholder={this.L('LIBRARY_DOCUMENT_NAME')}
            onSearch={(value) => this.handleSearchDocument('keyword', value)}
          />
        </Col>
        <Col sm={{ span: 12, offset: 0 }}>
          <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
          <Select
            defaultValue={filters.isActive}
            onChange={(value) => this.handleSearchDocument('isActive', value)}
            style={{ width: '100%' }}>
            {this.renderOptions(activeStatus)}
          </Select>
        </Col>
        <Col sm={{ span: 12, offset: 0 }}>
          <label>{L('FILTER_FROM_TO_DATE_EXPIRED')}</label>
          <RangePicker
            format={dateFormat}
            onChange={(value) => this.handleSearchDocument('dateFromToExpired', value)}
            style={{ width: '100%' }}
            placeholder={[L('FROM_DATE'), L('TO_DATE')]}
          />
        </Col>
        <Col sm={{ span: 12, offset: 0 }}>
          <label>{L('FILTER_FROM_TO_DATE_TAKEN_DOWN')}</label>
          <RangePicker
            format={dateFormat}
            onChange={(value) => this.handleSearchDocument('dateFromToTakenDown', value)}
            style={{ width: '100%' }}
            placeholder={[L('FROM_DATE'), L('TO_DATE')]}
          />
        </Col>
      </Row>
    )

    return this.isGranted(appPermissions.library.page) ? (
      <Row gutter={[16, 8]} id="library-page">
        <Col lg={8} xs={24} className="col-folder">
          <Card bodyStyle={{ height: '100%' }} bordered={false} className="wrap-folder-list">
            <Row gutter={[16, 8]} className="mb-3">
              <Col sm={{ span: 24, offset: 0 }}>
                <Input
                  addonBefore={<SearchOutlined />}
                  className="full-width txt-search-library"
                  placeholder={L('LIBRARY_FOLDER_NAME')}
                  onChange={(event) => this.folderSearch('keyword', event.target.value)}
                  addonAfter={<FilterIcon style={{ display: 'flex' }} />}
                  size="large"
                />
              </Col>
            </Row>
            <div style={{ height: 'calc(100% - 120px)', overflow: 'auto' }}>
              <InfiniteScroll
                initialLoad={false}
                pageStart={0}
                loadMore={this.handleLoadMoreFolder}
                hasMore={!this.state.loading && this.state.skipCount < folders.totalCount}
                useWindow={false}>
                <List
                  rowKey="id"
                  itemLayout="horizontal"
                  size="small"
                  dataSource={allFolders || []}
                  loading={this.props.libraryStore.isLoading}
                  renderItem={(folder) => (
                    <DocumentFolderPrivate
                      selectedFolderId={filterDocuments.libraryIds}
                      folder={folder}
                      findDocuments={this.handleSearchDocument}
                      showUpdateModal={this.createOrUpdateFolderModalOpen}
                      onUpdateStatus={this.activateOrDeactivateLibrary}
                    />
                  )}
                />
              </InfiniteScroll>
              <div className="folder-footer">
                {this.isGranted(appPermissions.library.create) && (
                  <Button
                    shape="round"
                    size="large"
                    className={'btn-primary-outlined'}
                    icon={<FolderAddOutlined />}
                    onClick={() => this.createOrUpdateFolderModalOpen()}>
                    {L('ADD_FOLDER')}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </Col>
        <Col lg={16} xs={24}>
          <DataTable
            extraFilterComponent={filterComponent}
            onRefresh={this.getAll}
            title={this.L('DOCUMENT_LIST')}
            textAddNew={''}
            onCreate={this.createOrUpdateDocumentModalOpen}
            createPermission={appPermissions.library.create}>
            <Spin spinning={this.props.libraryStore.isLoadingDocument}>
              <div
                style={{
                  height: 'calc(100vh - 325px)',
                  overflowY: 'auto',
                  boxShadow: '0 4px 32px rgb(110 186 196 / 16%)'
                }}>
                <Row gutter={[16, 16]}>
                  {(documents.items || []).map((document, index) => {
                    return (
                      <Col xs={24} sm={12} md={12} lg={8} xl={8} xxl={6} key={index}>
                        <DocumentFile
                          document={document}
                          openModal={this.createOrUpdateDocumentModalOpen}
                          onUpdateStatus={this.activateOrDeactivateDocument}
                        />
                      </Col>
                    )
                  })}
                </Row>
              </div>
            </Spin>
          </DataTable>
          <LibraryFolderFormModal
            libraryStore={this.props.libraryStore}
            projectStore={this.props.projectStore}
            roleStore={this.props.roleStore}
            formRef={this.formFolderRef}
            visible={this.state.modalFolderVisible}
            onCancel={() => this.hideOrShowModal('modalFolderVisible')}
            onCreate={this.handleCreateFolder}
          />
          {this.state.modalDocumentVisible && (
            <DocumentFileFormModal
              projectStore={this.props.projectStore}
              libraryStore={this.props.libraryStore}
              fileStore={this.props.fileStore}
              formRef={this.formDocumentRef}
              visible={this.state.modalDocumentVisible}
              onCancel={() => this.hideOrShowModal('modalDocumentVisible')}
              onCreate={this.handleCreateDocument}
            />
          )}
        </Col>
      </Row>
    ) : (
      <NoRole />
    )
  }
}

export default Libraries
