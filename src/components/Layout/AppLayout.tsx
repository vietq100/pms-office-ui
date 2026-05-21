import './AppLayout.less'

import * as React from 'react'

import { Navigate, Route, Routes } from 'react-router-dom'

import DocumentTitle from 'react-document-title'
import Header from './Header'
import { Layout } from 'antd'
import ProtectedRoute from './Router/ProtectedRoute'
import SiderMenu from './SiderMenu'
import { portalLayouts } from './Router/router.config'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import withRouter from './Router/withRouter'
import { AppConfiguration } from '@lib/appconst'
import ChatbotDialog from '@scenes/chatbotHistory/components/ChatbotDialog'
// import AppConfiguration from '@lib/appconst'

const { Content } = Layout
const title = AppConfiguration.appLayoutConfig.title

@inject(Stores.ProjectStore, Stores.SessionStore)
@observer
class AppLayout extends React.Component<any> {
  state = {
    collapsed: false,
    isMobile: false
  }

  componentDidMount = async () => {
    window.addEventListener('resize', this.handleResize)

    if (await this.props.sessionStore!.appSettingConfiguration?.isReminderCreateFeePackage) {
      const { navigate } = this.props
      navigate(portalLayouts.feePackage.path)
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  handleResize = () => {
    this.setState({ isMobile: window.innerWidth < 768 })
  }

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed
    })
  }

  onCollapse = (collapsed: any) => {
    this.setState({ collapsed })
  }

  render() {
    const { navigate, location } = this.props
    const { pathname } = location || {}
    const { collapsed, isMobile } = this.state
    const { userAccountType } = this.props.sessionStore

    const layout = (
      <Layout>
        <SiderMenu path="" onCollapse={this.onCollapse} collapsed={collapsed} />
        <Layout className="site-layout">
          <Layout.Header
            style={{
              background: 'transparent',
              minHeight: 52,
              padding: 0,
              position: 'fixed',
              left: 0,
              zIndex: 1,
              width: '100%'
            }}>
            <Header
              isMobile={isMobile}
              collapsed={collapsed}
              projectStore={this.props.projectStore}
              toggle={this.toggle}
              navigate={navigate}
            />
          </Layout.Header>
          <Content>
            <Routes>
              {Object.keys(portalLayouts).map((key: any, index: any) => {
                const route = portalLayouts[key]
                const ItemComponent = route.component

                return (
                  <Route key={index} path={route.path} element={<ProtectedRoute component={<ItemComponent />} />} />
                )
              })}
              {pathname !== '/' && (
                <Route
                  element={
                    <Navigate
                      to={{
                        pathname: '/exception?type=404'
                      }}
                    />
                  }
                />
              )}
            </Routes>
          </Content>
          {userAccountType !== 'ADMIN' && <ChatbotDialog />}
        </Layout>
        <style>
          {collapsed &&
            `
            .collapse-width {
              width: calc(100vw - 55px) !important
            }
          `}
        </style>
      </Layout>
    )

    return <DocumentTitle title={title}>{layout}</DocumentTitle>
  }
}

export default withRouter(AppLayout)
