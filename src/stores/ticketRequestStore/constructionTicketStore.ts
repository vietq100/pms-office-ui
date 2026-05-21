import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import fileService from '../../services/common/fileService'
import AppConsts, { moduleFile } from '@lib/appconst'
import { RequestHistoryModel } from '@models/ticketRequest/TicketRequestModel'
import constructionTicketService from '@services/ticketRequest/constructionTicketService'

const { ticketRequestStatusEnum } = AppConsts

class ConstructionTicketStore {
  @observable isLoading!: boolean
  @observable constructionRequest!: PagedResultDto<any>
  @observable editConstructionRequest!: any
  @observable listRequestHistory!: RequestHistoryModel[]

  constructor() {
    this.constructionRequest = { items: [], totalCount: 0 }
    this.editConstructionRequest = {}
    makeObservable(this)
  }

  @action
  async initData() {
    this.editConstructionRequest = { id: 0, statusId: ticketRequestStatusEnum.Draft }
  }

  @action
  async create(body: any, files) {
    this.isLoading = true
    this.editConstructionRequest = await constructionTicketService.create(body).finally(async () => {
      this.isLoading = !!(files && files.length)
    })
    const { uniqueId } = this.editConstructionRequest
    if (files && files.length && uniqueId) {
      await fileService.upload(moduleFile.constructionListFormDocument, uniqueId, files).finally(() => {
        this.isLoading = false
      })
    }
  }

  @action
  async update(updateCompanyInput: any, files) {
    this.isLoading = true
    await constructionTicketService.update(updateCompanyInput).finally(async () => {
      const { uniqueId } = this.editConstructionRequest
      this.isLoading = !!(files && files.length && uniqueId)
      if (files && files.length && uniqueId) {
        await fileService.upload(moduleFile.constructionListFormDocument, uniqueId, files).finally(() => {
          this.isLoading = false
        })
      }
    })
  }

  @action
  async sendApproval(body: any) {
    this.isLoading = true
    this.editConstructionRequest = await constructionTicketService.sendApproval(body).finally(async () => {
      this.isLoading = false
    })
  }

  @action
  async get4Staff(id: number) {
    const result = await constructionTicketService.get4Staff(id)
    this.editConstructionRequest = result
  }

  @action
  async get4Resident(id: number) {
    const result = await constructionTicketService.get4Resident(id)
    this.editConstructionRequest = result
  }

  @action
  async getAll4Staff(params: any) {
    this.isLoading = true
    const result = await constructionTicketService.getAll4Staff(params).finally(() => (this.isLoading = false))
    this.constructionRequest = result
  }

  @action
  async getAll4User(params: any) {
    this.isLoading = true
    const result = await constructionTicketService.getAll4User(params).finally(() => (this.isLoading = false))
    this.constructionRequest = result
  }

  @action
  async getListRequestHistory(params: any) {
    this.isLoading = true
    const result = await constructionTicketService.getListRequestHistory(params).finally(() => (this.isLoading = false))
    this.listRequestHistory = result
  }

  @action
  async deleteTicketRequest(id: number) {
    this.isLoading = true
    await constructionTicketService.delete(id).finally(() => (this.isLoading = false))
  }
}

export default ConstructionTicketStore
