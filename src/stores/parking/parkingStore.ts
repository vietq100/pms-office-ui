import { L } from '@lib/abpUtility'
import { parkingCardModel, parkingLotModel } from '@models/parking/parkingModels'
import type { PagedResultDto } from '@services/dto/pagedResultDto'
import parkingService from '@services/parking/parkingService'

import { observable, makeObservable, action } from 'mobx'

class ParkingStore {
  @observable parkingLot!: PagedResultDto<any>
  @observable parkingCard!: PagedResultDto<any>
  @observable parkingCardRequest!: PagedResultDto<any>
  @observable isLoading!: boolean
  @observable editParkingLot!: any
  @observable editParkingCard!: any
  @observable editParkingCardRequest!: any
  @observable vehicleTypes!: any
  @observable vehicleStatus!: any
  @observable vehicleStatusActive!: any
  @observable vehicleStatusCancel!: any
  @observable listFeeParking!: any
  @observable grantedStatus!: any

  constructor() {
    makeObservable(this)
    this.parkingCard = {
      items: [],
      totalCount: 0
    }
    this.parkingLot = {
      items: [],
      totalCount: 0
    }
    this.parkingCardRequest = {
      items: [],
      totalCount: 0
    }
    this.grantedStatus = [
      {
        id: true,
        value: true,
        label: L('PARKING_STATUS_GRANTED')
      },
      {
        id: false,
        value: false,
        label: L('PARKING_STATUS_UNGRANTED')
      }
    ]
    this.editParkingCard = {}
    this, (this.editParkingCardRequest = {})
    this.vehicleTypes = []
    this.listFeeParking = []
  }
  //PARKING LOT
  @action
  async getAllParking(params: any) {
    this.isLoading = true
    const result = await parkingService.getAllParking(params).finally(() => (this.isLoading = false))
    this.parkingLot = result
  }

  @action
  async createParking(body: any) {
    this.isLoading = true
    this.editParkingLot = await parkingService.createParking(body).finally(() => (this.isLoading = false))
  }
  @action
  async addParkingLot() {
    this.editParkingLot = new parkingLotModel()
  }
  @action
  async editParking(inventoryBrand: parkingLotModel) {
    this.editParkingLot = inventoryBrand
  }
  @action
  async updateParking(body: any) {
    this.isLoading = true
    this.editParkingLot = await parkingService.updateParking(body).finally(() => (this.isLoading = false))
  }

  @action
  async getParking(id: number) {
    const result = await parkingService.getParking(id)
    this.editParkingLot = result
  }

  @action
  async activateOrDeactivateParkingLot(id, isActive) {
    await parkingService.activateOrDeactivateParkingLot(id, isActive)
  }
  //PARKING MANAGEMENT
  @action
  async getAllVehicleResident(params: any) {
    this.isLoading = true
    const result = await parkingService.getAllVehicleResident(params).finally(() => (this.isLoading = false))
    this.parkingCard = result
  }
  @action
  async getAllRegistedVehicles(params: any) {
    this.isLoading = true
    const result = await parkingService.getAllRegistedVehicles(params).finally(() => (this.isLoading = false))
    this.parkingCard = result
  }

  @action
  async create(body: any) {
    this.isLoading = true
    this.editParkingCard = await parkingService.create(body).finally(async () => {
      this.isLoading = false
    })
  }
  @action
  async add() {
    this.editParkingCard = { id: null, isActive: true }
  }
  @action
  async edit(inventoryBrand: parkingCardModel) {
    this.editParkingCard = inventoryBrand
  }
  @action
  async update(body: any) {
    this.isLoading = true
    this.editParkingCard = await parkingService.update(body).finally(async () => {
      this.isLoading = false
    })
  }

  @action
  async getByAdmin(id: number) {
    const result = await parkingService.getByAdmin(id)
    this.editParkingCard = result
  }
  @action
  async getByResident(id: number) {
    const result = await parkingService.getByResident(id)
    this.editParkingCard = result
  }
  @action
  async getType() {
    const result = await parkingService.getType()
    this.vehicleTypes = result
  }

  @action
  async getListFeeParking(id?: number) {
    if (!id) {
      this.listFeeParking = []
    } else {
      const result = await parkingService.getListFeeParking(id)
      this.listFeeParking = result
    }
  }

  @action
  async getStatus() {
    const result = await parkingService.getStatus()
    this.vehicleStatus = result
    this.vehicleStatusActive = result.filter((item) => item.isCancel === false)
    this.vehicleStatusCancel = result.filter((item) => item.isCancel === true)
  }
  @action
  async exportParkingCard(params: any) {
    this.isLoading = true
    return await parkingService.exportParkingCard(params).finally(() => (this.isLoading = false))
  }
  @action
  async importParkingCard(file) {
    return parkingService.importParkingCard(file)
  }
  @action
  async activateOrDeactivate(id, isActive) {
    await parkingService.activateOrDeactivate(id, isActive)
  }
  @action
  async downloadTemplate() {
    return parkingService.downloadTemplate()
  }
  @action
  async importVehicleExcel(file, param?) {
    return parkingService.importVehicleExcel(file, param)
  }

  @action
  async deActiveVehicle(body: any) {
    this.isLoading = true
    await parkingService.deActiveVehicle(body).finally(() => (this.isLoading = false))
  }

  //PARKING CARD REQUEST
  @action
  async getAllRequestCard(params: any) {
    this.isLoading = true
    const result = await parkingService.getAllCardRequest(params).finally(() => (this.isLoading = false))
    this.parkingCardRequest = result
  }

  @action
  async getAllRequestCard4Staff(params: any) {
    this.isLoading = true
    const result = await parkingService.getAllCardRequest4Staff(params).finally(() => (this.isLoading = false))
    this.parkingCardRequest = result
  }

  @action
  async getCardParkingRequest(id: number) {
    const result = await parkingService.getcardParkingRequest(id)
    this.editParkingCardRequest = result
  }

  @action
  async getCardParkingRequest4Staff(id: number) {
    const result = await parkingService.getcardParkingRequest4Staff(id)
    this.editParkingCardRequest = result
  }

  @action
  async createCardParkingRequest(body: any) {
    this.isLoading = true
    await parkingService.createCardParkingRequest(body).finally(() => (this.isLoading = false))
  }

  @action
  async updateCardParkingRequest(body: any) {
    this.isLoading = true
    this.editParkingLot = await parkingService.updateCardParkingRequest(body).finally(() => (this.isLoading = false))
  }

  @action
  async updateStatusCardRequest(body: any) {
    this.isLoading = true
    await await parkingService.updateStatusCardRequest(body).finally(() => (this.isLoading = false))
  }
}

export default ParkingStore
