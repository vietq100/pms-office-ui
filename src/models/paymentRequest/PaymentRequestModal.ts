import dayjs from 'dayjs'

export class WaterMeterModal {
  id: number

  constructor() {
    this.id = 0
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new WaterMeterModal(), obj)
    newObj.dateOfRecording = obj.dateOfRecording ? dayjs(obj.dateOfRecording) : null
    newObj.dateOfCreationOfWater = obj.dateOfCreationOfWater ? dayjs(obj.dateOfCreationOfWater) : null

    return newObj
  }
}

export class ElectricMeterModal {
  id: number

  constructor() {
    this.id = 0
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new ElectricMeterModal(), obj)
    newObj.dateOfRecording = obj.dateOfRecording ? dayjs(obj.dateOfRecording) : null
    newObj.dateOfCreationOfElectricity = obj.dateOfCreationOfElectricity ? dayjs(obj.dateOfCreationOfElectricity) : null

    return newObj
  }
}

export class ListManagementFeeModal {
  id: number

  constructor() {
    this.id = 0
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new ListManagementFeeModal(), obj)
    newObj.children = obj.items

    return newObj
  }

  public static assigns(objs) {
    return objs.map((item) => ListManagementFeeModal.assign(item))
  }
}
export class ManagementFeeModal {
  id: number

  constructor() {
    this.id = 0
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new ManagementFeeModal(), obj)
    newObj.dateOfCreation = obj.dateOfCreation ? dayjs(obj.dateOfCreation) : null
    newObj.paymentBeforeDate = obj.paymentBeforeDate ? dayjs(obj.paymentBeforeDate) : null
    newObj.startOfDate = obj.startOfDate ? dayjs(obj.startOfDate) : null
    newObj.endOfDate = obj.endOfDate ? dayjs(obj.endOfDate) : null

    return newObj
  }
}

export class ListElectricAndWaterFeeModal {
  id: number

  constructor() {
    this.id = 0
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new ListElectricAndWaterFeeModal(), obj)
    newObj.children = obj.items
    newObj.dateOfCreation = obj.year
    newObj.id = obj.year

    return newObj
  }

  public static assigns(objs) {
    return objs.map((item) => ListElectricAndWaterFeeModal.assign(item))
  }
}
export class ElectricAndWaterFeeModal {
  id: number

  constructor() {
    this.id = 0
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new ElectricAndWaterFeeModal(), obj)
    newObj.dateOfCreation = obj.dateOfCreation ? dayjs(obj.dateOfCreation) : null
    newObj.paymentBeforeDate = obj.paymentBeforeDate ? dayjs(obj.paymentBeforeDate) : null
    newObj.startOfDate = obj.startOfDate ? dayjs(obj.startOfDate) : null
    newObj.endOfDate = obj.endOfDate ? dayjs(obj.endOfDate) : null
    newObj.dateOfCreationOfWater = obj.dateOfCreationOfWater ? dayjs(obj.dateOfCreationOfWater) : null
    newObj.dateOfCreationOfElectricity = obj.dateOfCreationOfElectricity ? dayjs(obj.dateOfCreationOfElectricity) : null

    return newObj
  }
}
