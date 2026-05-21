import { useNavigate } from 'react-router'
import { isGranted, L, LMainMenu } from '@lib/abpUtility'
import getMenuItem from '../../MenuItem'
import { Tooltip } from 'antd'
// import iconSaleAndLease from '@assets/icons/iconSaleAndLease.svg'

const GetMenuItems = ({ name, path, icon: Icon, isGroup, children, permission, type = '' }, collapsed?) => {
  const navigate = useNavigate()

  // Keep component is cause of error message from development mode
  let label = name
  if (path) {
    label = (
      <Tooltip trigger="contextMenu" placement="right" title={LMainMenu(name)}>
        <a
          onClick={(e) => {
            e.preventDefault()
            navigate(path)
          }}
          href={path}>
          {Icon ? <Icon className="menu-icon" /> : ''}

          <span>{LMainMenu(name)} </span>
        </a>
      </Tooltip>
    )
  } else if (type === 'link') {
    label = (
      <a
        onClick={() => {
          window.open('https://tower-booking.newtecons.vn/', '_blank')
        }}>
        {Icon ? <Icon className="menu-icon" /> : ''}
        <span>{L(name)} </span>
      </a>
    )
  } else {
    if (
      name === 'DASHBOARD_GROUP' ||
      name === 'PMS_INVESTMENT_GROUP' ||
      name === 'PMS_MANAGEMENT_BOARD_GROUP' ||
      name === 'PMS_CHATBOT' ||
      name === 'PMS_SETTING_GROUP'
    ) {
      label = (
        <>
          {/* {Icon ? <Icon className="menu-icon" /> : ''} */}{' '}
          <span className="custom-menu-group-item">{LMainMenu(name)}</span>{' '}
        </>
      )
    } else {
      label = (
        <>
          {/* {Icon ? <Icon className="menu-icon" /> : ''} */}

          <span>{LMainMenu(name)} </span>
        </>
      )
    }
  }

  if (isGroup) {
    const childItems = children ? children.map((child: any) => GetMenuItems(child)) : undefined
    return !childItems.find((item) => item !== null)
      ? null
      : getMenuItem(label, path || name, Icon ? <Icon className="menu-icon" /> : undefined, childItems, 'group')
  }

  if (children && children.length) {
    const isHaveGrantedChild = (children || []).findIndex((child) => isGranted(child.permission))
    const childItems = children ? children.map((child: any) => GetMenuItems(child)) : undefined

    return isHaveGrantedChild === -1
      ? null
      : getMenuItem(
          label,
          path || name,
          Icon ? (
            collapsed ? (
              name === 'DASHBOARD_GROUP' || name === 'PMS_PRODUCT_GROUP' || name === 'PMS_SETTING_GROUP' ? (
                <Icon className="menu-icon" />
              ) : (
                <></>
              )
            ) : name === 'DASHBOARD_GROUP' || name === 'PMS_PRODUCT_GROUP' || name === 'PMS_SETTING_GROUP' ? (
              <></>
            ) : (
              <Icon className="menu-icon" />
            )
          ) : undefined,
          childItems
        )
  }

  return isGranted(permission) ? getMenuItem(label, path || name) : null
}

export default GetMenuItems
