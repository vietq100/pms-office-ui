import { DeleteOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons/lib'

import { L } from '@lib/abpUtility'
import { Popover, Space, Table } from 'antd'
import Paragraph from 'antd/es/typography/Paragraph'
import Button from 'antd/lib/button'

export const renderDocumentsContractor = (files, handlePreview, handleDownload, handleRemove) => {
  const columns = [
    {
      title: L('DOCUMENT_NAME'),
      dataIndex: 'name',
      key: 'name',
      width: 150,
      ellipsis: true,
      render: (name) => (
        <>
          <Popover trigger="click" content={name}>
            {' '}
            <Paragraph
              style={{ fontSize: 13, fontWeight: 'bold' }}
              ellipsis={{
                rows: 1
              }}>
              <label className="pl-2">{name}</label>
            </Paragraph>
          </Popover>
        </>
      )
    },
    {
      title: L('DOCUMENT_CONTRACTOR_TYPE'),
      dataIndex: 'type',
      key: 'type',
      width: 100,
      ellipsis: true,
      render: (type) => (
        <Popover trigger="click" content={type}>
          {' '}
          <Paragraph
            ellipsis={{
              rows: 1
            }}>
            {' '}
            {type}
          </Paragraph>
        </Popover>
      )
    },
    {
      title: L('DOCUMENT_START_DATE'),
      dataIndex: 'startDate',
      key: 'startDate',
      width: 100,
      ellipsis: true,
      render: (startDate) => (
        <Popover trigger="click" content={startDate}>
          {' '}
          <Paragraph
            ellipsis={{
              rows: 1
            }}>
            {' '}
            {startDate}
          </Paragraph>
        </Popover>
      )
    },
    {
      title: L('DOCUMENT_END_DATE'),
      dataIndex: 'endDate',
      key: 'endDate',
      width: 100,
      ellipsis: true,
      render: (endDate) => (
        <Popover trigger="click" content={endDate}>
          {' '}
          <Paragraph
            ellipsis={{
              rows: 1
            }}>
            {' '}
            {endDate}
          </Paragraph>
        </Popover>
      )
    },
    {
      title: L('DOCUMENT_CREATE_BY'),
      dataIndex: 'createBy',
      key: 'createBy',
      width: 100,
      ellipsis: true,
      render: (createBy) => (
        <Popover trigger="click" content={createBy}>
          {' '}
          <Paragraph
            ellipsis={{
              rows: 1
            }}>
            {' '}
            {createBy}
          </Paragraph>
        </Popover>
      )
    },
    {
      title: L('DOCUMENT_REMARK'),
      dataIndex: 'remark',
      key: 'remark',
      width: 250,
      ellipsis: true,
      render: (remark) => (
        <Popover trigger="click" content={remark}>
          {' '}
          <Paragraph
            ellipsis={{
              rows: 1
            }}>
            {' '}
            {remark}
          </Paragraph>
        </Popover>
      )
    },
    {
      title: L('DOCUMENT_ACTION'),
      key: 'action',
      width: 120,

      render: (_, record) => (
        <Space size="middle">
          {handlePreview && (
            <Button
              size="small"
              shape="circle"
              type="text"
              onClick={() => handlePreview(record)}
              style={{ color: '#6F849F' }}>
              <EyeOutlined />
            </Button>
          )}
          {handleDownload && (
            <Button
              size="small"
              shape="circle"
              type="text"
              onClick={() => handleDownload(record)}
              style={{ color: '#6F849F' }}>
              <DownloadOutlined />
            </Button>
          )}
          {handleRemove && (
            <Button
              size="small"
              shape="circle"
              type="text"
              onClick={() => handleRemove(record)}
              style={{ color: '#6F849F' }}>
              <DeleteOutlined />
            </Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <Table
      pagination={false}
      size="middle"
      rowKey={(record) => record.id}
      className="custom-ant-table"
      columns={columns}
      dataSource={files}
    />
  )
}
export const renderDocuments = (files, handlePreview, handleDownload, handleRemove, disabled) => {
  const columns = [
    {
      title: L('DOCUMENT_NAME'),
      dataIndex: 'name',
      key: 'name',
      width: 150,
      ellipsis: true,
      render: (name) => (
        <>
          <Popover trigger="click" content={name}>
            <Paragraph
              style={{ fontSize: 13, fontWeight: 'bold' }}
              ellipsis={{
                rows: 1
              }}>
              <label className="pl-2">{name}</label>
            </Paragraph>
          </Popover>
        </>
      )
    },

    {
      title: L('DOCUMENT_ACTION'),
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Space size="middle">
          {handlePreview && (record?.mimeType == 'image/jpeg' || record?.mimeType == 'image/png') ? (
            <Button
              size="small"
              shape="circle"
              type="text"
              onClick={() => handlePreview(record)}
              style={{ color: '#6F849F' }}>
              <EyeOutlined />
            </Button>
          ) : record?.mimeType == 'application/msword' ||
            record?.mimeType == 'application/pdf' ||
            record?.mimeType == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            record?.mimeType == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ? (
            <Button
              size="small"
              shape="circle"
              type="text"
              onClick={() => handlePreview(record)}
              style={{ color: '#6F849F' }}>
              <EyeOutlined />
            </Button>
          ) : (
            <Button disabled={disabled} size="small" shape="circle" type="text" style={{ color: '#6F849F' }}></Button>
          )}
          {handleDownload && (
            <Button
              size="small"
              shape="circle"
              type="text"
              onClick={() => handleDownload(record)}
              style={{ color: '#6F849F' }}>
              <DownloadOutlined />
            </Button>
          )}
          {handleRemove && (
            <Button
              disabled={disabled}
              size="small"
              shape="circle"
              type="text"
              onClick={() => handleRemove(record)}
              style={{ color: '#6F849F' }}>
              <DeleteOutlined />
            </Button>
          )}{' '}
        </Space>
      )
    }
  ]

  return files.length > 0 ? (
    <Table
      pagination={false}
      size="middle"
      rowKey={(record) => record.guid}
      className="custom-ant-table"
      columns={columns}
      dataSource={files}
    />
  ) : (
    <></>
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
                {file.fileName}
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
                  style={{ color: 'rgba(255,255,255,.85)' }}>
                  <EyeOutlined />
                </Button>
              )}
              {handleDownload && (
                <Button
                  size="small"
                  shape="circle"
                  type="text"
                  onClick={() => handleDownload(file)}
                  style={{ color: 'rgba(255,255,255,.85)' }}>
                  <DownloadOutlined />
                </Button>
              )}
              {handleRemove && (
                <Button
                  size="small"
                  shape="circle"
                  type="text"
                  onClick={() => handleRemove(file, index)}
                  style={{ color: 'rgba(255,255,255,.85)' }}>
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
