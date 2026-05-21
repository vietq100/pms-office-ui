import * as fee from '@models/fee'
import type { PagedResultDto } from '@services/dto/pagedResultDto'
import feeService from '@services/fee/feeService'
import { action, observable, makeObservable } from 'mobx'

class FeeStore {
  @observable isLoading!: boolean
  @observable fee!: PagedResultDto<fee.IFee>
  @observable currentPage!: number
  @observable filterFee: fee.IFeeFilter
  @observable paymentChannels!: any[]
  @observable feeRefundModel!: fee.IFeeRefundModel
  selectedPackage!: fee.IPackageFee
  @observable voucherDetailFull: any = {}
  @observable voucherDetail: any = {}

  @observable paymentMethodList!: PagedResultDto<fee.IPaymentMethod>
  @observable paymentMethodDetail!: fee.IPaymentMethod

  constructor() {
    makeObservable(this)
    this.filterFee = {
      isActive: true,
      skipCount: 0,
      maxResultCount: 10
    }
    this.currentPage = 1
    this.selectedPackage = {} as fee.IPackageFee
  }

  @action async getPaymentMethodList(params) {
    this.isLoading = true
    const res = await feeService.getPaymentMethodList(params).finally(() => (this.isLoading = false))
    this.paymentMethodList = res
  }

  @action async submitPaymentMethodDetail(body) {
    this.isLoading = true
    await feeService
      .submitPaymentMethodDetail({ ...this.paymentMethodDetail, ...body })
      .finally(() => (this.isLoading = false))
  }

  @action
  async update(updatedFee: fee.IFeeUpdate) {
    await feeService.update(updatedFee)
  }

  @action
  async activate(id: number, isActive: boolean) {
    await feeService.activate(id, isActive)
  }

  @action
  async getAll(params) {
    this.isLoading = true
    this.fee = await feeService.getAll({ ...this.filterFee, ...params }).finally(() => (this.isLoading = false))
  }

  async getDetailVoucher(params) {
    const result = await feeService.getDetailVoucher(params)
    this.voucherDetailFull = result
  }

  async downloadTemplate() {
    return feeService.downloadTemplate()
  }

  async importFee(file, packageId, description) {
    return feeService.importFee(file, packageId, description)
  }

  async exportFees(params) {
    this.isLoading = true
    return await feeService.exportFees({ ...this.filterFee, ...params }).finally(() => (this.isLoading = false))
  }

  @action
  async showHideToResident(data: fee.IFee) {
    const dataToPost = {
      id: data.id,
      isShowToResident: !data.isShowToResident
    }
    await feeService.showHideToResident(dataToPost)
  }

  @action
  public setFilter(key, value) {
    this.filterFee = {
      ...this.filterFee,
      [key as any]: value
    }

    if (key !== 'skipCount') {
      this.currentPage = 1
      this.filterFee.skipCount = 0
    }
  }

  @action
  resetFilter() {
    this.filterFee = {
      isActive: true,
      skipCount: 0,
      maxResultCount: 10
    }
  }

  @action
  setCurrentPage(page) {
    this.currentPage = page
  }

  @action
  async getPaymentChannels() {
    this.paymentChannels = await feeService.getPaymentChannels({})
  }

  @action
  async updateStatus(isActive, feeIds) {
    isActive ? await feeService.markActiveFees({ feeIds }) : await feeService.markInactiveFees({ feeIds })
  }

  setSelectedPackageFee(pf) {
    this.selectedPackage = pf
  }

  // Refund fee
  @action
  async refundDepositFee(data: fee.IFeeRefundModel) {
    const res = await feeService.refundReservationDeposit(data)
    this.feeRefundModel = new fee.FeeRefundModel()
    this.voucherDetail = res
  }

  @action
  async refundReceipt(data: fee.IFeeRefundModel) {
    const res = await feeService.refundReceipt(data)
    this.feeRefundModel = new fee.FeeRefundModel()
    this.voucherDetail = res
  }

  @action
  setRefundDepositModel(feeDetail) {
    this.feeRefundModel = new fee.FeeRefundModel(feeDetail.id, '', feeDetail.totalAmount, feeDetail.unitId)
  }

  @action
  async changeStatusFee(body) {
    await feeService.changeStatusFee(body)
  }
}

export default FeeStore
