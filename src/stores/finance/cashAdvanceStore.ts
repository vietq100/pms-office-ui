import type { PagedResultDto } from '@services/dto/pagedResultDto'
import * as cashAdvanceModel from '@models/finance/cashAdvanceModel'
import { action, makeObservable, observable } from 'mobx'
import cashAdvanceService from '@services/finance/cashAdvanceService'
import { OptionModel } from '@models/global'
import { TransactionModel } from '@models/finance/transactionModel'

class CashAdvanceStore {
  @observable pagedData!: PagedResultDto<cashAdvanceModel.ICashAdvance>
  @observable pagedTransactionData!: PagedResultDto<TransactionModel>
  @observable isLoading!: boolean
  @observable isLoadingExport!: boolean
  @observable cashAdvances!: cashAdvanceModel.ICashAdvance[]
  @observable paymentChannels!: OptionModel[]
  @observable transactionTypes!: OptionModel[]
  @observable editCashAdvance!: cashAdvanceModel.ICashAdvance
  @observable cashAdvanceDetail: cashAdvanceModel.ICashAdvance | null = null
  @observable editDeposit!: cashAdvanceModel.IDepositModel
  @observable filters!: any
  @observable pageDeduct!: PagedResultDto<any>
  @observable cashReceiptInfo!: any

  @observable cashAdvanceWallets: any[] = []
  constructor() {
    this.pagedData = {
      items: [],
      totalCount: 0
    }
    this.pagedTransactionData = {
      items: [],
      totalCount: 0
    }
    this.pageDeduct = {
      items: [],
      totalCount: 0
    }
    this.filters = {}
    makeObservable(this)
  }

  @action
  public setFilter(key, value) {
    this.filters = { ...this.filters, [key as any]: value }
  }

  @action
  async update(body) {
    await cashAdvanceService.update(body)
  }

  @action
  async getPaymentChannels() {
    this.isLoading = true
    this.paymentChannels = await cashAdvanceService.getPaymentChannels().finally(() => {
      this.isLoading = false
    })
  }
  @action
  async getTransactionTypes() {
    this.isLoading = true
    this.transactionTypes = await cashAdvanceService.getTransactionTypes().finally(() => {
      this.isLoading = false
    })
  }

  @action
  async activateOrDeactivate(id, isActive) {
    await cashAdvanceService.activateOrDeactivate(id, isActive)
  }

  @action
  async delete(id) {
    await cashAdvanceService.delete(id)
    this.pagedData.items = this.pagedData.items.filter((x) => x.id !== id)
  }

  @action
  async get(id) {
    const result = await cashAdvanceService.get(id)
    this.editCashAdvance = result
  }

  @action
  async filter(params) {
    this.isLoading = true
    const result = await cashAdvanceService.filter(params).finally(() => (this.isLoading = false))
    this.pagedData = result
  }

  @action
  async filterCashAdvanceTransactions(params) {
    this.isLoading = true
    const result = await cashAdvanceService
      .filterCashAdvanceTransactions(params)
      .finally(() => (this.isLoading = false))
    this.pagedTransactionData = result
  }

  @action
  async getAll(params) {
    this.isLoading = true
    params.isActive = true
    this.cashAdvances = await cashAdvanceService
      .getAll({ ...this.filters, ...params })
      .finally(() => (this.isLoading = false))
  }
  @action
  async getAutoDeductCashAdvance(params) {
    this.isLoading = true
    this.pageDeduct = await cashAdvanceService
      .getAutoDeductCashAdvance({ ...this.filters, ...params })
      .finally(() => (this.isLoading = false))
  }

  /// Deposit
  @action
  async createDepositModel(initDeposit) {
    this.editDeposit = new cashAdvanceModel.DepositModel(initDeposit)
  }

  @action
  async createDeposit(body) {
    const parseBody = {
      ...body,
      cashAdvanceDate: body.cashAdvanceDate.toISOString()
    }
    await cashAdvanceService.createDeposit(parseBody)
  }
  // With draw
  @action
  async withDraw(body) {
    const parseBody = {
      ...body,
      cashReceiptDate: body.cashReceiptDate.toISOString()
    }
    await cashAdvanceService.withDraw(parseBody)
  }

  @action
  async getCashAdvanceWallets(params: any) {
    this.cashAdvanceWallets = await cashAdvanceService.getCashAdvanceWallets(params)
  }

  @action
  async downloadCashAdvances(params) {
    this.isLoadingExport = true
    await cashAdvanceService.exportCashAdvance(params)
    this.isLoadingExport = false
  }
  async getTemplateImport() {
    await cashAdvanceService.getTemplateImport()
  }

  @action
  async downloadCashAdvanceDetailTransaction(params) {
    this.isLoadingExport = true
    await cashAdvanceService.exportCashAdvanceDetailTransactions(params)
    this.isLoadingExport = false
  }

  @action
  async autoDeductCashAdvance(params) {
    await cashAdvanceService.autoDeductCashAdvance(params)
  }
  @action
  async importFromExcel(file, cashChanelId, cashChannelExternalId) {
    return cashAdvanceService.importFromExcel(file, cashChanelId, cashChannelExternalId)
  }

  @action
  async getCashReceipt(id) {
    const result = await cashAdvanceService.getCashReceipt(id)
    this.cashReceiptInfo = result
  }
}

export default CashAdvanceStore
