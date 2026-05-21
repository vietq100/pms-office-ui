import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '@services/dto/pagedResultDto'
import cardbuidingService from '@services/cardbuilding/cardbuidingService'

class CardbuidingStore {
  @observable isLoading!: boolean
  @observable cardBuildings!: PagedResultDto<any>
  @observable editCardBuilding!: any
  @observable listCompany!: any[]
  @observable listVehicleType!: any[]
  @observable listParking!: any[]
  @observable listFeeParking!: any[]

  constructor() {
    this.cardBuildings = { totalCount: 0, items: [] }
    this.editCardBuilding = {}
    this.listParking = []
    makeObservable(this)
  }

  @action
  async initCard() {
    this.isLoading = true
    this.editCardBuilding = { id: null, isActive: true }
    this.isLoading = false
  }
  @action
  async create(body: any) {
    this.isLoading = true
    await cardbuidingService.create(body).finally(() => (this.isLoading = false))
  }

  @action
  async update(updateUnitInput: any) {
    this.isLoading = true
    await cardbuidingService.update(updateUnitInput).finally(() => (this.isLoading = false))
  }

  @action
  async getAll(params: any) {
    const result = await cardbuidingService.getAll(params)
    this.cardBuildings = result
    return result
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await cardbuidingService.activateOrDeactivate(id, isActive)
  }

  @action
  async get(id: number) {
    const result = await cardbuidingService.get(id)
    this.editCardBuilding = result
  }

  @action
  async getListCompany() {
    const result = await cardbuidingService.getListCompany()

    this.listCompany = result
  }

  @action
  async getListVehicleType() {
    const result = await cardbuidingService.getListVehicleType()

    this.listVehicleType = result
  }

  @action
  async getListParking() {
    const result = await cardbuidingService.getListParking()

    this.listParking = result
  }

  @action
  async getListFeeParking() {
    const result = await cardbuidingService.getListFeeParking()

    this.listFeeParking = result
  }

  @action
  async importCard(file) {
    return await cardbuidingService.importCard(file)
  }

  @action
  async downloadTemplate() {
    return cardbuidingService.downloadTemplate()
  }
}

export default CardbuidingStore
