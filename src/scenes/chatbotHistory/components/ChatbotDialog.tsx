import { Avatar, Button, Card, Col, List, Row } from 'antd'
import { Comment } from '@ant-design/compatible'
import { useEffect, useRef, useState } from 'react'
import { getFirstLetterAndUpperCase, isNullOrEmpty, renderDateTime } from '@lib/helper'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import SessionStore from '@stores/sessionStore'
import { L } from '@lib/abpUtility'
import { moduleIds } from '@lib/appconst'
import FileImageAndPdf from '@components/FileUpload/FileImageAndPdf'
import TextArea from 'antd/lib/input/TextArea'
import { renderDocuments } from '@components/FileUpload/FileDocuments'
import UploadButton from '@components/FileUpload/UploadButton'
import { CloseOutlined, PaperClipOutlined, SendOutlined } from '@ant-design/icons'
import ChatbotIcon from '@assets/icons/chatbot.svg'
import ChatbotStore from '@stores/chatbotHistory/chatbotStore'

interface ChatbotDialogProps {
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
      <Col flex="none">
        <UploadButton
          moduleId={moduleIds.comment}
          label={L('')}
          acceptedFileTypes={allowPdf ? ['.jpg', '.jpeg', '.png', '.pdf'] : ['.jpg', '.jpeg', '.png']}
          onSelectFile={onSelectFile}
          multiple={false}
          wrapClass="btn-attachment"
          icon={<PaperClipOutlined />}
          maxNumberFile={3}
          maxSize={5}
        />
      </Col>
      <Col flex="auto">
        <TextArea
          rows={1}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          value={comment}
          size="large"
          style={{ resize: 'none' }}
        />
        {files && files.length > 0 && renderDocuments(files, null, null, onRemoveFile)}
      </Col>
      <Col flex="none">
        <Button
          htmlType="submit"
          loading={loading}
          onClick={onSubmit}
          size="small"
          shape="round"
          type="primary"
          icon={<SendOutlined />}>
          {L('')}
        </Button>
      </Col>
    </Row>
  )
}

const ChatbotDialog = inject(
  Stores.SessionStore,
  Stores.ChatbotStore
)(
  observer((props: ChatbotDialogProps) => {
    const selectedMsg = props.sessionStore?.currentLogin?.user?.uniqueId
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const { sessionStore, chatbotStore } = props
    const [comment, setComment] = useState('')
    const [files, setFiles] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [isChatbot, setIsChatbot] = useState(false)

    const onSelectFile = (newFiles: any[]) => {
      setFiles([...files, ...newFiles])
    }

    const onRemoveFile = (file: any, index: number) => {
      const newFiles = files.filter((_, i) => index !== i)
      setFiles(newFiles)
    }

    const handleSubmit = async () => {
      if (isNullOrEmpty(comment)) {
        return
      }

      setLoading(true)
      try {
        const body = {
          content: comment,
          moduleId: 5,
          conversationUniqueId: selectedMsg
        }
        await chatbotStore?.create(body, files)
        getDetail(selectedMsg)
        setComment('')
        setFiles([])
      } finally {
        setLoading(false)
      }
    }

    const handleChange = (e: any) => {
      setComment(e.target.value)
    }

    const getDetail = async (id: string | undefined) => {
      if (id) {
        await props.chatbotStore?.get(id)
      }
    }

    useEffect(() => {
      if (selectedMsg) {
        getDetail(selectedMsg)
      }
    }, [selectedMsg])

    useEffect(() => {
      if (isChatbot) {
        messagesEndRef.current?.scrollIntoView({ block: 'end' })
      }
    }, [isChatbot])

    return (
      <>
        <div
          style={{
            position: 'fixed',
            bottom: 50,
            right: 20
          }}>
          {isChatbot && (
            <Card
              className="comment-list"
              title={L('OPERATOR')}
              extra={<CloseOutlined style={{ cursor: 'pointer' }} onClick={() => setIsChatbot(false)} />}
              style={{
                width: 400,
                height: 500,
                borderRadius: 16,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative'
              }}
              bodyStyle={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
                overflow: 'hidden'
              }}>
              {/* Message list (fills remaining height, scrollable) */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '8px',
                  marginBottom: '60px' // reserve space for input editor
                }}>
                <List
                  dataSource={props.chatbotStore?.detailData?.items}
                  itemLayout="horizontal"
                  renderItem={(item: any) => (
                    <Row gutter={[8, 12]} wrap={false}>
                      <Col
                        sm={{ span: 24 }}
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
                        {item.files?.length > 0 && <FileImageAndPdf files={item.files} wrapClass="" />}
                      </Col>
                    </Row>
                  )}
                />
                <div ref={messagesEndRef} />
              </div>

              {/* Input editor (absolute at bottom) */}
              <div
                style={{
                  borderTop: '1px solid #eee',
                  padding: '8px',
                  background: '#fff',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0
                }}>
                <Editor
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  onSelectFile={onSelectFile}
                  onRemoveFile={onRemoveFile}
                  loading={loading}
                  comment={comment}
                  files={files}
                  allowPdf={true}
                />
              </div>
            </Card>
          )}
        </div>
        <Button
          type="link"
          onClick={() => setIsChatbot(!isChatbot)}
          style={{
            position: 'absolute',
            bottom: '3%',
            right: '2%',
            padding: 0
          }}>
          <img src={ChatbotIcon} alt="chatbot-toggle" style={{ width: '50px', height: '50px' }} />
        </Button>
      </>
    )
  })
)

export default ChatbotDialog
