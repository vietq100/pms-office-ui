import { UploadOutlined } from '@ant-design/icons/lib'
import { Upload, message, Tooltip } from 'antd'
import AppComponentBase from '../AppComponentBase'
import { inject, observer } from 'mobx-react'
import Stores from '../../stores/storeIdentifier'
import FileStore from '../../stores/common/fileStore'
import { LError, LNotification } from '../../lib/abpUtility'
import { moduleIds } from '@lib/appconst'
import unitService from '@services/project/unitService'

interface IUploadButtonProps {
  label: string
  toolTipTex?: string
  moduleId: number
  fileStore?: FileStore
  acceptedFileTypes?: string[]
  maxFile?: number
  maxSize?: number // Validate file size in Mb
  disabled?: boolean
  onSelectFile?: (files) => void
  multiple?: boolean
  wrapClass?: string
  icon?: any
  maxNumberFile?: number
}

@inject(Stores.FileStore)
@observer
class UploadButton extends AppComponentBase<IUploadButtonProps> {
  state = {
    files: [] as any[],
    combineFileTypes: this.props.acceptedFileTypes?.join(',')
  }

  validateFile = (file) => {
    // Validate file size in Mb
    if (this.props.maxSize && this.props.maxSize < file.size / 1024 / 1024) {
      return false
    }
    return true
  }

  handleBeforeUploadFile = (file) => {
    const currentFileList = [...this.state.files, ...(this.props.fileStore?.currentFiles as any[])]
    if (this.props.maxFile && this.props.maxFile <= currentFileList.length) {
      message.warning(LError('MAX_FILE_UPLOAD_{0}', this.props.maxFile))
      return false
    }
    // Validate file size in Mb
    if (!this.validateFile(file)) {
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

    this.setState({ files: [...this.state.files, file] })

    return false
  }

  onChange = async (info) => {
    const { file, fileList } = info
    switch (this.props.moduleId) {
      case moduleIds.unit: {
        await unitService.importTemplateImport(file)
        message.success(LNotification('UPLOAD_SUCCESS_WE_WILL_INFORM_YOU_ONCE_PROGRESSION_IS_DONE'))
        break
      }
      case moduleIds.unitEdit: {
        await unitService.uploadEditedUnit(file)
        message.success(LNotification('UPLOAD_SUCCESS_WE_WILL_INFORM_YOU_ONCE_PROGRESSION_IS_DONE'))
      }
    }

    if (this.props.onSelectFile && fileList instanceof Array) {
      const tempFileList = [...fileList]
      let limitFiles = !this.props.maxNumberFile ? fileList : tempFileList.slice(-this.props.maxNumberFile)
      limitFiles = limitFiles.filter((file) => this.validateFile(file))
      const files = (limitFiles || []).map((file) => file.originFileObj)
      this.props.onSelectFile(files)

      const lastFile = tempFileList.pop()
      if (lastFile.uid === file.uid && !!this.props.maxNumberFile && fileList.length > this.props.maxNumberFile) {
        message.warning(LNotification('LIMITED_MAXIMUM_{0}_FILE_CAN_UPLOAD', this.props.maxNumberFile))
      }
    }
  }

  render() {
    const { multiple, wrapClass, disabled, toolTipTex, label, icon } = this.props

    return (
      <Upload
        multiple={multiple || false}
        beforeUpload={this.handleBeforeUploadFile}
        onChange={this.onChange}
        accept={this.state.combineFileTypes}
        disabled={disabled}
        fileList={[]}>
        <Tooltip placement={'topLeft'} title={toolTipTex || ''}>
          <span className={wrapClass}>
            {icon || <UploadOutlined style={{ fontSize: '12px', marginRight: '8px' }} />} {label}
          </span>
        </Tooltip>
      </Upload>
    )
  }
}

export default UploadButton
