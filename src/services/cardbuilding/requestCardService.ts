import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import http from '../httpService'
import { L, LNotification } from '../../lib/abpUtility'
import { notifyError, notifySuccess } from '../../lib/helper'

class RequestCardbuidingService {
  public async create(body: any) {
    const response = await http.post('/api/services/app/UpdateCardRequest/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return response.data.result
  }
  public async updateByResident(body: any) {
    const response = await http.put('/api/services/app/UpdateCardRequest/UpdateByCompany', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return response.data.result
  }
  public async update(body: any) {
    const response = await http.put('/api/services/app/UpdateCardRequest/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return response.data.result
  }

  public async activateOrDeactivate(id: number, isActive) {
    const response = await http.post('api/services/app/UpdateCardRequest/Active', { id, isActive })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return response.data
  }

  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/UpdateCardRequest/Get', { params: { id } })

    return res.data.result
  }

  public async getByCompany(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/UpdateCardRequest/GetByCompany', { params: { id } })

    return res.data.result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    const response = await http.get('/api/services/app/UpdateCardRequest/GetAll', { params })
    const result = response.data.result || {}

    return result
  }

  public async getAllByCompany(params: any): Promise<PagedResultDto<any>> {
    const response = await http.get('/api/services/app/UpdateCardRequest/GetAllByCompany', { params })
    const result = response.data.result || {}

    return result
  }
}

export default new RequestCardbuidingService()
