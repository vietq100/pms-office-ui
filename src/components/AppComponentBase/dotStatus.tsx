import React from 'react'
import { StatusModel } from '@models/global'
import Badge from 'antd/lib/badge'
import { Tooltip } from 'antd'
import { L } from '@lib/abpUtility'

interface ItemStatusProps {
  status: StatusModel
}

const DotStatus: React.FC<ItemStatusProps> = ({ status }) => {
  const name = L((status.name || status.code || '') as string)
  return (
    <Tooltip title={name}>
      <Badge color={status.colorCode} size="default" />
    </Tooltip>
  )
}

export default DotStatus
