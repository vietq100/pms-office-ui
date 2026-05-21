import { Col, Row, Button, Input, List, Avatar, Card, Spin } from 'antd'
import { inject, observer } from 'mobx-react'
import Stores from '../../stores/storeIdentifier'
import AppComponentBase from '../AppComponentBase'
import CommentStore from '../../stores/common/commentStore'
import { isGrantedAny, L } from '@lib/abpUtility'
import { PaperClipOutlined, SendOutlined } from '@ant-design/icons/lib'
import { appPermissions, moduleIds } from '@lib/appconst'
import SessionStore from '../../stores/sessionStore'
import './comments.less'
import { isNullOrEmpty, getFirstLetterAndUpperCase, renderDateTime } from '@lib/helper'
import UploadButton from '@components/FileUpload/UploadButton'
import { renderDocuments } from '@components/FileUpload/FileDocuments'
import { Comment } from '@ant-design/compatible'
import FileImageAndPdf from '@components/FileUpload/FileImageAndPdf'

const { TextArea } = Input

const Editor = ({ onChange, onSubmit, onSelectFile, onRemoveFile, loading, comment, files, allowPdf }) => (
  <Row gutter={[8, 8]}>
    <Col flex="auto">
      <TextArea rows={1} onChange={onChange} value={comment} size="large" />
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

export interface ICommentProps {
  moduleId: number
  parentId: string | number
  commentStore: CommentStore
  sessionStore: SessionStore
  isPrivate: boolean
  aceptFile?: string
}

@inject(Stores.CommentStore)
@observer
class CommentList extends AppComponentBase<ICommentProps> {
  state = {
    filters: { maxResultCount: 10, skipCount: 0, isIncludeFile: true },
    loading: false,
    comment: '',
    files: []
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.parentId !== this.props.parentId) {
      await this.handleSearch()
    }
  }

  // async componentDidMount() {
  //   await this.handleSearch()
  // }

  componentWillUnmount() {
    this.props.commentStore.comments = { items: [], totalCount: 0 }
  }

  handleTableChange = (pagination: any) => {
    const { filters } = this.state
    filters.skipCount = (pagination.current - 1) * filters.maxResultCount!
    this.setState({ filters }, async () => {
      await this.handleSearch()
    })
  }

  handleSearch = async () => {
    const { moduleId, parentId, isPrivate } = this.props
    const { filters } = this.state
    this.setState({ loading: true })
    if (!parentId) return
    const params = {
      ...filters,
      moduleId,
      conversationUniqueId: parentId,
      isPrivate
    }

    await this.props.commentStore.getAll(params)
    this.setState({ loading: false })
  }

  handleSubmit = () => {
    if (isNullOrEmpty(this.state.comment)) {
      return
    }
    const { moduleId, parentId, isPrivate } = this.props
    const { comment, files } = this.state
    this.setState({ loading: true }, async () => {
      const body = {
        content: comment,
        moduleId,
        conversationUniqueId: parentId,
        isPrivate
      }
      await this.props.commentStore.create(body, files)
      await this.handleSearch()
      this.setState({ loading: false, comment: '', files: [] })
    })
  }

  handleChange = (e) => {
    this.setState({
      comment: e.target.value
    })
  }

  onSelectFile = (files) => {
    this.setState({ files: [...this.state.files, ...files] })
  }
  onRemoveFile = (file, index) => {
    const files = this.state.files.filter((item, i) => index !== i)
    this.setState({ files })
  }

  render() {
    const { loading, comment } = this.state
    const {
      commentStore: { comments }
    } = this.props

    return (
      <Row className="wrap-comments">
        <Col sm={{ span: 24, offset: 0 }}>
          {comments.items?.length > 0 &&
            (isGrantedAny(appPermissions.communication.create, appPermissions.communication.read) ||
              this.props.isPrivate) && (
              <Card className="mt-2 comment-list" style={{ height: 600, overflow: 'auto' }}>
                {this.state.loading ? (
                  <div className="text-center">
                    <Spin />
                  </div>
                ) : (
                  <List
                    dataSource={comments.items}
                    itemLayout="horizontal"
                    renderItem={(props: any) => (
                      <Row gutter={[8, 12]}>
                        <Col
                          sm={{ span: 24, offset: 0 }}
                          className={
                            this.props.sessionStore.currentLogin.user?.id === props.user?.id ? 'comment-right' : ''
                          }>
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
                          {props.files && props.files.length > 0 && (
                            <FileImageAndPdf files={props.files} wrapClass="" />
                          )}
                        </Col>
                      </Row>
                    )}
                  />
                )}
              </Card>
            )}

          {(isGrantedAny(appPermissions.communication.create, appPermissions.communication.read) ||
            this.props.isPrivate) && (
            <Comment
              className="wrap-comment-editor"
              style={{ padding: 0 }}
              avatar={
                <Avatar
                  src={this.props.sessionStore.profilePicture}
                  alt={this.props.sessionStore.currentLogin.user.name}
                  size="large">
                  {getFirstLetterAndUpperCase(this.props.sessionStore.currentLogin.user.name)}
                </Avatar>
              }
              content={
                <Editor
                  onChange={this.handleChange}
                  onSubmit={this.handleSubmit}
                  onSelectFile={this.onSelectFile}
                  onRemoveFile={this.onRemoveFile}
                  loading={loading}
                  comment={comment}
                  files={this.state.files}
                  allowPdf={this.props.isPrivate ? false : true}
                />
              }
            />
          )}
        </Col>
      </Row>
    )
  }
}

export default CommentList
