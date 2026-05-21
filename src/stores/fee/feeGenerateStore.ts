import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '@services/dto/pagedResultDto'
import feeGenerateService from '@services/fee/feeGenerateService'

class FeeGenerateStore {
  @observable isLoading!: boolean
  @observable pagedResult!: PagedResultDto<any>
  @observable pagedBatchResult!: PagedResultDto<any>
  @observable pagedBatchResultPdf!: any
  @observable feeGenOverview: any
  constructor() {
    makeObservable(this)
    this.pagedResult = {
      items: [],
      totalCount: 0
    }
    this.pagedBatchResult = {
      items: [],
      totalCount: 0
    }
  }

  async create(body: any) {
    this.isLoading = true
    return feeGenerateService.create(body).finally(() => (this.isLoading = false))
  }
  @action
  async getAll(params: any) {
    this.isLoading = true
    this.pagedResult = await feeGenerateService.getAll(params).finally(() => (this.isLoading = false))
  }
  @action
  async deative(body) {
    return await feeGenerateService.deactive(body)
  }
  @action
  async cofirm(body) {
    return await feeGenerateService.cofirm(body)
  }

  @action
  async GetAllDetail(params: any) {
    this.isLoading = true
    this.pagedBatchResult = await feeGenerateService.GetAllDetail(params).finally(() => (this.isLoading = false))
  }

  @action
  async GetListDetail(params: any) {
    this.isLoading = true
    this.pagedBatchResultPdf = await feeGenerateService.GetListDetail(params).finally(() => (this.isLoading = false))
  }
  @action
  async exportFeeGenerate(params: any) {
    this.isLoading = true
    return await feeGenerateService.exportFeeGenerate(params).finally(() => (this.isLoading = false))
  }

  @action async getOverviewDetail(params) {
    this.isLoading = true
    this.feeGenOverview = await feeGenerateService.getOverviewDetail(params).finally(() => (this.isLoading = false))
  }
}

export default FeeGenerateStore
