import { Card, Switch } from 'antd'
import Icon, { UserOutlined, CalendarOutlined, FolderOutlined } from '@ant-design/icons'
import { red, green } from '@ant-design/colors'
import { renderDate } from '@lib/helper'
import { L } from '@lib/abpUtility'

export interface IResidentFormProps {
  openModal: () => void
  onUpdateStatus: () => void
  document: any
}

function DocumentFile({ openModal, onUpdateStatus, document }) {
  return (
    <div className="document-item">
      <Card
        size="small"
        bordered={false}
        cover={
          <div className="wrap-document-info">
            <div className="document-icon" style={{ color: document.isActive ? green[6] : red[6] }}>
              <Icon component={document.icon} />
            </div>
            <div className="document-info">
              <div className="title text-truncate pointer" onClick={() => openModal(document.id)}>
                <label> {document?.name?.length > 20 ? document?.name.substring(0, 20) + '...' : document?.name}</label>
              </div>
              <div className="folder text-muted text-truncate small">
                <FolderOutlined className="mr-1" />
                {document?.library?.name?.length > 30
                  ? document?.library?.name.substring(0, 30) + '...'
                  : document?.library?.name}
              </div>
              <div className="user text-muted text-truncate small">
                <UserOutlined className="mr-1" /> {document.creatorUser?.displayName}
              </div>
              <div className="date text-muted small">
                <CalendarOutlined className="mr-1" /> {renderDate(document.creationTime)}
              </div>
            </div>
          </div>
        }>
        <div className="document-status">
          <Switch
            checked={document.isActive}
            className="mr-1"
            onChange={() => onUpdateStatus(document.id, !document.isActive)}
          />
          {L(document.isActive ? 'ACTIVE' : 'IN_ACTIVE')}
        </div>
      </Card>
    </div>
  )
}

export default DocumentFile
