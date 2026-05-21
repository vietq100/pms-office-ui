import { InboxOutlined } from '@ant-design/icons/lib'
import { Upload, message } from 'antd'
import AppComponentBase from '../AppComponentBase'
import { inject, observer } from 'mobx-react'
import Stores from '../../stores/storeIdentifier'
import FileStore from '../../stores/common/fileStore'
import { L, LError, LNotification } from '@lib/abpUtility'
import AppConsts, { documentTypes, fileTypeGroup } from '@lib/appconst'
import Modal from 'antd/lib/modal'
import { renderDocuments, renderDocumentsContractor } from '@components/FileUploadV2/FileDocuments'
import FileImages from '@components/FileUploadV2/FileImages'
import OfficeFileViewer from './OfficeFileViewer'
import PDFFileViewer from './PdfFileViewer'

const { Dragger } = Upload
const { moduleName } = AppConsts
const confirm = Modal.confirm
interface IFileUploadWrapProps {
  type?: string
  parentId?: string
  fileStore: FileStore
  onRemoveFile?: (file) => void
  beforeUploadFile: (file) => boolean
  acceptedFileTypes?: string[]
  maxFile?: number // Validate file size in Mb
  maxSize?: number // Validate file size in Mb
  totalSize?: number
  disabled?: boolean
  multiple?: boolean
  specialModuleName?: string
  columnDataModule?: any
  fileDocument?: any[]
  getFileLength?: (fileLength) => void
  getFile?: (file) => void
  height?: number
}

export function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

@inject(Stores.FileStore)
@observer
class FileUploadWrapV2 extends AppComponentBase<IFileUploadWrapProps> {
  state = {
    files: [] as any[],
    combineFileTypes: this.props.acceptedFileTypes?.join(','),
    previewImage: '',
    previewVisible: false,
    previewVisibleOfficeFile: false,
    previewOfficeFile: '',
    previewTitle: '',
    previewVisiblePDFFile: false,
    previewPDFFile: '',
    previewPDFTitle: '',
    totalSize: this.props.totalSize ? this.props.totalSize : 20
  }

  componentDidMount = async () => {
    if (this.props.parentId) {
      await this.initFiles()
    } else {
      this.props.fileStore.currentFiles = []
    }
  }

  componentDidUpdate = async (prevProps) => {
    if (prevProps.parentId !== this.props.parentId) {
      await this.initFiles()
    }
    if (prevProps.fileDocument !== this.props.fileDocument) {
      await this.initFiles()
    }
  }

  initFiles = async () => {
    if (!this.props.parentId) {
      this.setState({ files: [] })
      return
    }
    if (this.props.fileDocument) {
      if (this.props.specialModuleName) {
        this.setState({
          files: this.props.fileDocument?.filter((item: any) => item.moduleName === this.props.specialModuleName)
        })
      } else {
        this.setState({ files: this.props.fileDocument })
      }
    } else {
      const result = await this.props.fileStore.getFiles(this.props.parentId)

      this.props.getFile && this.props.getFile(result)
      if (this.props.specialModuleName) {
        this.setState({
          files: result?.filter((item: any) => item.moduleName === this.props.specialModuleName)
        })
        this.props.getFileLength &&
          this.props.getFileLength(
            result?.filter((item: any) => item.moduleName === this.props.specialModuleName).length
          )
      } else {
        this.setState({ files: result })
        this.props.getFileLength && this.props.getFileLength(result?.length)
      }
    }
  }

  handleRemoveFile = async (file) => {
    confirm({
      title: LNotification('DO_YOU_WANT_TO_DELETE_FILE'),
      content: LNotification('DELETE_FILE_NOT_RECOVERY'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        // this.setState({
        //   totalSize: (Number(this.state.totalSize) + Number(file.size / 1024 / 1024)).toFixed(2)
        // })
        if (file.id) {
          await this.props.fileStore.delete(file.guid)
          this.setState({
            files: this.state.files.filter((item) => item.guid !== file.guid)
          })
          this.props.getFileLength && this.props.getFileLength(this.state.files.length)
          return
        }
        const index = this.state.files.indexOf(file)
        const newFileList = this.state.files.slice()
        newFileList.splice(index, 1)
        this.setState({ files: newFileList })
        this.props.onRemoveFile && this.props.onRemoveFile(file)
      }
    })
  }

  handleBeforeUploadFile = async (file) => {
    const fileList = [...this.state.files]

    // Validate file size in Mb
    if (this.props.maxSize && this.props.maxSize < file.size / 1024 / 1024) {
      message.warning(LError('MAX_FILE_SIZE_UPLOAD_{0}_MB', this.props.maxSize))
      return false
    }
    // if (file?.size / 1024 / 1025 > this.state.totalSize) {
    //   message.warning(LError('MAX_SIZE_REMAIN_UPLOAD_{0}', this.state.totalSize))
    //   return
    // } else {
    //   this.setState({
    //     totalSize: (Number(this.state.totalSize) - Number(file.size / 1024 / 1024)).toFixed(2)
    //   })
    // }

    if (this.props.maxFile && this.props.maxFile <= fileList.length) {
      message.warning(LError('MAX_FILE_UPLOAD_{0}', this.props.maxFile))
      return false
    }

    // Validate file type
    const extension = `.${file.name?.split('.').pop()}`
    if (
      !extension ||
      (this.props.acceptedFileTypes &&
        this.props.acceptedFileTypes.findIndex((fileType) => fileType === extension) === -1)
    ) {
      message.warning(LError('UNACCEPTED_FILE_TYPE_{0}', extension))
      return false
    }

    return true
  }

  onChange = async (info) => {
    const { file } = info
    if (!(await this.handleBeforeUploadFile(file))) {
      return
    }

    const files = [...this.state.files, file]
    this.setState({ files }, () => {
      if (this.props.beforeUploadFile) {
        this.props.beforeUploadFile(file.originFileObj ?? file)
        this.props.getFileLength && this.props.getFileLength(files.length)
      }
    })
  }

  handleDownload = (file) => {
    window.open(file.downloadUrl, '_blank')
  }

  handlePreview = async (file) => {
    const extension = `.${file.name?.split('.').pop()}`
    const findOffice = fileTypeGroup.office.find((element) => element === extension)
    const findPdf = fileTypeGroup.pdf.find((element) => element === extension)
    if (findPdf) {
      this.setState({
        previewPDFFile: file.url || file.preview,
        previewVisiblePDFFile: true,

        previewPDFTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1)
      })
    } else if (findOffice) {
      this.setState({
        previewOfficeFile: file.fileUrl || file.url || file.preview,
        previewVisibleOfficeFile: true,

        previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1)
      })
    } else {
      if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj)
      }

      this.setState({
        previewImage: file.url || file.preview,
        previewVisible: true,

        previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1)
      })
    }
  }

  handleCancelPreview = () => this.setState({ previewVisible: false, previewImage: '' })

  handleCancelPreviewVisibleOfficeFile = () => this.setState({ previewVisibleOfficeFile: false, previewOfficeFile: '' })
  handleCancelPreviewVisiblePdfFile = () => this.setState({ previewVisiblePDFFile: false, previewPDFFile: '' })
  previewVisiblePDFFile
  render() {
    const {
      previewVisible,
      previewImage,
      previewTitle,
      files,
      previewVisibleOfficeFile,
      previewOfficeFile,
      previewPDFFile,
      previewVisiblePDFFile,
      previewPDFTitle
    } = this.state
    const { multiple } = this.props
    return (
      <div>
        <Dragger
          height={this.props.height}
          multiple={multiple || false}
          onRemove={this.handleRemoveFile}
          onChange={this.onChange}
          fileList={[]}
          disabled={this.props.disabled}
          beforeUpload={() => false}>
          <div>
            <InboxOutlined style={{ fontSize: '250%', color: '#6ebac4', marginTop: -10 }} />
            <br />
            <label style={{ fontWeight: 600 }}>{L('FILE_INSTRUCTION')}</label>
            <br />
            <label>
              {this.props.acceptedFileTypes && this.props.acceptedFileTypes.length
                ? L('FILE_ACCEPTED_FILE_TYPE_{0}', this.state.combineFileTypes)
                : ''}
            </label>
          </div>
        </Dragger>
        <br />
        {this.props.type === documentTypes.image ? (
          <FileImages files={files} wrapClass="" handleRemoveFile={this.handleRemoveFile} />
        ) : this.props.columnDataModule === moduleName.contractor ? (
          renderDocumentsContractor(files, this.handlePreview, this.handleDownload, this.handleRemoveFile)
        ) : (
          renderDocuments(files, this.handlePreview, this.handleDownload, this.handleRemoveFile, this.props.disabled)
        )}

        <Modal open={previewVisible} title={previewTitle} footer={null} onCancel={this.handleCancelPreview}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>

        <Modal
          className="w-100"
          style={{ top: 20 }}
          open={previewVisiblePDFFile}
          title={previewPDFTitle}
          footer={null}
          onCancel={this.handleCancelPreviewVisiblePdfFile}>
          <div className="full-width d-flex justify-content-center" style={{ overflow: 'hiden', maxHeight: '88vh' }}>
            <PDFFileViewer src={previewPDFFile} />
          </div>
        </Modal>

        <Modal
          className="w-50"
          open={previewVisibleOfficeFile}
          title={previewTitle}
          footer={null}
          onCancel={this.handleCancelPreviewVisibleOfficeFile}>
          <div className="full-width d-flex justify-content-center" style={{ overflow: 'auto', maxHeight: '60vh' }}>
            <OfficeFileViewer src={previewOfficeFile} />
          </div>
        </Modal>
      </div>
    )
  }
}

export default FileUploadWrapV2
