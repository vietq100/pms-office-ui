import 'famfamfam-flags/dist/sprite/famfamfam-flags.css'

import * as React from 'react'

import { Avatar, Dropdown, Menu } from 'antd'
import { LogoutOutlined, LockOutlined, UserOutlined } from '@ant-design/icons'
import Stores from '../../../../stores/storeIdentifier'
import SessionStore from '../../../../stores/sessionStore'
import { inject, observer } from 'mobx-react'
import { L } from '../../../../lib/abpUtility'
import MyProfileFormModal from './components/myProfileFormModal'
import ChangePasswordModal from './components/changePasswordModal'

export interface IMyProfileProps {
  sessionStore?: SessionStore
  wrapClass?: string
}

@inject(Stores.SessionStore)
@observer
class MyProfileSelect extends React.Component<IMyProfileProps> {
  formRef: any = React.createRef()

  state = {
    showProfileModal: false,
    showChangePasswordModal: false,
    imageUrl: ''
  }

  componentDidMount(): void {
    // this.props.sessionStore?.getMyProfilePicture()
  }

  hideOrShowModal = (modalName) => {
    this.setState({ [modalName]: !this.state[modalName] })
  }

  showUpdateMyProfileModal = async () => {
    this.setState({ showProfileModal: true })
    const form = this.formRef.current
    if (this.props.sessionStore && form) {
      form.setFieldsValue({ ...this.props.sessionStore.currentLogin.user })
    }
  }

  logOut = async () => {
    await this.props.sessionStore?.logout()
  }

  render() {
    // const currentLogin = this.props.sessionStore!.currentLogin
    const profilePicture = this.props.sessionStore?.profilePicture
    const myProfileMenu = (
      <Menu>
        <Menu.Item key="1" onClick={this.showUpdateMyProfileModal}>
          <UserOutlined />
          <span> {L('MY_PROFILE')}</span>
        </Menu.Item>

        <Menu.Item key="3" onClick={() => this.hideOrShowModal('showChangePasswordModal')}>
          <LockOutlined />
          <span> {L('CHANGE_PASSWORD')}</span>
        </Menu.Item>
        <Menu.Item key="2" onClick={this.logOut}>
          <LogoutOutlined />
          <span> {L('LOGOUT')}</span>
        </Menu.Item>
      </Menu>
    )

    return (
      <>
        <Dropdown overlay={myProfileMenu} placement="bottomRight" className={this.props.wrapClass}>
          <div>
            <Avatar
              style={{ height: 36, width: 36, borderRadius: '50%' }}
              shape="circle"
              alt={'profile'}
              src={profilePicture}
            />
            {/*<span>{currentLogin.user?.name}</span>*/}
          </div>
        </Dropdown>
        <MyProfileFormModal
          formRef={this.formRef}
          sessionStore={this.props.sessionStore}
          visible={this.state.showProfileModal}
          onCancel={() => this.hideOrShowModal('showProfileModal')}
        />
        <ChangePasswordModal
          visible={this.state.showChangePasswordModal}
          onCancel={() =>
            this.setState({
              showChangePasswordModal: false
            })
          }
          onCreate={() =>
            this.setState({
              showChangePasswordModal: false
            })
          }
        />
      </>
    )
  }
}

export default MyProfileSelect
