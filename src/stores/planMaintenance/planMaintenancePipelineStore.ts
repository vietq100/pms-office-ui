import { action, observable, makeObservable } from 'mobx'
import type { PagedResultDto } from '@services/dto/pagedResultDto'
import pmService from '@services/planMaintenance/planMaintenanceService'
import dayjs from 'dayjs'

class PlanMaintenancePipelineStore {
  @observable isLoading!: boolean
  @observable pagedResult!: PagedResultDto<any>
  @observable overview: any
  @observable planByStatus: any
  @observable listStatus: any
  @observable listPlanMaintenance: any
  @observable filterObject: any

  constructor() {
    makeObservable(this)
    this.pagedResult = {
      items: [],
      totalCount: 0
    }
    this.overview = {
      dueDate: 0,
      overdue: 0,
      today: 0
    }
    this.listStatus = []
    this.listPlanMaintenance = {}
    this.filterObject = {}
  }

  @action
  public setFilter(key, value) {
    if (key === 'dateFromTo') {
      this.filterObject = {
        ...this.filterObject,
        fromDate: value && value[0] ? dayjs(value[0]).toISOString() : null,
        toDate: value && value[1] ? dayjs(value[1]).toISOString() : null
      }
      return
    }

    this.filterObject = {
      ...this.filterObject,
      [key as any]: value
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

  async create(body: any) {
    return pmService.create(body)
  }

  @action
  async getOverview(params: any) {
    this.isLoading = true
    this.overview = await pmService
      .getPlanMaintenanceOverview({ ...this.filterObject, ...params })
      .finally(() => (this.isLoading = false))
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    this.pagedResult = await pmService.getAll(params).finally(() => (this.isLoading = false))
  }

  @action
  async getAllByStatus(params: any) {
    this.isLoading = true
    this.listStatus = await pmService.getStatusOptions(params).finally(() => (this.isLoading = false))
    this.listStatus.forEach(async (item) => {
      this.listPlanMaintenance[item.id] = await pmService.getAllCalendar({
        ...this.filterObject,
        statusIds: item.id,
        maxResultCount: 20,
        skipCount: 0
      })
    })
  }
  @action
  async getMore(statusId: number, params: any) {
    this.isLoading = true
    const result = await pmService.getAllCalendar({
      ...this.filterObject,
      ...params,
      statusIds: statusId
    })
    const oldResult = this.listPlanMaintenance[statusId].items
    this.listPlanMaintenance[statusId] = {
      items: [...oldResult, ...result.items],
      totalCount: result.totalCount
    }
    this.isLoading = false
  }
  @action
  async updatePlanStatus(planId: number, statusId: number) {
    await pmService.updatePlanStatus({
      planId,
      statusId
    })
    return await this.getAllByStatus({})
  }
}

export default PlanMaintenancePipelineStore
