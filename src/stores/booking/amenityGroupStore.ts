import type { PagedResultDto } from '@services/dto/pagedResultDto'
import { AmenityGroupDetailModel, RowAmenityGroupModel } from '@models/Booking/amenityModel'
import { action, observable, makeObservable } from 'mobx'
import amenityGroupService from '@services/booking/amenityGroupService'
import amenityService from '@services/booking/amenityService'

class AmenityGroupStore {
  @observable pagedResult!: PagedResultDto<RowAmenityGroupModel>
  @observable isLoading!: boolean
  @observable editAmenityGroup!: AmenityGroupDetailModel
  @observable amenityGroups!: any[]
  @observable amenities!: any[]

  constructor() {
    makeObservable(this)
    this.pagedResult = {
      items: [],
      totalCount: 0
    }
  }

  @action
  async getAmenities(params) {
    this.isLoading = true
    const res = await amenityService.getAll(params).finally(() => (this.isLoading = false))
    this.amenities = res.items.map((item) => ({
      ...item,
      name: item.amenityName
    }))
  }
  @action
  async create(body) {
    this.isLoading = true
    this.editAmenityGroup = await amenityGroupService.create(body).finally(() => (this.isLoading = false))
  }

  @action
  async update(body) {
    this.isLoading = true
    await amenityGroupService.update(body).finally(() => (this.isLoading = false))
  }

  @action
  async activateOrDeactivate(id, isActive) {
    await amenityGroupService.activateOrDeactivate(id, isActive)
  }

  @action
  async delete(id) {
    await amenityGroupService.delete(id)
    this.pagedResult.items = this.pagedResult.items.filter((x) => x.id !== id)
  }

  @action
  async get(id) {
    const result = await amenityGroupService.get(id)
    this.editAmenityGroup = result
  }

  @action
  async createAmenityGroupModel() {
    this.editAmenityGroup = new AmenityGroupDetailModel()
  }

  @action
  async getAll(params) {
    this.isLoading = true
    const result = await amenityGroupService.getAll(params).finally(() => (this.isLoading = false))
    this.pagedResult = result
  }

  @action
  async getLists(params) {
    this.amenityGroups = await amenityGroupService.getList(params)
  }
}

export default AmenityGroupStore
