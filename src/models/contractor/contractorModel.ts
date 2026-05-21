import dayjs from 'dayjs'

export interface IContractorModel {
  id?: number
  contractorName?: string
  contractorProjects?: any[]
  address?: string
}
export class ContractorModel implements IContractorModel {
  contractorName?: string
  contractorProjects?: []
  address?: string

  constructor() {
    this.contractorName = ''
    this.contractorProjects = []
    this.address = ''
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new ContractorModel(), obj)

    newObj.contractorName = obj.contractorName
    newObj.contractorProjects = obj.contractorProjects
    newObj.address = obj.address

    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class ContractorDocumentModel {
  id: number
  uniqueId: any
  documentName: any
  contractorId: number
  effectiveDate?: Date
  expiryDate?: Date
  contractorDocuments: any

  constructor() {
    this.id = 0
    this.contractorId = 0
    this.documentName = ''
    this.effectiveDate = new Date()
    this.expiryDate = new Date()
  }
  public static assign(obj) {
    if (!obj) return undefined
    const newObj = Object.assign(new ContractorDocumentModel(), obj)
    newObj.effectiveDate = obj.effectiveDate ? dayjs(obj.effectiveDate) : null
    newObj.expiryDate = obj.expiryDate ? dayjs(obj.expiryDate) : null
    return newObj
  }
}

export class ContractorDetailModel {
  id: number
  contractorName?: string
  phoneNumber?: number
  address?: string
  tax?: string
  description?: string
  contractorFirms?: any[]
  contractorContacts?: any[]
  contractorProjects?: any[]
  contractorDocuments?: any[]
  constructor() {
    this.id = 0

    this.contractorName = ''
    this.phoneNumber = 0
    this.address = ''
    this.tax = ''
    this.description = ''
    this.contractorContacts = []
    this.contractorFirms = []
    this.contractorDocuments = []
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new ContractorDetailModel(), obj)
    newObj.contractorFirms = obj.contractorFirms.map((item) => item.firmId)
    newObj.contractorDocuments = obj.contractorDocuments.map((item) => ({
      effectiveDate: item.effectiveDate ? dayjs(item.effectiveDate) : null,
      expiryDate: item.expiryDate ? dayjs(item.expiryDate) : null,
      id: item.id,
      uniqueId: item.uniqueId,
      documentName: item.documentName,
      contractorDocuments: item.contractorDocuments,
      contractorId: item.contractorId,
      documentType: item.documentType,
      documentTypeId: item.documentTypeId,
      remarks: item.remarks,
      file: item.file
    }))

    return newObj
  }
}
export class ContractorActivityDetailModel {
  id?: number
  uniqueId?: string
  contractorId?: number
  checkInTime?: Date
  checkOutTime?: Date

  public static assign(obj) {
    if (!obj) return undefined
    const newObj = Object.assign(new ContractorActivityDetailModel(), obj)
    newObj.checkInTime = obj.checkInTime ? dayjs(obj.checkInTime) : null
    newObj.checkOutTime = obj.checkOutTime ? dayjs(obj.checkOutTime) : null

    return newObj
  }
}
export class ContactModel {
  contractorContactId?: number
  userName?: number
  name?: number
  emailAddress?: Date
  password?: string
  isActive?: boolean
  phoneNumber?: number
  contractorId?: number
  surname?: string
  displayName?: string
  roleNames?: any[]

  constructor(id?, contactEmail?, contactName?, contactPhone?, contractorId?, password?) {
    this.contractorContactId = id
    this.emailAddress = contactEmail
    this.userName = contactPhone
    this.name = contactName
    this.displayName = contactName
    this.phoneNumber = contactPhone
    this.contractorId = contractorId
    this.surname = contactName.split(' ')[0]
    this.password = password
    this.roleNames = []
    this.isActive = true
  }
  public static assign(obj) {
    if (!obj) return undefined
    const newObj = Object.assign(new ContactModel(), obj)
    newObj.userName = obj.contactPhone ? obj.contactPhone : null
    newObj.name = obj.contactName ? obj.contactName : null
    newObj.emailAddress = obj.contactEmail ? obj.contactEmail : null
    return newObj
  }
}
