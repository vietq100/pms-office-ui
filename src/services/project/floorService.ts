import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import http from '../httpService'
import { notifyError, notifySuccess } from '../../lib/helper'
import { L, LNotification } from '../../lib/abpUtility'

class FloorService {
  public async create(body: any) {
    const result = await http.post('api/services/app/Floors/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async update(body: any) {
    const result = await http.put('api/services/app/Floors/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async delete(id: number) {
    const result = await http.delete('api/services/app/Floors/Delete', {
      params: { id }
    })
    return result.data
  }

  public async activateOrDeactivate(id: number, isActive) {
    const result = await http.post('api/services/app/Floors/Active', { id }, { params: { isActive } })
    return result.data
  }

  public async getRoles() {
    const result = await http.get('api/services/app/Floors/GetRoles')
    return result.data.result.items
  }

  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const result = await http.get('api/services/app/Floors/Get', {
      params: { id }
    })
    return result.data.result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    const result = await http.get('api/services/app/Floors/GetAll', { params })
    return result.data.result
  }

  public async filterOptions(params: any): Promise<any> {
    const result = await http.get('api/services/app/Floors/GetAll', { params })
    return (result.data?.result?.items || []).map((item) => ({
      value: item.id,
      label: item.name,
      code: item.code
    }))
  }
}

export default new FloorService()
