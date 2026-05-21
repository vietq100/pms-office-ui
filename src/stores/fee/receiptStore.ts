import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '@services/dto/pagedResultDto'
import receiptService from '@services/fee/receiptService'

class ReceiptStore {
  @observable isLoading!: boolean
  @observable pagedResult!: PagedResultDto<any>
  @observable receiptDetail: any = undefined
  @observable receiptOverview: any[] = []
  @observable cashAdvanceWallets: any[] = []
  @observable filters!: any
  @observable filterDate!: any
  constructor() {
    makeObservable(this)
    this.pagedResult = {
      items: [],
      totalCount: 0
    }
  }
  @action setFilter(filters) {
    this.filters = filters
  }
  @action setFilterDate(arrDate) {
    this.filterDate = arrDate
  }

  async create(body: any) {
    this.isLoading = true
    return receiptService.create(body).finally(() => (this.isLoading = false))
  }

  @action async getOverview(params) {
    this.isLoading = true
    this.receiptOverview = await receiptService.getOverview(params).finally(() => (this.isLoading = false))
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    this.pagedResult = await receiptService.getAll(params).finally(() => (this.isLoading = false))
  }

  @action
  async getDetail(id) {
    this.isLoading = true
    this.receiptDetail = await receiptService.getDetail(id).finally(() => (this.isLoading = false))
  }

  @action
  async getCashAdvanceWallets(params: any) {
    this.cashAdvanceWallets = await receiptService.getCashAdvanceWallets(params)
  }

  @action
  async delete(params) {
    this.isLoading = true
    await receiptService.delete(params).finally(() => (this.isLoading = false))
    this.pagedResult.items = this.pagedResult.items.filter((item) => item.id !== params.id)
  }

  @action
  async downloadReceipt(params) {
    await receiptService.downloadReceipts(params)
  }
}

export default ReceiptStore
