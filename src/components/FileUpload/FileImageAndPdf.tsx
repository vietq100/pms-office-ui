import React, { useState } from 'react'
import { DeleteOutlined, FilePdfOutlined } from '@ant-design/icons'
import { Button, Col, Modal, Row } from 'antd'
import PDFFileViewer from '@components/FileUploadV2/PdfFileViewer'
interface ImageProps {
  files?: any[]
  wrapClass: string
  handleRemoveFile?: (value: any, index) => void
}

const FileImageAndPdf: React.FC<ImageProps> = ({ files, handleRemoveFile, wrapClass = 'mt-3' }) => {
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')

  const [previewVisiblePdf, setPreviewVisiblePdf] = useState(false)
  const [previewpdf, setPreviewpdf] = useState('')

  const filePdf = files?.filter((item) => item.mimeType === 'application/pdf')
  const fileOther = files?.filter((item) => item.mimeType !== 'application/pdf')
  return (
    <div className={'ant-upload-picture-card-wrapper ant-row ' + wrapClass}>
      <Row gutter={[4, 4]} className="d-flex justify-content-end">
        {(fileOther || []).map((file, index) => {
          return (
            <div key={index} className="ant-upload-list ant-upload-list-picture-card ant-col ml-1">
              <div className="ant-upload-list-picture-card-container">
                <div
                  className="ant-upload-list-item ant-upload-list-item-done ant-upload-list-item-list-type-picture-card pointer"
                  onClick={() => {
                    setPreviewImage(file.url || file.fileUrl || file.fileThumpUrl)
                    setPreviewVisible(true)
                  }}>
                  <div className="ant-upload-list-item-info">
                    <img
                      style={{ height: 70, width: 70 }}
                      className="ant-upload-list-item-image"
                      src={file.url || file.fileUrl || file.fileThumpUrl}
                    />
                  </div>
                  {handleRemoveFile && (
                    <span className="ant-upload-list-item-actions">
                      <Button
                        size="small"
                        shape="circle"
                        type="text"
                        onClick={() => handleRemoveFile(file, index)}
                        style={{ color: 'rgba(255,255,255,.85)' }}>
                        <DeleteOutlined />
                      </Button>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        <Col span={24} className="d-flex justify-content-end">
          <ul>
            {(filePdf || []).map((file, index) => {
              return (
                <div key={index}>
                  <a
                    onClick={() => {
                      setPreviewpdf(file.url || file.fileUrl || file.fileThumpUrl)
                      setPreviewVisiblePdf(true)
                    }}>
                    <FilePdfOutlined size={32} color="red" /> {file.name}
                  </a>
                  {handleRemoveFile && (
                    <span className="ant-upload-list-item-actions">
                      <Button
                        size="small"
                        shape="circle"
                        type="text"
                        onClick={() => handleRemoveFile(file, index)}
                        style={{ color: 'rgba(255,255,255,.85)' }}>
                        <DeleteOutlined />
                      </Button>
                    </span>
                  )}
                </div>
              )
            })}
          </ul>
        </Col>
      </Row>
      <Modal open={previewVisible} footer={null} onCancel={() => setPreviewVisible(false)}>
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
      <Modal
        style={{ top: 20 }}
        className="w-100"
        open={previewVisiblePdf}
        footer={null}
        onCancel={() => setPreviewVisiblePdf(false)}>
        <PDFFileViewer src={previewpdf} />
      </Modal>
    </div>
  )
}

export default FileImageAndPdf
