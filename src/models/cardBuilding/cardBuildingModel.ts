export class CardBuildingModel {
  id: any
  constructor() {
    this.id = undefined
  }

  public static assign(obj: any) {
    if (!obj || !obj.cardRequests || !Array.isArray(obj.cardRequests) || obj.cardRequests.length === 0) {
      return obj
    }

    const [firstRequest] = obj.cardRequests
    const updatedFirstRequest = { ...firstRequest }

    // Collect keys that already exist inside first cardRequest
    const keysInCardRequest = new Set(Object.keys(firstRequest))

    // Move matching top-level keys into the first cardRequest
    Object.keys(obj).forEach((key) => {
      if (key !== 'id' && keysInCardRequest.has(key)) {
        updatedFirstRequest[key] = obj[key]
      }
    })

    const newCardRequests = [updatedFirstRequest]

    delete obj.tenantName
    delete obj.departmentName
    delete obj.elevatorAccess
    delete obj.numberPlate
    delete obj.tenantType
    delete obj.vehicleTypeId
    delete obj.vehicleParkingType

    // Return the transformed object
    return {
      ...obj,
      cardRequests: newCardRequests
    }
  }

  public static assigns(objs) {
    const results: any[] = []
    objs?.forEach((item) => results.push(this.assign(item)))
    return results
  }
}
