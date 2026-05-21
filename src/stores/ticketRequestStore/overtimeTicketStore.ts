import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import fileService from '../../services/common/fileService'
import AppConsts, { moduleFile } from '@lib/appconst'
import { RequestHistoryModel } from '@models/ticketRequest/TicketRequestModel'
import overtimeService from '@services/ticketRequest/overtimeTicketService'

const { ticketRequestStatusEnum } = AppConsts

class OvertimeTicketStore {
  @observable isLoading!: boolean
  @observable overtimesRequest!: PagedResultDto<any>
  @observable editOvertimeRequest!: any
  @observable listRequestHistory!: RequestHistoryModel[]

  constructor() {
    this.overtimesRequest = { items: [], totalCount: 0 }
    this.editOvertimeRequest = {}
    makeObservable(this)
  }

  @action
  async initData() {
    this.editOvertimeRequest = { id: 0, statusId: ticketRequestStatusEnum.Draft }
  }

  @action
  async create(body: any, files) {
    this.isLoading = true
    this.editOvertimeRequest = await overtimeService.create(body).finally(async () => {
      this.isLoading = !!(files && files.length)
    })
    const { uniqueId } = this.editOvertimeRequest
    if (files && files.length && uniqueId) {
      await fileService.upload(moduleFile.overTime, uniqueId, files).finally(() => {
        this.isLoading = false
      })
    }
  }

  @action
  async update(updateCompanyInput: any, files) {
    this.isLoading = true
    await overtimeService.update(updateCompanyInput).finally(async () => {
      const { uniqueId } = this.editOvertimeRequest
      this.isLoading = !!(files && files.length && uniqueId)
      if (files && files.length && uniqueId) {
        await fileService.upload(moduleFile.overTime, uniqueId, files).finally(() => {
          this.isLoading = false
        })
      }
    })
  }

  @action
  async sendApproval(body: any) {
    this.isLoading = true
    this.editOvertimeRequest = await overtimeService.sendApproval(body).finally(async () => {
      this.isLoading = false
    })
  }

  @action
  async get4Staff(id: number) {
    const result = await overtimeService.get4Staff(id)
    this.editOvertimeRequest = result
  }

  @action
  async get4Resident(id: number) {
    const result = await overtimeService.get4Resident(id)
    this.editOvertimeRequest = result
  }

  @action
  async getAll4Staff(params: any) {
    this.isLoading = true
    const result = await overtimeService.getAll4Staff(params).finally(() => (this.isLoading = false))
    this.overtimesRequest = result
  }

  @action
  async getAll4User(params: any) {
    this.isLoading = true
    const result = await overtimeService.getAll4User(params).finally(() => (this.isLoading = false))
    this.overtimesRequest = result
  }

  @action
  async getListRequestHistory(params: any) {
    this.isLoading = true
    const result = await overtimeService.getListRequestHistory(params).finally(() => (this.isLoading = false))
    this.listRequestHistory = result
  }

  @action
  async deleteTicketRequest(id: number) {
    this.isLoading = true
    await overtimeService.delete(id).finally(() => (this.isLoading = false))
  }

  @action
  async exportOvertimeTicket(params: any) {
    this.isLoading = true
    return await overtimeService.exportOvertimeTicket(params).finally(() => (this.isLoading = false))
  }
}

export default OvertimeTicketStore
