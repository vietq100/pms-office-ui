import React from 'react'
import { StatusModel } from '@models/global'
import { Tooltip } from 'antd'
import Badge from 'antd/lib/badge'
import Tag from 'antd/lib/tag'
import { hexToRGB } from '@lib/helper'
import { L } from '@lib/abpUtility'

interface ItemStatusProps {
  status: StatusModel
}

const ItemStatus: React.FC<ItemStatusProps> = ({ status }) => {
  const backgroundColor = `rgba(${hexToRGB(status.colorCode)}, .05)`
  const name = L((status.name || status.code || '') as string)
  return (
    <Tooltip title={name}>
      <Tag className={'round'} style={{ background: backgroundColor, borderColor: backgroundColor }}>
        <Badge color={status.colorCode} className="badge-without-text mr-2" />
        <span style={{ color: status.colorCode }}>{name}</span>
      </Tag>
    </Tooltip>
  )
}

export default ItemStatus
