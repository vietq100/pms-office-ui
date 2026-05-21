import { OptionModel } from '@models/global'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

export class PlanSanitationModel {
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
  floorIds?: number[]

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
    this.floorIds = []
  }

  public static assign(obj) {
    dayjs.extend(utc)
    dayjs.extend(timezone)
    if (!obj) return undefined

    const newObj = Object.assign(new PlanSanitationModel(), obj)
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
    newObj.floorIds = obj.floors ? obj.floors.map((item) => item?.id) : []
    return newObj
  }

  public static assigns(objs) {
    return objs.map((item) => PlanSanitationModel.assign(item))
  }
}
