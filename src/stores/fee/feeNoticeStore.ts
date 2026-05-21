import { action, observable, makeObservable } from 'mobx'
import feeNoticeService from '@services/fee/feeNoticeService'
import type { PagedResultDto } from '@services/dto/pagedResultDtoFeeNotice'

class FeeNoticeStore {
  @observable isLoading!: boolean
  @observable pagedResult!: PagedResultDto<any>
  @observable pagedResultStatistic!: PagedResultDto<any>
  @observable statusConfirm!: any

  constructor() {
    makeObservable(this)
    this.pagedResult = {
      items: [],
      totalCount: 0,
      totalUnit: 0,
      totalUnitUser: 0
    }
    this.pagedResultStatistic = {
      items: [],
      totalCount: 0,
      totalUnit: 0,
      totalUnitUser: 0
    }
  }

  async setStatusConfirm(status) {
    this.statusConfirm = status
  }

  async create(body: any) {
    this.isLoading = true
    return feeNoticeService.create(body).finally(() => (this.isLoading = false))
  }
  @action
  async getAll(params: any) {
    this.isLoading = true
    this.pagedResult = await feeNoticeService.getAll(params).finally(() => (this.isLoading = false))
  }

  @action
  async getHistory(params: any) {
    this.isLoading = true
    this.pagedResult = await feeNoticeService.getHistory(params).finally(() => (this.isLoading = false))
  }
  @action
  async getTemplatesll(params: any) {
    this.isLoading = true
    this.pagedResult = await feeNoticeService.getTemplatesll(params).finally(() => (this.isLoading = false))
  }
  @action
  async deative(body) {
    return await feeNoticeService.deactive(body)
  }
  @action
  async cofirm(body) {
    return await feeNoticeService.cofirm(body)
  }
  @action
  async refreshFeeNotice(id) {
    return await feeNoticeService.refreshFeeNotice(id)
  }

  async sendSpecificNotice(body) {
    this.isLoading = true
    await feeNoticeService.sendSpecificNotice(body).finally(() => (this.isLoading = false))
  }

  @action
  async exportFeeNotices(params: any) {
    this.isLoading = true
    return await feeNoticeService.exportFeeNotices(params).finally(() => (this.isLoading = false))
  }

  @action
  async feeNoticeAsZip(params: any) {
    this.isLoading = true
    return await feeNoticeService.feeNoticeAsZip(params).finally(() => (this.isLoading = false))
  }

  @action
  async getAllOverview(params: any) {
    this.isLoading = true
    this.pagedResultStatistic = await feeNoticeService.getAllOverview(params).finally(() => (this.isLoading = false))
  }
}

export default FeeNoticeStore
