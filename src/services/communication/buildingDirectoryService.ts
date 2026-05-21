import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '../httpService'
import { L, LNotification } from '@lib/abpUtility'
import { notifyError, notifySuccess } from '@lib/helper'
import { BuildingDirectoryModel } from '@models/communication/buildingDirectory/BuildingDirectoryModel'

class BuildingDirectoryService {
  public async create(body: BuildingDirectoryModel) {
    const res = await http.post('/api/services/app/Contacts/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return BuildingDirectoryModel.assign(res.data.result)
  }

  public async update(body: any) {
    const res = await http.put('/api/services/app/Contacts/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return BuildingDirectoryModel.assign(res.data.result)
  }

  public async activateOrDeactivate(id: number, isActive) {
    const res = await http.post('/api/services/app/Contacts/Active', { id }, { params: { isActive } })
    return res.data
  }

  public async delete(id: number) {
    const res = await http.delete('/api/services/app/Contacts/Active', {
      params: { id }
    })
    return res.data
  }

  public async get(id): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }
    const result = await http.get('/api/services/app/Contacts/Get', {
      params: { id }
    })
    return BuildingDirectoryModel.assign(result.data.result)
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    const res = await http.get('/api/services/app/Contacts/GetAll', { params })
    const result = BuildingDirectoryModel.assign(res.data.result)
    return result
  }

  public async filterOptions(params: any): Promise<any> {
    const res = await http.get('/api/services/app/Contacts/GetAll', { params })
    const result = BuildingDirectoryModel.assign(res.data.result)
    return result.items
  }
}

export default new BuildingDirectoryService()
