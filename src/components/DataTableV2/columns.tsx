import { isGranted, L } from '@lib/abpUtility'
import { renderDateTime } from '@lib/helper'
import moment from 'moment-timezone/moment-timezone'
import AppConsts from '@lib/appconst'
import Button from 'antd/es/button'
import { RedoOutlined, DeleteFilled, EditFilled } from '@ant-design/icons'
const { align } = AppConsts
const SystemColumn2 = {
  title: L('SYSTEM'),
  dataIndex: 'creationTime',
  key: 'creationTime',
  width: 250,
  readonly: true,
  render: (creationTime, row) => {
    const createdAtAgo = moment(creationTime).fromNow()
    const updatedAtAgo = moment(row.lastModificationTime).fromNow()
    return (
      <div className="text-muted small">
        {row.creatorUser?.displayName ? (
          <div>
            {L('CREATED_BY')} {row.creatorUser?.displayName} {createdAtAgo}
            {L(' ')}
            {L('AT')} {renderDateTime(creationTime)}
          </div>
        ) : (
          <div>
            {L('CREATED')} {createdAtAgo}
            {L(' ')}
            {L('AT')} {renderDateTime(creationTime)}
          </div>
        )}
        {row.lastModifierUser && (
          <div>
            {L('UPDATED_BY')} {row.lastModifierUser?.displayName} {updatedAtAgo}
            {L(' ')}
            {L('AT')} {renderDateTime(row.lastModificationTime)}
          </div>
        )}
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

export default SystemColumn2
