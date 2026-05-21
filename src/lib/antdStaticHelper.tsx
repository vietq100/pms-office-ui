/**
 * Antd v5 static helper: cung cấp modal/message/notification
 * có thể dùng ngoài React component (utility files).
 *
 * Cách dùng:
 *   import { antdStaticHelper } from '@lib/antdStaticHelper'
 *   antdStaticHelper.modal.error({ title: '...', content: '...' })
 */
import { App } from 'antd'
import type { MessageInstance } from 'antd/es/message/interface'
import type { ModalStaticFunctions } from 'antd/es/modal/confirm'
import type { NotificationInstance } from 'antd/es/notification/interface'

let modal: Omit<ModalStaticFunctions, 'warn'>
let message: MessageInstance
let notification: NotificationInstance

export const antdStaticHelper = {
  get modal() {
    return modal
  },
  get message() {
    return message
  },
  get notification() {
    return notification
  }
}

/**
 * Mount component này 1 lần trong cây App để khởi tạo các static instance.
 * Đặt bên trong <App> (antd) để hưởng dynamic theme.
 */
export const AntdStaticHelperMount: React.FC = () => {
  const staticFunctions = App.useApp()
  modal = staticFunctions.modal
  message = staticFunctions.message
  notification = staticFunctions.notification
  return null
}

import React from 'react'
