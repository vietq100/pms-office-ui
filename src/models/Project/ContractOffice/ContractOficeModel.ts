import { UserModel } from '@models/User/IUserModel'
import { L } from '@lib/abpUtility'
import dayjs from 'dayjs'

export interface IRowContractOffice {
  user?: UserModel
}

export class RowContractOfficeModel implements IRowContractOffice {
  user?: UserModel

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new RowContractOfficeModel(), obj)
    newObj.user = UserModel.assign(obj.user || {})
    if (newObj.expiryDate) {
      const currentDate = dayjs(new Date())
      newObj.expiredInDays = dayjs(newObj.expiryDate).diff(currentDate, 'days')
      newObj.expiredInDays = newObj.expiredInDays > -1 ? newObj.expiredInDays : L('EXPIRED')
    }
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class ContractFeeRow {
  id: number
  from?: string
  to?: string
  days?: number
  rate?: number
  fee?: number
  totalFee?: number
  year?: string

  constructor() {
    this.id = 0
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new ContractOfficeModel(), obj)
    newObj.from = obj.from ? dayjs(obj.from) : null
    newObj.to = obj.to ? dayjs(obj.to) : null

    return newObj
  }
}

export class ContractOfficeModel {
  id: number
  companyId?: number
  company?: any
  unitIds?: any
  units?: any
  commencementDate?: Date
  expiryDate?: Date
  isActive: boolean
  rents?: ContractFeeRow[]
  managements?: ContractFeeRow[]
  foundingDate?: string

  constructor() {
    this.id = 0
    this.isActive = true
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new ContractOfficeModel(), obj)
    newObj.commencementDate = obj.commencementDate ? dayjs(obj.commencementDate) : null
    newObj.contractSignedDate = obj.contractSignedDate ? dayjs(obj.contractSignedDate) : null
    newObj.expiryDate = obj.expiryDate ? dayjs(obj.expiryDate) : null
    newObj.foundingDate = obj.foundingDate ? dayjs(obj.foundingDate) : null
    return newObj
  }
}

export class ContractOptionModel {
  id: number
  name?: number

  constructor() {
    this.id = 0
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new ContractOptionModel(), obj)
    newObj.name = obj.contractname
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}
