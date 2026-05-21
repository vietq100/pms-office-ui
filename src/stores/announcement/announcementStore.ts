import type { PagedResultDto } from '@services/dto/pagedResultDto'
import { AnnouncementDetailModel } from '@models/announcement'
import { action, makeObservable, observable } from 'mobx'
import announcementService from '@services/announcement/announcementService'

class AnnouncementStore {
  @observable pagedResult!: PagedResultDto<AnnouncementDetailModel>
  @observable isLoading!: boolean
  @observable isLoadingLogUser!: boolean
  @observable feeTypes!: AnnouncementDetailModel[]
  @observable editAnnouncement: any
  @observable announcementUsers: any[]
  @observable announcementUserLogs!: PagedResultDto<any>
  @observable announcementOverview: any[] = []
  @observable listCategories: any = []

  constructor() {
    this.pagedResult = {
      items: [],
      totalCount: 0
    }

    this.announcementUserLogs = {
      items: [],
      totalCount: 0
    }

    this.editAnnouncement = new AnnouncementDetailModel()
    this.announcementUsers = []
    makeObservable(this)
  }
  @action async getOverview(params) {
    this.isLoading = true
    this.announcementOverview = await announcementService.getOverview(params).finally(() => (this.isLoading = false))
  }
  @action
  async create(body, files?) {
    this.isLoading = true
    this.editAnnouncement = await announcementService.create(body, files).finally(() => (this.isLoading = false))
  }

  @action
  async update(body) {
    this.isLoading = true
    this.editAnnouncement = await announcementService.update(body).finally(() => (this.isLoading = false))
  }

  @action
  async activateOrDeactivate(id, isActive) {
    await announcementService.activateOrDeactivate(id, isActive)
  }

  @action
  async publishAnnouncement(id) {
    await announcementService.publishAnnouncement(id)
    this.get(id)
  }

  @action
  async delete(id) {
    await announcementService.delete(id)
    this.pagedResult.items = this.pagedResult.items.filter((x) => x.id !== id)
  }

  @action
  async get(id) {
    this.isLoading = true
    const result = await announcementService.get(id).finally(() => (this.isLoading = false))
    this.editAnnouncement = result
  }
  @action
  async getLogs(id, skipCount?, maxResultCount?, keyword?) {
    this.announcementUserLogs = await announcementService.getLogs({
      campaignId: id,
      skipCount: skipCount,
      maxResultCount: maxResultCount,
      keyword: keyword
    })
  }

  @action
  async createAnnouncement() {
    this.editAnnouncement = new AnnouncementDetailModel()

    this.announcementUserLogs = {
      items: [],
      totalCount: 0
    }
    this.isLoading = false
  }

  @action
  async getAll(params) {
    this.isLoading = true
    const result = await announcementService.getAll(params).finally(() => (this.isLoading = false))
    this.pagedResult = result
  }

  @action
  async getAnnouncementUsers(params) {
    this.isLoadingLogUser = true
    this.announcementUserLogs = await announcementService
      .getAnnouncementUsers(params)
      .finally(() => (this.isLoadingLogUser = false))
  }
  @action
  async getListCategories(params: any) {
    const result = await announcementService.getListCategories(params)
    this.listCategories = result || {}
  }

  @action
  async exportCampaigns(params: any) {
    this.isLoading = true
    return await announcementService.exportCampaigns(params).finally(() => (this.isLoading = false))
  }
}

export default AnnouncementStore
