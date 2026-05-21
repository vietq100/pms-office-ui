
import * as React from 'react'

import { Avatar } from 'antd'
import NoticeIconView from './NoticeIcon/NoticeIconView'
import LanguageSelect from './LanguageSelect'
import MyProfileSelect from './MyProfile'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import SessionStore from '../../../stores/sessionStore'
import ProjectSelect from '@components/Layout/Header/ProjectSelect'
import ProjectStore from '@stores/project/projectStore'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'

export interface IHeaderProps {
  navigate?: any
  sessionStore?: SessionStore
  projectStore: ProjectStore
  collapsed?: any
  isMobile?: any
  toggle?: any
}

@inject(Stores.SessionStore, Stores.ProjectStore)
@observer
export class Header extends React.Component<IHeaderProps> {
  render() {
    return (
      <div className={'header-container'}>
        <div className={'wrap-header-logo'} style={{ width: this.props.collapsed ? 0 : 256 }}>
          {this.props.collapsed ? (
            <>
              <MenuFoldOutlined onClick={this.props.toggle} className="btn-fold-menu" />
            </>
          ) : (
            <>
              <MenuUnfoldOutlined onClick={this.props.toggle} className="btn-fold-menu" />
            </>
          )}
          <div className={'wrap-logo'}>
            <Avatar
              shape="square"
              style={{ height: this.props.collapsed ? 48 : '2rem', width: 'auto' }}
              src="/assets/images/logo-horizontal.png"
            />
          </div>
        </div>
        <div className={'wrap-header'}>
          <div
            style={{
              float: 'right',
              display: this.props.isMobile && !this.props.collapsed ? 'none' : 'inline-block',
              width: 'fit-content'
            }}>
            <ProjectSelect wrapClass={'wrap-project-select mr-3'} sessionStore={this.props.sessionStore} />
            <div className="wrap-profile">
              <LanguageSelect wrapClass="wrap-item" />
              <NoticeIconView navigate={this.props.navigate} wrapClass="wrap-item" />
              <MyProfileSelect wrapClass="wrap-item border" sessionStore={this.props.sessionStore} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Header
