import { action, observable, makeObservable } from 'mobx'

import * as PlanMaintenanceModel from '@models/PlanMaintenance/PlanMaintenanceModel'
import type { PagedResultDto } from '@services/dto/pagedResultDto'
import pmService from '@services/planMaintenance/planMaintenanceService'
import fileService from '@services/common/fileService'
import planMaintenanceService from '@services/planMaintenance/planMaintenanceService'
import dayjs from 'dayjs'
import { LNotification } from '@lib/abpUtility'
import { notifySuccess } from '@lib/helper'

class PlanMaintenanceStore {
  @observable isLoading!: boolean
  @observable currentPage!: number
  @observable pagedResult!: PagedResultDto<any>
  @observable editPlanMaintenance: any
  @observable planMaintenanceOverview: any[] = []
  @observable priorityOptions: any
  @observable statusOptions: any
  @observable overviewStatus: any
  @observable filterObject: PlanMaintenanceModel.IPlanMaintenanceFilter
  constructor() {
    this.filterObject = {
      isActive: true,
      skipCount: 0,
      maxResultCount: 10,
      assetIds: undefined,
      employeeId: undefined,
      priorityIds: undefined
    } as PlanMaintenanceModel.IPlanMaintenanceFilter
    this.currentPage = 1
    this.pagedResult = {
      items: [],
      totalCount: 0
    }
    this.priorityOptions = []
    this.statusOptions = []
    this.editPlanMaintenance = {}
    this.overviewStatus = []
    makeObservable(this)
  }
  @action async getOverview(params) {
    this.isLoading = true
    this.planMaintenanceOverview = await pmService.getOverview(params).finally(() => (this.isLoading = false))
  }
  @action
  async createPlanMaintenance() {
    this.editPlanMaintenance = new PlanMaintenanceModel.PlanMaintenanceModel()
  }

  @action
  async create(body: any, files, filesVideo) {
    this.isLoading = true
    this.editPlanMaintenance = await pmService.create(body)
    const { documentId } = this.editPlanMaintenance
    if (files && files.length && documentId) {
      await fileService.uploadPlanMaintenanceBefore(documentId, files)
    }
    if (filesVideo && filesVideo.length && documentId) {
      await fileService.UploadPlanMaintenanceVideo(documentId, filesVideo)
    }
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    this.isLoading = false
  }

  @action
  async update(updatePM: any, files, afterFiles, filesVideo) {
    this.isLoading = true
    await planMaintenanceService
      .update(updatePM)
      .finally(async () => {
        const { documentId } = this.editPlanMaintenance
        if (files && files.length && documentId) {
          await fileService.uploadPlanMaintenanceBefore(documentId, files)
        }
        if (afterFiles && afterFiles.length && documentId) {
          await fileService.UploadPlanMaintenanceAfters(documentId, afterFiles)
        }
        if (filesVideo && filesVideo.length && documentId) {
          await fileService.UploadPlanMaintenanceVideo(documentId, filesVideo)
        }
      })
      .finally(
        () => (notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY')), (this.isLoading = false))
      )
  }

  @action
  public setFilter(key, value) {
    if (key === 'teamIds') {
      this.filterObject = {
        ...this.filterObject,
        teamIds: value,
        employeeId: undefined
      }
      return
    }
    if (key === 'dateFromTo') {
      this.filterObject = {
        ...this.filterObject,
        fromDate: value && value[0] ? dayjs(value[0]).toISOString() : undefined,
        toDate: value && value[1] ? dayjs(value[1]).toISOString() : undefined
      }
      return
    }

    this.filterObject = {
      ...this.filterObject,
      [key as any]: value
    }

    if (key !== 'skipCount') {
      this.currentPage = 1
      this.filterObject.skipCount = 0
    }
  }

  @action
  public resetFilter() {
    this.filterObject = {
      skipCount: 0,
      isActive: true,
      maxResultCount: 10
    }
  }

  @action
  public setCurrentPage(page) {
    this.currentPage = page
  }

  @action
  public setIsLoading(isLoading: boolean) {
    this.isLoading = isLoading
  }

  @action
  async get(id: number) {
    this.editPlanMaintenance = await planMaintenanceService.get(id)
  }

  @action
  async getAll(params = {}) {
    this.isLoading = true
    this.pagedResult = await pmService
      .getAll({ ...this.filterObject, ...params })
      .finally(() => (this.isLoading = false))
  }

  @action
  async getAllMyPlan(params = {}) {
    this.isLoading = true
    this.pagedResult = await pmService
      .getAllMyPlan({ ...this.filterObject, ...params })
      .finally(() => (this.isLoading = false))
  }

  @action
  async delete(id) {
    console.log(id)
  }

  @action
  async getPriorityOptions(params) {
    this.priorityOptions = await pmService.getPriorityOptions(params)
  }

  @action
  async getStatusOptions(params) {
    this.statusOptions = await pmService.getStatusOptions(params)
  }

  @action
  async getCountStatus(params?: any) {
    this.overviewStatus = await pmService.getCountStatus({
      ...this.filterObject,
      ...params
    })
  }

  @action
  async exportPlanMaintenances(params) {
    this.isLoading = true
    return await pmService.exportPlanmaintenace(params).finally(() => (this.isLoading = false))
  }

  @action
  async activateOrDeactivate(id: number, isActive: boolean) {
    await pmService.activateOrDeactivate(id, isActive)
    if (isActive) {
      this.pagedResult.items = this.pagedResult.items.filter((item) => item.id !== id)
    }
  }

  @action
  async showHideReminder(isShow: boolean) {
    if (!this.editPlanMaintenance.reminder) {
      this.editPlanMaintenance.reminder = {
        isActive: true,
        reminderInMinute: 0,
        period: 0,
        userIds: [],
        emails: []
      }
    }
    this.editPlanMaintenance.reminder.isActive = isShow
  }

  @action
  async setEditPlanMaintenance(key: string, value: any) {
    this.editPlanMaintenance[key] = value
  }

  @action
  async downloadTemplate() {
    return pmService.downloadTemplate()
  }
  @action
  async importPlanmaintenace(file) {
    return pmService.importPlanmaintenace(file)
  }

  @action
  async exportPlanmaintenace(params = {}) {
    this.isLoading = true

    const filter = { ...this.filterObject }

    delete filter.skipCount
    delete filter.maxResultCount
    return await pmService.exportPlanmaintenace({ ...filter, ...params }).finally(() => (this.isLoading = false))
  }

  @action
  async sendNotiMaintenancePlan(id: number) {
    this.isLoading = true
    await pmService.sendNotiMaintenancePlan(id)

    notifySuccess(LNotification('SUCCESS'), LNotification('SEND_SUCCESSFULLY'))
    this.isLoading = false
  }
}

export default PlanMaintenanceStore
