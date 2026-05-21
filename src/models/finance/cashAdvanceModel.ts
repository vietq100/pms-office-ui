import moment from 'moment-timezone/moment-timezone'
import { UserModel } from '@models/User/IUserModel'
import dayjs, { Dayjs } from 'dayjs'

export interface ICashAdvance {
  balanceAmount: any
  id?: number
  userId?: number
  user?: UserModel
  totalAmount?: number
  receiptDate?: Dayjs
  cashChanelId?: number
  isActive?: boolean
  description?: any
}

export class CashAdvanceModel implements ICashAdvance {
  id?: number
  balanceAmount: any
  userId?: number
  user?: UserModel
  totalAmount?: number
  receiptDate?: Dayjs
  cashChanelId?: number
  isActive?: boolean
  description?: any

  constructor(initCashAdvance?) {
    this.id = undefined
    this.isActive = true
    this.receiptDate = dayjs(new Date())
    this.user = initCashAdvance?.user
    this.userId = initCashAdvance?.user?.id
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new CashAdvanceModel(), obj)
    newObj.receiptDate = obj.receiptDate ? moment(obj.receiptDate) : undefined
    newObj.userId = obj.user?.id
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export interface IDepositModel {
  id?: number
  userId?: number
  balanceAmount?: number
  totalAmount?: number
  receiptDate?: Date
  cashChanelId?: number
  isActive?: boolean
  description?: any
}

export class DepositModel {
  userId?: number
  unitId?: any
  balanceAmount?: number
  totalAmount?: number
  cashAdvanceDate?: Dayjs
  cashChanelId?: number
  cashChannelExternalId?: number
  description?: any
  isDeposit?: boolean
  feeTypeId?: number

  constructor(initDeposit?) {
    this.userId = initDeposit?.userId
    this.unitId = initDeposit?.unitId
    this.feeTypeId = initDeposit?.feeType?.id
    this.cashAdvanceDate = dayjs(new Date())
  }
}

export interface IWithDrawModel {
  id?: number
  userId?: number
  balanceAmount?: number
  totalAmount?: number
  receiptDate?: Date
  cashChanelId?: number
  isActive?: boolean
  description?: any
}

export class WithDrawModel {
  userId?: number
  unitId?: any
  cashNumber?: any
  balanceAmount?: number
  feeType?: any
  totalAmount?: number
  cashAdvanceDate?: Dayjs
  cashChanelId?: number
  cashChannelExternalId?: number
  description?: any
  isDeposit?: boolean

  constructor(initWithDraw?) {
    this.userId = initWithDraw?.userId
    this.unitId = initWithDraw?.unitId
    this.cashAdvanceDate = dayjs(new Date())
    this.feeType = initWithDraw?.feeType
  }
}
