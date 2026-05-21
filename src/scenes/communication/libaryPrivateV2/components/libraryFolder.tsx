import { renderDate } from '../../../../lib/helper'
import { isGranted } from '../../../../lib/abpUtility'
import { Button, List } from 'antd'
import {
  FolderOutlined,
  UserOutlined,
  CalendarOutlined,
  FolderOpenOutlined,
  CloseOutlined,
  EditOutlined
} from '@ant-design/icons'
import { appPermissions } from '@lib/appconst'
import Row from 'antd/lib/grid/row'
import Col from 'antd/lib/grid/col'

function DocumentFolderPrivate({ folder, findDocuments, showUpdateModal, onUpdateStatus, selectedFolderId }) {
  const isActive = selectedFolderId === folder?.id
  const wrapClass = 'folder-item ' + (isActive ? 'active' : '')
  return (
    <List.Item className={wrapClass}>
      <Row gutter={[16, 8]}>
        <Col flex="auto" className="pr-0 col-info">
          <Row gutter={[16, 8]}>
            <Col flex="none" style={{ alignSelf: 'center' }}>
              {isActive ? (
                <FolderOpenOutlined onClick={() => showUpdateModal(folder.id)} />
              ) : (
                <FolderOutlined onClick={() => showUpdateModal(folder.id)} />
              )}
            </Col>
            <Col flex="auto" className="wrap-info text-truncate" onClick={() => findDocuments('libraryIds', folder.id)}>
              {folder.name}
              <div className="text-muted small">
                <span className="mr-2 text-truncate">
                  <UserOutlined />: {folder.creatorUser?.displayName}
                </span>
                <span>
                  <CalendarOutlined />: {renderDate(folder.creationTime)}
                </span>
              </div>
            </Col>
          </Row>
        </Col>
        <Col flex="none" className="pl-0" style={{ alignSelf: 'center' }}>
          <span className="wrap-actions">
            {isGranted(appPermissions.library.update) && (
              <Button
                size="small"
                className="ml-1"
                shape="circle"
                icon={<EditOutlined />}
                onClick={() => showUpdateModal(folder.id)}
              />
            )}
            {isGranted(appPermissions.library.delete) && (
              <Button
                size="small"
                className="ml-1"
                shape="circle"
                icon={<CloseOutlined />}
                onClick={() => onUpdateStatus(folder.id, !folder.isActive)}
              />
            )}
          </span>
        </Col>
      </Row>
    </List.Item>
  )
}

export default DocumentFolderPrivate
