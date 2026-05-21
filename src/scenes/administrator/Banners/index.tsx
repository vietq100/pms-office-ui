import { L, LError } from '@lib/abpUtility'
// import FileStore from '@stores/common/fileStore'
import Stores from '@stores/storeIdentifier'
import { inject } from 'mobx-react'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { Button, Col, message, Modal, Row, Upload } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import WrapPageScroll from '@components/WrapPageScroll'
import fileService from '@services/common/fileService'
import { notifySuccess } from '@lib/helper'
import { renderImages } from '@components/FileUpload/FileDocuments'
import { getBase64 } from '@components/FileUpload'
const { Dragger } = Upload
// type Props = {
//   fileStore: FileStore
// }

const Banners = inject(Stores.FileStore)(
  observer(() => {
    const acceptedFileTypes = ['.jpg', '.jpeg', '.png']
    const [files, setFiles] = React.useState<any[]>([])
    const [isChange, setIsChange] = React.useState(false)
    const onRemoveFile = async (file) => {
      if (file.id) {
        setIsChange(true)
        await fileService.deleteBanner(file.id)
        notifySuccess(L('SUCCESSFULLY'), '')
        const newFileList = files.filter((item) => file.id !== item.id)
        setFiles(newFileList)
      } else {
        const newFileList = files.filter((item) => file.uid !== item.uid)
        setFiles(newFileList)
      }
    }
    const onChange = ({ file, fileList }) => {
      setIsChange(true)
      const extension = `.${file.name?.split('.').pop()}`
      if (!extension || acceptedFileTypes.findIndex((fileType) => fileType === extension) === -1) {
        message.warning(LError('UNACCEPTED_FILE_TYPE_{0}', extension))
        return false
      }
      setFiles([...files, ...fileList])
      return
    }
    React.useEffect(() => {
      fileService.getAllBanners().then((res) => setFiles(res))
    }, [])
    const onSave = async () => {
      await fileService.uploadBanners(files)
      notifySuccess(L('SUCCESSFULLY'), '')
    }
    const renderActions = (isLoading?) => {
      return (
        <Row>
          <Col sm={{ span: 24, offset: 0 }}>
            <Button type="primary" onClick={onSave} loading={isLoading} shape="round" disabled={!isChange}>
              {L('BTN_SAVE')}
            </Button>
          </Col>
        </Row>
      )
    }
    const handleDownload = (file) => {
      window.open(file.fileUrl, '_blank')
    }
    const [previewVisible, setPreviewVisible] = React.useState(false)
    const [previewImage, setPreviewImage] = React.useState<any>()
    const [previewTitle, setPreviewTitle] = React.useState<any>()
    const handlePreview = async (file) => {
      if (!file.fileUrl) {
        file.preview = await getBase64(file.originFileObj)
      }
      setPreviewVisible(true)
      setPreviewImage(file.fileUrl || file.preview)
      setPreviewTitle(file.name || file.originalFileName || file.fileUrl.substring(file.fileUrl.lastIndexOf('/') + 1))
    }
    return (
      <WrapPageScroll renderActions={renderActions}>
        <h3>{L('SETUP_BANNER')}</h3>
        <div className="my-3">
          <Dragger multiple onRemove={onRemoveFile} onChange={onChange} fileList={[]} beforeUpload={() => false}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">{L('FILE_INSTRUCTION')}</p>
            <p className="ant-upload-hint">{L('FILE_ACCEPTED_FILE_TYPE_{0}', acceptedFileTypes?.join(','))}</p>
          </Dragger>
        </div>
        {renderImages(files, handlePreview, handleDownload, onRemoveFile)}
        <Modal
          open={previewVisible}
          title={previewTitle}
          footer={null}
          onCancel={() => {
            setPreviewImage('')
            setPreviewVisible(false)
          }}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </WrapPageScroll>
    )
  })
)

export default Banners
