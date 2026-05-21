import { BellOutlined } from '@ant-design/icons'
import { Badge, Tabs } from 'antd'
import useMergeValue from 'use-merge-value'
import React from 'react'
import classNames from 'classnames'
import NoticeList, { NoticeIconTabProps } from './NoticeList'

import HeaderDropdown from '../HeaderDropdown'
import styles from './index.less'
import { BadgeProps } from 'antd/lib/badge'

const { TabPane } = Tabs

export interface NoticeIconData {
  avatar?: string | React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  datetime?: React.ReactNode
  extra?: React.ReactNode
  style?: React.CSSProperties
  key?: string | number
  read?: boolean
  icon?: any
}

export interface NoticeIconProps {
  count: number
  bell?: React.ReactNode
  className?: string
  loading?: boolean
  onClear?: (tabName: string, tabKey: string) => void
  onItemClick?: (item: NoticeIconData, tabProps: NoticeIconTabProps) => void
  onViewMore?: (tabProps: NoticeIconTabProps, e: MouseEvent) => void
  onTabChange?: (tabTile: string) => void
  style?: React.CSSProperties
  onPopupVisibleChange?: (visible: boolean) => void
  popupVisible?: boolean
  clearText?: string
  viewMoreText?: string
  clearClose?: boolean
  emptyImage?: string
  children?: React.ReactElement<NoticeIconTabProps>
}

const NoticeIcon: React.FC<NoticeIconProps> & {
  Tab: typeof NoticeList
} = (props) => {
  const getNotificationBox = (): React.ReactNode => {
    const { children, onClear, onTabChange, onItemClick, onViewMore, clearText, viewMoreText } = props
    if (!children) {
      return null
    }
    const {
      data,
      title,
      // count,
      tabKey,
      showClear,
      showViewMore,
      emptyText,
      icon
    } = children.props || {}
    // const len = data?.length || 0
    // const msgCount = count || count === 0 ? count : len
    // const tabTitle: string = msgCount > 0 ? `${title} (${msgCount})` : title
    return (
      <Tabs onChange={onTabChange} centered>
        <TabPane
          // tab={tabTitle}
          key={tabKey}>
          <NoticeList
            clearText={clearText}
            viewMoreText={viewMoreText}
            data={data}
            onClear={(): void => onClear && onClear(title, tabKey)}
            onClick={(item): void => onItemClick && onItemClick(item, children.props)}
            onViewMore={(event): void => onViewMore && onViewMore(children.props, event)}
            showClear={showClear}
            showViewMore={showViewMore}
            title={title}
            emptyText={emptyText}
            tabKey={tabKey}
            icon={icon}
          />
        </TabPane>
      </Tabs>
    )
  }

  const { count, bell } = props

  const [visible, setVisible] = useMergeValue<boolean>(false, {
    value: props.popupVisible,
    onChange: props.onPopupVisibleChange
  })

  const noticeButtonClass = classNames('notice-button', { opened: visible })
  const notificationBox = getNotificationBox()
  const NoticeBellIcon = bell || <BellOutlined className={styles.icon} />
  const haveUnreadMessage = count > 0
  const badgeProps = haveUnreadMessage ? { color: '#98221f' as const, count } : ({ dot: false } as BadgeProps)
  const trigger = (
    <span className={noticeButtonClass}>
      <Badge {...badgeProps}>{NoticeBellIcon}</Badge>
    </span>
  )
  if (!notificationBox) {
    return trigger
  }

  return (
    <HeaderDropdown
      placement="bottomRight"
      overlay={notificationBox}
      overlayClassName={'notify-popup'}
      trigger={['click']}
      open={visible}
      onOpenChange={setVisible}>
      {trigger}
    </HeaderDropdown>
  )
}

NoticeIcon.defaultProps = {
  emptyImage: 'https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg'
}

NoticeIcon.Tab = NoticeList

export default NoticeIcon
