import { action, observable, makeObservable } from 'mobx'
import type { PagedResultDto } from '@services/dto/pagedResultDto'
import fileService from '@services/common/fileService'
import { LNotification } from '@lib/abpUtility'
import { notifySuccess } from '@lib/helper'
import { servicePlanEnum } from '@lib/appconst'
import servicePlanService from '@services/servicePlan/servicePlanService'

class ServicePlanStore {
  @observable isLoading!: boolean
  @observable pagedResult!: PagedResultDto<any>
  @observable editPlanSanitation: any
  @observable priorityOptions: any
  @observable statusOptions: any
  constructor() {
    this.pagedResult = {
      items: [],
      totalCount: 0
    }
    this.priorityOptions = []
    this.statusOptions = []
    this.editPlanSanitation = {}
    makeObservable(this)
  }

  @action
  async createPlanSanitation() {
    this.editPlanSanitation = { type: servicePlanEnum.SANITTION }
  }

  @action
  async create(body: any, files, filesVideo) {
    this.isLoading = true
    this.editPlanSanitation = await servicePlanService.create(body)
    const { documentId } = this.editPlanSanitation
    if (files && files.length && documentId) {
      await fileService.uploadServicePlanDocument(documentId, files)
    }
    if (filesVideo && filesVideo.length && documentId) {
      await fileService.uploadServicePlanVideo(documentId, filesVideo)
    }
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    this.isLoading = false
  }

  @action
  async update(updatePM: any, files, afterFiles, filesVideo) {
    this.isLoading = true
    await servicePlanService
      .update(updatePM)
      .finally(async () => {
        const { documentId } = this.editPlanSanitation
        if (files && files.length && documentId) {
          await fileService.uploadServicePlanDocument(documentId, files)
        }
        if (afterFiles && afterFiles.length && documentId) {
          await fileService.uploadServicePlanDocumentDone(documentId, afterFiles)
        }
        if (filesVideo && filesVideo.length && documentId) {
          await fileService.uploadServicePlanVideo(documentId, filesVideo)
        }
      })
      .finally(() => (this.isLoading = false))

    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
  }

  @action
  async get(id: number) {
    this.editPlanSanitation = await servicePlanService.get(id)
  }

  @action
  async getAll(params) {
    this.isLoading = true
    this.pagedResult = await servicePlanService.getAll(params).finally(() => (this.isLoading = false))
  }

  @action
  async seteditPlanSanitation(key: string, value: any) {
    this.editPlanSanitation[key] = value
  }

  @action
  public setIsLoading(isLoading: boolean) {
    this.isLoading = isLoading
  }

  @action
  async getPriorityOptions(params) {
    this.priorityOptions = await servicePlanService.getPriorityOptions(params)
  }

  @action
  async getStatusOptions(params) {
    this.statusOptions = await servicePlanService.getStatusOptions(params)
  }

  @action
  async exportServicePlan(params) {
    this.isLoading = true

    delete params?.skipCount
    delete params?.maxResultCount
    return await servicePlanService.exportServicePlan({ ...params }).finally(() => (this.isLoading = false))
  }

  @action
  async activateOrDeactivate(id: number, isActive: boolean) {
    await servicePlanService.activateOrDeactivate(id, isActive)
    if (isActive) {
      this.pagedResult.items = this.pagedResult.items.filter((item) => item.id !== id)
    }
  }
}

export default ServicePlanStore
