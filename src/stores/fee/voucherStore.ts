import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '@services/dto/pagedResultDto'
import voucherService from '@services/fee/voucherService'

class VoucherStore {
  @observable isLoading!: boolean
  @observable pagedResult!: PagedResultDto<any>
  @observable voucherDetail: any = {}
  @observable voucherOverview: any[] = []
  @observable listChannel!: any[]
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
  @action async getOverview(params) {
    this.isLoading = true
    this.voucherOverview = await voucherService.getOverview(params).finally(() => (this.isLoading = false))
  }

  async create(body: any) {
    this.isLoading = true
    return voucherService.create(body).finally(() => (this.isLoading = false))
  }
  async update(body: any) {
    this.isLoading = true
    return voucherService.update(body).finally(() => (this.isLoading = false))
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    this.pagedResult = await voucherService.getAll(params).finally(() => (this.isLoading = false))
  }

  @action
  async delete(params) {
    await voucherService.delete(params)
    this.pagedResult.items = this.pagedResult.items.filter((item) => item.id !== params.id)
  }

  @action
  async downloadVoucher(params) {
    await voucherService.downloadVouchers(params)
  }
  @action
  async getChannels() {
    this.isLoading = true
    this.listChannel = await voucherService.getChannels().finally(() => (this.isLoading = false))
  }
  @action
  async exportExpenseMandates(params) {
    await voucherService.exportExpenseMandates(params)
  }
}

export default VoucherStore
