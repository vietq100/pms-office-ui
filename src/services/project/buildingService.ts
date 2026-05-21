import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import http from '../httpService'
import { L, LNotification } from '../../lib/abpUtility'
import { notifyError, notifySuccess } from '../../lib/helper'

class BuildingService {
  public async create(body: any) {
    const result = await http.post('api/services/app/Buildings/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async update(body: any) {
    const result = await http.put('api/services/app/Buildings/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async delete(id: number) {
    const result = await http.delete('api/services/app/Buildings/Delete', {
      params: { id }
    })
    return result.data
  }

  public async activateOrDeactivate(id: number, isActive) {
    const result = await http.post('api/services/app/Buildings/Active', { id }, { params: { isActive } })
    return result.data
  }

  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const result = await http.get('api/services/app/Buildings/Get', {
      params: { id }
    })
    return result.data.result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    const result = await http.get('api/services/app/Buildings/GetAll', {
      params
    })
    return result.data.result
  }

  public async filterOptions(params: any): Promise<any> {
    const result = await http.get('api/services/app/Buildings/GetAll', {
      params
    })
    return (result.data?.result?.items || []).map((item) => ({
      ...item,
      value: item.id,
      label: item.name,
      code: item.code
    }))
  }
}

export default new BuildingService()
