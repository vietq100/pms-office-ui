import type { PagedResultDto } from '../../dto/pagedResultDto'
import http from '../../httpService'
import { L, LNotification } from '../../../lib/abpUtility'
import { notifyError, notifySuccess } from '../../../lib/helper'
import { AppConfiguration, moduleIds } from '../../../lib/appconst'
import dayjs from 'dayjs'

class ShopOwnerService {
  public async create(body: any) {
    if (body.birthDate) {
      body.birthDate = dayjs(body.birthDate).format('YYYY/MM/DD')
    }

    const res = await http.post('api/services/app/ShopOwners/Create', body)
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

    const res = await http.put('api/services/app/ShopOwners/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return res.data.result
  }

  public async delete(id: number) {
    const res = await http.delete('api/services/app/ShopOwners/Delete', {
      params: { id }
    })
    return res.data
  }

  public async activateOrDeactivate(id: number, isActive) {
    const res = await http.post('api/services/app/ShopOwners/Active', { id }, { params: { isActive } })
    return res.data
  }

  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/ShopOwners/Get', {
      params: { id }
    })
    if (res.data.result && res.data.result.birthDate) {
      res.data.result.birthDate = dayjs(res.data.result.birthDate)
    }
    return res.data.result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    const res = await http.get('api/services/app/ShopOwners/GetAll', { params })
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
    const res = await http.get('api/services/app/ShopOwners/GetAll', { params })
    return (res.data?.result?.items || []).map((item) => ({
      id: item.id,
      value: item.id,
      label: item.displayName,
      displayName: item.displayName,
      emailAddress: item.emailAddress
    }))
  }

  public async filterWfAssigner(params: any): Promise<any> {
    let res
    switch (params.moduleId) {
      case moduleIds.feedback: {
        res = await http.get('/api/services/app/Feedback/GetAssignUser', {
          params
        })
        break
      }
      default: {
        res = await http.get('api/services/app/WorkOrder/GetAssignUser', {
          params
        })
      }
    }

    return (res.data?.result?.items || []).map((item) => ({
      id: item.id,
      value: item.id,
      label: item.displayName,
      displayName: item.displayName,
      emailAddress: item.emailAddress
    }))
  }

  public async getProjectRoles(params: any): Promise<any> {
    const res = await http.get('api/services/app/ShopOwners/GetProjectRoles', {
      params
    })
    return res.data.result
  }

  public async setProjectRole(body: any) {
    const res = await http.post('api/services/app/ShopOwners/SetProjectRoles', body)
    return res.data.result
  }
}

export default new ShopOwnerService()
