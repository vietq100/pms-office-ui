import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import http from '../httpService'
import { L, LNotification } from '../../lib/abpUtility'
import { notifyError, notifySuccess } from '../../lib/helper'
import { downloadFile } from '@lib/helperFile'

class CardbuidingService {
  public async create(body: any) {
    const response = await http.post('/api/services/app/Card/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return response.data.result
  }

  public async update(body: any) {
    const response = await http.put('/api/services/app/Card/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return response.data.result
  }

  public async activateOrDeactivate(id: number, isActive) {
    const response = await http.post('api/services/app/Card/Active', { id, isActive })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return response.data
  }

  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/Card/Get', { params: { id } })

    return res.data.result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    const response = await http.get('/api/services/app/Card/GetAll', { params })
    const result = response.data.result || []

    return result
  }

  public async getListCompany(): Promise<any[]> {
    const response = await http.get('/api/services/app/Card/GetListCompany')
    const result = response.data.result || {}

    return result
  }

  public async getListVehicleType(): Promise<any[]> {
    const response = await http.get('/api/services/app/Card/GetListVehicleType')
    const result = response.data.result || []

    return result
  }

  public async getListParking(): Promise<any[]> {
    const response = await http.get('/api/services/app/Card/GetListParking')
    const result = response.data.result || []

    return result
  }

  public async getListFeeParking(): Promise<any[]> {
    const response = await http.get('/api/services/app/Card/GetListFeeParking')
    const result = response.data.result || []

    return result
  }

  public async getAllCardsByCompany(params: any): Promise<PagedResultDto<any>> {
    const response = await http.get('/api/services/app/Card/GetAllCardsByCompany', { params })
    const result = response.data.result || {}

    return result
  }

  public async getCardInformationByName(name: any) {
    const response = await http.post(`api/services/app/Card/CheckExist?name=${name}`)

    return response.data.result[0]
  }

  public async importCard(file) {
    const data = new FormData()
    data.append('file', file)
    return await http.post('api/Imports/Cards/ImportFromExcel', data, {
      headers: {
        'content-type': 'multipart/form-data'
      }
    })
  }

  public async downloadTemplate() {
    const response = await http.get('api/Imports/Cards/GetTemplateImport', { responseType: 'blob' })
    downloadFile(response.data, `CardTemplateImport.xlsx`)
  }
}

export default new CardbuidingService()
