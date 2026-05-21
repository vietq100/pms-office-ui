import './index.less'

import { Layout, Menu } from 'antd'
import { isGranted } from '../../../lib/abpUtility'

// import AppLogo from '../../../assets/images/logo.svg'
import { appMenuGroups, portalLayouts } from '../Router/router.config'
import getMenuItems from './MenuItem'

const { Sider } = Layout

export interface ISiderMenuProps {
  path: any
  collapsed: boolean
  onCollapse: any
}

export interface IMenuItemProps {
  name: string
  path?: any
  icon?: any
  isGroup?: boolean
  children?: any
  permission?: string
}

const SiderMenu = (props: ISiderMenuProps) => {
  const { collapsed, onCollapse } = props
  let defaultSelectedKeys = ''
  Object.keys(portalLayouts).find((key) => {
    if (portalLayouts[key].path === window.location.pathname) {
      defaultSelectedKeys = portalLayouts[key].name
    }
    return ''
  })

  const menuItems = appMenuGroups
    .filter((route: any) => {
      const hasGrantedChild = (route.children || []).findIndex((item) => {
        if (item.children && item.children.length > 0) {
          return item.children.some((child) => isGranted(child.permission))
        }
        return isGranted(item.permission)
      })

      return route.permission
        ? isGranted(route.permission)
        : route.children && route.children.length && hasGrantedChild !== -1
    })
    .map((route: any) => {
      return getMenuItems(route, collapsed)
    })
  return (
    <Sider
      collapsible
      trigger={null}
      className="sidebar"
      width={260}
      breakpoint="lg"
      collapsedWidth="0"
      onBreakpoint={(broken) => {
        onCollapse(broken)
      }}
      collapsed={collapsed}
      onCollapse={onCollapse}>
      <Menu
        style={{ minHeight: '125vh' }}
        mode="inline"
        id={'menu-side-bar'}
        defaultSelectedKeys={[defaultSelectedKeys]}
        defaultOpenKeys={['PMS_MANAGEMENT_BOARD_GROUP', 'PMS_INVESTMENT_GROUP']}
        items={menuItems}
      />
    </Sider>
  )
}

export default SiderMenu
