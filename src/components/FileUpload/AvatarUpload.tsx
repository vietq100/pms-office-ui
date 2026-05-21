import { Upload, message } from 'antd'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import * as React from 'react'
import { inject, observer } from 'mobx-react'
import Stores from '../../stores/storeIdentifier'
import SessionStore from '../../stores/sessionStore'
import { getBase64 } from '../../lib/helper'
import { L, LError } from '../../lib/abpUtility'
import { defaultAvatar, moduleAvatar } from '../../lib/appconst'
import UserStore from '../../stores/administrator/userStore'
import ProjectStore from '@stores/project/projectStore'

export interface IAvatarUploadProps {
  sessionStore?: SessionStore
  userStore?: UserStore
  projectStore?: ProjectStore
  parentId?: any
  profilePictureId?: string
  initImageUrl?: string
  module: string
  cbGetProfilePicture?: () => void
}

export interface IAvatarUploadState {
  loading: boolean
  imageUrl?: string
}

@inject(Stores.SessionStore)
@observer
class AvatarUpload extends React.Component<IAvatarUploadProps, IAvatarUploadState> {
  state = {
    loading: false,
    imageUrl: ''
  }

  async componentDidMount() {
    this.initAvatar()
  }

  async componentDidUpdate(prevProps) {
    if (
      (this.props.module === moduleAvatar.resident ||
        this.props.module === moduleAvatar.staff ||
        this.props.module === moduleAvatar.shopOwner) &&
      this.props.userStore
    ) {
      if (
        prevProps.profilePictureId !== this.props.profilePictureId &&
        this.props.profilePictureId &&
        this.props.profilePictureId.length
      ) {
        await this.props.userStore.getProfilePicture(this.props.profilePictureId)
        this.setState({
          imageUrl: this.props.userStore.editUserProfilePicture,
          loading: false
        })
      } else if (prevProps.profilePictureId !== this.props.profilePictureId && !this.props.profilePictureId) {
        this.props.userStore.editUserProfilePicture = defaultAvatar
        this.setState({
          imageUrl: '',
          loading: false
        })
      }
    } else if (
      this.props.module === moduleAvatar.project &&
      this.props.parentId &&
      prevProps.initImageUrl !== this.props.initImageUrl
    ) {
      // Only init again if edit case
      this.setState({
        imageUrl: this.props.initImageUrl,
        loading: false
      })
    }
  }

  initAvatar = async () => {
    this.setState({ loading: true })
    if (this.props.module === moduleAvatar.myProfile && this.props.sessionStore) {
      await this.props.sessionStore.getMyProfilePicture()
      this.setState({
        imageUrl: this.props.sessionStore.profilePicture,
        loading: false
      })
      return
    } else if (
      this.props.parentId &&
      this.props.profilePictureId &&
      this.props.profilePictureId.length &&
      this.props.userStore &&
      (this.props.module === moduleAvatar.staff ||
        this.props.module === moduleAvatar.resident ||
        this.props.module === moduleAvatar.shopOwner)
    ) {
      await this.props.userStore.getProfilePicture(this.props.profilePictureId)
      this.setState({
        imageUrl: this.props.userStore.editUserProfilePicture,
        loading: false
      })
      return
    } else if (this.props.module === moduleAvatar.project && this.props.projectStore && this.props.parentId) {
      this.setState({
        imageUrl: this.props.initImageUrl,
        loading: false
      })
      return
    }

    this.setState({ loading: false })
  }

  handleChange = (info) => {
    if (this.props.module === moduleAvatar.project) {
      getBase64(info.file, (imageUrl) => this.setState({ imageUrl }))
    }
  }

  beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
      message.error(LError('ACCEPTED_FILE_TYPES_{0}', 'Image'))
      return false
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error(LError('MAX_FILE_SIZE_{0}', '2Mb'))
      return false
    }

    this.handleUpload(file)
    return false
  }

  handleUpload = async (file) => {
    this.setState({ loading: true })
    if (this.props.module === moduleAvatar.myProfile && this.props.sessionStore) {
      const fileInfo = await this.props.sessionStore.uploadMyProfilePicture(file)
      await this.props.sessionStore.updateMyProfilePicture({
        ...fileInfo,
        x: 0,
        y: 0
      })
      this.setState({
        loading: false,
        imageUrl: this.props.sessionStore.profilePicture
      })
      return
    } else if (
      this.props.parentId &&
      this.props.userStore &&
      (this.props.module === moduleAvatar.resident ||
        this.props.module === moduleAvatar.staff ||
        this.props.module === moduleAvatar.shopOwner)
    ) {
      const fileInfo = await this.props.userStore.uploadProfilePicture(file)
      await this.props.userStore.updateProfilePicture({
        ...fileInfo,
        x: 0,
        y: 0,
        userId: this.props.parentId
      })
      this.setState({
        imageUrl: this.props.userStore.editUserProfilePicture,
        loading: false
      })
    } else if (this.props.projectStore && this.props.module === moduleAvatar.project) {
      await this.props.projectStore.uploadProjectLogo(file, this.props.parentId)

      this.setState({
        loading: false
      })
    }

    if (this.props.cbGetProfilePicture) {
      this.props.cbGetProfilePicture()
    }
  }

  render() {
    const uploadButton = (
      <div>
        {this.state.loading ? <LoadingOutlined /> : <PlusOutlined />}
        <div className="ant-upload-text">{this.state.loading ? L('LOADING') : L('UPLOAD')}</div>
      </div>
    )
    const { imageUrl } = this.state
    const disableUpload =
      (this.props.module === moduleAvatar.resident ||
        this.props.module === moduleAvatar.staff ||
        this.props.module === moduleAvatar.shopOwner) &&
      !this.props.parentId

    return (
      <div style={{ textAlign: 'center' }}>
        <Upload
          disabled={disableUpload}
          name="avatar"
          listType="picture-card"
          className="avatar-uploader"
          showUploadList={false}
          beforeUpload={(file) => this.beforeUpload(file)}
          onChange={this.handleChange}>
          {imageUrl ? (
            <img src={imageUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            uploadButton
          )}
        </Upload>
        {imageUrl && imageUrl.length > 0 ? L('CHANGE') : ''}
      </div>
    )
  }
}

export default AvatarUpload
