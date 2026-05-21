import React, { useState } from 'react'
import { DeleteOutlined } from '@ant-design/icons'
import { Button, Modal } from 'antd'

interface ImageProps {
  files?: any[]
  wrapClass: string
  handleRemoveFile?: (value: any, index) => void
}

const FileImages: React.FC<ImageProps> = ({ files, handleRemoveFile, wrapClass = 'mt-3' }) => {
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')

  return (
    <div className={'ant-upload-picture-card-wrapper ant-row ' + wrapClass}>
      {(files || []).map((file, index) => {
        return (
          <div key={index} className="ant-upload-list ant-upload-list-picture-card ant-col">
            <div className="ant-upload-list-picture-card-container">
              <div
                className="ant-upload-list-item ant-upload-list-item-done ant-upload-list-item-list-type-picture-card pointer"
                onClick={() => {
                  setPreviewImage(file.url)
                  setPreviewVisible(true)
                }}>
                <div className="ant-upload-list-item-info">
                  <a className="ant-upload-list-item-thumbnail">
                    <img
                      style={{ height: 100, width: 100 }}
                      className="ant-upload-list-item-image"
                      src={file.url || file.fileUrl || file.fileThumpUrl}
                    />
                  </a>
                  {/* <a className="ant-upload-list-item-name ant-upload-list-item-name-icon-count-1">
                    {file.name}
                  </a> */}
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

      <Modal open={previewVisible} footer={null} onCancel={() => setPreviewVisible(false)}>
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  )
}

export default FileImages
