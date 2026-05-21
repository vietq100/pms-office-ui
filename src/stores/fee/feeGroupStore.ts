import type { PagedResultDto } from '@services/dto/pagedResultDto'
import { action, computed, observable, makeObservable } from 'mobx'
import { IFeeGroup } from '@models/fee'
import feeGroupService from '@services/fee/feeGroupService'
import unitService from '@services/project/unitService'

export default class FeeGroupStore {
  @observable isLoading!: boolean
  @observable pagedResult!: PagedResultDto<IFeeGroup>
  @observable selectedProjectId!: number | undefined
  @observable filterObject!: {
    projectId?: number
    unitId?: number | string
    packageId?: number | string
    isActive?: boolean | string
    skipCount: number
    feeStatusId?: number
    isShowToResident?: number
    maxResultCount?: number
    keyword?: string
    groupName?: string
    amenityId?: number
    feeTypeId?: number
  }
  @observable units?: {
    fullUnitCode: string
    id: number
  }[]

  residentUnitId?: string

  constructor() {
    this.pagedResult = {
      items: [],
      totalCount: 0
    }
    makeObservable(this)
    this.filterObject = {
      skipCount: 0,
      isActive: true,
      maxResultCount: 10
    }

    this.residentUnitId = ''
  }
  @action
  async getAll(params = {} as any) {
    this.isLoading = true
    this.filterObject = {
      ...this.filterObject,
      ...params,
      skipCount: params.skipCount || 0,
      projectId: this.selectedProjectId
    }

    this.pagedResult = await feeGroupService.getAll(this.filterObject).finally(() => (this.isLoading = false))
  }

  @action
  setProjectId(id) {
    this.selectedProjectId = id
  }

  @computed
  get projectId() {
    return this.selectedProjectId
  }

  setFilter(name: string, value: any) {
    this.filterObject[name] = value
    return this
  }

  @action
  resetFilter() {
    this.filterObject = {
      skipCount: 0,
      isActive: true,
      maxResultCount: 10
    }
    this.selectedProjectId = undefined
  }

  markGroupStatus(data) {
    return feeGroupService.markGroupStatus(data)
  }

  markGroupShowToResidents(data) {
    return feeGroupService.markGroupShowToResidents(data)
  }

  setSelectResidentUnit(val) {
    this.residentUnitId = val
  }

  download = () => {
    return feeGroupService.download({
      ...this.filterObject,
      projectId: this.selectedProjectId
    })
  }

  async notify(data) {
    this.isLoading = true
    return feeGroupService.notify(data).finally(() => (this.isLoading = false))
  }

  @action
  async getUnits({ keyword = '', projectId = 0, isActive = true }) {
    this.units = await unitService.getUnits({
      keyword,
      projectId,
      isActive
    })
  }

  @action
  clearUnits() {
    this.units = []
    return this
  }

  async changeStatusFeeGroup(body) {
    this.isLoading = true
    feeGroupService.changeStatusFeeGroup(body).finally(() => (this.isLoading = false))
  }
}
