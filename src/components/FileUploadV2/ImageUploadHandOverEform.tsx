import { LError } from '@lib/abpUtility'
import FileStore from '@stores/common/fileStore'
import { message, Upload } from 'antd'
import Modal from 'antd/lib/modal/Modal'
import { useEffect, useState } from 'react'
import { getPreviewFile } from '@lib/helper'
import { v4 as uuid } from 'uuid'
import fileService from '@services/common/fileService'
import { PaperclipIcon } from '@components/Icon'
import { fileTypeGroup } from '@lib/appconst'

interface ImageUploadProps {
  initialFileList?: any[]
  type?: string
  parentId?: string
  fileStore: FileStore
  onRemoveFile: (guid) => void
  onUpload: (file) => void
  beforeUploadFile?: (file) => boolean
  changeFile?: (files) => void
  acceptedFileTypes?: string[]
  maxFile?: number
  maxSize?: number // Validate file size in Mb
  disabled?: boolean // Validate file size in Mb
  multiple?: boolean
}

const uploadButton = (
  <div>
    <PaperclipIcon />
  </div>
)

const ListImageUploadHandOverEfrom = ({
  maxFile,
  maxSize,
  acceptedFileTypes,
  fileStore,
  initialFileList,
  onRemoveFile,
  onUpload
}: ImageUploadProps) => {
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')
  const [files, setFileList] = useState<Array<any>>([])

  useEffect(() => {
    if (initialFileList) {
      setFileList(initialFileList)
    } else {
      setFileList([])
    }
  }, [initialFileList])

  const handleBeforeUploadFile = async (file, fileList) => {
    if (maxSize && maxSize < file.size / 1024 / 1024) {
      message.warning(LError('MAX_FILE_SIZE_UPLOAD_{0}_MB', maxSize))
      return false
    }
    // Validate file type
    const extension = `.${file.name?.split('.').pop()}`
    if (!extension || (acceptedFileTypes && acceptedFileTypes.findIndex((fileType) => fileType === extension) === -1)) {
      message.warning(LError('UNACCEPTED_FILE_TYPE_{0}', extension))
      return false
    }
    try {
      const formData = new FormData()
      formData.append('image', file)

      const uniqueIdFake = uuid()
      const response = await fileService.uploadImgAnnouncement(uniqueIdFake, formData)
      onUpload(response?.guid)

      const ListFileNew = fileList.map((item) => {
        if (item.uid === file.uid) {
          return { ...item, guid: response?.guid } // Update the item and return a new object
        } else {
          return item // Return the original item if no update is needed
        }
      })

      setFileList(ListFileNew)

      return true
    } catch (error) {
      console.error('Image upload failed:', error)
      return true
    }
  }

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getPreviewFile(file.originFileObj)
    }
    setPreviewVisible(true)
    setPreviewImage(file.url || file.preview)
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1))
  }

  const handleChange = (info) => {
    const { fileList, file } = info

    if (!file?.guid) {
      handleBeforeUploadFile(file, fileList)
    }
  }
  const handleCancel = () => setPreviewVisible(false)

  const handleRemove = async (file) => {
    if (file) {
      await fileStore.delete(file.guid)
      const newFiles = files

      const listAfter = await newFiles.filter((item) => item.guid !== file.guid)

      setFileList(listAfter)
      onRemoveFile(file.guid)
      return
    }
  }
  return (
    <div className="align-items-center">
      <Upload
        beforeUpload={() => false}
        listType="picture-card"
        fileList={files}
        accept={fileTypeGroup.images.join(',')}
        onPreview={handlePreview}
        onChange={handleChange}
        onRemove={handleRemove}
        className="justify-content-start">
        {files.length >= (maxFile || 5) ? null : uploadButton}
      </Upload>
      <Modal open={previewVisible} title={previewTitle} footer={null} onCancel={handleCancel}>
        <img alt="previewImage" style={{ width: '100%' }} src={previewImage} />
      </Modal>
      <style scoped>
        {`
      .ant-upload.ant-upload-select-picture-card {
        border-radius: 50% !important;
        border: none !important;
        display: relative
      }`}
      </style>
    </div>
  )
}

export default ListImageUploadHandOverEfrom
