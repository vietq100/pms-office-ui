import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import fileService from '../../services/common/fileService'
import AppConsts, { moduleFile } from '@lib/appconst'
import { RequestHistoryModel } from '@models/ticketRequest/TicketRequestModel'
import ticketEventService from '@services/ticketRequest/ticketEventService'

const { ticketRequestStatusEnum } = AppConsts

class TicketEventStore {
  @observable isLoading!: boolean
  @observable eventsRequest!: PagedResultDto<any>
  @observable editEventRequest!: any
  @observable listRequestHistory!: RequestHistoryModel[]

  constructor() {
    this.eventsRequest = { items: [], totalCount: 0 }
    this.editEventRequest = {}
    makeObservable(this)
  }

  @action
  async initData() {
    this.editEventRequest = { id: 0, statusId: ticketRequestStatusEnum.Draft }
  }

  @action
  async create(body: any, files) {
    this.isLoading = true
    this.editEventRequest = await ticketEventService.create(body).finally(async () => {
      this.isLoading = !!(files && files.length)
    })
    const { uniqueId } = this.editEventRequest
    if (files && files.length && uniqueId) {
      await fileService.upload(moduleFile.eventPlanningFormDocument, uniqueId, files).finally(() => {
        this.isLoading = false
      })
    }
  }

  @action
  async update(updateCompanyInput: any, files) {
    this.isLoading = true
    await ticketEventService.update(updateCompanyInput).finally(async () => {
      const { uniqueId } = this.editEventRequest
      this.isLoading = !!(files && files.length && uniqueId)
      if (files && files.length && uniqueId) {
        await fileService.upload(moduleFile.eventPlanningFormDocument, uniqueId, files).finally(() => {
          this.isLoading = false
        })
      }
    })
  }

  @action
  async sendApproval(body: any) {
    this.isLoading = true
    this.editEventRequest = await ticketEventService.sendApproval(body).finally(async () => {
      this.isLoading = false
    })
  }

  @action
  async get4Staff(id: number) {
    const result = await ticketEventService.get4Staff(id)
    this.editEventRequest = result
  }

  @action
  async get4Resident(id: number) {
    const result = await ticketEventService.get4Resident(id)

    this.editEventRequest = result
  }

  @action
  async getAll4Staff(params: any) {
    this.isLoading = true
    const result = await ticketEventService.getAll4Staff(params).finally(() => (this.isLoading = false))
    this.eventsRequest = result
  }

  @action
  async getAll4User(params: any) {
    this.isLoading = true
    const result = await ticketEventService.getAll4User(params).finally(() => (this.isLoading = false))
    this.eventsRequest = result
  }

  @action
  async getListRequestHistory(params: any) {
    this.isLoading = true
    const result = await ticketEventService.getListRequestHistory(params).finally(() => (this.isLoading = false))
    this.listRequestHistory = result
  }

  @action
  async deleteTicketRequest(id: number) {
    this.isLoading = true
    await ticketEventService.delete(id).finally(() => (this.isLoading = false))
  }
}

export default TicketEventStore
