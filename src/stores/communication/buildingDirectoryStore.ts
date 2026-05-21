import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import buildingDirectoryService from '../../services/communication/buildingDirectoryService'

class BuildingDirectoryStore {
  @observable isLoading!: boolean
  @observable buildingDirectories!: PagedResultDto<any>
  @observable editBuildingDirectory!: any

  constructor() {
    makeObservable(this)
    this.buildingDirectories = { items: [], totalCount: 0 }
    this.editBuildingDirectory = {}
  }

  @action
  async create(body: any) {
    this.isLoading = true
    this.editBuildingDirectory = await buildingDirectoryService.create(body).finally(async () => {
      this.isLoading = false
    })
  }

  @action
  async update(updateBuildingDirectoryInput: any) {
    this.isLoading = true
    await buildingDirectoryService.update(updateBuildingDirectoryInput).finally(async () => {
      this.isLoading = false
    })
  }

  @action
  async delete(id: number) {
    await buildingDirectoryService.delete(id)
    this.buildingDirectories.items = this.buildingDirectories.items.filter((x) => x.id !== id)
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await buildingDirectoryService.activateOrDeactivate(id, isActive)
  }

  @action
  async get(id: number) {
    const result = await buildingDirectoryService.get(id)
    this.editBuildingDirectory = result
  }

  @action
  async createBuildingDirectory() {
    this.editBuildingDirectory = {
      displayName: '',
      emailAddress: '',
      phoneNumber: '',
      description: '',
      url: '',
      position: 0
    }
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await buildingDirectoryService.getAll(params).finally(() => (this.isLoading = false))
    this.buildingDirectories = result
  }
}

export default BuildingDirectoryStore
