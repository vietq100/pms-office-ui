import Icon, { DeleteOutlined, EyeOutlined } from '@ant-design/icons/lib'
import { ExcelIcon } from '@components/Icon'
// import { L } from '@lib/abpUtility'
import Button from 'antd/lib/button'

export const renderDocuments = (files, handlePreview, handleDownload, handleRemove) => {
  return (
    <div className="ant-upload-list ant-upload-list-text">
      {(files || []).map((file, index) => {
        return (
          <div key={index}>
            <span>
              <div className="ant-upload-list-item ant-upload-list-item-done ant-upload-list-item-list-type-text">
                <div className="ant-upload-list-item-info">
                  <span>
                    {file.icon && (
                      <div className="ant-upload-text-icon">
                        <Icon component={file.icon} style={{ top: '0' }} />
                      </div>
                    )}
                    <a
                      className="ant-upload-list-item-name ant-upload-list-item-name-icon-count-1"
                      href={file.downloadUrl}
                      target="_blank"
                      rel="noreferrer">
                      {file.name || file.originalFileName}
                    </a>
                    <span className="ant-upload-list-item-card-actions ">
                      {/* {file.hasPreview && handlePreview && ( */}
                      {handlePreview && (
                        <Button
                          size="small"
                          shape="circle"
                          type="text"
                          onClick={() => handlePreview(file)}
                          style={{ color: '#58585858' }}>
                          <EyeOutlined />
                        </Button>
                      )}
                      {handleDownload && (
                        <Button
                          size="small"
                          shape="circle"
                          type="text"
                          // className="pt-1 mx-1"
                          onClick={() => handleDownload(file)}>
                          <ExcelIcon />
                          {/* {L('EXPORT_EXCEL')} */}
                        </Button>
                      )}
                      {handleRemove && (
                        <Button
                          size="small"
                          shape="circle"
                          type="text"
                          onClick={() => handleRemove(file, index)}
                          style={{ color: '#58585858' }}>
                          <DeleteOutlined />
                        </Button>
                      )}
                    </span>
                  </span>
                </div>
              </div>
            </span>
          </div>
        )
      })}
    </div>
  )
}
export const renderImages = (files, handlePreview, handleDownload, handleRemove) => {
  return (
    <div className="ant-upload-list ant-upload-list-text">
      {(files || []).map((file, index) => {
        return (
          <div key={index} className="d-flex justify-content-between align-items-center mb-1 hover-muted">
            <span className="d-flex align-items-center">
              {(file.fileUrl || file.preview) && <img height={90} src={file.fileUrl || file.preview} />}
              <a
                className="ant-upload-list-item-name ant-upload-list-item-name-icon-count-1"
                href={file.fileUrl}
                target="_blank"
                rel="noreferrer">
                {file.originalFileName}
              </a>
            </span>
            <span className="ant-upload-list-item-card-actions ">
              {/* {file.hasPreview && handlePreview && ( */}
              {handlePreview && (
                <Button
                  size="small"
                  shape="circle"
                  type="text"
                  onClick={() => handlePreview(file)}
                  style={{ color: '#58585858' }}>
                  <EyeOutlined />
                </Button>
              )}
              {handleDownload && (
                <Button shape="circle" type="primary" onClick={() => handleDownload(file)}>
                  <ExcelIcon />
                  {/* {L('EXPORT_EXCEL')} */}
                </Button>
              )}
              {handleRemove && (
                <Button
                  size="small"
                  shape="circle"
                  type="text"
                  onClick={() => handleRemove(file, index)}
                  style={{ color: '#58585858' }}>
                  <DeleteOutlined />
                </Button>
              )}
            </span>
            <style scoped>{`
            .hover-muted:hover {
              background-color: #F5F5F5;
            }
            `}</style>
          </div>
        )
      })}
    </div>
  )
}
