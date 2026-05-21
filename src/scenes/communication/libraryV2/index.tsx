import FileManager, {
  Column,
  ContextMenu,
  Details,
  Item,
  ItemView,
  Permissions,
  Toolbar
} from 'devextreme-react/file-manager'
import { customizeIcon } from '@lib/helper'
import { Card, Modal } from 'antd'
import LibraryStore from '@stores/communication/libraryStore'
import ProjectStore from '@stores/project/projectStore'
import RoleStore from '@stores/administrator/roleStore'
import FileStore from '@stores/common/fileStore'
import NoRole from '@components/ComponentNoRole'
import { appPermissions, typeFile } from '@lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import DocumentFileFormModal from './components/documentFileFormModal'
import React from 'react'
import { L, LNotification } from '@lib/abpUtility'
import LibraryFolderFormModal from './components/libraryFolderFormModal'
import { AppComponentListBase } from '@components/AppComponentBase'
import PDFFileViewer from '@components/FileUploadV2/PdfFileViewer'
import OfficeFileViewer from '@components/FileUploadV2/OfficeFileViewer'
import './index.css'
const confirm = Modal.confirm

export interface ILibrariesProps {
  libraryStore: LibraryStore
  projectStore: ProjectStore
  roleStore: RoleStore
  fileStore: FileStore
}

export interface ILibrariesState {
  currentPath: string
  popupVisible: boolean
  imageItemToDisplay: any
  maxResultFolderCount: number
  skipFolderCount: number
  skipCount: number
  objectFolder: any[]
  modalDocumentVisible: boolean
  modalFolderVisible: boolean
  filterDocument: any
  showFile: boolean
  fileUrl: any
  typeShowFile: any
}
@inject(Stores.LibraryStore, Stores.ProjectStore, Stores.RoleStore, Stores.FileStore)
@observer
class LibraryPublicV2 extends AppComponentListBase<ILibrariesProps, ILibrariesState> {
  formFolderRef: any = React.createRef()
  formDocumentRef: any = React.createRef()
  formbao: any = React.createRef()
  state = {
    currentPath: 'Widescreen',
    popupVisible: false,
    imageItemToDisplay: {},
    maxResultFolderCount: 100,
    skipFolderCount: 0,
    skipCount: 0,
    objectFolder: [] as any,
    modalDocumentVisible: false,
    modalFolderVisible: false,
    filterDocument: { isActive: true },
    showFile: false,
    fileUrl: '',
    typeShowFile: ''
  }
  async componentDidMount() {
    this.isGranted(appPermissions.library.page) &&
      (await Promise.all([this.generateTreeFolder(), this.props.roleStore.getAllRoles()]))
  }

  getAllFolder = async (resetSkipCount?) => {
    await this.props.libraryStore.getAll({
      IsPublic: true,
      maxResultCount: this.state.maxResultFolderCount,
      skipCount: resetSkipCount ? 0 : this.state.skipFolderCount,
      isActive: true
    })
  }

  getAllDocument = async () => {
    await this.props.libraryStore.getAllDocument({
      IsPublic: true,
      maxResultCount: 100,
      skipCount: this.state.skipCount,
      ...this.state.filterDocument
    })
  }

  generateTreeFolder = async () => {
    await this.getAllFolder()
    await this.getAllDocument()
    this.mapFile()
  }

  mapFile = () => {
    const listFolder = [...this.props.libraryStore.folders.items]
    const listFile = [...this.props.libraryStore.documents.items].map((item) => ({ ...item, isDirectory: false }))

    const result = listFolder.map((folder) => {
      folder.isDirectory = true
      const matchedItems = listFile.filter((file) => file.libraryId === folder.id)
      return {
        ...folder,
        items: matchedItems.map((item) => ({
          ...item,
          name: item.file?.originalFileName ?? L('NO_FILE_UPLOAD'),
          size: item.file?.size,
          creatorUserName: item.creatorUser?.displayName
        }))
      }
    })

    this.setState({ objectFolder: result })
  }
  activateOrDeactivateDocument = (id: number, isActive) => {
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await this.props.libraryStore.activateOrDeactivateDocument(id, isActive)
        this.generateTreeFolder()
      }
    })
  }
  activateOrDeactivateLibrary = (id: number, isActive) => {
    const self = this
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.libraryStore.activateOrDeactivateLibrary(id, isActive)
        this.generateTreeFolder()
      }
    })
  }
  onViewDetailFolderOrDocument = (e) => {
    if (e?.fileSystemItem?.isDirectory === true) {
      if (e.itemData?.options?.action === 'view') {
        const id = e.fileSystemItem?.dataItem?.id
        this.createOrUpdateFolderModalOpen(id)
      }
      if (e.itemData?.options?.action === 'delete') {
        const id = e.fileSystemItem?.dataItem?.id
        const isActive = e.fileSystemItem?.dataItem?.isActive
        this.activateOrDeactivateLibrary(id, !isActive)
      }
    } else {
      if (e.itemData?.options?.action === 'view') {
        const id = e.fileSystemItem?.dataItem?.id

        this.createOrUpdateDocumentModalOpen(id)
      }
      if (e.itemData?.options?.action === 'delete') {
        const id = e.fileSystemItem?.dataItem?.id
        const isActive = e.fileSystemItem?.dataItem?.isActive
        this.activateOrDeactivateDocument(id, !isActive)
      }
    }
  }

  createOrUpdateFolderModalOpen = async (e) => {
    const { libraryStore, projectStore } = this.props

    if (!e) {
      await libraryStore.createLibrary()
    } else {
      await libraryStore.get(e)
      projectStore.buildingOptions = [...(libraryStore.editFolder?.buildings || [])]
    }

    this.setState({ modalFolderVisible: !this.state.modalFolderVisible })
    this.formFolderRef.current.setFieldsValue(libraryStore.editFolder)
  }

  createOrUpdateDocumentModalOpen = async (id) => {
    const { libraryStore } = this.props
    if (!id) {
      await libraryStore.createDocumentObject(undefined)
    } else {
      await libraryStore.getDocument(id)

      libraryStore.folderOptions = [libraryStore.editDocument?.library || {}]
    }
    this.setState({ modalDocumentVisible: !this.state.modalDocumentVisible })
    this.formDocumentRef.current?.setFieldsValue(libraryStore.editDocument)
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
      await this.generateTreeFolder()
      this.setState({ modalFolderVisible: false })
    })
  }
  handleCreateDocument = (files) => {
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
      await this.generateTreeFolder()
      this.setState({ modalDocumentVisible: false })
    })
  }

  changFilterOptionDocument = (value) => {
    if (value?.itemData?.isParent === false) {
      const statusActive = value.itemData.value
      this.setState({ filterDocument: { ...this.state.filterDocument, isActive: statusActive } })
      this.generateTreeFolder()
    }
  }

  onViewFileSupport = (e) => {
    const file = e?.file?.dataItem?.file
    if (file) {
      if (typeFile.MSOffice.includes(file.mimeType)) {
        this.setState({ showFile: true, typeShowFile: 'showOffice', fileUrl: file?.fileUrl })
      } else if (typeFile.pdf.includes(file.mimeType)) {
        this.setState({ showFile: true, typeShowFile: 'pdf', fileUrl: file?.fileUrl })
      } else if (typeFile.image.includes(file.mimeType)) {
        this.setState({ showFile: true, typeShowFile: 'image', fileUrl: file?.fileUrl })
      } else {
        this.setState({ showFile: false, typeShowFile: 'other', fileUrl: file?.fileUrl })
      }
    }
  }
  handleCancelViewFile = () => {
    this.setState({ showFile: false, typeShowFile: '', fileUrl: '' })
  }
  renderSwitch() {
    switch (this.state.typeShowFile) {
      case 'showOffice':
        return <OfficeFileViewer src={this.state.fileUrl} />
      case 'pdf':
        return <PDFFileViewer src={this.state.fileUrl} />
      case 'image':
        return <img alt="example" style={{ width: '100%' }} src={this.state.fileUrl} />
      default:
        return
    }
  }

  render() {
    const changeFilterDocument = {
      items: [
        {
          text:
            L('FILTER_DOCUMENT') +
            ': ' +
            (this.state.filterDocument.isActive === true
              ? L('ACTIVE')
              : this.state.filterDocument.isActive === false
              ? L('INACTIVE')
              : L('ALL')),
          icon: 'filter',
          isParent: true,
          items: [
            {
              text: L('ACTIVE'),
              isParent: false,
              value: true
            },
            {
              text: L('INACTIVE'),
              isParent: false,
              value: false
            },
            {
              text: L('ALL'),
              isParent: false,
              value: null
            }
          ]
        }
      ],
      onItemClick: this.changFilterOptionDocument
    }
    return this.isGranted(appPermissions.library.page) ? (
      <>
        <Card style={{ height: '100%' }}>
          <FileManager
            ref={this.formbao}
            style={{ height: '80vh' }}
            fileSystemProvider={this.state.objectFolder}
            customizeThumbnail={customizeIcon}
            onSelectedFileOpened={
              this.isGranted(appPermissions.library.detail) ? (e) => this.onViewFileSupport(e) : undefined
            }
            onContextMenuItemClick={this.onViewDetailFolderOrDocument}>
            <Permissions></Permissions>
            <ItemView showParentFolder={true} showFolders={true}>
              <Details>
                <Column dataField="thumbnail" />
                <Column dataField="name" caption={L('NAME_FILE')} />
                <Column dataField="isActive" caption={L('STATUS')} dataType="boolean" />
                <Column dataField="creationTime" caption={L('CREATE_AT')} dataType="datetime" />
                <Column dataField="creatorUserName" caption={L('CREATE_BY')} dataType="datetime" />
                <Column dataField="size" caption={L('SIZE')} />
              </Details>
            </ItemView>
            <Toolbar>
              {this.isGranted(appPermissions.library.create) && (
                <Item
                  widget="dxMenu"
                  location="before"
                  options={{
                    items: [
                      {
                        text: L('UPLOAD_FOLDER'),
                        icon: 'newfolder'
                      }
                    ],
                    onItemClick: () => this.createOrUpdateFolderModalOpen(undefined)
                  }}
                />
              )}
              <Item name="separator" location="before" />
              {this.isGranted(appPermissions.library.create) && (
                <Item
                  widget="dxMenu"
                  location="before"
                  options={{
                    items: [
                      {
                        text: L('UPLOAD_FILE'),
                        icon: 'plus'
                      }
                    ],
                    onItemClick: () => this.createOrUpdateDocumentModalOpen(undefined)
                  }}
                />
              )}
              <Item name="separator" location="before" />
              <Item widget="dxMenu" location="before" options={changeFilterDocument} />
              <Item name="separator" location="before" />
              <Item name="separator" location="before" />
              <Item
                widget="dxMenu"
                location="before"
                options={{
                  items: [
                    {
                      icon: 'refresh'
                    }
                  ],
                  onItemClick: () => this.generateTreeFolder()
                }}
              />
              <Item name="separator" location="after" />
              <Item name="switchView" />
            </Toolbar>
            <ContextMenu>
              {this.isGranted(appPermissions.library.update) && (
                <Item
                  text={L('VIEW_DETAIL')}
                  icon="rename"
                  options={{
                    action: 'view'
                  }}
                />
              )}
              {this.isGranted(appPermissions.library.delete) && (
                <Item
                  text={L('CHANGE_STATUS')}
                  icon="remove"
                  options={{
                    action: 'delete'
                  }}
                />
              )}
              <Item name="refresh" />
            </ContextMenu>
          </FileManager>
        </Card>
        <LibraryFolderFormModal
          libraryStore={this.props.libraryStore}
          projectStore={this.props.projectStore}
          roleStore={this.props.roleStore}
          formRef={this.formFolderRef}
          visible={this.state.modalFolderVisible}
          onCancel={() => this.createOrUpdateFolderModalOpen(null)}
          onCreate={this.handleCreateFolder}
        />
        {this.state.modalDocumentVisible && (
          <DocumentFileFormModal
            projectStore={this.props.projectStore}
            libraryStore={this.props.libraryStore}
            fileStore={this.props.fileStore}
            formRef={this.formDocumentRef}
            visible={this.state.modalDocumentVisible}
            onCancel={() => this.createOrUpdateDocumentModalOpen(null)}
            onCreate={this.handleCreateDocument}
          />
        )}
        <Modal
          style={{ top: 10 }}
          className="w-50"
          open={this.state.showFile}
          footer={null}
          onCancel={this.handleCancelViewFile}>
          {this.renderSwitch()}
        </Modal>
      </>
    ) : (
      <NoRole />
    )
  }
}

export default LibraryPublicV2
