import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import fileService from '../../services/common/fileService'
import AppConsts, { moduleFile } from '@lib/appconst'
import { RequestHistoryModel } from '@models/ticketRequest/TicketRequestModel'
import renovationService from '@services/ticketRequest/renovationService'

const { ticketRequestStatusEnum } = AppConsts

class RenovationStore {
  @observable isLoading!: boolean
  @observable renovationsRequest!: PagedResultDto<any>
  @observable editRenovationRequest!: any
  @observable listRequestHistory!: RequestHistoryModel[]

  constructor() {
    this.renovationsRequest = { items: [], totalCount: 0 }
    this.editRenovationRequest = {}
    makeObservable(this)
  }

  @action
  async initData() {
    this.editRenovationRequest = { id: 0, statusId: ticketRequestStatusEnum.Draft }
  }

  @action
  async create(body: any, files) {
    this.isLoading = true
    this.editRenovationRequest = await renovationService.create(body).finally(async () => {
      this.isLoading = !!(files && files.length)
    })
    const { uniqueId } = this.editRenovationRequest
    if (files && files.length && uniqueId) {
      await fileService.upload(moduleFile.renovationFormDocument, uniqueId, files).finally(() => {
        this.isLoading = false
      })
    }
  }

  @action
  async update(updateCompanyInput: any, files) {
    this.isLoading = true
    await renovationService.update(updateCompanyInput).finally(async () => {
      const { uniqueId } = this.editRenovationRequest
      this.isLoading = !!(files && files.length && uniqueId)
      if (files && files.length && uniqueId) {
        await fileService.upload(moduleFile.renovationFormDocument, uniqueId, files).finally(() => {
          this.isLoading = false
        })
      }
    })
  }

  @action
  async sendApproval(body: any) {
    this.isLoading = true
    this.editRenovationRequest = await renovationService.sendApproval(body).finally(async () => {
      this.isLoading = false
    })
  }

  @action
  async get4Staff(id: number) {
    const result = await renovationService.get4Staff(id)
    this.editRenovationRequest = result
  }

  @action
  async get4Resident(id: number) {
    const result = await renovationService.get4Resident(id)
    this.editRenovationRequest = result
  }

  @action
  async getAll4Staff(params: any) {
    this.isLoading = true
    const result = await renovationService.getAll4Staff(params).finally(() => (this.isLoading = false))
    this.renovationsRequest = result
  }

  @action
  async getAll4User(params: any) {
    this.isLoading = true
    const result = await renovationService.getAll4User(params).finally(() => (this.isLoading = false))
    this.renovationsRequest = result
  }

  @action
  async getListRequestHistory(params: any) {
    this.isLoading = true
    const result = await renovationService.getListRequestHistory(params).finally(() => (this.isLoading = false))
    this.listRequestHistory = result
  }

  @action
  async deleteTicketRequest(id: number) {
    this.isLoading = true
    await renovationService.delete(id).finally(() => (this.isLoading = false))
  }
}

export default RenovationStore
