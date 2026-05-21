import { action, observable, makeObservable } from 'mobx'
import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import totalWaterMeterService from '../../services/paymentRequest/totalWaterMeterService'

class TotalWaterMeterStore {
  @observable isLoading!: boolean
  @observable dataTable!: PagedResultDto<any>
  @observable dataDetail!: any

  constructor() {
    makeObservable(this)
    this.dataTable = {
      items: [],
      totalCount: 0
    }
  }
  @action
  async createOrUpdate(body: any, file?: any) {
    await totalWaterMeterService.createOrUpdate(body, file)
  }

  @action
  async delete(id: number) {
    await totalWaterMeterService.delete(id)
  }

  @action
  async get(id: number) {
    const result = await totalWaterMeterService.get(id)
    this.dataDetail = result
  }

  @action
  async initRecord() {
    this.dataDetail = {
      id: 0
    }
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await totalWaterMeterService.getAll(params).finally(() => (this.isLoading = false))
    this.dataTable = result
  }
}

export default TotalWaterMeterStore
