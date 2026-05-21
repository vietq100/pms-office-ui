import { InboxOutlined } from '@ant-design/icons/lib'
import { Upload, message } from 'antd'
import AppComponentBase from '../AppComponentBase'
import { inject, observer } from 'mobx-react'
import Stores from '../../stores/storeIdentifier'
import FileStore from '../../stores/common/fileStore'
import { L, LError } from '@lib/abpUtility'
import { documentTypes } from '@lib/appconst'
import Modal from 'antd/lib/modal'
import { renderDocuments } from '@components/FileUpload/FileDocuments'
import FileImages from '@components/FileUpload/FileImages'
const { Dragger } = Upload

interface IFileUploadWrapProps {
  type?: string
  parentId?: string
  fileStore: FileStore
  onRemoveFile: (file) => void
  beforeUploadFile: (file) => boolean
  acceptedFileTypes?: string[]
  maxFile?: number
  maxSize?: number // Validate file size in Mb
  disabled?: boolean // Validate file size in Mb
  multiple?: boolean
  specialModuleName?: string
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
class FileUploadWrap extends AppComponentBase<IFileUploadWrapProps> {
  state = {
    files: [] as any[],
    combineFileTypes: this.props.acceptedFileTypes?.join(','),
    previewImage: '',
    previewVisible: false,
    previewTitle: ''
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
  }

  initFiles = async () => {
    if (!this.props.parentId) {
      this.setState({ files: [] })
      return
    }

    const result = await this.props.fileStore.getFiles(this.props.parentId)
    if (this.props.specialModuleName) {
      this.setState({
        files: result?.filter((item: any) => item.moduleName === this.props.specialModuleName)
      })
    } else {
      this.setState({ files: result })
    }
  }

  handleRemoveFile = async (file) => {
    if (file.id) {
      await this.props.fileStore.delete(file.guid)
      this.setState({
        files: this.state.files.filter((item) => item.guid !== file.guid)
      })
      return
    }
    const index = this.state.files.indexOf(file)
    const newFileList = this.state.files.slice()
    newFileList.splice(index, 1)
    this.setState({ files: newFileList })

    this.props.onRemoveFile(file)
  }

  handleBeforeUploadFile = async (file) => {
    const fileList = [...this.state.files]
    if (this.props.maxFile && this.props.maxFile <= fileList.length) {
      message.warning(LError('MAX_FILE_UPLOAD_{0}', this.props.maxFile))
      return false
    }
    // Validate file size in Mb
    if (this.props.maxSize && this.props.maxSize < file.size / 1024 / 1024) {
      message.warning(LError('MAX_FILE_SIZE_UPLOAD_{0}_MB', this.props.maxSize))
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
      }
    })
  }

  handleDownload = (file) => {
    window.open(file.downloadUrl, '_blank')
  }

  handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
      previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1)
    })
  }

  handleCancelPreview = () => this.setState({ previewVisible: false, previewImage: '' })

  render() {
    const { previewVisible, previewImage, previewTitle, files } = this.state
    const { multiple } = this.props
    return (
      <div>
        <Dragger
          multiple={multiple || false}
          onRemove={this.handleRemoveFile}
          onChange={this.onChange}
          fileList={[]}
          disabled={this.props.disabled}
          beforeUpload={() => false}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">{L('FILE_INSTRUCTION')}</p>
          <p className="ant-upload-hint">
            {this.props.acceptedFileTypes && this.props.acceptedFileTypes.length
              ? L('FILE_ACCEPTED_FILE_TYPE_{0}', this.state.combineFileTypes)
              : ''}
          </p>
        </Dragger>

        {this.props.type === documentTypes.image ? (
          <FileImages files={files} wrapClass="" handleRemoveFile={this.handleRemoveFile} />
        ) : (
          renderDocuments(files, this.handlePreview, this.handleDownload, this.handleRemoveFile)
        )}

        <Modal open={previewVisible} title={previewTitle} footer={null} onCancel={this.handleCancelPreview}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    )
  }
}

export default FileUploadWrap
