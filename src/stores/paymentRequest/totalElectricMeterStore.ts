import { action, observable, makeObservable } from 'mobx'
import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import totalElectricMeterService from '../../services/paymentRequest/totalElectricMeterService'

class TotalElectricMeterStore {
  @observable isLoading!: boolean
  @observable dataTable!: PagedResultDto<any>
  @observable dataDetail!: any

  constructor() {
    makeObservable(this)
  }
  @action
  async createOrUpdate(body: any, file?: any) {
    await totalElectricMeterService.createOrUpdate(body, file)
  }

  @action
  async delete(id: number) {
    await totalElectricMeterService.delete(id)
  }

  @action
  async get(id: number) {
    const result = await totalElectricMeterService.get(id)
    this.dataDetail = result
  }

  @action
  async initRecord() {
    this.dataDetail = {
      id: undefined,
      lowUnitPrice: 1609,
      peakUnitPrice: 5025,
      normalUnitPrice: 2887
    }
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await totalElectricMeterService.getAll(params).finally(() => (this.isLoading = false))
    this.dataTable = result
  }
}

export default TotalElectricMeterStore
