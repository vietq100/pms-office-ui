import { L } from '@lib/abpUtility'
import { Tag } from 'antd'

const columns = (actionColumn?) => {
  const data = [
    {
      title: L('TenancyName'),
      dataIndex: 'tenancyName',
      key: 'tenancyName',
      width: 150,
      render: (text: string) => <div>{text}</div>
    },
    {
      title: L('Name'),
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string) => <div>{text}</div>
    },
    {
      title: L('ACTIVE_STATUS'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: 150,
      render: (text: boolean) =>
        text === true ? <Tag color="#2db7f5">{L('Yes')}</Tag> : <Tag color="red">{L('No')}</Tag>
    }
  ]

  if (actionColumn) {
    data.push(actionColumn)
  }

  return data
}

export default columns
