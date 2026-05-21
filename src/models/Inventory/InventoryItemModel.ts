import moment from 'moment-timezone/moment-timezone'

export interface IInventoryItemName {
  languageName: string
  value: string
}

export enum IInventoryStockTypes {
  stockIn = 'INVENTORY_STOCK_IN',
  stockOut = 'INVENTORY_STOCK_OUT'
}

export interface IInventoryItem {
  id: number
  categoryId: number
  name: string
  description: string
  locationUseAt: string
  typeDescription: string
  minimumBalance: number
  locationId: number
  locationRackNo: string
  locationRowNo: string
  locationOther: string
  rating: string
  colourCode: string
  quantity?: number
}

export class InventoryItemModel {
  id: number
  categoryId: number
  name: string
  description: string
  locationUseAt: string
  typeDescription: string
  minimumBalance: number
  locationId?: number
  locationRackNo: string
  locationRowNo: string
  locationOther: string
  rating: string
  colourCode: string

  constructor() {
    this.id = 0
    this.name = ''
    this.categoryId = 0
    this.description = ''
    this.locationUseAt = ''
    this.typeDescription = ''
    this.minimumBalance = 0
    this.locationId = undefined
    this.locationRackNo = ''
    this.locationRowNo = ''
    this.locationOther = ''
    this.rating = ''
    this.colourCode = ''
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new InventoryItemModel(), obj)
    newObj.id = obj.id
    newObj.name = obj.name
    newObj.categoryId = obj.categoryId
    newObj.description = obj.description
    newObj.locationUseAt = obj.locationUseAt
    newObj.typeDescription = obj.typeDescription
    newObj.minimumBalance = obj.minimumBalance
    newObj.locationId = obj.location ? obj.location.id : undefined
    newObj.locationRackNo = obj.locationRackNo
    newObj.locationRowNo = obj.locationRowNo
    newObj.locationOther = obj.locationOther
    newObj.rating = obj.rating
    newObj.colourCode = obj.colourCode

    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class InventoryStockInModel {
  id: number
  inventoryId: number
  companyId?: number
  brandId?: number
  locationId?: number
  inputDate?: Date
  quantity?: number
  cost?: number
  unitPrice?: number
  description: string
  deliveryNo: string

  constructor() {
    this.id = 0
    this.inventoryId = 0
    this.companyId = undefined
    this.brandId = undefined
    this.locationId = undefined
    this.inputDate = moment()
    this.quantity = undefined
    this.cost = undefined
    this.unitPrice = undefined
    this.description = ''
    this.deliveryNo = ''
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new InventoryStockInModel(), obj)
    newObj.id = obj.id
    newObj.inventoryId = obj.inventoryId
    newObj.companyId = obj.companyId
    newObj.brandId = obj.brandId
    newObj.locationId = obj.locationId
    newObj.inputDate = obj.inputDate ? moment(obj.inputDate) : undefined
    newObj.quantity = obj.quantity
    newObj.cost = obj.cost
    newObj.unitPrice = obj.unitPrice
    newObj.description = obj.description
    newObj.deliveryNo = obj.deliveryNo

    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class InventoryStockOutModel {
  id: number
  inventoryId: number
  parentId: number
  outputDate?: Date
  quantity: number
  description: string

  constructor() {
    this.id = 0
    this.inventoryId = 0
    this.parentId = 0
    this.outputDate = moment()
    this.quantity = 0
    this.description = ''
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new InventoryStockOutModel(), obj)
    newObj.id = obj.id
    newObj.inventoryId = obj.inventoryId
    newObj.parentId = obj.parentId
    newObj.outputDate = obj.outputDate ? moment(obj.outputDate) : undefined
    newObj.quantity = obj.quantity
    newObj.description = obj.description

    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}
