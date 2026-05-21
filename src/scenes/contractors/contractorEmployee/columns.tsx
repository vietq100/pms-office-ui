import { L } from '@lib/abpUtility'

export const getEmployeeColumn = (actionColumn?) => {
  const data = [
    actionColumn,
    {
      title: L('CONTACT_PHONE'),
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: '15%',
      ellipsis: true,
      render: (contactPhone) => <>{contactPhone}</>
    },
    {
      title: L('CONTACT_EMAIL'),
      dataIndex: 'contactEmail',
      key: 'contactEmail',
      width: '18%',
      ellipsis: true,
      render: (contactEmail) => <>{contactEmail}</>
    },
    {
      title: L('CONTACT_REMARK'),
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      render: (remark) => <>{remark}</>
    }
  ]

  return data
}

export default getEmployeeColumn
