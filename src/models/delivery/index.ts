import { UserModel } from '@models/User/IUserModel'
import dayjs from 'dayjs'
export interface IDeliveryModel {
  id?: number
  user?: UserModel
}
export class DeliveryModel implements IDeliveryModel {
  user?: UserModel
  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new DeliveryModel(), obj)
    newObj.user = UserModel.assign(obj.user || {})

    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}
export class DeliveryDetailModel {
  id: number
  uniqueId?: string
  isActive?: boolean
  statusId?: number
  status?: string
  deliveryTypeId?: number
  creationTime?: Date
  receivedDate?: Date
  userId?: number
  unitId?: number
  deliveryId?: number
  user?: any
  unit?: any
  deliveredDate?: Date
  deliveryReceive?: any
  description?: string
  otherNote?: string
  fullUnitCode?: string
  unitUserId?: string
  creatorUser?: string
  receiver?: any
  constructor() {
    this.id = 0
    this.userId = 0
    this.unitId = 0
    this.description = ''
    this.otherNote = ''
    this.deliveryReceive = new ReceiveModel()
    this.receiver = new ReceiveModel()
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new DeliveryDetailModel(), obj)
    newObj.creationTime = obj.creationTime ? dayjs(obj.creationTime) : null
    newObj.receivedDate = obj.receivedDate ? dayjs(obj.receivedDate) : null
    newObj.projectId = obj.project?.id
    newObj.unitId = obj.unit?.id
    newObj.userId = obj.user?.id
    newObj.fullUnitCode = obj.unit?.fullUnitCode
    newObj.deliveryReceive = obj.deliveryReceive ? ReceiveModel.assign(obj.deliveryReceive) : {}
    newObj.receiver = obj.receiver ? ReceiveModel.assign(obj.receiver) : {}

    newObj.unitUserId = `${newObj.unitId}-${newObj.userId}`

    return newObj
  }
}
export class ReceiveModel {
  residentUserId?: number
  deliveredDate?: Date
  residentName: string
  residentPhone: string
  residentNote: string
  residentEmail: string

  constructor(
    residentUserId?,
    // deliveredDate?,
    residentName?,
    residentPhone?,
    residentEmail?
  ) {
    this.residentUserId = residentUserId
    // this.deliveredDate = new Date()
    this.residentName = residentName
    this.residentPhone = residentPhone
    this.residentNote = ''
    this.residentEmail = residentEmail
  }
  public static assign(obj) {
    if (!obj) return undefined
    const newObj = Object.assign(new ReceiveModel(), obj)
    newObj.deliveredDate = obj.deliveredDate ? dayjs(obj.deliveredDate) : null
    newObj.residentUserId = obj.residentUserId ?? undefined

    return newObj
  }
}
