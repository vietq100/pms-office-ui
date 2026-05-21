import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import http from '../httpService'
import { notifyError, notifySuccess } from '../../lib/helper'
import { L, LNotification } from '../../lib/abpUtility'

class ZoneService {
  public async create(body: any) {
    const result = await http.post('api/services/app/Zone/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async update(body: any) {
    const result = await http.put('api/services/app/Zone/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async delete(id: number) {
    const result = await http.delete('api/services/app/Zone/Delete', {
      params: { id }
    })
    return result.data
  }

  public async activateOrDeactivate(id: number, isActive) {
    const result = await http.post('api/services/app/Zone/Active', { id, isActive })
    return result.data
  }

  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const result = await http.get('api/services/app/Zone/Get', {
      params: { id }
    })
    return result.data.result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    const result = await http.get('api/services/app/Zone/GetAll', { params })
    return result.data.result
  }

  public async getListZonesUnUsed(): Promise<any> {
    const res = await http.get('api/services/app/Zone/GetListZone')
    return res.data.result
  }
}

export default new ZoneService()
