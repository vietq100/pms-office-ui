import { UserModel } from '@models/User/IUserModel'
import dayjs from 'dayjs'

export interface IRowVisitor {
  user?: UserModel
}

export class RowVisitorModel implements IRowVisitor {
  user?: UserModel

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new RowVisitorModel(), obj)
    newObj.user = UserModel.assign(obj.user || {})
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class VisitorModel {
  id: number
  userId?: number
  unitId?: number
  user?: any
  unit?: any
  fullUnitCode?: string
  displayName?: string
  unitUserId?: string
  registerTime?: Date
  registerCheckoutTime?: Date
  checkInTime?: Date
  checkOutTime?: Date

  constructor() {
    this.id = 0
    this.userId = 0
    this.unitId = 0
    this.user = {}
    this.unit = {}
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new VisitorModel(), obj)
    newObj.registerTime = obj.registerTime ? dayjs(obj.registerTime) : null
    newObj.registerCheckoutTime = obj.registerCheckoutTime ? dayjs(obj.registerCheckoutTime) : null
    newObj.checkInTime = obj.checkInTime ? dayjs(obj.checkInTime) : null
    newObj.checkOutTime = obj.checkOutTime ? dayjs(obj.checkOutTime) : null
    newObj.displayName = obj.userDisplayName
    newObj.unitUserId = `${obj.unitId}-${obj.userId}`
    return newObj
  }
}

export class VisitorReasonModel {
  id: number
  name: string

  constructor() {
    this.id = 0
    this.name = ''
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new VisitorReasonModel(), obj)
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}
