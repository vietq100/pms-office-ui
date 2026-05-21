import { Tag } from 'antd'

type StatusTagProps = {
  active?: boolean
  children?: any
}

export const StatusColors = {
  Cancel: 'gray',
  Active: '#2db7f5',
  Inactive: '#f50',
  Refunded: '#d46b08'
}
export function StatusTag(props: StatusTagProps) {
  const { children, active, ...rest } = props
  return (
    <Tag color={active ? '#2db7f5' : '#f50'} {...rest} className="cell-round mr-0">
      {children}
    </Tag>
  )
}
