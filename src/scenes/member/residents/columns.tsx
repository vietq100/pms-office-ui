import { L } from '@lib/abpUtility'
import { Popover } from 'antd'
import SystemColumn from '@components/DataTable/columns'
import { renderIsActiveBlue } from '@lib/helper'

const columns = (actionColumn?) => {
  const data = [
    actionColumn,

    {
      title: L('RESIDENT_PHONE'),
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: '10%',
      render: (phoneNumber) => {
        return <div>{phoneNumber}</div>
      }
    },
    {
      title: L('RESIDENT_EMAIL'),
      dataIndex: 'emailAddress',
      key: 'emailAddress',
      width: '8%',
      render: (emailAddress) => <div>{emailAddress}</div>
    },
    {
      title: L('RESIDENT_COMPANY'),
      dataIndex: 'company',
      key: 'company',
      width: '20%',
      render: (company) => (
        <>
          <Popover trigger="click" content={<label>{company?.companyName}</label>}>
            <label className="text-truncate-2 px-1 ">{company?.companyName}</label>
          </Popover>
        </>
      )
    },
    {
      title: L('RESIDENT_STATUS'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: '8%',
      render: renderIsActiveBlue
    },
    SystemColumn
  ]

  return data
}

export default columns
