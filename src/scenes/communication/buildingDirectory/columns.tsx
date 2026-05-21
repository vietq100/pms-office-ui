import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { renderDotActive } from '@lib/helper'
import { Popover } from 'antd'
import Paragraph from 'antd/es/typography/Paragraph'

const { align } = AppConsts

const columns = (actionColumn?) => {
  const data = [
    {
      title: L(''),
      dataIndex: 'isActive',
      key: 'isActive',
      width: '2%',
      align: align.center,
      render: renderDotActive
    },
    actionColumn,

    {
      title: L('CONTACT_INFORMATION'),
      dataIndex: 'emailAddress',
      key: 'emailAddress',
      width: '15%',
      render: (emailAddress, row) => (
        <div>
          {emailAddress}
          <div className="text-muted small">{row.url}</div>
        </div>
      )
    },
    {
      title: L('CONTACT_PHONE_NUMBER'),
      dataIndex: 'emailAddress',
      key: 'emailAddress',
      width: '15%',
      render: (emailAddress, row) => <>{row.phoneNumber}</>
    },
    {
      title: L('DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,

      render: (description) => (
        <>
          <Popover trigger="click" content={<div className="custom-text-show-table">{description}</div>}>
            <Paragraph
              ellipsis={{
                rows: 1
              }}>
              {description}
            </Paragraph>
          </Popover>
        </>
      )
    }
  ]

  return data
}

export default columns
