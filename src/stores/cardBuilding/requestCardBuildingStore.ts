import { action, observable, makeObservable } from 'mobx'
import requestCardbuidingService from '@services/cardbuilding/requestCardService'
import type { PagedResultDto } from '@services/dto/pagedResultDto'
import AppConsts, { moduleFile } from '@lib/appconst'
import fileService from '@services/common/fileService'

const { cardRequestTypeEnum } = AppConsts

class RequestCardbuidingStore {
  @observable isLoading!: boolean
  @observable requestCardBuildings!: PagedResultDto<any>
  @observable editRequestCardBuilding!: any

  constructor() {
    this.requestCardBuildings = { totalCount: 0, items: [] }
    this.editRequestCardBuilding = {}
    makeObservable(this)
  }

  @action
  async init() {
    this.editRequestCardBuilding = { isActive: 0, id: null, type: cardRequestTypeEnum.IsUpdate }
  }

  @action
  async create(body: any, files) {
    this.isLoading = true
    this.editRequestCardBuilding = await requestCardbuidingService.create(body).finally(() => {
      this.isLoading = !!(files && files.length)
    })
    const { uniqueId } = this.editRequestCardBuilding
    if (files && files.length && uniqueId) {
      await fileService.upload(moduleFile.requestCard, uniqueId, files).finally(() => (this.isLoading = false))
    }
  }

  @action
  async updateByResident(body: any, files) {
    this.isLoading = true
    await requestCardbuidingService.updateByResident(body).finally(() => {
      const { uniqueId } = this.editRequestCardBuilding
      this.isLoading = !!(files && files.length && uniqueId)
      if (files && files.length && uniqueId) {
        fileService.upload(moduleFile.requestCard, uniqueId, files).finally(() => {
          this.isLoading = false
        })
      }
    })
  }

  @action
  async update(updateUnitInput: any, files) {
    this.isLoading = true
    await requestCardbuidingService.update(updateUnitInput).finally(() => {
      const { uniqueId } = this.editRequestCardBuilding
      this.isLoading = !!(files && files.length && uniqueId)
      if (files && files.length && uniqueId) {
        fileService.upload(moduleFile.requestCard, uniqueId, files).finally(() => (this.isLoading = false))
      }
    })
  }

  @action
  async getAll(params: any) {
    const result = await requestCardbuidingService.getAll(params)
    this.requestCardBuildings = result
  }

  @action
  async getAllByCompany(params: any) {
    const result = await requestCardbuidingService.getAllByCompany(params)
    this.requestCardBuildings = result
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await requestCardbuidingService.activateOrDeactivate(id, isActive)
  }

  @action
  async get(id: number) {
    const result = await requestCardbuidingService.get(id)
    this.editRequestCardBuilding = result
  }

  @action
  async getByCompany(id: number) {
    const result = await requestCardbuidingService.getByCompany(id)
    this.editRequestCardBuilding = result
  }
}

export default RequestCardbuidingStore
