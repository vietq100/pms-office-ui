import { List } from 'antd'
import { CloseCircleOutlined } from '@ant-design/icons'

export interface IResidentFormProps {
  member: any
  onRemove: () => void
}

function MemberItem({ member, onRemove }) {
  return (
    <List.Item className="member-item row">
      <div className="col title text-truncate">
        {member.displayName}
        <div className="text-muted small">{member.emailAddress}</div>
      </div>
      <div className="col-auto">
        <CloseCircleOutlined onClick={onRemove} />
      </div>
    </List.Item>
  )
}

export default MemberItem
