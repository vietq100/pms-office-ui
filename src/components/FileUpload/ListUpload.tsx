import { PlusOutlined } from '@ant-design/icons'
import { L, LError } from '@lib/abpUtility'
import FileStore from '@stores/common/fileStore'
import { message, Upload } from 'antd'
import Modal from 'antd/lib/modal/Modal'
import { useEffect, useState } from 'react'
import logo from '@assets/images/logo-icon.png'
import { getPreviewFile } from '@lib/helper'

interface ImageUploadProps {
  initialFileList?: any[]
  type?: string
  parentId?: string
  fileStore: FileStore
  onRemoveFile?: (file) => void
  beforeUploadFile?: (file) => boolean
  changeFile?: (files) => void
  acceptedFileTypes?: string[]
  maxFile?: number
  maxSize?: number // Validate file size in Mb
  disabled?: boolean // Validate file size in Mb
  multiple?: boolean
  showMainPhoto?: boolean
}

const uploadButton = (
  <div>
    <PlusOutlined />
    <div style={{ marginTop: 8 }}>{L('UPLOAD')}</div>
  </div>
)

const ListImageUpload = ({
  changeFile,
  maxFile,
  maxSize,
  acceptedFileTypes,
  showMainPhoto,
  fileStore,
  initialFileList
}: ImageUploadProps) => {
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')
  const [files, setFileList] = useState<Array<any>>([])
  const [imageUrl, setImageUrl] = useState<any>(logo)

  useEffect(() => {
    if (initialFileList) {
      setFileList(initialFileList)
    } else {
      setFileList([])
    }
  }, [initialFileList])

  const handleBeforeUploadFile = async (file) => {
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

    return true
  }

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getPreviewFile(file.originFileObj)
    }
    setPreviewVisible(true)
    setPreviewImage(file.url || file.preview)
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1))
  }

  const handleChange = async (info) => {
    const { fileList, file } = info
    let validation = true
    if (!(await handleBeforeUploadFile(file))) {
      validation = false
    }
    if (validation) {
      setFileList(fileList)
      if (changeFile) {
        changeFile(fileList)
      }
      const imageUrlNew = fileList[0]?.thumbUrl
      imageUrlNew ? setImageUrl(imageUrlNew) : setImageUrl(fileList[0]?.fileUrl)
    }
  }
  const handleCancel = () => setPreviewVisible(false)
  const handleRemove = async (file) => {
    if (file.id) {
      await fileStore.delete(file.guid)
      const newFiles = files
      newFiles.filter((item) => item.guid !== file.guid)
      setFileList(newFiles)
      return
    }
  }
  return (
    <div className="align-items-center">
      {showMainPhoto && (
        <div
          className="w-100 d-flex justify-content-center align-items-center flex-wrap mb-2"
          style={{ maxHeight: '300px' }}>
          <img alt="Banner" style={{ height: '300px', maxWidth: '100%' }} src={imageUrl || logo} />
        </div>
      )}
      <Upload
        beforeUpload={() => false}
        listType="picture-card"
        fileList={files}
        onPreview={handlePreview}
        onChange={handleChange}
        onRemove={handleRemove}
        className="justify-content-center">
        {files.length >= (maxFile || 4) ? null : uploadButton}
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

export default ListImageUpload
