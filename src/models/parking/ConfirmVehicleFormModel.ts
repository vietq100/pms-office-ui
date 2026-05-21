export interface IDetails {
  id: number
  vehicleTypeId?: number
  feeGenerateConfigurationId?: number
  totalVehicle?: number
}

export class ConfirmVehicleFormModel {
  id: number
  vehicleRegistrationFee: any[]
  note?: string
  feePackageId?: number
  uniqueId?: string
  statusId?: number
  constructor() {
    this.id = 0
    this.vehicleRegistrationFee = []
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new ConfirmVehicleFormModel(), obj)
    newObj.vehicleRegistrationFee = obj.vehicleRegistrationFee.map((item) => ({
      id: item?.id,
      vehicleTypeId: item?.vehicleTypeId,
      feeGenerateConfigurationId: item?.feeGenerateConfigurationId,
      totalPrice: item?.totalPrice,
      vatPrice: item?.vatPrice
    }))

    return newObj
  }
}
