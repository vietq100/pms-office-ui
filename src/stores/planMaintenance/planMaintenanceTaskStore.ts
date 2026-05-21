import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '@services/dto/pagedResultDto'
import planMaintenanceService from '@services/planMaintenance/planMaintenanceService'
import * as PlanMaintenanceModel from '@models/PlanMaintenance/PlanMaintenanceModel'

class PlanMaintenanceTaskStore {
  @observable isLoading!: boolean
  @observable pagedResult!: PagedResultDto<any>
  @observable filterObject: PlanMaintenanceModel.IPlanMaintenanceTaskFilter
  @observable currentPage!: number

  constructor() {
    this.pagedResult = {
      items: [],
      totalCount: 0
    }
    this.filterObject = {
      isActive: true,
      skipCount: 0,
      maxResultCount: 10,
      planMaintenanceId: undefined,
      statusId: undefined,
      isOnlyMyTask: undefined
    }
    this.currentPage = 1
    makeObservable(this)
  }

  @action
  public setFilter(key, value) {
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

  async create(body: any) {
    return planMaintenanceService.create(body)
  }

  @action
  async getAll(params = {}) {
    this.isLoading = true
    this.pagedResult = await planMaintenanceService
      .getAllTasks({
        ...this.filterObject,
        ...params
      })
      .finally(() => (this.isLoading = false))
  }

  // @action
  // async delete(params) {
  //   await planMaintenanceService.delete(params)
  //   this.pagedResult.items = this.pagedResult.items.filter((item) => item.id !== params.id)
  // }

  // @action
  // async downloadReceipt(params) {
  //   await planMaintenanceService.downloadReceipts(params)
  // }
}

export default PlanMaintenanceTaskStore
