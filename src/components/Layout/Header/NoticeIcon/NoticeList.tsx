import { List } from 'antd'

import React from 'react'
import classNames from 'classnames'
import { NoticeIconData } from './index'
import Icon from '@ant-design/icons'

export interface NoticeIconTabProps {
  count?: number
  name?: string
  showClear?: boolean
  showViewMore?: boolean
  style?: React.CSSProperties
  title: string
  tabKey: string
  data?: NoticeIconData[]
  onClick?: (item: NoticeIconData) => void
  onClear?: () => void
  emptyText?: string
  clearText?: string
  viewMoreText?: string
  onViewMore?: (e: any) => void
  icon?: any
}
const NoticeList: React.SFC<NoticeIconTabProps> = ({
  data = [],
  onClick,
  onClear,
  onViewMore,
  emptyText,
  showClear = true,
  clearText,
  viewMoreText,
  showViewMore = false
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="notFound">
        <img src="https://gw.alipayobjects.com/zos/rmsportal/sAuJeJzSKbUmHfBQRzmZ.svg" alt="not found" />
        <div>{emptyText}</div>
      </div>
    )
  }
  return (
    <>
      <List<NoticeIconData>
        className="list"
        dataSource={data}
        renderItem={(item, i) => {
          const itemCls = classNames('item', {
            read: item.read
          })
          // eslint-disable-next-line no-nested-ternary
          const leftIcon = item.icon ? <Icon component={item.icon} className="notification-icon mt-3" /> : null

          return (
            <List.Item className={itemCls} key={item.key || i}>
              <List.Item.Meta
                className="meta"
                avatar={leftIcon}
                title={
                  <div className="title" onClick={() => onClick && onClick(item)}>
                    {item.title}
                    <div className="extra">{item.extra}</div>
                  </div>
                }
                description={
                  <div onClick={() => onClick && onClick(item)}>
                    <div className="description">{item.description}</div>
                    <div className="datetime">{item.datetime}</div>
                  </div>
                }
              />
            </List.Item>
          )
        }}
      />
      <div className={'bottomBar'}>
        {showClear ? <div onClick={onClear}>{clearText}</div> : null}
        {showViewMore ? (
          <div
            onClick={(e) => {
              if (onViewMore) {
                onViewMore(e)
              }
            }}>
            {viewMoreText}
          </div>
        ) : null}
      </div>
    </>
  )
}

export default NoticeList
