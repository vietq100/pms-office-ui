import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { renderDateTime, renderDotActive, renderTag } from '@lib/helper'
import { Popover } from 'antd'
import Paragraph from 'antd/lib/typography/Paragraph'
import { CalendarOutlined, UserOutlined } from '@ant-design/icons'
const { align } = AppConsts
const columns = (actionColumn?, actionComment?) => {
  const data = [
    {
      title: L(''),
      dataIndex: 'isActive',
      key: 'isActive',
      width: '2%',
      align: align.center,
      render: renderDotActive
    },
    {
      title: L('FEEDBACK_ID'),
      dataIndex: 'id',
      key: 'id',
      width: '5%',
      align: align.center,
      ellipsis: true,
      render: (id) => <>{id}</>
    },
    actionColumn,
    {
      title: L('FEEDBACK_RESIDENT'),
      dataIndex: 'user',
      key: 'user',
      width: '12%',
      render: (user) => (
        <Popover trigger="click" content={user?.displayName}>
          <div>
            {L(user.gender === null ? '' : L(user.gender ? 'GENDER_MR' : 'GENDER_MS'))}
            {user.displayName}
          </div>
        </Popover>
      )
    },

    {
      title: L('FEEDBACK_TYPE'),
      dataIndex: 'tracker',
      key: 'tracker',
      width: '7%',
      render: (tracker, row) => <div>{row.workflow?.tracker?.name}</div>
    },
    {
      title: L('FEEDBACK_DESCRIPTION'),
      dataIndex: 'workflow',
      key: 'workflow',
      width: '15%',
      ellipsis: true,
      render: (workflow) => (
        <>
          <strong className="text-muted">{workflow?.subject}</strong>
          <Popover trigger="click" content={<div className="custom-text-show-table">{workflow?.description}</div>}>
            <Paragraph
              ellipsis={{
                rows: 1
              }}>
              {workflow?.description}
            </Paragraph>
          </Popover>
        </>
      )
    },
    {
      title: L('FEEDBACK_SOLUTION'),
      dataIndex: 'workflow',
      key: 'workflow',
      width: '15%',
      ellipsis: true,
      render: (workflow) => (
        <>
          <Popover trigger="click" content={<div className="custom-text-show-table">{workflow?.solution}</div>}>
            {' '}
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
      title: L('FEEDBACK_ASSIGNER'),
      dataIndex: 'assigned',
      key: 'assigned',
      width: '11%',
      ellipsis: true,
      render: (assigned, row) => (
        <Popover
          trigger="click"
          content={(row.workflow?.assignedUsers || []).map((user, index) => (
            <>
              {index > 0 ? ', ' : ''}
              <span>{user?.displayName}</span>
            </>
          ))}>
          <div>
            {(row.workflow?.assignedUsers || []).map((user, index) => (
              <>
                {index > 0 ? ', ' : ''}
                <span>{user?.displayName}</span>
              </>
            ))}
          </div>
        </Popover>
      )
    },
    {
      title: L('FEEDBACK_STATUS'),
      dataIndex: 'workflow',
      key: 'workflow',
      width: '10%',
      render: (workflow) =>
        renderTag(
          workflow?.status?.name,
          workflow?.status?.colorCode || 'black',
          workflow?.status?.borderColorCode || 'white'
        )
    },
    actionComment,
    {
      title: L('WORK_ORDER_CREATED_AT'),
      dataIndex: 'workflow',
      key: 'workflow',
      ellipsis: true,
      width: '15%',
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
