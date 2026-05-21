import { CheckOutlined, WarningOutlined, CloseCircleOutlined, InfoOutlined, BugOutlined } from '@ant-design/icons'
import { notification } from 'antd'
const localization = {
  defaultLocalizationSourceName: 'WebLabel',
  sourceWebNotification: 'WebNotification',
  sourceWebError: 'WebError',
  sourceWebMainMenu: 'WebMainMenu',
  sourceWebCategory: 'WebCategory'
}
declare let abp: any

export function L(key: string, ...args: any[]): string {
  let localizedText = abp.localization.localize(key, localization.defaultLocalizationSourceName)
  if (!localizedText) {
    localizedText = key
  }

  if (!args || !args.length) {
    return localizedText
  }

  return abp.utils.formatString(localizedText, ...args)
}

export function LError(key: string, ...args: any[]): string {
  let localizedText = abp.localization.localize(key, localization.sourceWebError)
  if (!localizedText) {
    localizedText = key
  }

  if (!args || !args.length) {
    return localizedText
  }

  return abp.utils.formatString(localizedText, ...args)
}

export function LNotification(key: string, ...args: any[]): string {
  let localizedText = abp.localization.localize(key, localization.sourceWebNotification)
  if (!localizedText) {
    localizedText = key
  }

  if (!args || !args.length) {
    return localizedText
  }

  return abp.utils.formatString(localizedText, ...args)
}

export function LCategory(key: string, ...args: any[]): string {
  let localizedText = abp.localization.localize(key, localization.sourceWebCategory)
  if (!localizedText) {
    localizedText = key
  }

  if (!args || !args.length) {
    return localizedText
  }

  return abp.utils.formatString(localizedText, ...args)
}

export function LMainMenu(key: string, ...args: any[]): string {
  let localizedText = abp.localization.localize(key, localization.sourceWebMainMenu)
  if (!localizedText) {
    localizedText = key
  }

  if (!args || !args.length) {
    return localizedText
  }

  return abp.utils.formatString(localizedText, ...args)
}

export function isGranted(permissionName: string): boolean {
  if (!permissionName || permissionName === '') {
    return true
  }
  return abp.auth.isGranted(permissionName)
}

export function isGrantedAny(...args: string[]): boolean {
  for (let i = 0; i < args.length; i++) {
    if (abp.auth.isGranted(args[i])) {
      return true
    }
  }
  return false
}

export function getNotificationIconBySeverity(severity) {
  switch (severity) {
    case abp.notifications.severity.SUCCESS:
      return CheckOutlined
    case abp.notifications.severity.WARN:
      return WarningOutlined
    case abp.notifications.severity.ERROR:
      return CloseCircleOutlined
    case abp.notifications.severity.FATAL:
      return BugOutlined
    case abp.notifications.severity.INFO:
    default:
      return InfoOutlined
  }
}

abp.notify.success = (description, message?, options?) => {
  notification.success({
    message: message || L('NOTIFICATION'),
    description: description,
    onClick: () => {
      options?.onClick()
    }
  })
}
abp.notify.info = (description, message?, options?) => {
  notification.info({
    message: message || L('NOTIFICATION'),
    description: description,
    onClick: () => {
      options?.onClick()
    }
  })
}

abp.notify.error = (description, message?, options?) => {
  notification.error({
    message: message || L('NOTIFICATION'),
    description: description,
    onClick: () => {
      options?.onClick()
    }
  })
}
