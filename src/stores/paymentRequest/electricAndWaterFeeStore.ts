import { action, observable, makeObservable } from 'mobx'
import electricAndWaterFeeService from '../../services/paymentRequest/electricAndWaterFeeService'
import { RequestHistoryModel } from '@models/ticketRequest/TicketRequestModel'

class ElectricAndWaterFeeStore {
  @observable isLoading!: boolean
  @observable dataTable!: any[]
  @observable dataDetail!: any
  @observable listRequestHistory!: RequestHistoryModel[]

  constructor() {
    makeObservable(this)
  }
  @action
  async createOrUpdate(body: any, file?: any) {
    if (body.id) {
      await electricAndWaterFeeService.update(body, file)
    } else {
      await electricAndWaterFeeService.create(body, file)
    }
  }

  @action
  async delete(id: number) {
    await electricAndWaterFeeService.delete(id)
  }

  @action
  async get(id: number) {
    const result = await electricAndWaterFeeService.get(id)
    this.dataDetail = result
  }

  @action
  async initRecord() {
    this.dataDetail = {
      id: undefined
    }
  }

  @action
  async getList(params: any) {
    this.isLoading = true
    const result = await electricAndWaterFeeService.getList(params).finally(() => (this.isLoading = false))
    console.log(result)
    this.dataTable = result
  }
  @action
  async getDetailWaterByFeePackageId(id: number) {
    const result = await electricAndWaterFeeService.getDetailWaterByFeePackageId(id)
    return result
  }
  @action
  async calculateElectricityFee(id: number) {
    const result = await electricAndWaterFeeService.calculateElectricityFee(id)
    return result
  }
  @action
  async getListRequestHistory(params: any) {
    this.isLoading = true
    const result = await electricAndWaterFeeService
      .getListRequestHistory(params)
      .finally(() => (this.isLoading = false))
    this.listRequestHistory = result
  }
  @action
  async sendApproval(body: any) {
    this.isLoading = true
    await electricAndWaterFeeService.sendApproval(body).finally(async () => {
      this.isLoading = false
    })
  }
}

export default ElectricAndWaterFeeStore
