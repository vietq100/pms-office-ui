import { isGranted, L } from '@lib/abpUtility'
import { renderDateTime } from '@lib/helper'
import AppConsts from '@lib/appconst'
import Button from 'antd/es/button'
import { RedoOutlined, DeleteFilled, EditFilled } from '@ant-design/icons'
const { align } = AppConsts
const SystemColumn = {
  title: L('SYSTEM'),
  dataIndex: 'lastModificationTime',
  key: 'lastModificationTime',
  width: 180,
  readonly: true,
  render: (lastModificationTime, row) => {
    return (
      <div className="text-muted small ml-2">
        {row.lastModificationTime ? (
          <div className="text-muted small ml-2">
            <div>
              {L('UPDATE') + L(': ') + row.lastModifierUser?.displayName}
              <br />
              {lastModificationTime ? renderDateTime(lastModificationTime) : null}
            </div>
          </div>
        ) : (
          <div className="text-muted small ml-2">
            <div>
              {row?.creatorUser && L('CREATE') + L(': ') + row?.creatorUser?.displayName}
              <br />
              {row.creationTime ? renderDateTime(row.creationTime) : null}
            </div>
          </div>
        )}
      </div>
    )
  }
}

export const columnCreate = {
  title: L('SYSTEM_CREATE'),
  dataIndex: 'creationTime',
  key: 'creationTime',
  width: 100,
  readonly: true,
  render: (creationTime, row) => {
    return (
      <div className="text-muted small ml-2">
        <div>
          {row?.creatorUserName ?? row?.creatorUser?.displayName}
          <br />
          {creationTime ? renderDateTime(creationTime) : null}
        </div>
      </div>
    )
  }
}

export const columnUpdate = {
  title: L('SYSTEM_UPDATE'),
  dataIndex: 'lastModificationTime',
  key: 'lastModificationTime',
  width: 100,
  readonly: true,
  render: (lastModificationTime, row) => {
    return (
      <div className="text-muted small ml-2">
        <div>
          {row.lastModifierUser?.displayName}
          <br />
          {lastModificationTime ? renderDateTime(lastModificationTime) : null}
        </div>
      </div>
    )
  }
}

export const actionColumn = (onUpdate, updatePermission, onDelete, deletePermission) => ({
  title: L('ACTIONS'),
  dataIndex: 'operation',
  key: 'operation',
  fixed: align.right,
  align: align.right,
  width: 120,
  render: (text: string, item: any) => (
    <div>
      {isGranted(updatePermission) && (
        <Button type="text" icon={<EditFilled className="text-primary" />} onClick={() => onUpdate(item.id)} />
      )}
      {isGranted(deletePermission) && (
        <Button
          type="text"
          icon={item.isActive ? <DeleteFilled className="text-muted" /> : <RedoOutlined className="text-muted" />}
          onClick={() => onDelete(item.id, !item.isActive)}
        />
      )}
    </div>
  )
})

export default SystemColumn
