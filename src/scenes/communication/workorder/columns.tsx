import { L } from '@lib/abpUtility'
import { renderDate, renderDateTime, renderDotActive, renderTag } from '@lib/helper'
import { CalendarOutlined, UserOutlined } from '@ant-design/icons/lib'

import { Popover } from 'antd'
import Paragraph from 'antd/lib/typography/Paragraph'
import AppConsts from '@lib/appconst'
const { align } = AppConsts

const columns = (actionColumn?, actionComment?) => {
  const data = [
    {
      title: L(''),
      dataIndex: 'isActive',
      key: 'isActive',
      width: 10,
      align: align.center,
      render: renderDotActive
    },
    {
      title: L('WORK_ORDER_ID'),
      dataIndex: 'id',
      key: 'id',

      align: align.center,
      width: 60,
      render: (id) => <>{id}</>
    },
    actionColumn,

    {
      title: L('WORK_ORDER_RESIDENT'),
      dataIndex: 'user',
      width: 100,
      render: (user) => (
        <Popover trigger="click" content={user?.displayName}>
          <div className="text-truncate-3">
            {L(user.gender === null ? '' : L(user.gender ? 'GENDER_MR' : 'GENDER_MS'))}
            {user.displayName}
          </div>
        </Popover>
      )
    },
    {
      title: L('WORK_ORDER_DESCRIPTION'),
      dataIndex: 'workflow',
      key: 'workflow',
      width: 150,
      render: (workflow) => (
        <>
          <strong className="text-muted">{workflow?.subject}</strong>
          <Popover trigger="click" content={<div className="custom-text-show-table">{workflow?.description}</div>}>
            <Paragraph
              ellipsis={{
                rows: 2
              }}>
              {workflow?.description}
            </Paragraph>
          </Popover>
        </>
      )
    },
    {
      title: L('WORK_ORDER_SOLUTION'),
      dataIndex: 'workflow',
      key: 'workflow',
      width: 150,
      render: (workflow) => (
        <>
          <Popover trigger="click" content={<div className="custom-text-show-table">{workflow?.solution}</div>}>
            <Paragraph
              ellipsis={{
                rows: 1
              }}>
              {workflow?.solution}
            </Paragraph>
          </Popover>
        </>
      )
    },

    {
      title: L('WORK_ORDER_STATUS'),
      dataIndex: 'status',
      key: 'status',
      width: 70,
      ellipsis: true,
      render: (status, row) =>
        renderTag(
          row.workflow?.status?.name,
          row.workflow?.status?.colorCode || 'black',
          row.workflow?.status?.borderColorCode || 'white'
        )
    },

    {
      title: L('WORK_ORDER_START_DATE'),
      dataIndex: 'workflow',
      key: 'workflow',
      width: 85,
      render: (workflow) => renderDate(workflow?.startDate)
    },
    {
      title: L('WORK_ORDER_DUE_DATE'),
      dataIndex: 'workflow',
      key: 'workflow',
      width: 85,
      render: (workflow) => renderDate(workflow?.dueDate)
    },

    actionComment,
    {
      title: L('WORK_ORDER_CREATED_AT'),
      dataIndex: 'workflow',
      key: 'workflow',
      width: 150,
      render: (workflow) => (
        <div className="text-muted small">
          <CalendarOutlined className="mr-1" /> {renderDateTime(workflow?.creationTime)}
          <div>
            <UserOutlined className="mr-1" /> {workflow?.creatorUser?.displayName}
          </div>
        </div>
      )
    }
  ]

  return data
}

export default columns
