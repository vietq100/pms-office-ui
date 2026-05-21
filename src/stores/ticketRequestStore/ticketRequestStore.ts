import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import fileService from '../../services/common/fileService'
import ticketRequestService from '@services/ticketRequest/ticketRequestService'
import AppConsts, { moduleFile } from '@lib/appconst'
import { RequestHistoryModel } from '@models/ticketRequest/TicketRequestModel'

const { formInOutType, ticketRequestStatusEnum } = AppConsts

class TicketRequestStore {
  @observable isLoading!: boolean
  @observable ticketsRequest!: PagedResultDto<any>
  @observable editTicketRequest!: any
  @observable listRequestHistory!: RequestHistoryModel[]

  constructor() {
    this.ticketsRequest = { items: [], totalCount: 0 }
    this.editTicketRequest = {}
    makeObservable(this)
  }

  @action
  async initData(typeId) {
    this.editTicketRequest = { id: 0, statusId: ticketRequestStatusEnum.Draft, typeId: typeId }
  }

  @action
  async create(body: any, files) {
    this.isLoading = true
    this.editTicketRequest = await ticketRequestService.create(body).finally(async () => {
      this.isLoading = !!(files && files.length)
    })
    const { uniqueId } = this.editTicketRequest
    if (files && files.length && uniqueId) {
      const moduleUpload = body?.typeId === formInOutType.In ? moduleFile.InFormDocument : moduleFile.OutFormDocument
      await fileService.upload(moduleUpload, uniqueId, files).finally(() => {
        this.isLoading = false
      })
    }
  }

  @action
  async update(body: any, files) {
    this.isLoading = true
    await ticketRequestService.update(body).finally(async () => {
      const { uniqueId } = this.editTicketRequest
      this.isLoading = !!(files && files.length && uniqueId)
      if (files && files.length && uniqueId) {
        const moduleUpload = body?.typeId === formInOutType.In ? moduleFile.InFormDocument : moduleFile.OutFormDocument
        await fileService.upload(moduleUpload, uniqueId, files).finally(() => {
          this.isLoading = false
        })
      }
    })
  }

  @action
  async sendApproval(body: any) {
    this.isLoading = true
    this.editTicketRequest = await ticketRequestService.sendApproval(body).finally(async () => {
      this.isLoading = false
    })
  }

  @action
  async get4Staff(id: number) {
    const result = await ticketRequestService.get4Staff(id)
    this.editTicketRequest = result
  }

  @action
  async get4Resident(id: number) {
    const result = await ticketRequestService.get4Resident(id)
    this.editTicketRequest = result
  }

  @action
  async getAll4Staff(params: any) {
    this.isLoading = true
    const result = await ticketRequestService.getAll4Staff(params).finally(() => (this.isLoading = false))
    this.ticketsRequest = result
  }

  @action
  async getAll4User(params: any) {
    this.isLoading = true
    const result = await ticketRequestService.getAll4User(params).finally(() => (this.isLoading = false))
    this.ticketsRequest = result
  }

  @action
  async getListRequestHistory(params: any) {
    this.isLoading = true
    const result = await ticketRequestService.getListRequestHistory(params).finally(() => (this.isLoading = false))
    this.listRequestHistory = result
  }

  @action
  async deleteTicketRequest(id: number) {
    this.isLoading = true
    await ticketRequestService.delete(id).finally(() => (this.isLoading = false))
  }
}

export default TicketRequestStore
