import withRouter from '@components/Layout/Router/withRouter'
import { L } from '@lib/abpUtility'
import ChatbotStore from '@stores/chatbotHistory/chatbotStore'
import SessionStore from '@stores/sessionStore'
import Stores from '@stores/storeIdentifier'
import { Col, Input, Row } from 'antd'
import { inject, observer } from 'mobx-react'
import { useEffect, useRef, useState } from 'react'
import ChatbotContentBox from './components/ChatbotContentBox'
import ChatbotHistoryItem from './components/ChatbotHistoryItem'

interface ChatbotDialogProps {
  location?: any
  sessionStore?: SessionStore
  chatbotStore?: ChatbotStore
  moduleId?: string
  parentId?: string
  isPrivate?: boolean
}

const ChatbotHistory = inject(
  Stores.ChatbotStore,
  Stores.SessionStore
)(
  observer((props: ChatbotDialogProps) => {
    const id = props?.location?.state?.id ?? null
    const locale = abp.localization.currentLanguage.name
    const listRef = useRef<HTMLDivElement>(null)
    const [selectedMsg, setSelectedMsg] = useState<any>(null)
    const [skipCount, setSkipCount] = useState<number>(0)
    const [filters, setFilters] = useState<any>({ isActive: 'true' })
    const [chatbotItems, setChatbotItems] = useState<any[]>([])
    const [direction, setDirection] = useState<'down' | 'up' | 'reset'>('reset')
    const [refreshKey, setRefreshKey] = useState<string>(crypto.randomUUID())

    // select initial msg
    useEffect(() => {
      if (id) {
        setSelectedMsg(id)
      }
    }, [id])

    const getAll = async (newFilters = filters, merge: 'down' | 'up' | 'reset' = 'down') => {
      await props.chatbotStore?.getAll({
        maxResultCount: 10,
        skipCount,
        ...newFilters
      })

      const newItems = props.chatbotStore?.tableData?.items ?? []

      setChatbotItems((prev) => {
        if (merge === 'reset') return newItems
        if (merge === 'down') return [...prev, ...newItems]
        if (merge === 'up') return [...newItems, ...prev]
        return prev
      })
    }

    const handleSelectedMsgChange = (id?: number) => {
      setSelectedMsg(id)
      setRefreshKey(crypto.randomUUID())
    }

    const updateSearch = async (name: string, value: any) => {
      const newFilter = { ...filters, [name]: value }
      setFilters(newFilter)
      setSkipCount(0)
      setDirection('reset')
    }

    const handleSearch = async (name: string, value: any) => {
      const newFilter = { ...filters, [name]: value }
      setFilters(newFilter)
      setSkipCount(0)
      setDirection('reset')
    }

    const handleScroll = () => {
      const el = listRef.current
      if (!el) return

      const totalCount = props.chatbotStore?.tableData?.totalCount ?? 0

      // Scroll down (bottom)
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
        if (skipCount + 10 < totalCount) {
          setDirection('down')
          setSkipCount((prev) => {
            const next = prev + 10
            return next < totalCount ? next : prev
          })
        }
      }

      // Scroll up (top)
      if (el.scrollTop <= 50 && skipCount > 0) {
        setDirection('up')
        setSkipCount((prev) => Math.max(prev - 10, 0))
      }
    }

    // pagination fetch (scroll down/up)
    useEffect(() => {
      if (direction === 'down' || direction === 'up' || direction === 'reset') {
        getAll(filters, direction)
      }
    }, [skipCount])

    useEffect(() => {
      const el = listRef.current
      if (el) el.addEventListener('scroll', handleScroll)
      return () => {
        if (el) el.removeEventListener('scroll', handleScroll)
      }
    }, [])

    return (
      <Row>
        {props?.sessionStore?.userAccountType === 'ADMIN' && (
          <Col span={8} style={{ backgroundColor: '#F7F9FA', height: 'calc(100vh - 100px)', overflowY: 'hidden' }}>
            <div className="header" style={{ backgroundColor: '#195595', color: '#fff', padding: '0.875rem 1rem' }}>
              {L('CHATBOT_MESSAGE')}
            </div>

            <div
              className="chatbot-history-list"
              style={{ height: 'calc(100vh - 140px)', overflowY: 'auto' }}
              ref={listRef}>
              <Input.Search
                maxLength={200}
                placeholder={L('CHATBOT_SEARCH_PLACEHOLDER')}
                onChange={(value) => updateSearch('keyword', value.target?.value)}
                onSearch={(value) => handleSearch('keyword', value)}
                style={{ padding: '0.875rem' }}
              />
              {chatbotItems.map((item, idx) => (
                <ChatbotHistoryItem
                  data={item}
                  key={`chatbot-item-${idx}`}
                  onClick={handleSelectedMsgChange}
                  locale={locale}
                />
              ))}
            </div>
          </Col>
        )}
        <Col flex="auto" style={{ height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
          {selectedMsg && <ChatbotContentBox key={refreshKey} selectedMsg={selectedMsg} />}
        </Col>
      </Row>
    )
  })
)

export default withRouter(ChatbotHistory)
