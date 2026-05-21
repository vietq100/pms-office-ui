import { CreatorUser } from '@services/administrator/user/dto/creatorUser'
import { Filter } from '../filter'
import { LanguageValue } from '@models/global'
import appConsts, { feePaymentStatusObject, getBackgroundColorByIndex } from '@lib/appconst'
import { StatusColors } from '@components/StatusTag'
import { L } from '@lib/abpUtility'
import dayjs from 'dayjs'

const { feePaymentStatus, FeeNoticeStatusKeys, FeeNoticeMethodKeys } = appConsts

export interface IPackageFee {
  name: string
  description?: string
  guid?: string
  period: number
  year: number
  feeType?: FeeTypeModel
  fromToDate?: Date[]
  startDate?: Date
  endDate?: Date
  creatorUser?: CreatorUser
  lastModificationTime?: string
  lastModifierUserId?: number
  creationTime?: string
  creatorUserId?: number
  id?: number
  projectId?: number
}
export class PackageFeeModel implements IPackageFee {
  name: string
  description?: string
  guid?: string
  period: number
  year: number
  fromToDate?: Date[]
  startDate?: Date
  endDate?: Date
  creatorUser?: CreatorUser
  lastModificationTime?: string
  lastModifierUserId?: number
  creationTime?: string
  creatorUserId?: number
  id?: number
  projectId?: number

  constructor() {
    this.name = ''
    this.period = 0
    this.year = 0
    this.projectId = 0
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new PackageFeeModel(), obj)
    newObj.fromToDate = [dayjs(obj.startDate), dayjs(obj.endDate)]
    newObj.startDate = dayjs(obj.startDate)
    newObj.endDate = dayjs(obj.endDate)
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class PackageFeeByYearModel {
  year: number
  packages: PackageFeeModel[]

  constructor() {
    this.year = 0
    this.packages = []
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new PackageFeeModel(), obj)
    newObj.packages = PackageFeeModel.assigns(obj.packages || [])
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export interface FilterPackageFee extends Filter {
  period?: number
  year?: number | undefined
  projectId?: number | undefined
  keyword?: string
  isActive?: boolean
}

export interface IFeeUpdate {
  debitAmount: number
  description: string
  isShowToResident: boolean
  isActive: boolean
  id: number
}

export interface IFee {
  packageId: number
  projectId: number
  unitId?: number
  feePayStatusId?: number
  fullUnitCode?: string
  customerName?: string
  feeTypeId?: number
  totalAmount?: number
  debitAmount?: number
  billNumber?: string
  dueDate?: string
  description?: string
  informDate?: string
  fromDate?: string
  toDate?: string
  isShowToResident?: boolean
  isActive?: boolean
  feeType?: {
    code: string
    nameId: string
    name: string
    description: string
    isActive: boolean
    creatorUser: CreatorUser
    creationTime: string
    creatorUserId: number
    id: number
  }
  package?: IPackageFee
  id?: number
}

export interface IPaymentMethod {
  id: number
  code: string
  feePaymentChannelId: number
  accountNo: string
  address: string
  branchName: string
  beneficiaryName: string
  description: string
  bankCif: string
  isActive: boolean
  feePaymentChannel: {
    code: string
    name: string
    id: number
  }
}
export class FeeDetailModel implements IFee {
  packageId: number
  projectId: number
  unitId?: number
  feePayStatusId?: number
  feePayStatus?: any
  fullUnitCode?: string
  customerName?: string
  feeTypeId?: number
  totalAmount?: number
  debitAmount?: number
  billNumber?: string
  dueDate?: string
  description?: string
  informDate?: string
  fromDate?: string
  toDate?: string
  isShowToResident?: boolean
  isActive?: boolean
  feeType?: {
    code: string
    nameId: string
    name: string
    description: string
    isActive: boolean
    creatorUser: CreatorUser
    creationTime: string
    creatorUserId: number
    id: number
  }
  package?: IPackageFee
  id?: number

  constructor() {
    this.packageId = 0
    this.projectId = 0
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new FeeDetailModel(), obj)
    const color =
      obj.feePayStatusId === feePaymentStatus.paid
        ? StatusColors.Active
        : obj.feePayStatusId === feePaymentStatus.unPaid
        ? StatusColors.Inactive
        : StatusColors.Refunded
    newObj.feePayStatus = {
      id: obj.feePayStatusId,
      name: L(feePaymentStatusObject[obj.feePayStatusId] || 'FEE_STATUS_NOT_DEFINED'),
      color
    }
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}
export interface IFeeFilter {
  keyword?: string
  projectId?: number
  year?: number
  period?: number
  feeTypeId?: number
  feeStatus?: number
  isShowToResident?: boolean
  isActive?: boolean
  skipCount?: number
  packageId?: number
  maxResultCount?: number
  groupName?: string
}

export interface IFeeType {
  groupId?: number
  code?: string
  name?: string
  names?: LanguageValue[]
  description?: any
  isActive?: boolean
  id?: number
  nameId?: string
  isGenFee?: boolean
  feeGenerateConfiguration?: any
  feeGenerateConfigurations?: any
  isFeeNotification?: boolean
  materialSAP?: any
}

export class FeeTypeModel implements IFeeType {
  groupId?: number
  code?: string
  name?: string
  names?: LanguageValue[]
  description?: any
  isActive?: boolean
  id?: number
  nameId?: string
  feeGenerateConfiguration?: any
  isGenFee?: boolean
  constructor() {
    this.id = undefined
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new FeeTypeModel(), obj)
    newObj.names = LanguageValue.init(obj.names || [])
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export interface IFeeGroup {
  id: number
  package: IPackageFee
  unitId: number
  fullUnitCode: string
  totalAmount: number
  debitAmount: number
  projectId: number
  companyId?: number
}

export type ResidentUnit = {
  optionValue: string
  displayName: string
  fullUnitCode: string
  emailAddress: string
  userName: string
  phoneNumber: string
}

export interface ISummaryFee {
  name?: string
  code?: string
  statusId: number
  totalAmount: number
  totalCount: number
  unPaid?: number
  paid?: number
  refund?: number
  color?: string
}

export class SummaryFee implements ISummaryFee {
  name?: string
  code?: string
  statusId: number
  totalAmount: number
  totalCount: number
  unPaid?: number
  paid?: number
  refund?: number
  color?: string
  feeType?: any

  constructor(statusId?, totalAmount?, totalCount?) {
    this.statusId = statusId || 0
    this.totalAmount = totalAmount || 0
    this.totalCount = totalCount || 0
  }

  public static assign(obj, index?) {
    if (!obj) return undefined

    const newObj = Object.assign(new SummaryFee(), obj)
    newObj.name = obj.feeType?.name
    newObj.code = obj.feeType?.code
    newObj.statusId = obj.feeType?.id
    newObj.color = getBackgroundColorByIndex(index || newObj.statusId || 0)
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item, index) => results.push(this.assign(item, index)))
    return results
  }
}

// FEE REFUND
export interface IFeeRefundModel {
  id: number
  unitId: number
  depositAmount: number
  refundDescription: string
}

export class FeeRefundModel implements IFeeRefundModel {
  id: number
  unitId: number
  depositAmount: number
  refundDescription: string

  constructor(id?, refundDescription?, depositAmount?, unitId?) {
    this.id = id || 0
    this.unitId = unitId || 0
    this.depositAmount = depositAmount || 0
    this.refundDescription = refundDescription || ''
  }
}

export interface IRowFeeNotice {
  id?: number
  method?: string
  status?: string
  statusCode?: number
  isActive?: boolean
}
export class RowFeeNoticeModel implements IRowFeeNotice {
  id?: number
  method?: any
  status?: string
  statusId?: number
  isActive?: boolean
  constructor() {
    this.id = undefined
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new RowFeeNoticeModel(), obj)
    newObj.status = FeeNoticeStatusKeys[obj.statusId]
    newObj.method = obj.data?.methodIds.map((item) => FeeNoticeMethodKeys[item])

    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}
