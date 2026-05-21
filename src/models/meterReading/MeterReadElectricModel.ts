export interface IelectricDetails {
  id: number
  previousReading?: number
  newReading?: string
  newSunReading?: number
  previousSunReading?: number
  quantityConsumption?: number
  quantitySunConsumption?: number
  quantity?: number
}

export class MeterReadingElectricModel {
  id: number
  electricDetails: IelectricDetails[]
  note?: string
  feePackageId?: number
  uniqueId?: string
  companyId?: number

  constructor() {
    this.id = 0
    this.electricDetails = []
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new MeterReadingElectricModel(), obj)
    newObj.electricDetails = obj.electricDetails.map((item) => ({
      id: item?.id,
      previousReading: item?.previousReading,
      newReading: item?.newReading,
      quantity: item?.quantity,
      unitId: item?.unitId,
      fullUnitCode: item?.unit?.fullUnitCode,
      newSunReading: item?.newSunReading,
      previousSunReading: item?.previousSunReading,
      quantityConsumption: item?.quantityConsumption,
      quantitySunConsumption: item?.quantitySunConsumption
    }))

    return newObj
  }
}
