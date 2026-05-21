import { UserModel } from '@models/User/IUserModel'
import { PackageFeeModel } from '@models/fee'
import dayjs, { Dayjs } from 'dayjs'

export interface IRowReservation {
  user?: UserModel
}

export class RowReservationModel implements IRowReservation {
  id: number
  user?: UserModel
  amenity?: any
  unit?: any
  status?: any
  fromToDate: [Dayjs, Dayjs] | null | undefined
  startDate?: Date
  endDate?: Date
  displayName?: string
  userName?: string
  emailAddress?: string
  phoneNumber?: string
  fullUnitCode?: string
  description?: string

  constructor() {
    this.id = 0
    this.amenity = {}
    this.user = new UserModel()
    this.unit = {}
    this.status = {}
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new RowReservationModel(), obj)
    newObj.userName = obj.userName || obj.username
    newObj.fromToDate = [dayjs(obj.startDate), dayjs(obj.endDate)]
    newObj.user = UserModel.assign(obj.user || {})
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class ReservationModel {
  id: number
  userId?: number
  unitId?: number
  amenity?: any
  user?: any
  unit?: any
  feeDetails?: PackageFeeModel[]
  fromToDate: [Dayjs, Dayjs] | null | undefined
  fullUnitCode?: string
  unitUserId?: string
  status?: string
  statusName?: string
  paymentStatus?: string
  paymentName?: string
  startDate?: Date
  endDate?: Date
  description?: string

  constructor() {
    this.id = 0
    this.userId = 0
    this.unitId = 0
    this.amenity = {}
    this.user = {}
    this.unit = {}
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new ReservationModel(), obj)
    newObj.fromToDate = [dayjs(obj.startDate), dayjs(obj.endDate)]
    newObj.unitUserId = `${newObj.unitId}-${newObj.userId}`
    newObj.status = obj.status?.statusCode
    newObj.statusName = obj.status?.name
    newObj.paymentStatus = obj.paymentStatus?.paymentStatusCode
    newObj.paymentName = obj.paymentStatus?.name

    return newObj
  }
}

export class BookingSlotModel {
  id: number
  start?: Date
  startTimeZone?: string
  end?: Date
  endTimeZone?: string
  isAvailable?: boolean
  price?: number

  constructor() {
    this.id = 0
  }

  public static assign(obj) {
    if (!obj) return undefined

    // Need to get timezone for create
    const newObj = Object.assign(new BookingSlotModel(), obj)
    newObj.start = new Date((obj.startTime || '').slice(0, 19))
    newObj.startTimeZone = (obj.startTime || '').slice(19, obj.startTime.length)
    newObj.end = new Date((obj.endTime || '').slice(0, 19))
    newObj.endTimeZone = (obj.startTime || '').slice(19, obj.startTime.length)
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}
