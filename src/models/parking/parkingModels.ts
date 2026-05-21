import dayjs from 'dayjs'

export class parkingLotModel {
  id: number
  isActive?: boolean
  projectId?: number
  code?: string
  name?: string
  numOfSlots?: number
  description?: string
  constructor() {
    this.id = 0
  }
  public static assign(obj) {
    if (!obj) return undefined
    const newObj = Object.assign(new parkingLotModel(), obj)

    return newObj
  }
}
export class parkingCardModel {
  id: number
  serialNumber?: string
  parkingId?: number
  statusId?: boolean
  isActive?: boolean
  feePackageId?: number
  projectId?: number
  amount?: number
  cancellationDate?: Date

  constructor() {
    this.id = 0
  }
  public static assign(obj) {
    if (!obj) return undefined
    const newObj = Object.assign(new parkingCardModel(), obj)

    newObj.cancellationDate = obj.cancellationDate ? dayjs(obj.cancellationDate) : null
    return newObj
  }
}

export class VehicleModel {
  numberPlate?: string
  model?: string
  description?: string
  corlor?: string
  typeId?: string
  constructor() {
    this.numberPlate = ''
  }
  public static assign(obj) {
    if (!obj) return undefined
    const newObj = Object.assign(new VehicleModel(), obj)

    return newObj
  }
}
