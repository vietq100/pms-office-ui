import { L } from '@lib/abpUtility'

const columns = (actionColumn?) => {
  const data = [
    actionColumn,
    {
      title: L('ST_ROLE_DISPLAY_NAME'),
      dataIndex: 'displayName',
      key: 'displayName',

      render: (text: string) => <div>{text}</div>
    }
  ]

  return data
}

export default columns
