import { action, observable, makeObservable } from 'mobx'
import managementFeeService from '../../services/paymentRequest/managementFeeService'
import { RequestHistoryModel } from '@models/ticketRequest/TicketRequestModel'
import AppConsts from '@lib/appconst'

const { ticketRequestStatusEnum } = AppConsts

class ManagementFeeStore {
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
      await managementFeeService.update(body, file)
    } else {
      await managementFeeService.create(body, file)
    }
  }

  @action
  async delete(id: number) {
    await managementFeeService.delete(id)
  }

  @action
  async get(id: number) {
    const result = await managementFeeService.get(id)
    this.dataDetail = result
  }

  @action
  async initRecord() {
    this.dataDetail = {
      id: undefined,
      statusId: ticketRequestStatusEnum.Draft
    }
  }

  @action
  async getList(params: any) {
    this.isLoading = true
    const result = await managementFeeService.getList(params).finally(() => (this.isLoading = false))
    this.dataTable = result
  }
  @action
  async getListRequestHistory(params: any) {
    this.isLoading = true
    const result = await managementFeeService.getListRequestHistory(params).finally(() => (this.isLoading = false))
    this.listRequestHistory = result
  }
  @action
  async sendApproval(body: any) {
    this.isLoading = true
    await managementFeeService.sendApproval(body).finally(async () => {
      this.isLoading = false
    })
  }
}

export default ManagementFeeStore
