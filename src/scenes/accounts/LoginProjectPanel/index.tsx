
import * as React from 'react'

import { Col, Input, Row, Card } from 'antd'
import { inject, observer } from 'mobx-react'
import AccountStore from '../../../stores/accountStore'
import AuthenticationStore from '../../../stores/authenticationStore'
import { isGranted, L } from '../../../lib/abpUtility'
import SessionStore from '../../../stores/sessionStore'
import Stores from '../../../stores/storeIdentifier'
import debounce from 'lodash/debounce'
import withRouter from '@components/Layout/Router/withRouter'
import { portalLayouts } from '@components/Layout/Router/router.config'
const { Search } = Input

export interface ILoginProps {
  authenticationStore?: AuthenticationStore
  sessionStore?: SessionStore
  accountStore?: AccountStore
  location: any
}

@inject(Stores.AuthenticationStore, Stores.SessionStore, Stores.AccountStore)
@observer
class LoginProjectPanel extends React.Component<ILoginProps, any> {
  state = {
    projects: [] as any[],
    isMobile: false
  }
  componentDidMount = async () => {
    if (window.screen.width <= 760) {
      this.resize(true)
    } else {
      this.resize(false)
    }
    if (this.props.sessionStore) {
      await this.props.sessionStore.getOwnProjects({})
      const projects = this.props.sessionStore.ownProjects
      this.setState({ projects })
    }
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resize.bind(this))
  }
  resize = (isResize) => {
    this.setState({ isMobile: isResize })
  }
  filterProject = debounce(async (keyword) => {
    const { projects } = this.state
    ;(projects || []).map((project) => {
      project.show = !keyword || keyword.length === 0 || (project.normalizedName || '').includes(keyword.toLowerCase())
    })
    this.setState({ projects })
  }, 100)

  handleSelectProject = async (project: any) => {
    if (project) {
      await this.props.sessionStore!.changeProject(project)
      sessionStorage.setItem('rememberMe', '1')
      const { state } = this.props.location || {}

      const defaultPath = Object.keys(portalLayouts).find((key) => {
        const route = portalLayouts[key]
        if (route.permission === '' || route.path.includes(':id')) return false
        return isGranted(route.permission)
      })

      window.location =
        state?.from && state.from.pathname !== '/'
          ? state.from.pathname
          : defaultPath
          ? portalLayouts[defaultPath].path
          : '/'
    }
  }

  public render() {
    const { projects } = this.state || []

    return (
      <Row className="panel-project-login">
        <Col span={24} className="mb-3">
          <h3>{L('PROJECT_NAME')}</h3>
          <Search
            placeholder={L('SEARCH_PROJECT_BY_NAME')}
            onChange={(value) => this.filterProject(value.target?.value)}
            onSearch={(value) => this.filterProject(value)}
          />
        </Col>
        <Col span={24}>
          <Row className={'project-list '} gutter={16}>
            {(projects || [])
              .filter((item) => item.show)
              .map((project) => {
                return (
                  <Col
                    span={this.state.isMobile ? 24 : 12}
                    className={'project-item pointer'}
                    key={project.id}
                    onClick={() => this.handleSelectProject(project)}>
                    <Card
                      className={'mb-3 text-center'}
                      bordered={false}
                      cover={<img className={'project-logo'} src={project.logoUrl} />}>
                      {project.name}
                    </Card>
                  </Col>
                )
              })}
          </Row>
        </Col>
      </Row>
    )
  }
}

export default withRouter(LoginProjectPanel)
