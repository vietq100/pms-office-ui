import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import projectService from '../../services/project/projectService'
import buildingService from '../../services/project/buildingService'
import fileService from '../../services/common/fileService'
import { defaultAvatar, moduleFile, moduleIds } from '../../lib/appconst'
import floorService from '@services/project/floorService'
import { compressImage, notifySuccess } from '@lib/helper'
import { ProjectFeeTemplateModel } from '@models/Project/ProjectModel'
import unitService from '@services/project/unitService'
import { LNotification } from '@lib/abpUtility'

class ProjectStore {
  @observable isLoading!: boolean
  @observable projects!: PagedResultDto<any>
  @observable editProject!: any
  @observable editProjectLogo!: any
  @observable editProjectSettingWorkOrder!: any
  @observable editProjectSettingFeedBack!: any
  @observable editProjectFeeTemplate!: any
  @observable projectOptions: any = []
  @observable buildingOptions: any = []
  @observable floorOptions: any = []
  @observable unitUserOptions: any = []
  @observable unitOptions: any = []
  @observable tempProjectLogo: any
  @observable floors: any = []
  @observable units: any = []
  @observable timeZone: any = []
  @observable timeSetting: any
  @observable editProjectBankSetting: any = {}
  @observable countryOptions: any = []
  @observable provinceOptions: any = []
  @observable districtOptions: any = []
  @observable communeOptions: any = []
  @observable templateInfoHeaderFooter: any
  @observable notificationSettings: any = {}

  constructor() {
    this.projects = { items: [], totalCount: 0 }
    makeObservable(this)
  }

  @action
  async create(body: any, files?) {
    this.isLoading = true
    const result = await projectService
      .create(body)
      .finally(() => (this.isLoading = !!(files && files.length) || !!this.tempProjectLogo))
    this.editProject = result
    if (files && files.length) {
      await fileService.upload(moduleFile.library, result.uniqueId, files).finally(() => (this.isLoading = false))
    }
    // Handle upload logo
    if (this.tempProjectLogo) {
      await this.uploadProjectLogo(this.tempProjectLogo, result.uniqueId).finally(() => (this.isLoading = false))
      this.tempProjectLogo = undefined
    }
  }

  @action
  async createProjectFeeTemplate(body: any) {
    this.isLoading = true
    await projectService.createProjectFeeTemplate(body).finally(() => (this.isLoading = false))
    await this.getProjectFeeTemplate(body.projectId)
  }

  @action
  async update(updateProjectInput: any, files?) {
    this.isLoading = true
    const result = await projectService.update(updateProjectInput).finally(() => {
      this.isLoading = !!(files && files.length)
    })
    if (files && files.length) {
      await fileService.upload(moduleFile.library, result.uniqueId, files).finally(() => (this.isLoading = false))
    }
  }

  @action
  async updateProjectSetting(body: any) {
    this.isLoading = true

    await projectService.updateProjectSetting(body).finally(() => (this.isLoading = false))
    await this.getProjectSetting(body.projectId, body.moduleId)
  }
  async updateModuleNotificationSettings(body: any) {
    this.isLoading = true
    await projectService.updateModuleNotificationSettings(body).finally(() => (this.isLoading = false))
    await this.getModuleNotificationSettings()
  }

  @action
  async updateBank(arrBankInfo: any, projectId) {
    this.isLoading = true
    await projectService.updateBank(arrBankInfo, projectId).finally(() => (this.isLoading = false))
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
  }
  @action
  async updateProjectFeeTemplate(body: any) {
    this.isLoading = true
    await projectService.updateProjectFeeTemplate(body).finally(() => (this.isLoading = false))
    await this.getProjectFeeTemplate(body.projectId)
  }

  @action
  async delete(id: number) {
    await projectService.delete(id)
    this.projects.items = this.projects.items.filter((x) => x.id !== id)
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await projectService.activateOrDeactivate(id, isActive)
  }

  @action
  async defaultOrNotDefault(id: number, isDefault) {
    await projectService.defaultOrNotDefault(id, isDefault)
  }

  @action
  async get(id: number) {
    const result = await projectService.get(id)
    this.editProject = result
  }

  @action
  async getProjectLogo(profilePictureId) {
    const result = await projectService.getLogoById(profilePictureId)
    this.editProjectLogo = result || defaultAvatar
  }

  @action
  async uploadProjectLogo(file, uniqueId) {
    if (!uniqueId) {
      this.tempProjectLogo = file
      return
    }
    const compressedImage = await compressImage(file, 1024)
    await projectService.uploadProjectLogo(compressedImage, uniqueId)
  }

  @action
  async updateProjectLogo(data) {
    const profilePictureId = await projectService.updateProjectLogo(data)
    await this.getProjectLogo(profilePictureId)
  }

  @action
  async getProjectSetting(id: number, moduleId: number) {
    if (moduleId === moduleIds.feedback) {
      this.editProjectSettingFeedBack = await projectService.getProjectSetting(id, moduleId)
    }
    if (moduleId === moduleIds.workOrder) {
      this.editProjectSettingWorkOrder = await projectService.getProjectSetting(id, moduleId)
    }
  }

  @action
  async getModuleNotificationSettings() {
    this.notificationSettings = await projectService.getModuleNotificationSettings()
  }

  @action
  async getProjectBankSetting(id: number) {
    this.editProjectBankSetting = await projectService.getProjectBankSetting(id)
  }

  @action
  async getProjectFeeTemplate(id: number) {
    this.editProjectFeeTemplate = await projectService.getProjectFeeTemplate(id)
  }

  @action
  async createProject() {
    this.editProject = {
      code: '',
      name: '',
      investorName: '',
      hotline: '',
      description: '',
      address: '',
      id: 0,
      isActive: true,
      logoUrl: undefined
    }
  }

  @action
  async initProjectSetting() {
    this.editProjectSettingWorkOrder = {
      id: 0,
      isActive: true
    }
    this.editProjectSettingFeedBack = {
      id: 0,
      isActive: true
    }
  }
  @action
  async initProjectBankSetting() {
    this.editProjectBankSetting = {}
  }
  @action
  async initProjectFeeTemplate() {
    this.editProjectFeeTemplate = new ProjectFeeTemplateModel()
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await projectService.getAll(params).finally(() => (this.isLoading = false))
    this.projects = result
  }

  @action
  async filterOptions(params: any) {
    params.maxResultCount = 1000
    params.isActive = true
    params.sorting = 'Name ASC'
    const result = await projectService.filterOptions(params)
    this.projectOptions = result
  }

  @action
  async getListCountry(params: any) {
    const result = await projectService.getListCountry(params)
    this.countryOptions = result
  }
  @action
  async getListProvince(params: any) {
    const result = await projectService.getListProvince(params)
    this.provinceOptions = result
  }
  @action
  async getListDistrict(params: any) {
    const result = await projectService.getListDistrict(params)
    this.districtOptions = result
  }
  @action
  async getListCommune(params: any) {
    const result = await projectService.getListCommune(params)
    this.communeOptions = result
  }
  @action
  async filterBuildingOptions(params: any) {
    const result = await buildingService.filterOptions({ isActive: true, ...params })
    this.buildingOptions = result
  }

  @action
  async filterFloorOptions(params: any) {
    if (!params.buildingId) {
      this.floorOptions = []
      return
    }
    params.isActive = true
    const result = await floorService.filterOptions(params)
    this.floorOptions = result
  }

  @action
  async filterUnitUserOptions(params: any) {
    if (!params.projectId) {
      this.unitUserOptions = []
    }

    params.isActive = true
    const result = await projectService.filterUnitUsers(params)
    this.unitUserOptions = result
  }

  @action
  async filterUnitOptions(params: any) {
    if (!params.projectId) {
      this.unitOptions = []
    }

    params.isActive = true
    const result = await unitService.filterAllOptions(params)
    this.unitOptions = result
  }

  @action
  resetUnitUserOptions() {
    this.unitUserOptions = []
  }
  @action
  async getTimeZone() {
    const res = (await projectService.getTimeZone()).data.result.items
    this.timeZone = res
  }

  @action async getTimeSetting(id) {
    const res = (await projectService.getTimeSetting(id)).data.result
    this.timeSetting = res
  }

  @action async getListUnitStackingPlan(id: number, isActive: any) {
    if (!id) {
      this.floors = []
      this.units = []
      return
    }
    const res = await projectService.getListUnitStackingPlan(id, isActive)

    this.floors = res.data.result
    const allUnit: Array<any> = []
    res.data.result.map((floor) => {
      floor.units.map((unit) => allUnit.push(unit))
    })
    this.units = allUnit
  }

  @action
  async getFeeTemplateInfoSettings() {
    this.isLoading = true
    const result = await projectService.getFeeTemplateInfoSettings().finally(() => (this.isLoading = false))
    this.templateInfoHeaderFooter = result
  }
  @action
  async updateFeeTemplateInfoSettings(body: any) {
    this.isLoading = true
    await projectService.updateFeeTemplateInfoSettings(body).finally(() => (this.isLoading = false))
  }
}

export default ProjectStore
