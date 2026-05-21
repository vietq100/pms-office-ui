import { Col, List, Modal, Row, Avatar, Button, Input, Card } from 'antd'
import React from 'react'
import { isGranted, L } from '../../../lib/abpUtility'
import CommentStore from '@stores/common/commentStore'
import { getFirstLetterAndUpperCase, isNullOrEmpty, renderDateTime } from '@lib/helper'
import './comments.less'
import FileImages from '@components/FileUpload/FileImages'
import SessionStore from '@stores/sessionStore'
import { renderDocuments } from '@components/FileUpload/FileDocuments'
import UploadButton from '@components/FileUpload/UploadButton'
import { appPermissions, moduleIds } from '@lib/appconst'
import { PaperClipOutlined, SendOutlined } from '@ant-design/icons'
import Stores from '@stores/storeIdentifier'
import { inject, observer } from 'mobx-react'
import { Comment } from '@ant-design/compatible'

const { TextArea } = Input

type Props = {
  uniqueId: any
  visible: boolean
  moduleId: any
  onCancel: () => void
  isPrivate: boolean
  commentStore: CommentStore
  sessionStore: SessionStore
}

const Editor = ({ onChange, onSubmit, onSelectFile, onRemoveFile, loading, comment, files }) => (
  <Row gutter={[8, 8]}>
    <Col flex="auto">
      <TextArea rows={1} onChange={onChange} value={comment} size="large" />
      {files && files.length > 0 && renderDocuments(files, null, null, onRemoveFile)}
    </Col>
    <Col flex="100px">
      <UploadButton
        moduleId={moduleIds.comment}
        label={L('ATTACH')}
        acceptedFileTypes={['.jpg', '.jpeg', '.png']}
        onSelectFile={onSelectFile}
        multiple={true}
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

const CommentListModal = inject(Stores.CommentStore)(
  observer((props: Props) => {
    React.useEffect(() => {
      getListComment()
      getCurrentLogin()
    }, [props.visible === true])

    const [comments, setComments] = React.useState<any[]>([])
    const [comment, setComment] = React.useState<any>('')
    const [files, setFiles] = React.useState<any[]>([])
    const getListComment = async () => {
      const params = {
        conversationUniqueId: props.uniqueId
      }
      await props.commentStore.getAll(params)
      setComments(props.commentStore.comments.items)
    }

    const [currentLoginInformations, setCurrentLoginInformations] = React.useState<any>()
    const getCurrentLogin = async () => {
      await props.sessionStore.getCurrentLoginInformations()
      setCurrentLoginInformations(props.sessionStore.currentLogin)
    }

    const handleChange = (e) => {
      setComment(e.target?.value)
    }

    const onSelectFile = (files) => {
      setFiles(files)
    }

    const handleSubmit = async () => {
      if (isNullOrEmpty(comment)) {
        return
      }
      const { moduleId, uniqueId, isPrivate } = props

      const body = {
        content: comment,
        moduleId,
        conversationUniqueId: uniqueId,
        isPrivate
      }
      await props.commentStore.create(body, files)
      getListComment()
      setComment('')

      setFiles([])
    }

    const onRemoveFile = (file, index) => {
      const fileAfterRemove = files.filter((item, i) => index !== i)

      setFiles(fileAfterRemove)
    }

    return (
      <Modal
        width={800}
        open={props.visible}
        cancelText={L('BTN_CANCEL')}
        onCancel={props.onCancel}
        onOk={props.onCancel}>
        {(isGranted(appPermissions.communication.create) || props.isPrivate) && (
          <Comment
            className="wrap-comment-editor"
            style={{ padding: 0 }}
            avatar={
              <Avatar
                src={props.sessionStore.profilePicture}
                alt={props.sessionStore.currentLogin.user?.name}
                size="large">
                {getFirstLetterAndUpperCase(props.sessionStore.currentLogin.user?.name)}
              </Avatar>
            }
            content={
              <Editor
                onChange={handleChange}
                onSubmit={handleSubmit}
                onSelectFile={onSelectFile}
                onRemoveFile={onRemoveFile}
                comment={comment}
                files={files}
                loading={false}
              />
            }
          />
        )}
        {comments?.length > 0 && (isGranted(appPermissions.communication.read) || props.isPrivate) && (
          <Card className="mt-2 comment-list" style={{ overflow: 'auto', maxHeight: '60vh' }}>
            <List
              dataSource={comments}
              itemLayout="horizontal"
              renderItem={(props: any) => (
                <Row gutter={[8, 8]}>
                  <Col
                    sm={{ span: 24, offset: 0 }}
                    className={currentLoginInformations.user?.id === props.user?.id ? 'comment-right' : ''}>
                    <Comment
                      author={props.author}
                      avatar={
                        <Avatar src={props.avatar} alt={props.author} size="large">
                          {getFirstLetterAndUpperCase(props.author)}
                        </Avatar>
                      }
                      content={props.content}
                      datetime={renderDateTime(props.creationTime)}
                    />
                    {props.files && props.files.length > 0 && <FileImages files={props.files} wrapClass="" />}
                  </Col>
                </Row>
              )}
            />
          </Card>
        )}
      </Modal>
    )
  })
)

export default CommentListModal
