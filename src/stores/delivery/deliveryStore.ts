import type { PagedResultDto } from '@services/dto/pagedResultDto'
import { action, makeObservable, observable } from 'mobx'
import deliveryService from '@services/delivery/deliveryService'
import { DeliveryDetailModel } from '@models/delivery'
import fileService from '@services/common/fileService'
import { moduleFile } from '@lib/appconst'
class DeliveryStore {
  @observable pagedResult!: PagedResultDto<any>
  @observable isLoading!: boolean
  @observable editDelivery!: any
  @observable listStatus: any = []
  @observable listTypes: any = []

  constructor() {
    this.pagedResult = {
      items: [],
      totalCount: 0
    }
    this.editDelivery = { deliveryReceive: {} }
    makeObservable(this)
  }
  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await deliveryService.getAll(params).finally(() => (this.isLoading = false))
    this.pagedResult = result
  }
  @action
  async create(body, files?) {
    this.isLoading = true
    this.editDelivery = await deliveryService.create(body, files).finally(() => (this.isLoading = false))
    const { uniqueId } = this.editDelivery
    if (files && files.length && uniqueId) {
      await fileService.upload(moduleFile.delivery, uniqueId, files).finally(() => {
        this.isLoading = false
      })
    }
  }
  @action
  async createDelivery() {
    this.editDelivery = new DeliveryDetailModel()
  }
  @action
  async update(body: any, files, filesAfter) {
    this.isLoading = true
    await deliveryService.update(body).finally(async () => {
      const { uniqueId } = this.editDelivery

      this.isLoading = !!(files && files.length && uniqueId)
      if (files && files.length && uniqueId) {
        await fileService.upload(moduleFile.delivery, uniqueId, files).finally(() => {
          this.isLoading = false
        })
      }
      if (filesAfter && filesAfter.length && uniqueId) {
        await fileService.upload(moduleFile.deliverySignature, uniqueId, filesAfter).finally(() => {
          this.isLoading = false
        })
      }
    })
  }
  @action
  async get(id: number) {
    const result = await deliveryService.get(id)
    this.editDelivery = result
  }
  @action
  async activateOrDeactivate(id, isActive) {
    await deliveryService.activateOrDeactivate(id, isActive)
  }
  @action
  async getListStatus(params: any) {
    const result = await deliveryService.getListStatus(params)
    this.listStatus = result || {}
  }
  @action
  async getListTypes(params: any) {
    const result = await deliveryService.getListTypes(params)
    this.listTypes = result || {}
  }
}

export default DeliveryStore
