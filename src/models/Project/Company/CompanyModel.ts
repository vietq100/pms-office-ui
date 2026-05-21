import { UserModel } from '@models/User/IUserModel'

export interface SalesOrganizationDto {
  id: number
  salesOrg: string
  companyCode: string
  name: string
  isActive: boolean
}

export interface LocationSimpleDto {
  id: number
  code: string
  name: string
}

export interface IRowCompany {
  user?: UserModel
}

export class RowCompanyModel implements IRowCompany {
  user?: UserModel

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new RowCompanyModel(), obj)
    newObj.user = UserModel.assign(obj.user || {})
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class CompanyOptionModel {
  id: number
  name: string
  companyCode: string
  companyLegalName: string
  representative: string
  constructor() {
    this.id = 0
    this.name = ''
    this.companyCode = ''
    this.companyLegalName = ''
    this.representative = ''
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new CompanyOptionModel(), obj)
    newObj.name = obj.companyName
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export enum BpType {
  Personal = 1,
  Organization = 2
}

export class SyncHistoryModel {
  id: number
  status: string
  requestPayload: string
  responsePayload: string
  errorMessage: string | null
  attemptNumber: number
  createdTime: string

  constructor() {
    this.id = 0
    this.status = ''
    this.requestPayload = ''
    this.responsePayload = ''
    this.errorMessage = null
    this.attemptNumber = 0
    this.createdTime = ''
  }

  public static assigns(objs: any[]): SyncHistoryModel[] {
    return objs.map((item) => Object.assign(new SyncHistoryModel(), item))
  }
}

export class CompanyModel {
  id: number
  companyTypeId?: number
  companyCode: string
  companyTax: string
  companyName: string
  companyLegalName: string
  representative: string
  documentFileId?: Date
  // SAP
  bpType?: number
  buGroup?: string
  salesOrganizationId?: number
  salesOrganization?: SalesOrganizationDto
  sapPartnerNumber?: string
  isSyncedToSap?: boolean
  // Personal
  firstName?: string
  lastName?: string
  title?: string
  birthDate?: string
  issueDate?: string
  issuePlace?: string
  permanentAddress?: string
  permanentCommuneId?: number
  permanentCommune?: LocationSimpleDto
  permanentDistrictId?: number
  permanentDistrict?: LocationSimpleDto
  permanentProvinceId?: number
  permanentProvince?: LocationSimpleDto
  permanentCountryId?: number
  permanentCountry?: LocationSimpleDto
  // Organization extra
  businessLicense?: string
  licenseIssueDate?: string
  licenseIssuePlace?: string
  // Contact address
  contactCommuneId?: number
  contactCommune?: LocationSimpleDto
  contactDistrictId?: number
  contactDistrict?: LocationSimpleDto
  contactProvinceId?: number
  contactProvince?: LocationSimpleDto
  contactCountryId?: number
  contactCountry?: LocationSimpleDto

  constructor() {
    this.id = 0
    this.companyName = ''
    this.companyCode = ''
    this.companyTax = ''
    this.companyLegalName = ''
    this.representative = ''
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new CompanyModel(), obj)
    newObj.companyTypeId = obj.companyType?.id
    return newObj
  }
}

export class CompanyTypeModel {
  id: number
  name: string

  constructor() {
    this.id = 0
    this.name = ''
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new CompanyTypeModel(), obj)
    newObj.name = obj.typeName
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}
