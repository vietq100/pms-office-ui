import appConsts from '@lib/appconst'
import { v4 as uuid } from 'uuid'
const { announcementTypeKeys, announcementStatusKeys } = appConsts

export class AnnouncementUserLogModel {
  id?: number
  key?: string
  displayName: string
  emailAddress?: string
  fullUnitCode?: string
  phoneNumber?: string
  userName?: string
  residentRole?: string
  residentType?: string
  fileUrl?: string
  executeTime?: Date

  constructor() {
    this.displayName = ''
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new AnnouncementUserLogModel(), obj)
    newObj.key = uuid()
    newObj.displayName = obj.displayName || obj.user?.displayName
    newObj.fullUnitCode = obj.fullUnitCode || obj.unit?.fullUnitCode
    newObj.residentRole = obj.role?.name
    newObj.residentType = obj.type?.name
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export interface IRowAnnouncement {
  id?: number
  method?: string
  status?: string
  statusCode?: number
  isActive?: boolean
}

export class RowAnnouncementModel implements IRowAnnouncement {
  id?: number
  method?: string
  status?: string
  statusCode?: number
  isActive?: boolean
  constructor() {
    this.id = undefined
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new RowAnnouncementModel(), obj)
    newObj.method = announcementTypeKeys[obj.campaignTypeId]
    newObj.status = announcementStatusKeys[obj.statusCode]
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class AnnouncementDetailModel {
  id?: number
  uniqueId?: string
  notificationType?: any
  isActive?: boolean
  statusCode?: number
  status?: string
  campaignTypeId?: number
  content?: any

  constructor() {
    this.id = undefined
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new AnnouncementDetailModel(), obj)
    newObj.method = announcementTypeKeys[obj.notificationMethod]
    newObj.status = announcementStatusKeys[obj.statusCode]

    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}
