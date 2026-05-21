import 'famfamfam-flags/dist/sprite/famfamfam-flags.css'

import * as React from 'react'

import { Dropdown } from 'antd'
import { DownOutlined, HomeFilled } from '@ant-design/icons'
import { L } from '../../../../lib/abpUtility'
import Stores from '../../../../stores/storeIdentifier'
import SessionStore from '../../../../stores/sessionStore'
import classNames from 'classnames'
import { inject, observer } from 'mobx-react'
import AppConsts from '@lib/appconst'
const { authorization } = AppConsts
export interface IProjectSelectProps {
  sessionStore?: SessionStore
  wrapClass?: string
}

@inject(Stores.SessionStore)
@observer
class ProjectSelect extends React.Component<IProjectSelectProps> {
  async changeProject(project, unitName?) {
    await this.props.sessionStore!.changeProject(project, unitName)
    window.location.reload()
  }
  logOut = async () => {
    await this.props.sessionStore?.logout()
  }
  async componentDidMount() {
    if (!this.props.sessionStore?.project) {
      this.logOut()
    }
  }

  projectMenu = () => {
    const { sessionStore } = this.props
    const userType = localStorage.getItem(authorization.userType) ?? '1'

    return (sessionStore!.ownProjects || []).map((item: any) => {
      return {
        label:
          userType === '2' ? (
            <>
              <i className={item.icon} /> {item.unit.name}
            </>
          ) : (
            <>
              <i className={item.icon} /> {item.name}
            </>
          ),
        key: item.id,
        onClick: () => this.changeProject(item)
      }
    })
  }

  render() {
    const { project } = this.props.sessionStore!
    // const userType = localStorage.getItem(authorization.userType)
    // const unitDisplayName = localStorage.getItem(authorization.unitDisplayName)

    return (
      <Dropdown menu={{ items: this.projectMenu() }} trigger={['click']} className={this.props.wrapClass}>
        <span>
          <HomeFilled className="mr-3 color-primary" style={{ fontSize: '16px' }} />

          <span className="mr-1">{project?.name ?? project?.label}</span>
          <DownOutlined
            className={classNames('dropDown', 'className', 'color-primary')}
            title={L('Projects')}
            style={{ fontSize: '16px' }}
          />
        </span>
      </Dropdown>
    )
  }
}

export default ProjectSelect
