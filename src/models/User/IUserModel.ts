export interface IUserModel {
  id: number
  name: string
  surname: string
  displayName: string
  phoneNumber?: string
  userName?: string
  emailAddress?: string
  fileUrl?: string
}

export class UserModel implements IUserModel {
  id: number
  name: string
  surname: string
  displayName: string
  phoneNumber?: string
  userName?: string
  emailAddress?: string
  fileUrl?: string

  constructor(id?, displayName?, userName?, emailAddress?, phoneNumber?) {
    this.id = id || 0
    this.name = ''
    this.surname = ''
    this.displayName = displayName || ''
    this.phoneNumber = phoneNumber
    this.userName = userName || ''
    this.emailAddress = emailAddress
    this.fileUrl = ''
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new UserModel(), obj || {})
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class UnitUserModel implements IUserModel {
  optionValue: string
  id: number
  userId: number
  name: string
  surname: string
  displayName: string
  phoneNumber?: string
  userName?: string
  emailAddress?: string
  fileUrl?: string
  unitId?: number
  fullUnitCode?: string
  constructor() {
    this.optionValue = ''
    this.id = 0
    this.userId = 0
    this.name = ''
    this.surname = ''
    this.displayName = ''
    this.phoneNumber = ''
    this.userName = ''
    this.emailAddress = ''
    this.fileUrl = ''
    this.unitId = 0
    this.fullUnitCode = ''
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new UnitUserModel(), obj.user || {})
    newObj.userId = obj.user?.id
    newObj.unitId = obj.unit?.id
    newObj.optionValue = `${newObj.unitId}-${newObj.userId}`
    newObj.fullUnitCode = obj.unit?.fullUnitCode
    return newObj
  }

  public static init(displayName, userId, unitId, fullUnitCode) {
    const newObj = Object.assign(new UnitUserModel(), {})
    newObj.displayName = displayName
    newObj.userId = userId
    newObj.unitId = unitId
    newObj.optionValue = `${newObj.unitId}-${newObj.userId}`
    newObj.fullUnitCode = fullUnitCode
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class UserOption {
  id: number
  value: number
  label: string
  displayName: string
  emailAddress: string

  constructor() {
    this.id = 0
    this.value = 0
    this.label = ''
    this.displayName = ''
    this.emailAddress = ''
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new UserOption(), obj || {})
    newObj.id = obj.id
    newObj.value = obj.id
    newObj.label = obj.displayName
    newObj.displayName = obj.displayName
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    ;(objs || []).forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class UserBalanceModel {
  id: number
  user?: UserModel
  cashNumber?: string
  balanceAmount?: number

  constructor() {
    this.id = 0
    this.balanceAmount = 0
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new UserBalanceModel(), obj || {})
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}
