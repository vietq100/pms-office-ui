import type { PagedResultDto } from '../../dto/pagedResultDto'
import http from '../../httpService'
import { L, LNotification } from '../../../lib/abpUtility'
import { notifyError, notifySuccess } from '../../../lib/helper'
import { AppConfiguration, moduleIds } from '../../../lib/appconst'
import { UserOption } from '@models/User/IUserModel'
import dayjs from 'dayjs'

class StaffService {
  public async create(body: any) {
    if (body.birthDate) {
      body.birthDate = dayjs(body.birthDate).format('YYYY/MM/DD')
    }

    const res = await http.post('api/services/app/Employees/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    if (res.data.result && res.data.result.birthDate) {
      res.data.result.birthDate = dayjs(res.data.result.birthDate)
    }
    return res.data.result
  }

  public async update(body: any) {
    if (body.birthDate) {
      body.birthDate = dayjs(body.birthDate).format('YYYY/MM/DD')
    }

    const res = await http.put('api/services/app/Employees/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return res.data.result
  }

  public async delete(id: number) {
    const res = await http.delete('api/services/app/Employees/Delete', {
      params: { id }
    })
    return res.data
  }

  public async activateOrDeactivate(id: number, isActive) {
    const res = await http.post('api/services/app/Employees/Active', { id }, { params: { isActive } })
    return res.data
  }

  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/Employees/Get', {
      params: { id }
    })
    if (res.data.result && res.data.result.birthDate) {
      res.data.result.birthDate = dayjs(res.data.result.birthDate)
    }
    return res.data.result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    if (!params.maxResultCount) {
      params.maxResultCount = 10
      params.skipCount = 0
    }
    const res = await http.get('api/services/app/Employees/GetAll', { params })
    const result = res.data.result
    if (result.items) {
      ;(result.items || []).forEach((item) => {
        item.profilePictureUrl = item.profilePictureId
          ? `${AppConfiguration.remoteServiceBaseUrl}api/services/app/Profile/GetProfilePictureById?profilePictureId=${item.profilePictureId}`
          : null
      })
    }

    return res.data.result
  }

  public async filterOptions(params: any): Promise<any> {
    if (!params.maxResultCount) {
      params.maxResultCount = 10
      params.skipCount = 0
      params.isActive = true
    }
    const res = await http.get('api/services/app/Employees/GetAll', { params })
    return (res.data?.result?.items || []).map((item) => ({
      id: item.id,
      value: item.id,
      label: item.displayName,
      displayName: item.displayName,
      emailAddress: item.emailAddress
    }))
  }

  public async filterWfAssigner(params: any): Promise<any> {
    params.isActive = true
    params.maxResultCount = 100
    params.skipCount = 0

    let res
    switch (params.moduleId) {
      case moduleIds.feedback: {
        res = await http.get('/api/services/app/Feedback/GetAssignUser', {
          params
        })
        break
      }
      case moduleIds.planMaintenance: {
        res = await http.get('/api/services/app/PlanMaintenance/GetAssignUser', { params })
        break
      }
      default: {
        res = await http.get('api/services/app/WorkOrder/GetAssignUser', {
          params
        })
      }
    }

    return UserOption.assigns(res.data?.result?.items || [])
  }

  public async filterWfWatcher(params: any): Promise<any> {
    params.isActive = true
    params.maxResultCount = 100
    params.skipCount = 0
    let res
    switch (params.moduleId) {
      case moduleIds.feedback: {
        res = await http.get('/api/services/app/Feedback/GetAssignUser', {
          params
        })
        break
      }
      case moduleIds.planMaintenance: {
        res = await http.get('/api/services/app/PlanMaintenance/GetAssignUser', { params })
        break
      }
      default: {
        res = await http.get('api/services/app/WorkOrder/GetAssignUser', {
          params
        })
      }
    }

    return UserOption.assigns(res.data?.result?.items || [])
  }

  public async getProjectRoles(params: any): Promise<any> {
    const res = await http.get('api/services/app/Employees/GetProjectRoles', {
      params
    })
    return res.data.result
  }

  public async setProjectRole(body: any) {
    const res = await http.post('api/services/app/Employees/SetProjectRoles', body)
    return res.data.result
  }

  public async getOverview(params) {
    const res = await http.get('api/services/app/Employees/GetOverviewEmployee', { params })
    return res.data.result
  }
}

export default new StaffService()
