import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import http from '../httpService'
import { L, LNotification } from '../../lib/abpUtility'
import { notifyError, notifySuccess } from '../../lib/helper'

import {
  CoutryOptionModel,
  ProjectDetail,
  ProjectFeeTemplateModel,
  ProjectOptionModel,
  ProjectRow,
  ProjectSettingModel,
  UnitOptionModel
} from '@models/Project/ProjectModel'
import { UnitUserModel } from '@models/User/IUserModel'

class ProjectService {
  public async create(body: any) {
    const result = await http.post('api/services/app/Projects/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async update(body: any) {
    const result = await http.put('api/services/app/Projects/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async updateProjectSetting(body: any) {
    const result = await http.put('api/services/app/Projects/UpdateProjectsWorkflowSetting', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async createProjectFeeTemplate(body: any) {
    if (body.templateLanguages) {
      body.notificationTemplates = Object.keys(body.templateLanguages).map((key) => {
        return { ...body.templateLanguages[key], languageName: key }
      })
    }

    const result = await http.post('api/services/app/TemplateNotify/CreateFeeTemplate', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async updateProjectFeeTemplate(body: any) {
    if (!body) {
      return
    }

    Object.keys(body.templateLanguages).forEach((key) => {
      const index = (body.notificationTemplates || []).findIndex((item) => item.languageName === key)
      if (index === -1) {
        body.notificationTemplates.push({
          ...body.notificationTemplates[index],
          ...body.templateLanguages[key],
          languageName: key
        })
        return
      }

      body.notificationTemplates[index] = {
        ...body.notificationTemplates[index],
        ...body.templateLanguages[key]
      }
    })

    delete body.templateLanguages

    const result = await http.put('api/services/app/TemplateNotify/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async delete(id: number) {
    const result = await http.delete('api/services/app/Projects/Delete', {
      params: { id }
    })
    return result.data
  }

  public async activateOrDeactivate(id: number, isActive) {
    const result = await http.post('api/services/app/Projects/Active', { id }, { params: { isActive } })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data
  }

  public async defaultOrNotDefault(id: number, isDefault) {
    const result = await http.post('api/services/app/Projects/SetDefault', { id }, { params: { isDefault } })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data
  }

  public async getRoles() {
    const result = await http.get('api/services/app/Projects/GetRoles')
    return result.data.result.items
  }

  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
      return
    }

    const result = await http.get('api/services/app/Projects/Get', {
      params: { id }
    })
    return ProjectDetail.assign(result.data.result)
  }

  public async getLogoById(projectId) {
    const result = await http.get('api/services/app/Profile/GetProfilePictureById', { params: { projectId } })
    const logoUrl = result.data.result?.profilePicture
      ? `data:image/jpeg;base64,${result.data.result.profilePicture}`
      : undefined
    return logoUrl
  }

  public async uploadProjectLogo(file, uniqueId) {
    const data = new FormData()
    data.append('file', file)
    const result = await http.post('api/Documents/UploadProject', data, {
      headers: {
        'content-type': 'multipart/form-data'
      },
      params: { uniqueId }
    })
    return result.data.result
  }

  public async updateProjectLogo(body: any) {
    const result = await http.put('api/services/app/Profile/UpdateProfilePicture', body)
    return result.data.result
  }

  public async getProjectSetting(projectId: number, moduleId: number): Promise<any> {
    if (!projectId) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
      return
    }

    const result = await http.get('api/services/app/Projects/GetProjectsWorkflowSetting', {
      params: { projectId, moduleId }
    })
    return ProjectSettingModel.assign(result.data.result)
  }

  public async getModuleNotificationSettings(): Promise<any> {
    const result = await http.get('api/services/app/ProjectSettings/GetModuleNotificationSettings')
    return ProjectSettingModel.assign(result.data.result)
  }

  public async getProjectBankSetting(projectId: number): Promise<any> {
    const result = await http.get('api/services/app/ProjectSettings/GetBankInfo', { params: { projectId } })
    // return ProjectSettingModel.assign(result.data.result)
    return result.data.result
  }

  public async getProjectFeeTemplate(projectId: number): Promise<any> {
    if (!projectId) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
      return
    }

    const res = await http.get('api/services/app/TemplateNotify/GetFeeNotificationTemplate', { params: { projectId } })
    return ProjectFeeTemplateModel.assign(res.data.result)
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    const res = await http.get('api/services/app/Projects/GetAll', { params })
    const { result } = res.data
    if (result.items) {
      result.items = ProjectRow.assigns(result.items)
    }

    return result
  }

  public async filterOptions(params: any): Promise<any> {
    const result = await http.get('api/services/app/Projects/GetOwnerProjects', { params })
    return ProjectOptionModel.assigns(result.data?.result?.items || [])
  }

  public async getListCountry(params: any): Promise<any> {
    const result = await http.get('api/services/app/Locations/GetListCountry', { params })
    return CoutryOptionModel.assigns(result.data?.result || [])
  }
  public async getListProvince(params: any): Promise<any> {
    const result = await http.get('api/services/app/Locations/GetListProvince', { params })
    return result.data?.result || []
  }
  public async getListDistrict(params: any): Promise<any> {
    const result = await http.get('api/services/app/Locations/GetListDistrict', { params })
    return result.data?.result || []
  }
  public async getListCommune(params: any): Promise<any> {
    const result = await http.get('api/services/app/Locations/GetListCommune', { params })
    return result.data?.result || []
  }
  public async filterUnits(params) {
    const response = await http.get('api/services/app/Units/GetAll', { params })
    const result = UnitOptionModel.assigns(response.data.result.items || [])
    return result
  }

  public async filterUnitUsers(params) {
    const res = await http.get('api/services/app/Units/GetUnitUsers', {
      params
    })
    const result = UnitUserModel.assigns(res.data.result.items || [])
    return result
  }
  public async countUnitByStatus(params) {
    const res = await http.get('/api/services/app/Units/GetDashboardUnitStatus', params)
    const { result } = res.data

    return result.map((item) => ({
      name: item.name,
      value: item.totalCount,
      color: `#${Math.floor(16077777 + item.id * 7777).toString(16)}`
    }))
  }
  public async countUnitByType(params) {
    const res = await http.get('/api/services/app/Units/GetDashboardUnitType', params)
    const { result } = res.data

    return result.map((item) => ({
      name: item.name,
      value: item.totalCount,
      color: `#${Math.floor(16077777 + item.id * 7777).toString(16)}`
    }))
  }
  public async createOrUpdateProjectSettings(id, values) {
    await http.post(`/api/services/app/Projects/CreateOrUpdateProjectSettings?projectId=${id}`, [
      {
        name: 'TIME',
        value: `${values.abnormalTime}`
      },
      {
        name: 'NUMBER',
        value: `${values.abnormalNumber}`
      },
      {
        name: 'EMAIL',
        value: `${values.abnormalEmail.join(', ')}`
      }
    ])
  }

  public async getListUnitStackingPlan(id, isActive) {
    return await http.get('/api/services/app/Floors/GetListUnitStackingPlan', {
      params: { BuildingId: id, isActive: isActive }
    })
  }
  public async updateUnitOrder(body) {
    return await http.post(`/api/services/app/Units/OrderListUnit`, body)
  }
  public async updateFloorOrder(body) {
    return await http.post(`/api/services/app/Floors/OrderListFloor`, body)
  }

  public async getTimeZone() {
    return await http.get('api/services/app/Timing/GetTimezones?defaultTimezoneScope=1')
  }

  public async getTimeSetting(id) {
    return await http.get('api/services/app/ProjectSettings/GetProjectTimeSettings', { params: { projectId: id } })
  }

  public async updateProjectTimeSettings(timeSettingValues) {
    await http.put('/api/services/app/ProjectSettings/UpdateProjectTimeSettings', timeSettingValues)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return
  }

  public async updateModuleNotificationSettings(notifctionSetting) {
    await http.put('/api/services/app/ProjectSettings/UpdateModuleNotificationSettings', notifctionSetting)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return
  }
  public async updateBank(arrrBankInfo, projectId) {
    await http.put('api/services/app/ProjectSettings/UpdateBankInfoSettings', arrrBankInfo, {
      params: { projectId: projectId }
    })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return
  }

  public async getFeeTemplateInfoSettings() {
    const result = await http.get('api/services/app/ProjectSettings/GetFeeTemplateInfoSettings')
    return result.data.result
  }
  public async updateFeeTemplateInfoSettings(body) {
    await http.put('api/services/app/ProjectSettings/UpdateFeeTemplateInfoSettings', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return
  }
}

export default new ProjectService()
