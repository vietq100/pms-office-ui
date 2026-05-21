import { action, observable, makeObservable } from 'mobx'
import electricFormService from '@services/meterReading/electricFormService'
import * as pagedResultDto from '@services/dto/pagedResultDto'
import { MeterReadingElectricModel } from '@models/meterReading/MeterReadElectricModel'
import fileService from '@services/common/fileService'
import { moduleFile } from '@lib/appconst'
import { ConfirmMeterReaingModal } from '@models/meterReading/ConfirmMeterReaingModal'
import { RequestHistoryModel } from '@models/ticketRequest/TicketRequestModel'

class ElectricFormStore {
  @observable isLoading!: boolean
  @observable meters!: pagedResultDto.PagedResultDto<any>
  @observable meterDetail!: MeterReadingElectricModel
  @observable confirmMerters!: pagedResultDto.PagedResultDto<any>
  @observable confirmMeterDetail!: ConfirmMeterReaingModal
  @observable listRequestHistory!: RequestHistoryModel[]

  @observable listIdCompanyError!: number[]

  constructor() {
    makeObservable(this)
    this.meters = { items: [], totalCount: 0 }
    this.confirmMerters = { items: [], totalCount: 0 }
    this.listIdCompanyError = []
  }

  @action
  async initCreate() {
    this.meterDetail = {
      id: 0,
      electricDetails: []
    }
  }

  @action
  async create(body: any, files) {
    this.isLoading = true

    this.meterDetail = await electricFormService.create(body).finally(async () => {
      this.isLoading = !!(files && files.length)
    })
    const { uniqueId } = this.meterDetail
    if (files && files.length && uniqueId) {
      await fileService.upload(moduleFile.electricFormReading, uniqueId, files).finally(() => {
        this.isLoading = false
      })
    }
  }

  @action
  async update(body: any, files) {
    this.isLoading = true

    await electricFormService.update(body).finally(async () => {
      const { uniqueId } = this.meterDetail
      this.isLoading = !!(files && files.length && uniqueId)
      if (files && files.length && uniqueId) {
        await fileService.upload(moduleFile.electricFormReading, uniqueId, files).finally(() => {
          this.isLoading = false
        })
      }
    })
  }

  @action
  async getFormDraft(params: any) {
    this.isLoading = true
    const result = await electricFormService.getFormDraft(params).finally(() => (this.isLoading = false))
    this.meterDetail = result
  }

  @action
  async getAllFormDraft(params: any) {
    this.isLoading = true
    const result = await electricFormService.getAllFormDraft(params).finally(() => (this.isLoading = false))
    this.meters = result
  }

  @action
  async exportMeterOverview(param: any) {
    this.isLoading = true
    return electricFormService.exportElectricFormData(param).finally(() => (this.isLoading = false))
  }
  @action
  async downloadTemplate() {
    return electricFormService.downloadTemplate()
  }

  @action
  async deleteForm(body: any) {
    this.isLoading = true
    await electricFormService.delete(body).finally(async () => {
      this.isLoading = false
    })
  }

  //CONFIRM ELETRIC FORM
  @action
  async getAllElectricForm(params: any) {
    this.isLoading = true
    const result = await electricFormService.getAllElectricFrom(params).finally(() => (this.isLoading = false))
    this.confirmMerters = result
  }

  @action
  async getAllElectricForm4Tennt(params: any) {
    this.isLoading = true
    const result = await electricFormService.getAllElectricForm4Tennt(params).finally(() => (this.isLoading = false))
    this.confirmMerters = result
  }

  @action
  async createRequestElectric(body: any) {
    this.isLoading = true

    this.meterDetail = await electricFormService.createRequestElectric(body).finally(async () => {
      this.isLoading = false
    })
  }

  async checkRequestIsValid(body: any) {
    const numberCheck = await electricFormService.checkRequestIsValid(body).finally(async () => {
      this.isLoading = false
    })
    this.listIdCompanyError = numberCheck
  }

  @action
  async getConfirmElectricForm(params: any) {
    this.isLoading = true
    const result = await electricFormService.getConfirmElectricForm(params).finally(() => (this.isLoading = false))
    this.confirmMeterDetail = result
  }

  @action
  async getConfirmElectricForm4Tenant(params: any) {
    this.isLoading = true
    const result = await electricFormService
      .getConfirmElectricForm4Tenant(params)
      .finally(() => (this.isLoading = false))
    this.confirmMeterDetail = result
  }

  @action
  async getListRequestHistory(params: any) {
    this.isLoading = true
    const result = await electricFormService.getListRequestHistory(params).finally(() => (this.isLoading = false))
    this.listRequestHistory = result
  }

  @action
  async sendApproval(body: any) {
    this.isLoading = true
    await electricFormService.sendApproval(body).finally(async () => {
      this.isLoading = false
    })
  }
  @action
  async updateElectricForm(body: any) {
    this.isLoading = true
    await electricFormService.updateElectricForm(body).finally(async () => (this.isLoading = false))
  }
}

export default ElectricFormStore
