import { action, observable, makeObservable } from 'mobx'

import type { IPlanMaintenanceCalendarFilter } from '@models/PlanMaintenance/PlanMaintenanceModel'
import pmService from '@services/planMaintenance/planMaintenanceService'
import AppConsts, { CalendarTypes } from '@lib/appconst'

const { monthNamesShort } = AppConsts
const currentDate = new Date()
class PlanMaintenanceCalendarStore {
  @observable isLoading!: boolean
  @observable currentPage!: number
  @observable events: any
  @observable priorityOptions: any
  @observable statusOptions: any
  @observable overviewStatus: any
  @observable filterObject: IPlanMaintenanceCalendarFilter
  @observable eventsFiltered: any
  @observable displayMonths: any
  @observable excludeMonths: any

  constructor() {
    this.filterObject = {
      isActive: true,
      skipCount: 0,
      maxResultCount: 10,
      projectId: 0,
      year: null
    }
    this.currentPage = 1
    this.events = []
    this.eventsFiltered = []
    this.priorityOptions = []
    this.statusOptions = []
    this.overviewStatus = []
    this.displayMonths = monthNamesShort.slice(currentDate.getMonth(), 12)
    this.excludeMonths = monthNamesShort.slice(0, currentDate.getMonth())
    makeObservable(this)
  }

  @action
  async create(body: any) {
    return pmService.create(body)
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

  @action
  public setCurrentPage(page) {
    this.currentPage = page
  }

  @action
  async getAll(params = {}) {
    this.isLoading = true
    this.events = await pmService
      .getPlanMaintenanceByAsset({
        ...this.filterObject,
        ...params,
        calendarTypeId: CalendarTypes.PlanMaintenance
      })
      .finally(() => (this.isLoading = false))
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
  async getCountStatus(params) {
    this.overviewStatus = await pmService.getCountStatus(params)
  }

  @action
  async prepareMonthData() {
    this.eventsFiltered = this.events.map((assetType) => {
      ;(assetType.assets || []).forEach((asset) => {
        asset.data.forEach((monthData) => {
          monthData.isShow = this.displayMonths.findIndex((monthName) => monthName === monthData.month) > -1
        })
      })
      return assetType
    })
  }

  @action
  public setMonthFilter(displayMonths, excludeMonths) {
    this.displayMonths = displayMonths
    this.excludeMonths = excludeMonths
  }
}

export default PlanMaintenanceCalendarStore
