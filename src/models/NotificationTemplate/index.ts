import { notificationMethod } from '@lib/appconst'

export class TemplateModel {
  languageName: string
  templateName: string
  subject: string
  templateContent: string

  constructor(languageName?, templateName?, subject?, templateContent?) {
    this.languageName = languageName || ''
    this.templateName = templateName || ''
    this.subject = subject || ''
    this.templateContent = templateContent || ''
  }

  public static assign(obj) {
    if (!obj) return undefined
    ;(obj.availableLanguages || []).forEach((item) => {
      obj[item.languageName] = item
    })
    const newObj = Object.assign(new TemplateModel(), obj)
    return newObj
  }
}

export interface IRowNotificationTemplate {
  id?: number
  notificationType?: any
  availableLanguages?: any
  notificationTemplate?: any
  method?: string
  parameters?: any
  isActive?: boolean
  isStatic?: boolean
  isMember?: boolean
}

export class RowNotificationTemplateModel implements IRowNotificationTemplate {
  id?: number
  notificationType?: any
  availableLanguages?: any
  notificationTemplate?: any
  method?: string
  parameters?: any
  isActive?: boolean
  isStatic?: boolean
  isMember?: boolean
  constructor() {
    this.id = undefined
  }

  public static assign(obj) {
    if (!obj) return undefined
    ;(obj.availableLanguages || []).forEach((item) => {
      obj[item.languageName] = item
    })
    const newObj = Object.assign(new RowNotificationTemplateModel(), obj)
    newObj.method = notificationMethod[obj.notificationMethod]
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class NotificationTemplateDetailModel {
  id?: number
  projectId?: number
  notificationType?: any
  notificationMethod?: number
  notificationTemplates?: any
  templateLanguages?: any
  parameters?: any
  isActive?: boolean
  isStatic?: boolean
  isMember?: boolean
  constructor() {
    this.id = undefined
    this.templateLanguages = {}
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new NotificationTemplateDetailModel(), obj)
    newObj.method = notificationMethod[obj.notificationMethod]
    ;(obj.notificationTemplates || []).forEach((item) => {
      newObj.templateLanguages[item.languageName] = item
    })
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}
export class NotificationTypeModel {
  id: number
  value: string
  label: string
  code: string
  constructor(value?, label?, id?, code?) {
    this.id = id
    this.value = value
    this.label = label
    this.code = code
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new NotificationTypeModel(), obj)
    newObj.id = obj.id
    newObj.value = obj.id
    newObj.label = obj.notificationName
    newObj.code = obj.notificationCode
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}
