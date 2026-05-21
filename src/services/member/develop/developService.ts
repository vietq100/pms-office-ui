import type { PagedResultDto } from '../../dto/pagedResultDto'
import http from '../../httpService'
import { L, LNotification } from '../../../lib/abpUtility'
import { notifyError, notifySuccess } from '../../../lib/helper'
import dayjs from 'dayjs'

class DevelopService {
  public async create(body: any) {
    if (body.birthDate) {
      body.birthDate = dayjs(body.birthDate).format('YYYY/MM/DD')
    }

    const result = await http.post('api/services/app/UserDeveloper/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async update(body: any) {
    if (body.birthDate) {
      body.birthDate = dayjs(body.birthDate).format('YYYY/MM/DD')
    }

    const result = await http.put('api/services/app/UserDeveloper/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async activateOrDeactivate(id: number, isActive) {
    const result = await http.post('api/services/app/UserDeveloper/Active', { id, isActive })
    return result.data
  }

  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const result = await http.get('api/services/app/UserDeveloper/Get', {
      params: { id }
    })
    if (result.data.result && result.data.result.birthDate) {
      result.data.result.birthDate = dayjs(result.data.result.birthDate)
    }

    return result.data.result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    const res = await http.get('api/services/app/UserDeveloper/GetAll', { params })
    const { result } = res.data

    return result
  }
}

export default new DevelopService()
