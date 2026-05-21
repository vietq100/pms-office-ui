import { action, observable, makeObservable } from 'mobx'
import * as pagedResultDto from '@services/dto/pagedResultDto'
import { RequestHistoryModel } from '@models/ticketRequest/TicketRequestModel'
import vehicleRegistrationFormService from '@services/parking/confirmVehicle'
import { ConfirmVehicleFormModel } from '@models/parking/ConfirmVehicleFormModel'

class VehicleRegistrationFormStore {
  @observable isLoading!: boolean
  @observable listConfirm!: pagedResultDto.PagedResultDto<any>
  @observable VehicleRegistrationFormDetail!: ConfirmVehicleFormModel
  @observable confirmMerters!: pagedResultDto.PagedResultDto<any>
  @observable confirmDetail!: any
  @observable listRequestHistory!: RequestHistoryModel[]
  @observable listIdCompanyError!: number[]
  @observable listVehicleDetail!: pagedResultDto.PagedResultDto<any>

  constructor() {
    makeObservable(this)
    this.listConfirm = { items: [], totalCount: 0 }
    this.confirmMerters = { items: [], totalCount: 0 }
    this.listIdCompanyError = []
    this.listVehicleDetail = { items: [], totalCount: 0 }
  }

  @action
  async initCreate() {
    this.VehicleRegistrationFormDetail = {
      id: 0,
      vehicleRegistrationFee: []
    }
  }

  @action
  async create(body: any) {
    this.isLoading = true

    this.VehicleRegistrationFormDetail = await vehicleRegistrationFormService.create(body).finally(async () => {
      this.isLoading = false
    })
  }

  @action
  async createRequest(body: any) {
    this.isLoading = true

    this.VehicleRegistrationFormDetail = await vehicleRegistrationFormService.createRequest(body).finally(async () => {
      this.isLoading = false
    })
  }

  @action
  async update(body: any) {
    this.isLoading = true

    await vehicleRegistrationFormService.update(body).finally(async () => {
      this.isLoading = false
    })
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await vehicleRegistrationFormService.getAll(params).finally(() => (this.isLoading = false))
    this.listConfirm = result
  }

  @action
  async getAllByResident(params: any) {
    this.isLoading = true
    const result = await vehicleRegistrationFormService.getAllByResident(params).finally(() => (this.isLoading = false))
    this.listConfirm = result
  }

  @action
  async get(params: any) {
    this.isLoading = true
    const result = await vehicleRegistrationFormService.get(params).finally(() => (this.isLoading = false))
    this.confirmDetail = result
  }

  @action
  async GetByResident(params: any) {
    this.isLoading = true
    const result = await vehicleRegistrationFormService.GetByResident(params).finally(() => (this.isLoading = false))
    this.confirmDetail = result
  }

  async checkRequestIsValid(body: any) {
    const numberCheck = await vehicleRegistrationFormService.checkRequestIsValid(body).finally(async () => {
      this.isLoading = false
    })
    this.listIdCompanyError = numberCheck
  }

  @action
  async getListRequestHistory(params: any) {
    this.isLoading = true
    const result = await vehicleRegistrationFormService
      .getListRequestHistory(params)
      .finally(() => (this.isLoading = false))
    this.listRequestHistory = result
  }

  @action
  async sendApproval(body: any) {
    this.isLoading = true
    await vehicleRegistrationFormService.sendApproval(body).finally(async () => {
      this.isLoading = false
    })
  }

  @action
  async getVehicleRegistrationById(params: any) {
    this.isLoading = true
    const result = await vehicleRegistrationFormService
      .getVehicleRegistrationById(params)
      .finally(() => (this.isLoading = false))
    this.listVehicleDetail = result
  }

  @action
  async delete(params: any) {
    await vehicleRegistrationFormService.delete(params)
  }
}

export default VehicleRegistrationFormStore
