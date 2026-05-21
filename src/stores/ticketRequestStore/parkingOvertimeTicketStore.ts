import parkingOvertimeTicketService from '@services/ticketRequest/parkingOvertimeTicketService'
import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import { RequestHistoryModel } from '@models/ticketRequest/TicketRequestModel'
import { action, makeObservable, observable } from 'mobx'
import fileService from '@services/common/fileService'
import AppConsts, { moduleFile } from '@lib/appconst'

const { ticketRequestStatusEnum } = AppConsts

class ParkingOvertimeTicketStore {
  @observable isLoading!: boolean
  @observable tableData!: PagedResultDto<any>
  @observable listRequestHistory!: RequestHistoryModel[]
  @observable detailData!: any

  constructor() {
    this.tableData = { items: [], totalCount: 0 }
    this.detailData = {}
    makeObservable(this)
  }

  @action
  async initData() {
    this.detailData = { id: 0, statusId: ticketRequestStatusEnum.Draft }
  }

  @action
  async create(body: any, files) {
    this.isLoading = true
    this.tableData = await parkingOvertimeTicketService.create(body).finally(async () => {
      this.isLoading = !!(files && files.length)
    })
    const { uniqueId } = this.detailData
    if (files && files.length && uniqueId) {
      await fileService.upload(moduleFile.overtimeParking, uniqueId, files).finally(() => {
        this.isLoading = false
      })
    }
    return this.tableData
  }

  @action
  async update(body: any, files) {
    this.isLoading = true
    const result = await parkingOvertimeTicketService.update(body).finally(async () => {
      const { uniqueId } = this.detailData
      this.isLoading = !!(files && files.length && uniqueId)
      if (files && files.length && uniqueId) {
        await fileService.upload(moduleFile.overtimeParking, uniqueId, files).finally(() => {
          this.isLoading = false
        })
      }
    })
    return result
  }

  @action
  async get4Staff(id: number) {
    const result = await parkingOvertimeTicketService.get4Staff(id)
    this.detailData = result
  }

  @action
  async get4Resident(id: number) {
    const result = await parkingOvertimeTicketService.get4Resident(id)
    this.detailData = result
  }

  @action
  async getAll4Staff(params: any) {
    this.isLoading = true
    const result = await parkingOvertimeTicketService.getAll4Staff(params).finally(() => (this.isLoading = false))
    this.tableData = result
  }

  @action
  async getAll4User(params: any) {
    this.isLoading = true
    const result = await parkingOvertimeTicketService.getAll4User(params).finally(() => (this.isLoading = false))
    this.tableData = result
  }

  @action
  async delete(id: number) {
    this.isLoading = true
    await parkingOvertimeTicketService.delete(id).finally(() => (this.isLoading = false))
  }

  @action
  async sendApproval(body: any) {
    this.isLoading = true
    this.detailData = await parkingOvertimeTicketService
      .sendApproval(body)
      .finally(async () => (this.isLoading = false))
  }

  @action
  async getListRequestHistory(params: any) {
    this.isLoading = true
    const result = await parkingOvertimeTicketService
      .getListRequestHistory(params)
      .finally(() => (this.isLoading = false))
    this.listRequestHistory = result
  }
}

export default ParkingOvertimeTicketStore
