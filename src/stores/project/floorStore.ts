import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import floorService from '../../services/project/floorService'

class FloorStore {
  @observable isLoading!: boolean
  @observable floors!: PagedResultDto<any>
  @observable editFloor!: any
  @observable roles: any = []
  constructor() {
    makeObservable(this)
  }
  @action
  async create(body: any) {
    const result = await floorService.create(body)
    this.floors.items.push(result)
  }

  @action
  async update(updateFloorInput: any) {
    const result = await floorService.update(updateFloorInput)
    this.floors.items = this.floors.items.map((x) => {
      if (x.id === updateFloorInput.id) x = result
      return x
    })
  }

  @action
  async delete(id: number) {
    await floorService.delete(id)
    this.floors.items = this.floors.items.filter((x) => x.id !== id)
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await floorService.activateOrDeactivate(id, isActive)
  }

  @action
  async getRoles() {
    const result = await floorService.getRoles()
    this.roles = result
  }

  @action
  async get(id: number) {
    const result = await floorService.get(id)
    this.editFloor = result
  }

  @action
  async createFloor(projectId?, buildingId?) {
    this.editFloor = {
      id: 0,
      name: '',
      code: '',
      description: '',
      isActive: true,
      buildingId,
      size: 0
    }
    this.roles = []
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await floorService.getAll(params).finally(() => (this.isLoading = false))
    this.floors = result
  }
}

export default FloorStore
