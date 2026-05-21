import { L } from '@lib/abpUtility'
import AppConst from '@lib/appconst'
import { renderDotActive } from '@lib/helper'
const { align } = AppConst

const columns = (actionColumn?) => {
  const data = [
    {
      title: '',
      dataIndex: 'isActive',
      key: 'isActive',
      width: '2%',
      align: align.center,
      render: renderDotActive
    },
    actionColumn,
    {
      title: L('FULL_NAME'),
      dataIndex: 'displayName',
      key: 'displayName',
      width: '15%',
      ellipsis: true,
      render: (text: string) => <>{text}</>
    },
    {
      title: L('EMAIL_ADDRESS'),
      dataIndex: 'emailAddress',
      key: 'emailAddress',
      ellipsis: true,
      render: (text: string) => <>{text}</>
    }
  ]

  return data
}

export default columns
