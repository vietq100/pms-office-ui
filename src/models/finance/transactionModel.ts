import { UserModel } from '@models/User/IUserModel'
import moment from 'moment-timezone/moment-timezone'
import { mapActiveStatus } from '@lib/helper'

export interface ITransaction {
  id?: number
  expenseMandateNumber?: string
  totalAmount?: number
  expenseDate?: Date
  description?: string
  paymentChannel?: any
  status?: boolean
  creationTime?: Date
  creatorUser?: UserModel
  isActive?: boolean
}

export class TransactionModel implements ITransaction {
  id?: number
  expenseMandateNumber?: string
  totalAmount?: number
  expenseDate?: Date
  description?: string
  paymentChannel?: any
  status?: boolean
  creationTime?: Date
  creatorUser?: UserModel
  isActive?: boolean
  withdrawRequestId?: number
  transactionId?: number
  cashAdvanceId?: number
  userId?: number
  user?: UserModel
  balanceAmount?: number

  constructor(userId?, user?, cashAdvanceId?, balanceAmount?, withdrawRequestId?, totalAmount?) {
    this.id = undefined
    this.isActive = true
    this.userId = userId
    this.user = user
    this.withdrawRequestId = withdrawRequestId
    this.totalAmount = totalAmount
    this.balanceAmount = balanceAmount
    this.cashAdvanceId = cashAdvanceId
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new TransactionModel(), obj)
    newObj.expenseMandateNumber = obj.receiptNumber
    newObj.expenseDate = obj.cashReceiptDate ? moment(obj.cashReceiptDate) : undefined
    newObj.paymentChannel = obj.cashChanel
    newObj.status = mapActiveStatus(obj.isActive)
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}
