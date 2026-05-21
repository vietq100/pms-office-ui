import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '../httpService'
import { L, LNotification } from '../../lib/abpUtility'
import { notifyError, notifySuccess } from '../../lib/helper'
import { mimeType } from '../../lib/appconst'
import dayjs from 'dayjs'

class LibraryService {
  // Folder
  public async create(body: any) {
    const response = await http.post('api/services/app/Library/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return response.data.result
  }

  public async update(body: any) {
    const response = await http.put('api/services/app/Library/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return response.data.result
  }

  public async activateOrDeactivateLibrary(id: number, isActive) {
    const response = await http.post('api/services/app/Library/Active', null, {
      params: { id, isActive }
    })
    return response.data
  }

  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const response = await http.get('api/services/app/Library/Get', {
      params: { id }
    })
    const result = {
      ...response.data.result,
      projectId: response.data.result.project?.id,
      buildingIds: (response.data.result.buildings || []).map((item) => item.id),
      roleIds: (response.data.result.roles || []).map((item) => item.id)
    }
    return result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    delete params.dateFromTo

    const response = await http.get('api/services/app/Library/GetAll', {
      params
    })
    return response.data.result
  }

  // Document
  public async createDocument(body: any) {
    const response = await http.post('api/services/app/LibraryDocument/Create', body)
    return response.data.result
  }

  public async updateDocument(body: any) {
    const response = await http.put('api/services/app/LibraryDocument/Update', body)
    return response.data.result
  }

  public async deleteDocument(id: number) {
    const response = await http.delete('api/services/app/LibraryDocument/Delete', { params: { id } })
    return response.data
  }

  public async activateOrDeactivateDocument(id: number, isActive) {
    const response = await http.post('api/services/app/LibraryDocument/Active', null, { params: { id, isActive } })
    return response.data
  }

  public async getDocument(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const response = await http.get('api/services/app/LibraryDocument/Get', {
      params: { id }
    })
    const result = {
      ...response.data.result,
      takenDownDate: response.data.result.takenDownDate ? dayjs(response.data.result.takenDownDate) : null,
      expiredDate: response.data.result.expiredDate ? dayjs(response.data.result.expiredDate) : null,
      projectId: response.data.result.library?.project?.id
    }
    return result
  }

  public async getAllDocument(params: any): Promise<PagedResultDto<any>> {
    const [fromTakenDownDate, toTakenDownDate] = params.dateFromToTakenDown || []
    const [fromExpiredDate, toExpiredDate] = params.dateFromToExpired || []
    params.fromTakenDownDate = fromTakenDownDate ? dayjs(fromTakenDownDate).startOf('day').toJSON() : null
    params.toTakenDownDate = toTakenDownDate ? dayjs(toTakenDownDate).endOf('day').toJSON() : null
    params.fromExpiredDate = fromExpiredDate ? dayjs(fromExpiredDate).startOf('day').toJSON() : null
    params.toExpiredDate = toExpiredDate ? dayjs(toExpiredDate).endOf('day').toJSON() : null

    delete params.dateFromToTakenDown
    delete params.dateFromToExpired

    const response = await http.get('api/services/app/LibraryDocument/GetAll', {
      params
    })
    ;(response.data.result.items || []).map((item) => {
      item.icon = item.file?.mimeType ? mimeType[item.file?.mimeType] : mimeType.other
      // If there are not defined mimeType
      if (!item.icon) {
        item.icon = mimeType.other
      }
      return item
    })
    return response.data.result
  }
}

export default new LibraryService()
