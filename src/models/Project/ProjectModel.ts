import { TemplateModel } from '@models/NotificationTemplate'
import { buildFileUrlWithEncToken } from '@lib/helper'
import { defaultAvatar } from '@lib/appconst'

export class ProjectSettingModel {
  id: number
  projectId: number
  requestPerDay?: number
  newMailTos: string[]
  newMailCCs: string[]
  newMailBCCs: string[]
  updateMailTos: string[]
  updateMailCCs: string[]
  updateMailBCCs: string[]
  reportMailTos: string[]
  reportMailCCs: string[]
  reportMailBCCs: string[]
  notificationUsers: number[]
  form: any
  constructor() {
    this.id = 0
    this.projectId = 0
    this.requestPerDay = undefined
    this.newMailTos = []
    this.newMailCCs = []
    this.newMailBCCs = []
    this.updateMailTos = []
    this.updateMailCCs = []
    this.updateMailBCCs = []
    this.reportMailTos = []
    this.reportMailCCs = []
    this.reportMailBCCs = []
    this.notificationUsers = []
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new ProjectSettingModel(), obj)
    return newObj
  }
}

export class ProjectFeeTemplateModel {
  id: number
  notificationTypeId: number
  notificationMethod: number
  isMember: boolean
  isActive: boolean
  notificationTemplates: TemplateModel[]
  templateLanguages: any
  parameters: any[]

  constructor() {
    this.id = 0
    this.notificationTypeId = 0
    this.notificationMethod = 0
    this.isMember = false
    this.isActive = false
    this.notificationTemplates = []
    this.templateLanguages = {}
    this.parameters = []
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new ProjectFeeTemplateModel(), obj)

    ;(abp.localization.languages || []).forEach((language) => {
      const templateLanguage = (newObj.notificationTemplates || []).find(
        (template) => template.languageName === language.name
      )
      newObj.templateLanguages[language.name] = TemplateModel.assign(
        templateLanguage || { languageName: language.name }
      )
    })
    return newObj
  }
}

export class ProjectRow {
  id?: number
  uniqueId?: string
  investorName?: string
  hotline?: string
  buildingCount?: number
  unitCount?: number
  description?: string
  address?: string
  isActive?: boolean
  creationTime?: Date
  creatorUserId?: number
  logoUrl?: string
  code?: string
  name?: string

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new ProjectRow(), obj)
    // Hack to cache image request
    newObj.logoUrl = obj.file?.fileUrl ? obj.file?.fileUrl : null
    newObj.buildingCount = obj.projectInfo?.totalBuildingCount || 0
    newObj.unitCount = obj.projectInfo?.totalUnitCount || 0

    return newObj
  }

  public static assigns(objs) {
    const results: ProjectRow[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class ProjectDetail {
  id?: number
  uniqueId?: string
  investorName?: string
  hotline?: string
  description?: string
  address?: string
  isActive?: boolean
  isDefault?: boolean
  creationTime?: Date
  creatorUserId?: number
  logoUrl?: string
  code?: string
  name?: string

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new ProjectDetail(), obj)
    // Hack to cache image request
    newObj.logoUrl = obj.file?.fileUrl ? obj.file?.fileUrl : null
    return newObj
  }
}

export class UnitOptionModel {
  id?: number
  name?: string

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new UnitOptionModel(), obj)
    // Hack to cache image request
    newObj.name = obj.fullUnitCode
    return newObj
  }

  public static assigns(objs) {
    const results: UnitOptionModel[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class ProjectOptionModel {
  id?: number
  name?: string
  normalizedName?: string
  value?: number
  label: string
  code: string
  logoUrl: string
  constructor() {
    this.label = ''
    this.code = ''
    this.logoUrl = ''
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new ProjectOptionModel(), obj)
    newObj.show = true
    newObj.value = obj.id
    newObj.label = obj.name
    newObj.normalizedName = (newObj.name || '').toLowerCase()
    newObj.logoUrl =
      obj.file?.fileUrl && obj.file?.fileUrl.length ? buildFileUrlWithEncToken(obj.file?.fileUrl) : defaultAvatar
    return newObj
  }

  public static assigns(objs) {
    const results: ProjectOptionModel[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class CoutryOptionModel {
  id?: number
  name?: string
  value?: number
  label: string

  constructor() {
    this.label = ''
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new CoutryOptionModel(), obj)
    newObj.value = obj.id
    newObj.label = obj.name
    return newObj
  }

  public static assigns(objs) {
    const results: CoutryOptionModel[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}
