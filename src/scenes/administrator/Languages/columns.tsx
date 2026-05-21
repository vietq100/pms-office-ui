import { L } from '@lib/abpUtility'
import { Tag } from 'antd'

const columns = (actionColumn?) => {
  const data = [
    actionColumn,
    {
      title: L('LANGUAGE_NAME'),
      dataIndex: 'name',
      key: 'name',
      width: '10%',
      render: (text: string) => <div>{text}</div>
    },
    {
      title: L('LANGUAGE_DISPLAY_NAME'),
      dataIndex: 'displayName',
      key: 'displayName',
      width: '15%',
      render: (text: string) => <div>{text}</div>
    },
    {
      title: L('LANGUAGE_IS_DISABLED'),
      dataIndex: 'isDisabled',
      key: 'isDisabled',
      render: (text: boolean) =>
        text === true ? <Tag color="#2db7f5">{L('Yes')}</Tag> : <Tag color="red">{L('No')}</Tag>
    }
  ]

  return data
}

export default columns
