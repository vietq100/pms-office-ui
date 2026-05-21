import { Comment } from '@ant-design/compatible'
import { PaperClipOutlined, SendOutlined } from '@ant-design/icons'
import { renderDocuments } from '@components/FileUpload/FileDocuments'
import FileImageAndPdf from '@components/FileUpload/FileImageAndPdf'
import UploadButton from '@components/FileUpload/UploadButton'
import { L } from '@lib/abpUtility'
import { moduleIds } from '@lib/appconst'
import { getFirstLetterAndUpperCase, isNullOrEmpty, renderDateTime } from '@lib/helper'
import ChatbotStore from '@stores/chatbotHistory/chatbotStore'
import SessionStore from '@stores/sessionStore'
import Stores from '@stores/storeIdentifier'
import { Avatar, Button, Card, Col, Row, Spin } from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import { inject, observer } from 'mobx-react'
import { useEffect, useRef, useState } from 'react'

interface ChatbotContentBoxProps {
  selectedMsg: any
  sessionStore?: SessionStore
  chatbotStore?: ChatbotStore
}

const Editor = ({ onChange, onSubmit, onSelectFile, onRemoveFile, loading, comment, files, allowPdf }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }
  return (
    <Row gutter={[8, 8]}>
      <Col flex="auto">
        <TextArea rows={1} onChange={onChange} onKeyDown={handleKeyDown} value={comment} size="large" />
        {files && files.length > 0 && renderDocuments(files, null, null, onRemoveFile)}
      </Col>
      <Col flex="100px">
        <UploadButton
          moduleId={moduleIds.comment}
          label={L('ATTACH')}
          acceptedFileTypes={allowPdf ? ['.jpg', '.jpeg', '.png', '.pdf'] : ['.jpg', '.jpeg', '.png']}
          onSelectFile={onSelectFile}
          multiple={false}
          wrapClass="btn-attachment"
          icon={<PaperClipOutlined />}
          maxNumberFile={3}
          maxSize={5}
        />
      </Col>
      <Col flex="100px">
        <Button
          htmlType="submit"
          loading={loading}
          onClick={onSubmit}
          size="large"
          shape="round"
          type="primary"
          icon={<SendOutlined />}>
          {L('BTN_ADD_COMMENT')}
        </Button>
      </Col>
    </Row>
  )
}

const ChatbotContentBox = inject(
  Stores.SessionStore,
  Stores.ChatbotStore
)(
  observer((props: ChatbotContentBoxProps) => {
    const { selectedMsg, sessionStore } = props
    const listRef = useRef<HTMLDivElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const [comment, setComment] = useState('')
    const [files, setFiles] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [skipCount, setSkipCount] = useState(0)
    const [chatbotItems, setChatbotItems] = useState<any[]>([])

    // Virtual scroll states
    const rowHeight = 100 // estimate average row height (px)
    const [scrollTop, setScrollTop] = useState(0)
    const viewportHeight = 500 // set your chat viewport height (px)

    const onSelectFile = (newFiles: any[]) => setFiles([...files, ...newFiles])
    const onRemoveFile = (_: any, index: number) => setFiles(files.filter((_, i) => i !== index))

    const handleSubmit = async () => {
      if (isNullOrEmpty(comment)) return
      setLoading(true)
      try {
        const body = {
          content: comment,
          moduleId: 5,
          conversationUniqueId: selectedMsg
        }
        await props.chatbotStore?.create(body, files)

        // reload latest messages
        setSkipCount(0)
        setChatbotItems([])
        await getDetail(selectedMsg, 0, true)
        setComment('')
        setFiles([])
      } finally {
        setLoading(false)
      }
    }

    const getDetail = async (id: string, skip = skipCount, reset = false) => {
      if (!id) return
      setLoading(true)

      await props.chatbotStore?.get({
        maxResultCount: 10,
        skipCount: skip,
        conversationUniqueId: id,
        moduleId: 5
      })

      const newItems = props.chatbotStore?.detailData?.items ?? []

      setChatbotItems((prev) => {
        if (reset) return newItems
        return [...newItems, ...prev]
      })

      setLoading(false)
    }

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget
      setScrollTop(el.scrollTop)

      // infinite scroll for older items
      if (el.scrollTop <= 50 && !loading) {
        const totalCount = props.chatbotStore?.detailData?.totalCount ?? 0
        if (chatbotItems.length >= totalCount) return

        const nextSkip = skipCount + 10
        setSkipCount(nextSkip)

        const prevHeight = el.scrollHeight
        getDetail(selectedMsg, nextSkip).then(() => {
          const newHeight = el.scrollHeight
          el.scrollTop = newHeight - prevHeight
        })
      }
    }

    useEffect(() => {
      if (selectedMsg) {
        setSkipCount(0)
        setChatbotItems([])
        getDetail(selectedMsg, 0, true).then(() => {
          // wait until DOM is painted
          requestAnimationFrame(() => {
            if (listRef.current) {
              listRef.current.scrollTop = listRef.current.scrollHeight
            }
          })
        })
      }
    }, [selectedMsg])

    // Virtualization math
    const totalHeight = chatbotItems.length * rowHeight
    const startIndex = Math.floor(scrollTop / rowHeight)
    const visibleCount = Math.ceil(viewportHeight / rowHeight) + 5 // add buffer
    const endIndex = Math.min(startIndex + visibleCount, chatbotItems.length)
    const offsetY = startIndex * rowHeight
    const visibleItems = chatbotItems.slice(startIndex, endIndex)

    return (
      <>
        <Card
          ref={listRef}
          onScroll={handleScroll}
          className="mb-2 comment-list"
          style={{
            height: viewportHeight,
            overflow: 'auto',
            width: '100%',
            position: 'absolute',
            backgroundColor: 'transparent',
            boxShadow: 'none'
          }}>
          {props.chatbotStore?.isLoading && chatbotItems.length === 0 ? (
            <div className="text-center">
              <Spin />
            </div>
          ) : (
            <div style={{ height: totalHeight, position: 'relative' }}>
              <div style={{ transform: `translateY(${offsetY}px)` }}>
                {visibleItems.map((item: any) => (
                  <Row key={item.id} gutter={[8, 12]}>
                    <Col
                      sm={{ span: 24, offset: 0 }}
                      className={sessionStore?.currentLogin.user?.id === item.user?.id ? 'comment-right' : ''}>
                      <Comment
                        author={item.author}
                        avatar={
                          <Avatar src={item.avatar} alt={item.author} size="large">
                            {getFirstLetterAndUpperCase(item.author)}
                          </Avatar>
                        }
                        content={item.content}
                        datetime={renderDateTime(item.creationTime)}
                      />
                      {item.files && item.files.length > 0 && <FileImageAndPdf files={item.files} wrapClass="" />}
                    </Col>
                  </Row>
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </Card>

        <Comment
          className="wrap-comment-editor"
          style={{ padding: 0, backgroundColor: 'transparent' }}
          avatar={
            <Avatar src={sessionStore?.profilePicture} alt={sessionStore?.currentLogin.user.name} size="large">
              {getFirstLetterAndUpperCase(sessionStore?.currentLogin.user.name)}
            </Avatar>
          }
          content={
            <Editor
              onChange={(e) => setComment(e.target.value)}
              onSubmit={handleSubmit}
              onSelectFile={onSelectFile}
              onRemoveFile={onRemoveFile}
              loading={loading}
              comment={comment}
              files={files}
              allowPdf={true}
            />
          }
        />
      </>
    )
  })
)

export default ChatbotContentBox
