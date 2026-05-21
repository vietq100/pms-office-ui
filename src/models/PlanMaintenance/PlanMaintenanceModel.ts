import { OptionModel } from '@models/global'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

export interface IPlanMaintenanceFilter {
  keyword?: string
  projectId?: number
  teamIds?: number
  isActive?: boolean
  fromDate?: string
  toDate?: string
  employeeId?: number
  skipCount?: number
  maxResultCount?: number
  assetIds?: number[]
  priorityIds?: number[]
}

export interface IPlanMaintenanceCalendarFilter {
  keyword?: string
  projectId?: number
  teamIds?: number
  isActive?: boolean
  fromDate?: string
  toDate?: string
  employeeId?: number
  skipCount?: number
  maxResultCount?: number
  assetIds?: number[]
  priorityIds?: number[]
  year?: any
}

export interface IPlanMaintenanceTaskFilter {
  keyword?: string
  isActive?: boolean
  skipCount?: number
  maxResultCount?: number
  planMaintenanceId?: number
  statusId?: number
  isOnlyMyTask?: boolean
}

export class PlanMaintenanceModel {
  id?: number
  name: string
  guid: string
  documentId: string
  fullUnitCode: string
  areaId?: number | string
  categoryId?: number | string
  subCategoryId?: number
  furtherSubcategoryId?: number
  sourceId?: number
  statusId?: number
  paymentStatusId?: number
  priorityId?: number
  startDate?: Date
  endDate?: Date
  actualStartDate?: Date
  actualEndDate?: Date
  nextStartDate?: Date
  actualPaymentDate?: Date
  contactId?: number
  contactName: string
  contactPhone: string
  contactEmail: string
  description: string
  contact: any
  creationTime?: Date
  site: string
  teamId?: number
  teamUserId?: number
  observerUserId?: number
  assetIds: any
  assets: any
  totalCostAmount?: number
  //reminder: any

  constructor() {
    this.id = undefined
    this.name = ''
    this.guid = ''
    this.documentId = ''
    this.fullUnitCode = ''
    this.areaId = undefined
    this.categoryId = undefined
    this.subCategoryId = undefined
    this.furtherSubcategoryId = undefined
    this.sourceId = undefined
    this.statusId = undefined
    this.paymentStatusId = undefined
    this.priorityId = undefined
    this.startDate = undefined
    this.endDate = undefined
    this.actualStartDate = undefined
    this.actualEndDate = undefined
    this.nextStartDate = undefined
    this.actualPaymentDate = undefined
    this.creationTime = undefined
    this.contactId = undefined
    this.contactName = ''
    this.contactEmail = ''
    this.contactPhone = ''
    this.description = ''
    this.contact = {}
    this.site = ''
    this.teamId = undefined
    this.teamUserId = undefined
    this.observerUserId = undefined
    this.assetIds = []
    this.assets = []
    this.totalCostAmount = undefined
    // this.reminder = {
    //   isActive: false,
    //   reminderInMinute: 0,
    //   period: 0,
    //   userIds: [],
    //   emails: []
    // }
  }

  public static assign(obj) {
    dayjs.extend(utc)
    dayjs.extend(timezone)
    if (!obj) return undefined

    const newObj = Object.assign(new PlanMaintenanceModel(), obj)
    newObj.sourceId = obj.sourceId || undefined
    newObj.statusId = obj.statusId || undefined
    newObj.startDate = obj.startDate ? dayjs(obj.startDate) : undefined
    newObj.endDate = obj.endDate ? dayjs(obj.endDate) : undefined
    newObj.actualStartDate = obj.actualStartDate ? dayjs(obj.actualStartDate) : undefined
    newObj.actualEndDate = obj.actualEndDate ? dayjs(obj.actualEndDate) : undefined
    newObj.actualPaymentDate = obj.actualPaymentDate ? dayjs(obj.actualPaymentDate) : undefined
    newObj.assets = obj.assets
      ? obj.assets.map((item) => ({
          ...item,
          label: item.assetName,
          value: item.id
        }))
      : undefined
    newObj.assetIds = obj.assets ? obj.assets.map((item) => item.id) : []
    newObj.nextStartDate = obj.nextStartDate ? dayjs(obj.nextStartDate) : undefined
    newObj.teamUser = new OptionModel(obj.teamUser?.id, obj.teamUser?.displayName)
    newObj.observerUser = new OptionModel(obj.observerUser?.id, obj.observerUser?.displayName)
    return newObj
  }

  public static assigns(objs) {
    return objs.map((item) => PlanMaintenanceModel.assign(item))
  }
}

export class PlanMaintenanceEventModel {
  id?: number
  name: string
  guid: string
  documentId: string
  fullUnitCode: string
  areaId?: number
  categoryId?: number
  subCategoryId?: number
  sourceId?: number
  statusId?: number
  paymentStatusId?: number
  priorityId?: number
  startDate?: Date
  nextStartDate?: Date
  endDate?: Date
  actualPaymentDate?: Date
  contactId?: number
  contactName: string
  contactPhone: string
  contactEmail: string
  description: string
  contact: any
  creationTime?: Date
  site?: string
  teamId?: number
  teamUserId?: number
  observerUserId?: number
  assetIds: any
  assets: any

  // For calendar js
  title: string
  start?: Date
  end?: Date
  color: any

  constructor() {
    this.id = undefined
    this.name = ''
    this.guid = ''
    this.documentId = ''
    this.fullUnitCode = ''
    this.areaId = undefined
    this.categoryId = undefined
    this.subCategoryId = undefined
    this.sourceId = undefined
    this.statusId = undefined
    this.paymentStatusId = undefined
    this.priorityId = undefined
    this.startDate = undefined
    this.endDate = undefined
    this.nextStartDate = undefined
    this.actualPaymentDate = undefined
    this.creationTime = undefined
    this.contactId = undefined
    this.contactName = ''
    this.contactEmail = ''
    this.contactPhone = ''
    this.description = ''
    this.contact = {}
    this.site = undefined
    this.teamId = undefined
    this.teamUserId = undefined
    this.observerUserId = undefined
    this.assetIds = []
    this.assets = []
    //calendar
    this.title = ''
    this.start = undefined
    this.end = undefined
    this.color = ''
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new PlanMaintenanceEventModel(), obj)
    newObj.sourceId = obj.sourceId || null
    newObj.statusId = obj.statusId || null
    newObj.startDate = obj.startDate ? dayjs(obj.startDate) : null
    newObj.endDate = obj.endDate ? dayjs(obj.endDate) : null
    newObj.assets = obj.assets || null
    newObj.nextStartDate = obj.nextStartDate ? dayjs(obj.nextStartDate) : null
    newObj.start = obj.startDate ? `${dayjs(dayjs(obj.startDate)).tz(dayjs.tz.guess()).format()}` : null
    newObj.end = obj.endDate ? `${dayjs(dayjs(obj.endDate)).tz(dayjs.tz.guess()).format()}` : null
    newObj.title = `#${obj.id} ${obj.fullUnitCode || ''} ${obj.name || ''} ${
      obj.status ? `- ${obj.status.name}` : ''
    } ${obj.priority ? `- ${obj.priority.name}` : ''}`
    newObj.color = obj.status && obj.status.colorCode ? obj.status.colorCode : '#333'
    return newObj
  }

  public static assigns(objs) {
    return objs.map((item) => PlanMaintenanceEventModel.assign(item))
  }
}

export class PlanMaintenanceTaskModel {
  id?: number
  guid: string
  documentId: string
  planId?: number
  taskStatusId?: number
  teamId?: number
  teamUserId?: number
  priorityId?: number
  startDate?: Date
  endDate?: Date
  scheduleStartDate?: Date
  scheduleEndDate?: Date
  actualPaymentDate?: Date
  cost?: number
  chargeCost?: number
  effortDay?: number
  effortHour?: number
  effortMinute?: number
  taskNote: string
  description: string
  totalCostAmount: number

  constructor() {
    this.id = undefined
    this.guid = ''
    this.documentId = ''
    this.planId = undefined
    this.taskStatusId = undefined
    this.teamId = undefined
    this.teamUserId = undefined
    this.priorityId = undefined
    this.startDate = undefined
    this.endDate = undefined
    this.scheduleStartDate = undefined
    this.scheduleEndDate = undefined
    this.actualPaymentDate = undefined
    this.cost = undefined
    this.chargeCost = undefined
    this.effortDay = undefined
    this.effortHour = undefined
    this.effortMinute = undefined
    this.taskNote = ''
    this.description = ''
    this.totalCostAmount = 0
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new PlanMaintenanceTaskModel(), obj)
    newObj.teamId = obj.team ? obj.team.id : null
    newObj.teamUserId = obj.teamUser ? obj.teamUser.id : null
    newObj.taskStatusId = obj.taskStatusId ? obj.taskStatusId : null
    newObj.startDate = obj.startDate ? dayjs(obj.startDate) : null
    newObj.endDate = obj.endDate ? dayjs(obj.endDate) : null
    newObj.scheduleStartDate = obj.scheduleStartDate ? dayjs(obj.scheduleStartDate) : null
    newObj.scheduleEndDate = obj.scheduleEndDate ? dayjs(obj.scheduleEndDate) : null
    newObj.actualPaymentDate = obj.actualPaymentDate ? dayjs(obj.actualPaymentDate) : null
    return newObj
  }

  public static assigns(objs) {
    return objs.forEach((item) => PlanMaintenanceTaskModel.assign(item))
  }
}
