import { UserModel } from '@models/User/IUserModel'
import { CompanyOptionModel } from '@models/Project/Company/CompanyModel'
import { L } from '@lib/abpUtility'
import dayjs from 'dayjs'

export interface IRowContract {
  user?: UserModel
}

export class RowContractModel implements IRowContract {
  user?: UserModel

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new RowContractModel(), obj)
    newObj.user = UserModel.assign(obj.user || {})
    if (newObj.expiredDate) {
      const currentDate = dayjs(new Date())
      newObj.expiredInDays = dayjs(newObj.expiredDate).diff(currentDate, 'days')
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

export class ContractModel {
  id: number
  projectId?: number
  companyId?: number
  company?: any
  contractNo: string
  fullUnitCode: string
  contractName: string
  buildingIds?: any
  buildings?: any
  unitIds?: any
  units?: any
  contractTypeCode?: number
  contractCategoryId?: number
  contractCategory?: any
  signedDate?: Date
  validDate?: Date
  expiredDate?: Date
  contractAmount?: number
  remindBefore?: number
  documentFileId?: string
  isActive: boolean
  other?: string
  emailReceiveRemind?: string
  serviceFeePerSquare?: number
  amountPerSquare?: number
  numberOfEmployee?: number
  description?: string
  contractAmountBeforeTaxes?: number
  reminder?: any

  constructor() {
    this.id = 0
    this.fullUnitCode = ''
    this.contractName = ''
    this.contractNo = ''
    this.isActive = true
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new ContractModel(), obj)
    newObj.signedDate = obj.signedDate ? dayjs(obj.signedDate) : null
    newObj.validDate = obj.validDate ? dayjs(obj.validDate) : null
    newObj.expiredDate = obj.expiredDate ? dayjs(obj.expiredDate) : null
    newObj.buildingIds = (obj.buildings || []).map((item) => item.id)
    newObj.unitIds = (obj.units || []).map((item) => item.id)
    newObj.contractCategoryId = obj.contractCategory?.id
    newObj.relatedTo = obj.relatedTo ? obj.relatedTo : undefined
    newObj.company = CompanyOptionModel.assign(obj.company || {})
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
