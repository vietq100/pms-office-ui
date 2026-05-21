export interface IelectricDetails {
  id: number
  previousReading?: number
  newReading?: string
  newSunReading?: number
  previousSunReading?: number
  quantityConsumption?: number
  quantitySunConsumption?: number
  quantity?: number
  totalAmount?: number
  totalAmountVat?: number
  amount?: number
}

export class ConfirmMeterReaingModal {
  id: number
  electricDetails: IelectricDetails[]
  note?: string
  feePackageId?: number
  uniqueId?: string
  statusId?: number

  constructor() {
    this.id = 0
    this.electricDetails = []
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new ConfirmMeterReaingModal(), obj)
    newObj.electricDetails = obj.electricDetails.map((item) => ({
      id: item?.id,
      previousReading: item?.previousReading,
      newReading: item?.newReading,
      quantity: item?.quantity,
      unitId: item?.unitId,
      fullUnitCode: item?.unit?.fullUnitCode,
      totalAmount: item?.totalAmount,
      totalAmountVat: item?.totalAmountVat,
      amount: item?.amount,
      newSunReading: item?.newSunReading,
      previousSunReading: item?.previousSunReading,
      quantityConsumption: item?.quantityConsumption,
      quantitySunConsumption: item?.quantitySunConsumption
    }))

    return newObj
  }
}
