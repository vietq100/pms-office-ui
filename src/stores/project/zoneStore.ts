import { action, observable, makeObservable } from 'mobx'
import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import zoneService from '../../services/project/zoneService'

class ZoneStore {
  @observable isLoading!: boolean
  @observable zones!: PagedResultDto<any>
  @observable editZone!: any

  constructor() {
    makeObservable(this)
  }
  @action
  async create(body: any) {
    await zoneService.create(body)
  }

  @action
  async update(updateFloorInput: any) {
    await zoneService.update(updateFloorInput)
  }

  @action
  async delete(id: number) {
    await zoneService.delete(id)
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await zoneService.activateOrDeactivate(id, isActive)
  }

  @action
  async get(id: number) {
    const result = await zoneService.get(id)
    this.editZone = result
  }

  @action
  async initZone() {
    this.editZone = {
      id: undefined,
      zoneName: '',
      zoneCode: '',
      description: '',
      isActive: true,
      size: 0,
      powerConsumption: 0
    }
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await zoneService.getAll(params).finally(() => (this.isLoading = false))
    this.zones = result
  }
}

export default ZoneStore
