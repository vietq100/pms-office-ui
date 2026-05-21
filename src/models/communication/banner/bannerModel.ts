import { Status } from '@models/global'
import AppConsts, { appStatusColors } from '@lib/appconst'
import { mapActiveStatus } from '@lib/helper'
import dayjs from 'dayjs'

const { announcementTypeIcon } = AppConsts
export interface IBanner {
  id?: number
  subject?: string
  message?: any
  version?: string
  forClient?: number
  fromToDate?: any
  startDate?: Date
  endDate?: Date
  announcementTypeId?: number
  announcementTypeIcon?: string
  isActive?: boolean
  isExpired?: boolean
  statusId?: number
  statusCode?: string
  status?: Status
  nameId?: string
  uniqueId?: string
}

export class BannerModel implements IBanner {
  id?: number
  subject?: string
  message?: any
  version?: string
  forClient?: number
  fromToDate?: any
  startDate?: Date
  endDate?: Date
  announcementTypeId?: number
  announcementTypeIcon?: string
  isActive?: boolean
  isExpired?: boolean
  statusId?: number
  statusCode?: string
  status?: Status
  nameId?: string
  uniqueId?: string

  constructor() {
    this.id = undefined
    this.isActive = true
    this.isExpired = false
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new BannerModel(), obj)
    newObj.fromToDate = obj.startDate && obj.endDate ? [dayjs(obj.startDate), dayjs(obj.endDate)] : undefined
    newObj.statusCode = obj.status?.code
    newObj.status = mapActiveStatus(obj.isActive)
    newObj.announcementTypeIcon = announcementTypeIcon[obj.announcementTypeId]
    newObj.isExpired = dayjs(obj.endDate).isBefore(dayjs())
    newObj.expiredStatus = newObj.isExpired
      ? new Status('EXPIRED', appStatusColors.expired)
      : new Status('VALID', appStatusColors.valid)
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    ;(objs || []).forEach((item) => results.push(this.assign(item)))
    return results
  }
}
