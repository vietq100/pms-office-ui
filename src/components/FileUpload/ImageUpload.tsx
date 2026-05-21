import { PlusOutlined } from '@ant-design/icons'
import { LError } from '@lib/abpUtility'
import FileStore from '@stores/common/fileStore'
import { message, Upload } from 'antd'
import Modal from 'antd/lib/modal/Modal'
import { useEffect, useState } from 'react'
import logo from '@assets/images/logo-icon.png'
interface ImageUploadProps {
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
}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}
const useForceUpdate = () => {
  const set = useState(0)[1]
  return () => set((s) => s + 1)
}
const uploadButton = (
  <div>
    <PlusOutlined />
    <div style={{ marginTop: 8 }}>Upload</div>
  </div>
)

const ImageUpload = (props: ImageUploadProps) => {
  const forceUpdate = useForceUpdate()
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')
  const [files, setFileList] = useState<Array<any>>([])
  const [imageUrl, setImageUrl] = useState<any>(logo)
  const initFiles = async () => {
    if (!props.parentId) {
      setFileList([])
      return
    }

    await props.fileStore.getFiles(props.parentId)
    setFileList(props.fileStore.currentFiles)
    if (props.changeFile) {
      props.changeFile(props.fileStore.currentFiles)
    }
    if (props.fileStore.currentFiles[0]) {
      setImageUrl(props.fileStore.currentFiles[0].fileUrl)
    }
  }
  useEffect(() => {
    if (props.parentId) {
      initFiles()
    }
    setImageUrl(logo)
    forceUpdate()
  }, [props.parentId])

  const handleBeforeUploadFile = async (file) => {
    const newFileList = [...files]
    if (props.maxFile && props.maxFile <= newFileList.length) {
      message.warning(LError('MAX_FILE_UPLOAD_{0}', props.maxFile))
      return false
    }
    // Validate file size in Mb
    if (props.maxSize && props.maxSize < file.size / 1024 / 1024) {
      message.warning(LError('MAX_FILE_SIZE_UPLOAD_{0}_MB', props.maxSize))
      return false
    }
    // Validate file type
    const extension = `.${file.name?.split('.').pop()}`
    if (
      !extension ||
      (props.acceptedFileTypes && props.acceptedFileTypes.findIndex((fileType) => fileType === extension) === -1)
    ) {
      message.warning(LError('UNACCEPTED_FILE_TYPE_{0}', extension))
      return false
    }

    return true
  }

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
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
      if (props.changeFile) {
        props.changeFile(fileList)
      }
      const imageUrlNew = fileList[0]?.thumbUrl
      imageUrlNew ? setImageUrl(imageUrlNew) : setImageUrl(fileList[0]?.fileUrl)
    }
  }
  const handleCancel = () => setPreviewVisible(false)
  const handleRemove = async (file) => {
    if (file.id) {
      await props.fileStore.delete(file.guid)
      const newFiles = files
      newFiles.filter((item) => item.guid !== file.guid)
      setFileList(newFiles)
      return
    }
  }
  return (
    <div className="align-items-center">
      <div
        className="w-100 d-flex justify-content-center align-items-center flex-wrap mb-2"
        style={{ maxHeight: '300px' }}>
        <img alt="Banner" style={{ height: '300px', maxWidth: '100%' }} src={imageUrl || logo} />
      </div>
      <Upload
        beforeUpload={() => false}
        listType="picture-card"
        fileList={files}
        onPreview={handlePreview}
        onChange={handleChange}
        onRemove={handleRemove}
        className="justify-content-center">
        {files.length >= 4 ? null : uploadButton}
      </Upload>
      <Modal open={previewVisible} title={previewTitle} footer={null} onCancel={handleCancel}>
        <img alt="previewImage" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  )
}

export default ImageUpload
