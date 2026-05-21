import { L } from '@lib/abpUtility'
import { notifySuccess } from '@lib/helper'
import { enquiryType } from '@scenes/saleAndLease/sale'
import type { PagedResultDto } from '@services/dto/pagedResultDto'
import saleAndLeaseService from '@services/saleAndLease/saleAndLeaseService'
import { action, makeObservable, observable } from 'mobx'

class SaleAndLeaseStore {
  @observable isLoading = false
  @observable statusList: any[] = []
  @observable currentStatusList: any[] = []
  @observable saleList: PagedResultDto<any> = { totalCount: 0, items: [] }
  @observable leaseList: PagedResultDto<any> = { totalCount: 0, items: [] }
  @observable saleDetail: any
  @observable leaseDetail: any
  @observable notificationSetting: any[] = []
  @observable saleOverview: any[] = []
  @observable LeaseOverview: any[] = []
  constructor() {
    makeObservable(this)
  }

  @action public getNotificationSetting = async (params) => {
    this.isLoading = true
    this.notificationSetting = await saleAndLeaseService
      .getNotificationSetting(params)
      .finally(() => (this.isLoading = false))
  }
  @action public updateNotificationSetting = async (body) => {
    this.isLoading = true
    await saleAndLeaseService.updateNotificationSetting(body).finally(() => (this.isLoading = false))
  }

  @action
  public getAllSale = async (params) => {
    this.isLoading = true
    const res = await saleAndLeaseService
      .getAll({ ...params, enquiryTypeId: enquiryType.sale })
      .finally(() => (this.isLoading = false))
    this.saleList = res
  }
  @action
  public async getAllLease(params) {
    this.isLoading = true
    const res = await saleAndLeaseService
      .getAll({
        ...params,
        enquiryTypeId: enquiryType.lease
      })
      .finally(() => (this.isLoading = false))
    this.leaseList = res
  }

  @action
  public getListStatus = async () => {
    const res = await saleAndLeaseService.getListStatus()
    this.statusList = res
  }
  @action
  public getCurrentListStatus = async (id) => {
    const res = id ? await saleAndLeaseService.getCurrentListStatus(id) : await saleAndLeaseService.getListStatus()
    this.currentStatusList = res
  }

  @action
  public getDetail = async (id) => {
    this.isLoading = true
    const res = await saleAndLeaseService.getDetail(id).finally(() => (this.isLoading = false))
    if (res.enquiryTypeId === enquiryType.lease) {
      this.leaseDetail = res
    } else {
      this.saleDetail = res
    }
  }
  @action public createSale = async (body, imageList) => {
    this.isLoading = true
    const res = await saleAndLeaseService
      .create({ ...body, enquiryTypeId: enquiryType.sale })
      .finally(() => (this.isLoading = false))
    await saleAndLeaseService.uploadPhoto(imageList, res.uniqueId)
    return notifySuccess(L('SUCCESSFULLY'), L('CREATE_SUCCESSFULLY'))
  }
  @action public updateSale = async (body, imageList) => {
    this.isLoading = true
    const res = await saleAndLeaseService
      .update({ ...this.saleDetail, ...body, enquiryTypeId: enquiryType.sale })
      .finally(() => (this.isLoading = false))
    await saleAndLeaseService.uploadPhoto(imageList, res.uniqueId)
    return notifySuccess(L('SUCCESSFULLY'), L('UPDATE_SUCCESSFULLY'))
  }
  @action public createLease = async (body, imageList) => {
    this.isLoading = true
    const res = await saleAndLeaseService
      .create({ ...body, enquiryTypeId: enquiryType.lease })
      .finally(() => (this.isLoading = false))
    await saleAndLeaseService.uploadPhoto(imageList, res.uniqueId)
    return notifySuccess(L('SUCCESSFULLY'), L('CREATE_SUCCESSFULLY'))
  }
  @action public updateLease = async (body, imageList) => {
    this.isLoading = true
    const res = await saleAndLeaseService
      .update({
        ...this.leaseDetail,
        ...body,
        enquiryTypeId: enquiryType.lease
      })
      .finally(() => (this.isLoading = false))
    await saleAndLeaseService.uploadPhoto(imageList, res.uniqueId)
    return notifySuccess(L('SUCCESSFULLY'), L('UPDATE_SUCCESSFULLY'))
  }

  @action async getSaleOverview(params) {
    this.isLoading = true
    this.saleOverview = await saleAndLeaseService.getOverview(params).finally(() => (this.isLoading = false))
  }
  @action async getLeaseOverview(params) {
    this.isLoading = true
    this.LeaseOverview = await saleAndLeaseService.getOverview(params).finally(() => (this.isLoading = false))
  }
}

export default SaleAndLeaseStore
