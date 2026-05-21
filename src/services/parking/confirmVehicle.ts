import http from '../httpService'
import { notifyError, notifySuccess } from '../../lib/helper'
import { L, LNotification } from '../../lib/abpUtility'
class VehicleRegistrationFormService {
  public async create(body) {
    const result = await http.post('/api/services/app/VehicleRegistrationForm/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async createRequest(body) {
    const result = await http.post('/api/services/app/VehicleRegistrationForm/CreateRequestVehicleRegistration', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async update(body) {
    const result = await http.put('/api/services/app/VehicleRegistrationForm/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async getAll(params: any): Promise<any> {
    const res = await http.get('api/services/app/VehicleRegistrationForm/GetAll', {
      params
    })
    const result = res.data.result
    return result
  }

  public async getVehicleRegistrationById(params: any): Promise<any> {
    const res = await http.get('api/services/app/VehicleRegistrationForm/GetVehicleRegistrationById', {
      params
    })
    const result = res.data.result
    return result
  }

  public async getAllByResident(params: any): Promise<any> {
    const res = await http.get('api/services/app/VehicleRegistrationForm/GetAllByResident', {
      params
    })
    const result = res.data.result
    return result
  }

  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('/api/services/app/VehicleRegistrationForm/Get', {
      params: { id }
    })

    const result = res.data.result

    return result
  }

  public async GetByResident(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/VehicleRegistrationForm/GetByResident', {
      params: { id }
    })

    const result = res.data.result

    return result
  }

  public async checkRequestIsValid(body) {
    const result = await http.post('api/services/app/VehicleRegistrationForm/CheckRequestIsValid', body)

    return result.data.result
  }
  public async getListRequestHistory(params: any): Promise<any> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('api/services/app/Request/GetListRequestHistory', {
      params
    })
    return res.data.result
  }

  public async sendApproval(body: any) {
    await http.put('api/services/app/Request/UpdateStatus', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
  }

  public async delete(id: number) {
    const result = await http.delete('api/services/app/VehicleRegistrationForm/Delete', {
      params: { id }
    })
    return result.data
  }
}

export default new VehicleRegistrationFormService()
