import type { PagedResultDto } from '@services/dto/pagedResultDto'
import { AmenityDetailModel } from '@models/Booking/amenityModel'
import { action, observable, makeObservable } from 'mobx'
import amenityService from '@services/booking/amenityService'
import residentService from '@services/member/resident/residentService'
import unitService from '@services/project/unitService'
import fileService from '@services/common/fileService'
import { moduleFile } from '@lib/appconst'
import { notifySuccess } from '@lib/helper'
import { L } from '@lib/abpUtility'

class AmenityStore {
  @observable pagedResult!: PagedResultDto<AmenityDetailModel>
  @observable amenities!: AmenityDetailModel[]
  @observable isLoading!: boolean
  @observable editAmenity!: AmenityDetailModel
  @observable amenityParent!: AmenityDetailModel
  @observable icons!: any[]
  @observable timezones!: any[]
  @observable memberRoles!: any[]
  @observable unitTypes!: any[]
  @observable blackList: any = {
    items: [],
    totalCount: 0
  }
  @observable blackListDetail!: any
  @observable monthlyPackageList: any = {
    items: [],
    totalCount: 0
  }
  @observable monthlyPackageDetail!: any
  constructor() {
    makeObservable(this)
    this.pagedResult = {
      items: [],
      totalCount: 0
    }
  }

  @action
  async getAllMonthlyPackageList(params) {
    this.isLoading = true
    this.monthlyPackageList = await amenityService.getAllMonthlyPackage(params).finally(() => (this.isLoading = false))
  }
  @action
  async getMonthlyPackageDetail(id) {
    this.isLoading = true
    this.monthlyPackageDetail = await amenityService.getMonthlyPackageDetail(id).finally(() => (this.isLoading = false))
  }
  @action
  async updateMonthlyPackageDetail(body: any) {
    this.isLoading = true
    const newBody = {
      ...body,
      startDate: body.time[0].toISOString(),
      endDate: body.time[1].toISOString()
    }
    if (!this.monthlyPackageDetail?.id) {
      this.monthlyPackageDetail = await amenityService
        .createMonthlyPackageDetail(newBody)
        .finally(() => (this.isLoading = false))
    } else {
      this.monthlyPackageDetail = await amenityService
        .updateMonthlyPackageDetail({
          ...this.monthlyPackageDetail,
          ...newBody
        })
        .finally(() => (this.isLoading = false))
    }
  }
  @action
  async getAllBlackList(params) {
    this.isLoading = true
    this.blackList = await amenityService.getAllBlackList(params).finally(() => (this.isLoading = false))
  }
  @action
  async getBlackListDetail(id) {
    this.isLoading = true
    this.blackListDetail = await amenityService.getBlackListDetail(id).finally(() => (this.isLoading = false))
  }
  @action
  async updateBlackListDetail(body: any) {
    this.isLoading = true
    const newBody = {
      ...body,
      startDate: body.time[0].toISOString(),
      endDate: body.time[1].toISOString()
    }
    if (!this.blackListDetail?.id) {
      this.blackListDetail = await amenityService.createBlackListDetail(newBody).finally(() => (this.isLoading = false))
    } else {
      this.blackListDetail = await amenityService
        .updateBlackListDetail({ ...this.blackListDetail, ...newBody })
        .finally(() => (this.isLoading = false))
    }
  }
  @action
  async updateAmenityMaintenance(body: any) {
    this.isLoading = true
    await amenityService.updateAmenityMaintenance(body).finally(() => (this.isLoading = false))
    notifySuccess(L('SUCCESSFULLY'), L('UPDATE_SUCCESSFULLY'))
  }

  @action
  async create(body, files) {
    this.isLoading = true
    this.editAmenity = await amenityService.create(body).finally(async () => {
      this.isLoading = !!(files && files.length)
    })
    const { uniqueId } = this.editAmenity
    if (files && files.length && uniqueId) {
      await fileService.upload(moduleFile.amenity, uniqueId, files).finally(() => {
        this.isLoading = false
      })
    }
  }

  @action
  async update(body, files) {
    this.isLoading = true
    await amenityService.update(body).finally(async () => {
      const { uniqueId } = this.editAmenity
      this.isLoading = !!(files && files.length && uniqueId)
      if (files && files.length && uniqueId) {
        await fileService.upload(moduleFile.amenity, uniqueId, files).finally(() => {
          this.isLoading = false
        })
      }
    })
  }

  @action
  async activateOrDeactivate(id, isActive) {
    await amenityService.activateOrDeactivate(id, isActive)
  }
  @action
  async activateOrDeactivateBlackList(body) {
    await amenityService.activateOrDeactivateBlackList(body)
  }

  @action
  async delete(id) {
    await amenityService.delete(id)
  }

  @action
  async get(id) {
    this.editAmenity = await amenityService.get(id)
  }
  @action
  async getAminetyParent(id) {
    this.amenityParent = await amenityService.get(id)
  }

  @action
  async createAmenityModel() {
    this.editAmenity = new AmenityDetailModel()
  }

  @action
  async getAll(params) {
    this.isLoading = true
    this.pagedResult = await amenityService.getAll(params).finally(() => (this.isLoading = false))
  }

  @action
  async getLists(params) {
    const data = await amenityService.getAll(params)
    this.amenities = data.items || []
  }

  @action
  async getIcons(params) {
    this.icons = await amenityService.getIcons(params)
  }

  @action
  async getTimezones(params) {
    this.timezones = await amenityService.getTimezones(params)
  }

  @action
  async getMemberRoles() {
    // Don't need to call again if there are already init
    if (this.memberRoles && this.memberRoles.length) {
      return
    }

    this.memberRoles = await residentService.getMemberRoles()
    ;(this.memberRoles || []).forEach((item) => {
      item.id = item.code
      item.value = item.code
    })
  }

  @action
  async getUnitTypes() {
    // Don't need to call again if there are already init
    if (this.unitTypes && this.unitTypes.length) {
      return
    }

    this.unitTypes = await unitService.getUnitTypes()
    ;(this.unitTypes || []).forEach((item) => {
      item.id = item.code
      item.value = item.code
    })
  }
}

export default AmenityStore
