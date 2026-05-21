import { LanguageValue } from '@models/global'
import dayjs from 'dayjs'
import sortBy from 'lodash/sortBy'

export interface IRowAmenityModel {
  id?: number
  amenityName?: string
  isActive?: boolean
}

export class RowAmenityModel implements IRowAmenityModel {
  id?: number
  amenityName?: string
  isActive?: boolean

  constructor() {
    this.id = undefined
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new RowAmenityModel(), obj)
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}
export class BlacklistDetailModel implements IRowAmenityModel {
  id?: number
  amenityName?: string
  isActive?: boolean

  constructor() {
    this.id = undefined
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(obj)
    newObj.amenityIds = obj.amenities.map((item) => item.id)
    newObj.time = [dayjs(obj.startDate), dayjs(obj.endDate)]
    newObj.amenities = obj.amenities.map((item) => ({
      ...item,
      name: item.amenityName
    }))
    return newObj
  }
}
export class MonthlyPackageDetailModel implements IRowAmenityModel {
  id?: number
  amenityName?: string
  isActive?: boolean

  constructor() {
    this.id = undefined
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(obj)
    newObj.amenityIds = obj.amenities.map((item) => item.id)
    newObj.time = [dayjs(obj.startDate), dayjs(obj.endDate)]
    newObj.amenities = obj.amenities.map((item) => ({
      ...item,
      name: item.amenityName
    }))
    newObj.unitUserId = obj.unitId + '-' + obj.user?.id
    return newObj
  }
}

export class AmenityDetailModel {
  id?: number
  projectId?: number
  uniqueId?: string
  timeZoneId?: string
  names?: LanguageValue[]
  remarks?: LanguageValue[]
  isActive?: boolean
  parentAmenityId?: number
  isUseDeposited?: boolean
  isLocked?: boolean
  isNeedApprove?: boolean
  isOverlap?: boolean
  iconId?: number
  timeUnit?: string
  timeRules?: any
  amenityTimeRules?: any[]
  depositAmount?: number
  maintenanceStartDate?: string
  isMonthlyPackage?: boolean
  emailReceiveNotify?: any[]
  policies: LanguageValue[]
  constructor() {
    this.id = undefined
    this.timeZoneId = 'SE Asia Standard Time'
    this.names = LanguageValue.init([])
    this.remarks = LanguageValue.init([])
    this.iconId = 1
    this.timeUnit = 'NO_LIMIT'
    this.timeRules = {}
    this.amenityTimeRules = []
    this.isOverlap = true
    this.uniqueId = undefined
    this.emailReceiveNotify = []
    this.policies = LanguageValue.init([])
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new AmenityDetailModel(), obj)
    newObj.names = LanguageValue.init(obj.names || [])
    newObj.remarks = LanguageValue.init(obj.remarks || [])
    newObj.policies = LanguageValue.init(obj.policies || [])
    if (newObj.amenityTimeRules instanceof Array) {
      newObj.amenityTimeRules = sortBy(newObj.amenityTimeRules, ['order', 'startTime'])
      const currentDate = dayjs(new Date()).format('MM/DD/YYYY ')
      newObj.amenityTimeRules.forEach((item) => {
        item.startTime = dayjs(currentDate + item.startTime)
        item.endTime = dayjs(currentDate + item.endTime)
        if (!newObj.timeRules[item.numNextValidDate]) {
          newObj.timeRules[item.numNextValidDate] = [item]
          return
        }
        newObj.timeRules[item.numNextValidDate].push(item)
      })
      newObj.maintenanceTime = [
        dayjs(obj.maintenanceStartDate).isValid() ? dayjs(obj.maintenanceStartDate) : null,
        dayjs(obj.maintenanceEndDate).isValid() ? dayjs(obj.maintenanceEndDate) : null
      ]
      newObj.emailReceiveNotify = Array.isArray(obj.emailReceiveNotify) ? obj.emailReceiveNotify : []
    }

    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class RowAmenityGroupModel {
  id?: number
  name?: string
  isActive?: boolean

  constructor() {
    this.id = undefined
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new RowAmenityModel(), obj)
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class AmenityGroupDetailModel {
  id?: number
  name?: string
  numberOfLimit?: number
  timeUnit?: number
  numberOfTimes?: number
  description?: string
  isActive?: boolean

  constructor() {
    this.id = undefined
    this.name = ''
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new AmenityDetailModel(), obj)
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}
