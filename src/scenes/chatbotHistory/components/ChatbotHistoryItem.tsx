import { Comment } from '@ant-design/compatible'
import { renderDateTime } from '@lib/helper'
import { Avatar, Tooltip } from 'antd'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/en'
import 'dayjs/locale/vi'

dayjs.extend(relativeTime)
interface ChatbotHistoryItemProps {
  data: any
  locale: string
  onClick: (id?: number) => void
}

const ChatbotHistoryItem = (props: ChatbotHistoryItemProps) => {
  const { data, locale, onClick } = props
  return (
    <div onClick={() => onClick?.(data?.uniqueId)} style={{ cursor: 'pointer' }}>
      <Comment
        author={
          <div>
            <div>{data?.uniqueUser?.displayName}</div>
            {data?.uniqueUser?.companyName && (
              <div style={{ fontSize: '10px', color: '#888' }}>{data?.uniqueUser?.companyName}</div>
            )}
          </div>
        }
        avatar={<Avatar src={data?.uniqueUser?.avatarUrl} alt="chatbot-avatar" />}
        content={<p>{data?.content}</p>}
        datetime={
          <Tooltip title={renderDateTime(data?.creationTime)}>
            <span style={{ position: 'absolute', right: '0', top: 0 }}>
              {dayjs(data?.creationTime).locale(locale).fromNow()}
            </span>
          </Tooltip>
        }
        style={{
          borderBottom: '1px solid #E3E5E5',
          paddingInline: '1rem',
          backgroundColor: !data?.isRead ? '#fff8e' : 'transparent'
        }}
      />
    </div>
  )
}

export default ChatbotHistoryItem
