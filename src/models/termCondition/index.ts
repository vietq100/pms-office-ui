import { notificationMethod } from '@lib/appconst'

export class TermConditionModel {
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
    const newObj = Object.assign(new TermConditionModel(), obj)
    return newObj
  }
}

export interface IRowTermCondition {
  id?: number
  notificationType?: any
  availableLanguages?: any
  notificationTermCondition?: any
  method?: string
  parameters?: any
  isActive?: boolean
  isStatic?: boolean
  isMember?: boolean
}

export class RowTermConditionModel implements IRowTermCondition {
  id?: number
  notificationType?: any
  availableLanguages?: any
  notificationTermCondition?: any
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
    const newObj = Object.assign(new RowTermConditionModel(), obj)
    newObj.method = notificationMethod[obj.notificationMethod]
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class TermConditionDetailModel {
  id?: number
  subject?: any
  content?: any
  constructor() {
    this.id = undefined
    this.subject = []
    this.content = []
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new TermConditionDetailModel(), obj)
    newObj.subject = (obj.subject || []).reduce((result, item) => {
      result[item.languageName] = item.value
      return result
    }, {})
    newObj.content = (obj.content || []).reduce((result, item) => {
      result[item.languageName] = item.value
      return result
    }, {})
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}
