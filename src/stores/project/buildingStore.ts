import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import buildingService from '../../services/project/buildingService'

class BuildingStore {
  @observable isLoading!: boolean
  @observable buildings!: PagedResultDto<any>
  @observable editBuilding!: any
  @observable buildingOptions: any = []
  constructor() {
    makeObservable(this)
  }
  @action
  async create(body: any) {
    const result = await buildingService.create(body)
    this.buildings.items.push(result)
  }

  @action
  async update(updateBuildingInput: any) {
    const result = await buildingService.update(updateBuildingInput)
    this.buildings.items = this.buildings.items.map((x) => {
      if (x.id === updateBuildingInput.id) x = result
      return x
    })
  }

  @action
  async delete(id: number) {
    await buildingService.delete(id)
    this.buildings.items = this.buildings.items.filter((x) => x.id !== id)
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await buildingService.activateOrDeactivate(id, isActive)
  }

  @action
  async get(id: number) {
    const result = await buildingService.get(id)

    this.editBuilding = result
  }

  @action
  async createBuilding(projectId?) {
    this.editBuilding = {
      id: 0,
      name: '',
      code: '',
      isActive: true,
      projectId: projectId,
      description: ''
    }
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await buildingService.getAll(params).finally(() => (this.isLoading = false))
    this.buildings = result
  }

  @action
  async filterOptions(params: any) {
    const result = await buildingService.filterOptions(params)
    this.buildingOptions = result
  }
}

export default BuildingStore
