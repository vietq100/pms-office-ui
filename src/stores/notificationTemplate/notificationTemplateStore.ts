import type { PagedResultDto } from '@services/dto/pagedResultDto'
import { NotificationTemplateDetailModel } from '@models/NotificationTemplate'
import { action, observable, makeObservable } from 'mobx'
import notificationTemplateService from '@services/notificationTemplate/notificationTemplateService'
import { OptionModel } from '@models/global'

class NotificationTemplateStore {
  @observable pagedResult!: PagedResultDto<NotificationTemplateDetailModel>
  @observable pagedResultTemplteFee!: PagedResultDto<NotificationTemplateDetailModel>

  @observable isLoading!: boolean
  @observable feeTypes!: NotificationTemplateDetailModel[]
  @observable editTemplate!: NotificationTemplateDetailModel
  @observable notificationTypes!: OptionModel[]
  @observable listModules: any[] = []

  constructor() {
    this.pagedResult = {
      items: [],
      totalCount: 0
    }
    this.pagedResultTemplteFee = {
      items: [],
      totalCount: 0
    }
    makeObservable(this)
  }

  @action async getListModules() {
    const res = await notificationTemplateService.getListModules()
    this.listModules = res
  }

  @action
  async create(body) {
    await notificationTemplateService.create(body)
  }

  @action
  async update(body) {
    await notificationTemplateService.update(body)
  }

  @action
  async activateOrDeactivate(id, isActive) {
    await notificationTemplateService.activateOrDeactivate(id, isActive)
  }

  @action
  async delete(id) {
    await notificationTemplateService.delete(id)
    this.pagedResult.items = this.pagedResult.items.filter((x) => x.id !== id)
  }

  @action
  async get(id) {
    const result = await notificationTemplateService.get(id)
    this.editTemplate = result
  }
  @action
  async getProjectTemplate(param) {
    const result = await notificationTemplateService.getProjectTemplate(param)
    this.editTemplate = result
  }

  @action
  async createNotificationTemplate() {
    this.editTemplate = new NotificationTemplateDetailModel()
  }

  @action
  async getAll(params) {
    this.isLoading = true
    const result = await notificationTemplateService.getAll(params).finally(() => (this.isLoading = false))
    this.pagedResult = result
  }

  @action
  async getAllTemplateFee(params) {
    this.isLoading = true
    const result = await notificationTemplateService.getAllTemplateFee(params).finally(() => (this.isLoading = false))
    this.pagedResultTemplteFee = result
  }

  @action
  async getLists(params) {
    this.pagedResult.items = await notificationTemplateService.getList(params)
  }
  @action
  async getNotificationTypes(params) {
    // params.isActive = true
    this.notificationTypes = await notificationTemplateService.getNotificationType(params)
  }
}

export default NotificationTemplateStore
